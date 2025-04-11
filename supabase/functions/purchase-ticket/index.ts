
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the ticket purchase data from request
    const { 
      place_id, 
      event_id, 
      ticket_type, 
      price, 
      event_date 
    } = await req.json();

    // Simple validation
    if (!place_id || !ticket_type || !price || !event_date) {
      return new Response(
        JSON.stringify({ error: "Missing required fields for ticket purchase" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a mock QR code - in a real application this would be generated properly
    const qr_code = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Insert the ticket record in the database
    const { data: ticketData, error: ticketError } = await supabaseClient
      .from("tickets")
      .insert({
        user_id: user.id,
        place_id,
        event_id: event_id || null,
        ticket_type,
        price,
        purchase_date: new Date().toISOString(),
        event_date,
        status: "valid",
        qr_code
      })
      .select()
      .single();

    if (ticketError) {
      throw ticketError;
    }

    console.log("Ticket purchased successfully:", ticketData);

    return new Response(
      JSON.stringify({ success: true, ticket: ticketData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in purchase-ticket function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
