
'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, Camera } from 'lucide-react';

export function ProfilePictureUpload() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image under 2MB.' });
            return;
        }

        setIsUploading(true);
        try {
            const storage = getStorage();
            // Create a reference to the file in Firebase Storage
            const fileRef = ref(storage, `profile_pictures/${user.uid}_${Date.now()}`);
            
            // Upload the file
            await uploadBytes(fileRef, file);
            
            // Get the public URL
            const photoURL = await getDownloadURL(fileRef);
            
            // Update the user's profile
            await updateProfile(user, { photoURL });
            
            toast({ title: 'Profile picture updated!' });
            
            // Force a reload to refresh the avatar across the app
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-3xl bg-secondary">
                    {user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || <Camera className="h-8 w-8 text-muted-foreground" />}
                </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp" 
                />
                <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload New Picture'}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG, or WEBP. Max 2MB.</p>
            </div>
        </div>
    );
}
