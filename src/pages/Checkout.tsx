
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import { Icons } from '@/components/ui/icons';

// Common payment method icons
const PaymentIcons = {
  visa: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
      <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.177 1.991.177l.466-2.242c0 0-1.382-.513-2.757-.513-3.453 0-4.716 1.693-4.716 3.293 0 3.575 5.274 2.818 5.274 4.48 0 .21-.166.668-.959.668-1.209 0-2.816-.463-2.816-.463l-.495 2.272c0 0 1.371.538 3.156.538 1.622 0 4.572-.449 4.572-3.479C32.011 23.306 26.369 23.919 26.369 22.206z"/>
    </svg>
  ),
  mastercard: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"/>
      <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"/>
      <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"/>
    </svg>
  ),
  paypal: (
    <div className="w-6 h-6 flex items-center justify-center">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.026-.024.13a.804.804 0 0 1-.794.68h-2.52a.489.489 0 0 1-.483-.42.488.488 0 0 1-.01-.121l.818-5.214a.804.804 0 0 1 .793-.679h.505c3.237 0 5.774-1.315 6.515-5.12.256-1.313.193-2.447-.302-3.327a2.876 2.876 0 0 0-.9-.817c-.563-.36-1.305-.585-2.205-.663h-5.847a.804.804 0 0 0-.794.68l-2.826 17.894a.49.49 0 0 1-.483.42H2a.488.488 0 0 1-.482-.559L4.345 7.85A.804.804 0 0 1 5.14 7.17h5.847c2.086 0 3.618.394 4.65 1.145.532.388.917.857 1.176 1.401.259.544.392 1.19.392 1.938 0 .482-.057.982-.17 1.495a7.08 7.08 0 0 1-.469 1.284 4.462 4.462 0 0 0-1.95-2.863c-1.033-.751-2.565-1.145-4.65-1.145H3.924a.489.489 0 0 1-.483-.42L.617 1.56A.488.488 0 0 1 .99 1h8.157c.898.078 1.64.303 2.204.663.564.36 1 .817 1.302 1.37.302.544.458 1.19.458 1.938 0 .482-.056.982-.168 1.495-.113.512-.268.982-.465 1.407.465.036.883.101 1.258.195.374.094.71.208 1.004.344.294.135.56.294.793.478.233.183.44.388.607.612.169.224.317.463.439.718.122.256.225.528.302.817z" fill="#009EE3"></path>
      </svg>
    </div>
  ),
  apple: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16px" height="16px">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
};

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutState {
  items: CheckoutItem[];
  total: number;
  serviceType: string;
  bookingId?: string;
  merchantName?: string;
}

// Supporting Components for Checkout
const PaymentMethodOption: React.FC<{
  value: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  disabled?: boolean;
}> = ({ value, label, icon, description, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={`payment-${value}`} disabled={disabled} />
      <Label htmlFor={`payment-${value}`} className="flex items-center cursor-pointer">
        <div className="mr-2">{icon}</div>
        <div>
          <span className="font-medium">{label}</span>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </Label>
    </div>
  );
};

const OrderSummaryItem: React.FC<{ item: CheckoutItem }> = ({ item }) => {
  return (
    <div className="flex justify-between py-2">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
      </div>
      <p className="font-semibold">${item.price.toFixed(2)}</p>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutState>({
    items: [],
    total: 0,
    serviceType: 'booking'
  });

  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load checkout data from location state
  useEffect(() => {
    if (location.state) {
      setCheckoutData(location.state);
    } else {
      // No checkout data provided, redirect to home
      toast({
        title: "Missing checkout information",
        description: "Please select items before proceeding to checkout.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [location, navigate, toast]);

  const handleBillingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo({
      ...billingInfo,
      [name]: value
    });
  };

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setBillingInfo({
      ...billingInfo,
      [name]: value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setSavePaymentInfo(checked);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 2000));
      
      // Success path
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully."
      });
      
      // Navigate to confirmation page
      navigate('/confirmation', {
        state: {
          orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
          amount: checkoutData.total,
          items: checkoutData.items,
          paymentMethod,
          bookingId: checkoutData.bookingId
        }
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === 'credit-card') {
      if (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.cardholderName) {
        toast({
          title: "Missing payment information",
          description: "Please fill in all required card details.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.address || 
        !billingInfo.city || !billingInfo.state || !billingInfo.zipCode) {
      toast({
        title: "Missing billing information",
        description: "Please fill in all required billing details.",
        variant: "destructive"
      });
      return;
    }
    
    // Process payment
    processPayment();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <main className="pt-20 pb-16 container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Checkout Form */}
          <div className="flex-1 order-2 md:order-1">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            <form onSubmit={handleFormSubmit}>
              {/* Billing Information */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Please enter your billing details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={billingInfo.fullName}
                        onChange={handleBillingInfoChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={billingInfo.email}
                        onChange={handleBillingInfoChange}
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingInfoChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={billingInfo.city}
                        onChange={handleBillingInfoChange}
                        placeholder="San Francisco"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={billingInfo.state} 
                        onValueChange={(value) => handleSelectChange('state', value)}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={billingInfo.zipCode}
                        onChange={handleBillingInfoChange}
                        placeholder="94103"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={billingInfo.country} 
                      onValueChange={(value) => handleSelectChange('country', value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-3"
                  >
                    <PaymentMethodOption
                      value="credit-card"
                      label="Credit / Debit Card"
                      icon={<div className="flex space-x-1">{PaymentIcons.visa}{PaymentIcons.mastercard}</div>}
                    />
                    <PaymentMethodOption
                      value="paypal"
                      label="PayPal"
                      icon={PaymentIcons.paypal}
                      description="You will be redirected to PayPal to complete payment"
                    />
                    <PaymentMethodOption
                      value="apple-pay"
                      label="Apple Pay"
                      icon={PaymentIcons.apple}
                      disabled={!window.navigator.userAgent.includes('Mac')}
                    />
                  </RadioGroup>
                  
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={cardInfo.cardNumber}
                          onChange={handleCardInfoChange}
                          placeholder="•••• •••• •••• ••••"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={cardInfo.expiryDate}
                            onChange={handleCardInfoChange}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            type="password"
                            value={cardInfo.cvv}
                            onChange={handleCardInfoChange}
                            placeholder="•••"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          name="cardholderName"
                          value={cardInfo.cardholderName}
                          onChange={handleCardInfoChange}
                          placeholder="Name as it appears on card"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                          id="savePaymentInfo" 
                          checked={savePaymentInfo} 
                          onCheckedChange={handleCheckboxChange} 
                        />
                        <label
                          htmlFor="savePaymentInfo"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Save card information for future payments
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto px-8" 
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Complete Payment ($${checkoutData.total.toFixed(2)})`
                )}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="md:w-1/3 order-1 md:order-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                {checkoutData.merchantName && (
                  <CardDescription>{checkoutData.merchantName}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutData.items.map(item => (
                  <OrderSummaryItem key={item.id} item={item} />
                ))}
                
                <Separator className="my-2" />
                
                {checkoutData.serviceType === 'booking' && (
                  <div className="text-sm text-muted-foreground">
                    <p>Booking ID: {checkoutData.bookingId || 'N/A'}</p>
                    <p>Service type: Reservation</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start space-y-2">
                <div className="flex justify-between w-full text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${(checkoutData.total * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>${(checkoutData.total * 0.1).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between w-full font-bold text-lg">
                  <span>Total</span>
                  <span>${checkoutData.total.toFixed(2)}</span>
                </div>
                <div className="w-full pt-4">
                  <p className="text-xs text-center text-muted-foreground">
                    By proceeding with this payment, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
