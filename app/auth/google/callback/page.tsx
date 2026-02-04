'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function GoogleAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Get the session from the URL fragment
        // Supabase OAuth automatically exchanges the code and sets the session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!data.session) {
          setError('No session created. Please try signing in again.');
          setIsLoading(false);
          return;
        }

        console.log('[v0] Google auth successful, user:', data.session.user.email);
        
        // Store user info in localStorage for app access
        localStorage.setItem('currentUser', JSON.stringify({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || 'User',
          avatar: data.session.user.user_metadata?.avatar_url,
        }));

        // Redirect to feed
        router.push('/feed');
      } catch (err: any) {
        console.error('[v0] Google auth callback error:', err);
        setError(err?.message || 'Authentication failed');
        setIsLoading(false);
      }
    })();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 border-border/50 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Authentication Failed</h2>
            <p className="text-center text-muted-foreground text-sm">{error}</p>
            <Button 
              onClick={() => router.push('/signin')}
              className="w-full mt-4"
            >
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 border-border/50 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <svg className="h-8 w-8 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Signing you in…</h2>
            <p className="text-muted-foreground mt-2">Please wait while we complete your Google authentication.</p>
          </div>
          <div className="flex gap-2 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/signin')}
            className="w-full bg-transparent"
          >
            Back to Sign In
          </Button>
        </div>
      </Card>
    </div>
  );
}
