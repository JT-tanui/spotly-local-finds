
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import { Icons } from '@/components/ui/icons';
import BillingForm from '@/components/checkout/BillingForm';
import PaymentMethodForm from '@/components/checkout/PaymentMethodForm';
import OrderSummary from '@/components/checkout/OrderSummary';

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
              <BillingForm 
                billingInfo={billingInfo}
                onBillingInfoChange={handleBillingInfoChange}
                onSelectChange={handleSelectChange}
              />
              
              {/* Payment Method */}
              <PaymentMethodForm 
                paymentMethod={paymentMethod}
                cardInfo={cardInfo}
                savePaymentInfo={savePaymentInfo}
                onPaymentMethodChange={handlePaymentMethodChange}
                onCardInfoChange={handleCardInfoChange}
                onCheckboxChange={handleCheckboxChange}
              />
              
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
            <OrderSummary checkoutData={checkoutData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
