
import React, { useState } from 'react';
import { UserProfile, PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Plus, Clock, Check, AlertTriangle, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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

interface PaymentsTabProps {
  user: UserProfile;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ user }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [activeTab, setActiveTab] = useState('methods');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const { toast } = useToast();

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
              <div className="p-6 border rounded-lg bg-slate-50 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">Current plan</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm">Basic features</p>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm">Create events</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-primary overflow-hidden relative">
                  <div className="absolute top-2 right-2">
                    <Badge>Recommended</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>Premium</CardTitle>
                    <CardDescription>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">$19.99</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">All basic features</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Unlimited events</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Priority support</p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => 
                      toast({
                        title: "Implementation required",
                        description: "This would integrate with Stripe Checkout"
                      })
                    }>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">$49.99</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">All premium features</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Advanced analytics</p>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm">Dedicated account manager</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => 
                      toast({
                        title: "Implementation required",
                        description: "This would integrate with Stripe Checkout"
                      })
                    }>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentsTab;
