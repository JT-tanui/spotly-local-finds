
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/contexts/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    dietaryPreferences: [] as string[],
    foodInterests: [] as string[],
    notificationPreferences: {
      email: true,
      push: true,
    },
    profileImage: null as File | null,
    previewImage: '',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id: string, type: 'dietaryPreferences' | 'foodInterests') => {
    setFormData(prev => {
      const current = [...prev[type]];
      if (current.includes(id)) {
        return { ...prev, [type]: current.filter(item => item !== id) };
      } else {
        return { ...prev, [type]: [...current, id] };
      }
    });
  };

  const handleNotificationChange = (type: 'email' | 'push', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        profileImage: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const nextStep = () => {
    if (step === 1 && !formData.fullName) {
      toast({
        title: "Missing information",
        description: "Please enter your full name to continue.",
        variant: "destructive"
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload profile image if provided
      let avatarUrl = user.user_metadata?.avatar_url || '';
      
      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.profileImage);
          
        if (uploadError) {
          throw uploadError;
        }
        
        if (data) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path);
            
          avatarUrl = urlData.publicUrl;
        }
      }
      
      // Update user metadata in auth
      await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          avatar_url: avatarUrl,
        }
      });
      
      // Create or update profile in database
      const profileData: UserProfile = {
        id: user.id,
        full_name: formData.fullName,
        avatar_url: avatarUrl,
        email: formData.email,
        user_id: user.id,
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData]);
        
      if (profileError) throw profileError;
      
      // Store user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert([{
          user_id: user.id,
          dietary_preferences: formData.dietaryPreferences,
          food_interests: formData.foodInterests,
          notification_email: formData.notificationPreferences.email,
          notification_push: formData.notificationPreferences.push,
        }]);
        
      if (preferencesError) throw preferencesError;
      
      // Update local profile state
      setProfile(profileData);
      
      toast({
        title: "Profile complete!",
        description: "Your profile has been set up successfully.",
      });
      
      // Redirect to homepage
      navigate('/');
      
    } catch (error) {
      console.error('Error during onboarding:', error);
      toast({
        title: "Error",
        description: "There was a problem setting up your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-xl mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Dinex</h1>
          <p className="text-muted-foreground">Complete your profile to get started</p>
        </div>

        <div className="mb-8">
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Profile</span>
            <span className={step >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Preferences</span>
            <span className={step >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Interests</span>
            <span className={step >= 4 ? "text-primary font-medium" : "text-muted-foreground"}>Settings</span>
          </div>
        </div>

        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
              
              <div className="flex flex-col items-center mb-6">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 relative cursor-pointer"
                  onClick={triggerFileInput}
                >
                  {formData.previewImage || user?.user_metadata?.avatar_url ? (
                    <img 
                      src={formData.previewImage || user?.user_metadata?.avatar_url || ''} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-2xl font-medium">
                      {formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Change Photo</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button" 
                  onClick={triggerFileInput}
                >
                  Upload Photo
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    disabled={!!user?.email}
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Dietary Preferences</h2>
              <p className="text-muted-foreground mb-4">
                Let us know about your dietary preferences so we can personalize your experience.
              </p>
              
              <div className="space-y-3">
                {['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo', 'No Restrictions'].map((preference) => (
                  <div key={preference} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`pref-${preference}`} 
                      checked={formData.dietaryPreferences.includes(preference)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleCheckboxChange(preference, 'dietaryPreferences');
                        } else {
                          handleCheckboxChange(preference, 'dietaryPreferences');
                        }
                      }}
                    />
                    <Label htmlFor={`pref-${preference}`}>{preference}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Food Interests</h2>
              <p className="text-muted-foreground mb-4">
                What types of food are you most interested in?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'American', 'Middle Eastern', 'Korean', 'French', 'Seafood', 'Desserts'].map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`cuisine-${cuisine}`} 
                      checked={formData.foodInterests.includes(cuisine)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleCheckboxChange(cuisine, 'foodInterests');
                        } else {
                          handleCheckboxChange(cuisine, 'foodInterests');
                        }
                      }}
                    />
                    <Label htmlFor={`cuisine-${cuisine}`}>{cuisine}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>
              <p className="text-muted-foreground mb-4">
                How would you like to receive updates from Dinex?
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="email-notifications" 
                    checked={formData.notificationPreferences.email}
                    onCheckedChange={(checked) => {
                      handleNotificationChange('email', !!checked);
                    }}
                  />
                  <Label htmlFor="email-notifications">Email notifications</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="push-notifications" 
                    checked={formData.notificationPreferences.push}
                    onCheckedChange={(checked) => {
                      handleNotificationChange('push', !!checked);
                    }}
                  />
                  <Label htmlFor="push-notifications">Push notifications</Label>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t">
                <h3 className="text-xl font-semibold mb-3">You're all set!</h3>
                <p className="text-muted-foreground">
                  Complete your profile to start using Dinex. You can always update these preferences later in your profile settings.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <Button onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Setting Up...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
