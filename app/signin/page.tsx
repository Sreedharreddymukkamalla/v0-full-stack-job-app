'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, AlertCircle, Check, Zap } from 'lucide-react';
import { signIn as authSignIn } from '@/lib/auth';
import { signInWithGoogle } from '@/lib/supabase';
import { MOCK_USERS } from '@/lib/mock-data';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const user = authSignIn(email, password);
      if (user) {
        router.push('/feed');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignIn = (mockEmail: string, mockPassword: string) => {
    setEmail(mockEmail);
    setPassword(mockPassword);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('[v0] Google sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-primary/95 to-accent p-12 text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur font-bold text-xl shadow-lg">
              A
            </div>
            <span className="text-2xl font-bold tracking-tight">AImploy</span>
          </div>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-md">
              Continue your career journey. Access your profile, messages, and discover new opportunities.
            </p>
          </div>
          
          <div className="space-y-5">
            {[
              { title: 'Track Applications', desc: 'Monitor all your job applications in one place' },
              { title: 'Network with Pros', desc: 'Connect with industry professionals' },
              { title: 'AI-Powered Insights', desc: 'Get personalized career recommendations' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 backdrop-blur">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-primary-foreground/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          2024 AImploy. All rights reserved.
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              A
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">AImploy</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Sign In</h1>
            <p className="text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-foreground">Quick Demo Access</p>
            </div>
            <div className="grid gap-2">
              {MOCK_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSignIn(user.email, user.password)}
                  className="w-full text-left p-3 rounded-xl bg-background/80 hover:bg-background border border-transparent hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {error && (
            <div className="flex gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-12 rounded-xl gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-11 rounded-xl gap-2 font-medium bg-transparent hover:bg-secondary"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline font-medium">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
