
import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import PaymentMethodOption from './PaymentMethodOption';
import { PaymentIcons } from './PaymentIcons';

interface CardInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentMethodFormProps {
  paymentMethod: string;
  cardInfo: CardInfo;
  savePaymentInfo: boolean;
  onPaymentMethodChange: (value: string) => void;
  onCardInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  cardInfo,
  savePaymentInfo,
  onPaymentMethodChange,
  onCardInfoChange,
  onCheckboxChange
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Select your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={paymentMethod}
          onValueChange={onPaymentMethodChange}
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
                onChange={onCardInfoChange}
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
                  onChange={onCardInfoChange}
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
                  onChange={onCardInfoChange}
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
                onChange={onCardInfoChange}
                placeholder="Name as it appears on card"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="savePaymentInfo" 
                checked={savePaymentInfo} 
                onCheckedChange={onCheckboxChange} 
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
  );
};

export default PaymentMethodForm;
