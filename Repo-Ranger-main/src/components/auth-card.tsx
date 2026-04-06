'use client';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Github } from 'lucide-react';
import { AuthForm } from './auth-form';

// Google Icon SVG
const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
        <title>Google</title>
        <path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.45,11.44 21.35,11.1Z"/>
    </svg>
);

interface AuthCardProps {
    showTitle?: boolean;
    onSuccess?: () => void;
}

export function AuthCard({ showTitle = true, onSuccess }: AuthCardProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  
  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'github') setIsGithubLoading(true);

    try {
        const result = await signInWithPopup(auth, authProvider);
        const user = result.user;
        
        // This write happens in the background and does not block the UI.
        if (db && user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(userDoc => {
                if (!userDoc.exists()) {
                    setDoc(userDocRef, { id: user.uid }).catch(err => console.error("Firestore user doc creation failed:", err));
                }
            });
        }
        
        toast({ title: "Successfully signed in!" });
        
        // The page-level useEffect will handle the redirect.
        // We only call the onSuccess callback if it's provided (for dialogs).
        if (onSuccess) {
            onSuccess();
        }
        
    } catch(error) {
        const authError = error as AuthError;
        let errorMessage = authError.message;
        if (authError.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'An account already exists with the same email. Try signing in with the original provider.';
        } else if (authError.code === 'auth/popup-closed-by-user') {
            errorMessage = 'The sign-in window was closed before completing.';
        }
        toast({
            variant: 'destructive',
            title: `${provider === 'google' ? 'Google' : 'GitHub'} Sign In Failed`,
            description: errorMessage || 'An unknown error occurred.',
        });
    } finally {
        if (provider === 'google') setIsGoogleLoading(false);
        if (provider === 'github') setIsGithubLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-md border-0 sm:border">
        {showTitle && (
            <CardHeader className="text-center">
                <CardTitle>Welcome to Repo Ranger</CardTitle>
                <CardDescription>Sign in to save repos, create collections, and use AI chat.</CardDescription>
            </CardHeader>
        )}
        <CardContent className={showTitle ? "pt-6" : ""}>
            <div className="grid gap-2">
                <Button onClick={() => handleProviderSignIn('google')} disabled={isGoogleLoading || isGithubLoading} variant="outline">
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Continue with Google
                </Button>
                <Button onClick={() => handleProviderSignIn('github')} disabled={isGoogleLoading || isGithubLoading} variant="outline">
                    {isGithubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github />}
                    Continue with GitHub
                </Button>
            </div>
            
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or with email</span>
                </div>
            </div>

            <Tabs defaultValue="signIn" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signIn">Sign In</TabsTrigger>
                    <TabsTrigger value="signUp">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signIn" className="pt-4">
                    <AuthForm mode="signIn" onSuccess={onSuccess} />
                </TabsContent>
                <TabsContent value="signUp" className="pt-4">
                    <AuthForm mode="signUp" onSuccess={onSuccess} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  )
}
