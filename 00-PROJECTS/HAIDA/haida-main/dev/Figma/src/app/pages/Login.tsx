import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { GlassCard } from '../components/ui/glass-card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { useUi } from '../lib/ui-context';
import { useAuth } from '../lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Loader2,
} from 'lucide-react';

export function Login({ onLogin }: { onLogin: () => void }) {
  const { config } = useUi();
  const { login } = config;
  const {
    signIn,
    signUp,
    signInWithMicrosoft,
    resetPassword,
    isLoading: authLoading,
    user,
    isAuthenticated,
    error: authError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const lastAuthErrorRef = useRef<string | null>(null);

  // Auto-redirect if user is already authenticated (e.g., from Microsoft OAuth callback)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting to dashboard:', user.email);
      toast.success('Welcome back!', {
        description: `Logged in as ${user.email}`,
      });
      onLogin();
    }
  }, [isAuthenticated, user, onLogin]);

  useEffect(() => {
    if (authError && authError !== lastAuthErrorRef.current) {
      lastAuthErrorRef.current = authError;
      toast.error('Authentication Error', {
        description: authError,
      });
    }
  }, [authError]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Validation Error', {
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address.',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Weak Password', {
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Real Supabase authentication with Remember Me option
      const result = await signIn(email, password, rememberMe);

      if (result.success) {
        toast.success('Welcome back!', {
          description: 'Successfully logged in to HAIDA Workspace.',
        });
        onLogin();
      } else {
        toast.error('Authentication Failed', {
          description: result.error || 'Invalid credentials provided.',
        });
      }
    } catch (err: any) {
      toast.error('Authentication Failed', {
        description: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(resetEmail)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email to receive the reset link.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(resetEmail);

      if (result.success) {
        toast.info('Reset Link Sent', {
          description: `Check your inbox at ${resetEmail} for instructions.`,
        });
        setIsResetOpen(false);
        setResetEmail('');
      } else {
        toast.error('Failed to Send Reset Link', {
          description: result.error || 'Please try again later.',
        });
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateEmail(signUpEmail)) {
      toast.error('Invalid Email', { description: 'Please enter a valid email to sign up.' });
      return;
    }

    if (!signUpPassword || signUpPassword.length < 6) {
      toast.error('Weak Password', { description: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(signUpEmail, signUpPassword, signUpName);

      if (result.success) {
        toast.success('Account Created', {
          description:
            result.notice ||
            `Account created for ${signUpEmail}. If you do not receive an email, contact support.`,
        });
        setIsSignUpOpen(false);
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpName('');
      } else {
        toast.error('Registration Failed', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <GlassCard className="w-full max-w-md p-8 space-y-6 bg-white/60 dark:bg-slate-900/80 backdrop-blur-3xl border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="space-y-2 text-center"></div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder={login.emailPlaceholder}
                type="email"
                className="glass bg-white/40 border-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="px-0 h-auto text-xs text-primary"
                  onClick={() => setIsResetOpen(true)}
                >
                  {login.forgotPasswordText}
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={login.passwordPlaceholder}
                className="glass bg-white/40 border-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                {login.rememberMeText}
              </Label>
            </div>

            <Button
              className="w-full h-11 text-base shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700 transition-all"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : login.signInButtonText}
            </Button>

            {login.showMicrosoftLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground glass rounded-full">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11 glass hover:bg-white/20 border-white/20"
                  onClick={async () => {
                    const result = await signInWithMicrosoft();
                    if (!result.success) {
                      toast.error(result.error || 'Microsoft sign-in failed');
                    }
                  }}
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                  )}
                  {isLoading || authLoading ? 'Signing in...' : login.microsoftButtonText}
                </Button>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">{login.subtitle}</p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="px-0 text-primary font-semibold"
              onClick={() => setIsSignUpOpen(true)}
            >
              {login.signUpText}
            </Button>
          </p>
        </GlassCard>
      </div>

      {/* Official Footer */}
      {login.showFooter && (
        <footer className="relative z-10 w-full bg-white/80 dark:bg-slate-900/90 border-t border-border/20 py-8 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground border-t border-border/20 pt-8">
              <p>{login.footerText}</p>
              <ul className="flex flex-wrap justify-center gap-6">
                <li>
                  <a
                    href="https://www.hiberus.com/aviso-legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary"
                  >
                    Aviso Legal
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hiberus.com/politica-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary"
                  >
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hiberus.com/cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary"
                  >
                    Política de Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      )}

      {/* Forgot Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              placeholder="name@company.com"
              className="mt-2"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleForgotPassword}>Send Reset Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Enter your details to create a new account. We'll send you a confirmation link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                placeholder="John Doe"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address</Label>
              <Input
                id="signup-email"
                placeholder="name@company.com"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                placeholder="Min 6 characters"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignUpOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
