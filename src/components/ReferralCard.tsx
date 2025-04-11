
import React from 'react';
import { Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReferralCardProps {
  referralCode: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referralCode }) => {
  const { toast } = useToast();
  
  const handleShare = () => {
    navigator.clipboard.writeText(`Join me on Spotly! Use code ${referralCode} to get your first reservation free.`);
    toast({ 
      title: "Copied to clipboard", 
      description: "Share this with your friends!" 
    });
  };
  
  return (
    <Card className="mb-6 bg-gradient-mint">
      <CardHeader>
        <CardTitle className="text-lg">Refer a Friend</CardTitle>
        <CardDescription>
          Share Spotly and both get a free reservation!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white/80 p-3 rounded-md text-center mb-3">
          <p className="font-mono font-bold">{referralCode}</p>
        </div>
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
