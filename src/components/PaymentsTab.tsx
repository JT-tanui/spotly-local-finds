
import React, { useState } from 'react';
import { UserProfile, PaymentMethod, SubscriptionPlan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Plus, Clock, Check, AlertTriangle, Trash, ExternalLink, Shield, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Mock payment methods - this would be fetched from Supabase/Stripe in a real implementation
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expMonth: 12,
    expYear: 2025,
    isDefault: true
  }
];

// Mock payment history - this would be fetched from Supabase/Stripe in a real implementation
const mockPaymentHistory = [
  {
    id: 'pi_1',
    amount: 1999,
    date: '2025-03-15',
    status: 'succeeded',
    description: 'Premium Subscription'
  },
  {
    id: 'pi_2',
    amount: 499,
    date: '2025-02-15',
    status: 'succeeded',
    description: 'Event Ticket'
  }
];

// Subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic',
    price: 0,
    interval: 'month',
    features: [
      'Access to basic features',
      'Create up to 3 events',
      'Standard support'
    ],
    description: 'Free tier with limited features'
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    price: 1999,
    interval: 'month',
    features: [
      'All basic features',
      'Unlimited events',
      'Priority support',
      'No ads',
      'Advanced analytics'
    ],
    isPopular: true,
    description: 'Most popular plan for enthusiasts'
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    price: 4999,
    interval: 'month',
    features: [
      'All premium features',
      'Dedicated account manager',
      'API access',
      'Custom branding',
      'Team collaboration'
    ],
    description: 'For businesses and professional organizers'
  }
];

interface PaymentsTabProps {
  user: UserProfile;
  subscription?: any;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ user, subscription }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [activeTab, setActiveTab] = useState('methods');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isSubscribed = subscription?.subscribed || false;
  const currentPlan = isSubscribed ? subscription?.subscriptionTier?.toLowerCase() || 'basic' : 'basic';

  const handleAddCard = () => {
    // In a real implementation, this would integrate with Stripe Elements
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully."
    });
    setIsAddingCard(false);
  };

  const handleRemoveCard = (id: string) => {
    // In a real implementation, this would call Stripe API
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed."
    });
  };

  const handleSetDefault = (id: string) => {
    // In a real implementation, this would call Stripe API
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated."
    });
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    if (subscription?.createCheckoutSession) {
      try {
        // This would be the actual price ID from Stripe
        const priceId = selectedPlan.id === 'plan_premium' ? 'price_premium_monthly' : 'price_professional_monthly';
        await subscription.createCheckoutSession(priceId);
        
        // The createCheckoutSession function should redirect to Stripe
        // If it doesn't, we can show a toast notification
        toast({
          title: "Redirecting to checkout",
          description: "You'll be redirected to complete your purchase."
        });
      } catch (error) {
        console.error("Checkout error:", error);
        toast({
          variant: "destructive",
          title: "Checkout failed",
          description: "There was an error initiating checkout. Please try again."
        });
      }
    } else {
      // Simulate redirect for demo purposes
      navigate('/checkout');
    }
  };

  const handleManageSubscription = () => {
    if (subscription?.openCustomerPortal) {
      subscription.openCustomerPortal();
    } else {
      toast({
        title: "Customer Portal",
        description: "This would open the Stripe Customer Portal in a real implementation."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Payments</CardTitle>
        <CardDescription>
          Manage your payment methods and view your payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{method.brand}</p>
                        {method.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        •••• {method.last4} • Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this payment method?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCard(method.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              
              <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      In a real implementation, this would integrate with Stripe Elements
                      to add a new payment method securely.
                    </p>
                    <div className="p-6 border rounded-md bg-slate-50">
                      <p className="text-center text-muted-foreground">
                        Stripe Card Element would be placed here
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCard}>
                        Add Card
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {mockPaymentHistory.map(payment => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payment.description}</p>
                      <Badge 
                        variant={payment.status === 'succeeded' ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {payment.status === 'succeeded' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                </div>
              ))}
              
              {mockPaymentHistory.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No payment history</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                    When you make payments, they'll appear here for your reference.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="subscription">
            <div className="space-y-6">
              <div className={`p-6 rounded-lg relative overflow-hidden ${
                isSubscribed ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-slate-50 border'
              } border`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {isSubscribed ? (
                        subscription?.subscriptionTier || 'Premium'
                      ) : 'Free Plan'}
                    </h3>
                    <p className="text-sm text-muted-foreground">Current plan</p>
                  </div>
                  <Badge>{isSubscribed ? 'Active' : 'Free'}</Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {isSubscribed ? (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">All premium features</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Unlimited events</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Priority support</p>
                      </div>
                      
                      {subscription?.subscriptionEnd && (
                        <p className="text-sm text-muted-foreground mt-4">
                          Renews on {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                        </p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleManageSubscription}
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Basic features</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Create events</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {!isSubscribed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`overflow-hidden relative ${
                        plan.isPopular ? 'border-2 border-primary' : ''
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-primary text-white px-3 py-1 transform rotate-0 origin-top-right">
                            <Sparkles className="h-3 w-3 inline-block mr-1" /> Popular
                          </div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          <div className="flex items-end gap-1">
                            <span className="text-3xl font-bold">
                              ${(plan.price / 100).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">/{plan.interval}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                              <p className="text-sm">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={plan.price > 0 ? (plan.isPopular ? "default" : "outline") : "secondary"}
                          disabled={plan.price === 0}
                          onClick={() => handleSubscribe(plan)}
                        >
                          {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Your Purchase</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {selectedPlan && (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                            <p className="text-sm text-muted-foreground">
                              Billed {selectedPlan.interval}ly
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${(selectedPlan.price / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Secure payment processed by Stripe</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button onClick={handleCheckout}>
                          Proceed to Checkout
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsCheckoutOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentsTab;
