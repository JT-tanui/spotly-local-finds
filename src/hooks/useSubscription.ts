
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuthContext';
import { useToast } from './use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionTier?: string;
  subscriptionEnd?: string;
  isLoading: boolean;
  error: Error | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    isLoading: false,
    error: null
  });

  const checkSubscription = async () => {
    if (!user) return;

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        throw new Error(error.message);
      }

      setStatus({
        subscribed: data.subscribed,
        subscriptionTier: data.subscription_tier,
        subscriptionEnd: data.subscription_end,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setStatus({
        subscribed: false,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error checking subscription')
      });
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to checkout page
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast({
        variant: 'destructive',
        title: 'Checkout Failed',
        description: err instanceof Error ? err.message : 'Failed to create checkout session'
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to customer portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to open customer portal'
      });
    }
  };

  // Check subscription status when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setStatus({
        subscribed: false,
        isLoading: false,
        error: null
      });
    }
  }, [user]);

  return {
    ...status,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal
  };
}
