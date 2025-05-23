
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckoutItem } from '@/types';
import OrderSummaryItem from './OrderSummaryItem';

interface CheckoutState {
  items: CheckoutItem[];
  total: number;
  serviceType: string;
  bookingId?: string;
  merchantName?: string;
}

interface OrderSummaryProps {
  checkoutData: CheckoutState;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ checkoutData }) => {
  return (
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
  );
};

export default OrderSummary;
