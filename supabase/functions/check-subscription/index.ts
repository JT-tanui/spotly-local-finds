
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key to bypass RLS policies
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user exists as a Stripe customer
    const { data: customers, error: searchError } = await stripe.customers.search({
      query: `email:'${user.email}'`,
    });

    if (searchError) {
      console.error("Error searching for customer:", searchError);
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!customers || customers.data.length === 0) {
      // No customer record found, user is not subscribed
      await updateSubscriberRecord(supabaseClient, user, null, false);
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      // Customer exists but has no active subscriptions
      await updateSubscriberRecord(supabaseClient, user, customerId, false);
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // User has an active subscription
    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const priceId = subscription.items.data[0].price.id;
    
    // Get price details to determine tier
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;
    
    let subscriptionTier;
    if (amount <= 1999) {
      subscriptionTier = "premium";
    } else {
      subscriptionTier = "professional";
    }

    // Update subscriber record in Supabase
    await updateSubscriberRecord(
      supabaseClient, 
      user, 
      customerId, 
      true, 
      subscriptionTier, 
      subscriptionEnd
    );

    return new Response(JSON.stringify({
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error checking subscription status:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateSubscriberRecord(
  supabase: any, 
  user: any, 
  stripeCustomerId: string | null, 
  subscribed: boolean,
  subscriptionTier?: string,
  subscriptionEnd?: string
) {
  try {
    // First, check if the subscribers table exists
    const { error: tableCheckError } = await supabase
      .from('subscribers')
      .select('count')
      .limit(1);

    // If the table doesn't exist, it's likely the migration hasn't been run yet
    if (tableCheckError) {
      console.warn("Subscribers table not found. SQL migration may not have been run yet.");
      return;
    }

    await supabase.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: stripeCustomerId,
      subscribed: subscribed,
      subscription_tier: subscriptionTier || null,
      subscription_end: subscriptionEnd || null,
      updated_at: new Date().toISOString(),
    }, { 
      onConflict: 'user_id',
      ignoreDuplicates: false
    });
  } catch (error) {
    console.error("Error updating subscriber record:", error);
  }
}
