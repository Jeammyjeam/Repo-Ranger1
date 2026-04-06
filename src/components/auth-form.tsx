'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

type AuthFormProps = {
  mode: 'signIn' | 'signUp';
  onSuccess?: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (showVerificationMessage) {
        setIsLoading(false);
        return;
    }

    try {
      if (mode === 'signUp') {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        
        setShowVerificationMessage(values.email);
        toast({ title: 'Verification Email Sent', description: 'Please check your inbox to complete your registration.' });
        form.reset();

        // Background write, does not block UI
        if (db && user) {
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, { id: user.uid }).catch(err => console.error("Firestore user doc creation failed:", err));
        }

      } else { // mode === 'signIn'
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Email Not Verified',
            description: 'Please check your inbox for the verification link.',
          });
        } else {
            toast({ title: 'Successfully signed in!' });

            // Background write
            if (db) {
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then(userDoc => {
                    if (!userDoc.exists()) {
                        setDoc(userDocRef, { id: user.uid }).catch(err => console.error("Firestore user doc creation failed on login:", err));
                    }
                });
            }
            
            // The page-level useEffect will handle the redirect.
            // We only call the onSuccess callback if it's provided (for dialogs).
            if (onSuccess) {
                onSuccess();
            }
            setIsLoading(false);
            return;
        }
      }
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
      }
      toast({
        variant: 'destructive',
        title: mode === 'signUp' ? 'Sign Up Failed' : 'Sign In Failed',
        description: errorMessage,
      });
    }
    
    setIsLoading(false);
  }

  if (showVerificationMessage) {
    return (
        <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-md">
            <h3 className="font-semibold text-primary">Verification Email Sent</h3>
            <p className="text-sm text-foreground/80 mt-1">
                A verification link has been sent to <span className="font-bold">{showVerificationMessage}</span>. Please check your inbox and spam folder.
            </p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signUp' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
