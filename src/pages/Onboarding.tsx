
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Check, ChevronRight, MapPin, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const categories = [
  { id: 'restaurant', name: 'Restaurants', emoji: '🍽️' },
  { id: 'cafe', name: 'Cafes', emoji: '☕' },
  { id: 'bar', name: 'Bars', emoji: '🍷' },
  { id: 'park', name: 'Parks', emoji: '🏞️' },
  { id: 'museum', name: 'Museums', emoji: '🖼️' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎭' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'fitness', name: 'Fitness', emoji: '💪' },
];

const dietaryPreferences = [
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten Free' },
  { id: 'dairy-free', name: 'Dairy Free' },
  { id: 'nut-free', name: 'Nut Free' },
  { id: 'halal', name: 'Halal' },
  { id: 'kosher', name: 'Kosher' },
];

const accessibilityOptions = [
  { id: 'wheelchair', name: 'Wheelchair Accessible' },
  { id: 'parking', name: 'Accessible Parking' },
  { id: 'elevator', name: 'Elevator Access' },
  { id: 'restroom', name: 'Accessible Restroom' },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([1, 3]); // Default 1-3 out of 4
  const [isLoading, setIsLoading] = useState(false);
  
  const isDesktop = useIsDesktop();
  const { user, profile, setProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 4;
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleDietaryToggle = (id: string) => {
    setSelectedDietary(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleAccessibilityToggle = (id: string) => {
    setSelectedAccessibility(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handlePriceToggle = (price: number) => {
    setPriceRange(prev => {
      // If this price is already the min, update the min
      if (price === prev[0]) {
        return [Math.min(price + 1, prev[1]), prev[1]];
      }
      // If this price is already the max, update the max
      else if (price === prev[1]) {
        return [prev[0], Math.max(price - 1, prev[0])];
      }
      // If this price is in the range, make it the new min or max
      else if (price > prev[0] && price < prev[1]) {
        // Determine whether to make it new min or max based on which is closer
        return (price - prev[0] <= prev[1] - price)
          ? [price, prev[1]]
          : [prev[0], price];
      }
      // If this price is outside the range, make it new min or max
      else {
        return price < prev[0]
          ? [price, prev[1]]
          : [prev[0], price];
      }
    });
  };

  const isPriceInRange = (price: number) => {
    return price >= priceRange[0] && price <= priceRange[1];
  };

  const saveUserPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile with phone
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .update({
          favorite_categories: selectedCategories,
          dietary_preferences: selectedDietary,
          accessibility_needs: selectedAccessibility,
          price_range: priceRange,
        })
        .eq('user_id', user.id);
        
      if (preferencesError) throw preferencesError;

      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          phone,
        });
      }
      
      toast({
        title: "Setup complete!",
        description: "Your preferences have been saved.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      saveUserPreferences();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome to Spotly!</CardTitle>
              <p className="text-center text-muted-foreground">Let's set up your profile</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this for booking confirmations and event updates
                </p>
              </div>
            </CardContent>
          </>
        );
      
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">What do you like?</CardTitle>
              <p className="text-center text-muted-foreground">Select your favorite categories</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => (
                    <div 
                      key={category.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-spotly-red bg-spotly-red/10'
                          : 'border-border'
                      }`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{category.emoji}</span>
                          <span>{category.name}</span>
                        </div>
                        {selectedCategories.includes(category.id) && (
                          <Check className="h-4 w-4 text-spotly-red" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </>
        );
      
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Dietary Preferences</CardTitle>
              <p className="text-center text-muted-foreground">Select any dietary preferences you have</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {dietaryPreferences.map(item => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-2 flex items-center justify-between cursor-pointer ${
                        selectedDietary.includes(item.id)
                          ? 'border-spotly-red bg-spotly-red/10'
                          : 'border-border'
                      }`}
                      onClick={() => handleDietaryToggle(item.id)}
                    >
                      <span>{item.name}</span>
                      {selectedDietary.includes(item.id) && (
                        <Check className="h-4 w-4 text-spotly-red" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Accessibility Needs</h3>
                  {accessibilityOptions.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id}
                        checked={selectedAccessibility.includes(item.id)}
                        onCheckedChange={() => handleAccessibilityToggle(item.id)}
                      />
                      <Label htmlFor={item.id}>{item.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </>
        );
      
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Price Range</CardTitle>
              <p className="text-center text-muted-foreground">Select your preferred price range</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4].map(price => (
                    <div 
                      key={price}
                      className={`flex flex-col items-center cursor-pointer`}
                      onClick={() => handlePriceToggle(price)}
                    >
                      <div 
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-lg border-2 ${
                          isPriceInRange(price) 
                            ? 'border-spotly-red bg-spotly-red/10 text-spotly-red' 
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {'$'.repeat(price)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Your Preferences Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-spotly-red" />
                      <span className="text-sm font-medium">Favorite Categories:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.length > 0 ? (
                          selectedCategories.map(catId => {
                            const cat = categories.find(c => c.id === catId);
                            return cat ? (
                              <Badge key={catId} variant="outline" className="text-xs">
                                {cat.emoji} {cat.name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">No categories selected</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-spotly-red" />
                      <span className="text-sm font-medium">Price Range:</span>
                      <span className="text-sm">{'$'.repeat(priceRange[0])} - {'$'.repeat(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDesktop ? 'px-4' : 'px-6'} py-12 bg-background`}>
      <Card className={`w-full ${isDesktop ? 'max-w-md' : ''} mx-auto`}>
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-spotly-red transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="pt-6">
            {renderStep()}
            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={step === 1 || isLoading}
              >
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </div>
              <Button
                onClick={nextStep}
                disabled={isLoading}
              >
                {step === totalSteps ? (isLoading ? 'Saving...' : 'Finish') : 'Next'}
                {step !== totalSteps && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
