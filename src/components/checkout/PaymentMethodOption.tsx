
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethodOptionProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({ 
  value, 
  label, 
  icon, 
  description, 
  disabled 
}) => {
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

export default PaymentMethodOption;
