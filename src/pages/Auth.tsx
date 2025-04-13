
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import AppConfig from '@/config';

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters long");

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useIsDesktop();
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If debug mode and dummy auth are enabled, pre-fill the credentials
  useEffect(() => {
    if (AppConfig.debug && AppConfig.useDummyAuth) {
      setEmail(AppConfig.dummyAuthCredentials.email);
      setPassword(AppConfig.dummyAuthCredentials.password);
    }
  }, []);

  // If skipAuthentication is true in debug mode, redirect to home with mock user
  if (AppConfig.skipAuthentication) {
    navigate('/');
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }
    
    if (activeTab === "signup" && !fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If in debug mode with dummy auth, bypass validation
    if (AppConfig.debug && AppConfig.useDummyAuth) {
      setIsLoading(true);
      try {
        await signIn(
          AppConfig.dummyAuthCredentials.email, 
          AppConfig.dummyAuthCredentials.password
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signUp(email, password, { full_name: fullName });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDesktop ? 'px-4' : 'px-6'} py-12 bg-background`}>
      <Card className={`w-full ${isDesktop ? 'max-w-md' : ''} mx-auto`}>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="text-3xl font-bold text-spotly-red">Spotly</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {activeTab === "signin" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === "signin" 
              ? "Enter your email below to access your account" 
              : "Enter your information to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AppConfig.debug && AppConfig.useDummyAuth && (
            <div className="bg-amber-100 border border-amber-300 p-3 rounded-md text-sm mb-4">
              <p className="font-medium text-amber-800">Debug Mode Active</p>
              <p className="text-amber-700">Using dummy credentials for authentication.</p>
            </div>
          )}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-spotly-red hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-spotly-red hover:bg-spotly-red/90" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-spotly-red hover:bg-spotly-red/90" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our <Link to="/terms" className="text-spotly-red hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-spotly-red hover:underline">Privacy Policy</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
