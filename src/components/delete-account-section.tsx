
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

export function DeleteAccountSection() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const isPasswordProvider = user?.providerData.some(p => p.providerId === 'password');

    const handleDelete = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            if (isPasswordProvider && user.email) {
                if (!password) {
                    toast({ variant: 'destructive', title: 'Password required' });
                    setIsLoading(false);
                    return;
                }
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);
            }

            await deleteUser(user);

            toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
            router.refresh();
            router.replace('/');
        } catch (error) {
            const e = error as Error;
            let errorMessage = 'Could not delete your account. Please try again.';
            if (e.message.includes('auth/wrong-password')) {
                errorMessage = 'The password you entered is incorrect.';
            } else if (e.message.includes('auth/requires-recent-login')) {
                errorMessage = 'For security, please sign out and sign back in before deleting your account.';
            }
            toast({ variant: 'destructive', title: 'Deletion Failed', description: errorMessage });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
            setPassword('');
        }
    };
    
    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action is irreversible. It will permanently delete your account, collections, and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {isPasswordProvider && (
                    <div className="space-y-2">
                        <Label htmlFor="password">To confirm, please enter your password:</Label>
                        <Input 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                        />
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPassword('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading || (isPasswordProvider && !password)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Account
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
