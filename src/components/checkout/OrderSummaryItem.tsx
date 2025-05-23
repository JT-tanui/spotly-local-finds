
import React from 'react';
import { CheckoutItem } from '@/types';

interface OrderSummaryItemProps {
  item: CheckoutItem;
}

export const OrderSummaryItem: React.FC<OrderSummaryItemProps> = ({ item }) => {
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

export default OrderSummaryItem;
