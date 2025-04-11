
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HelpTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
        <CardDescription>
          Find answers to common questions and get help
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start text-left" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            How do I make a reservation?
          </Button>
          <Button variant="outline" className="w-full justify-start text-left" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Can I cancel my reservation?
          </Button>
          <Button variant="outline" className="w-full justify-start text-left" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            How do I earn free reservations?
          </Button>
          <Button variant="outline" className="w-full justify-start text-left" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpTab;
