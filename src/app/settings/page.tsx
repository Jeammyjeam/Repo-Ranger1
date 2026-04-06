'use client';

import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UpdateProfileForm } from '@/components/update-profile-form';
import { ChangePasswordForm } from '@/components/change-password-form';
import { DeleteAccountSection } from '@/components/delete-account-section';
import { AuthGuard } from '@/components/auth-guard';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';

export default function SettingsPage() {
    const { user } = useUser();

    const isPasswordProvider = user?.providerData.some(
        (provider) => provider.providerId === 'password'
    );

    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container max-w-4xl py-12">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline mb-8">
                            Settings
                        </h1>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your avatar and display name.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ProfilePictureUpload />
                                    <div className="border-t pt-6">
                                        <UpdateProfileForm currentUser={user!} />
                                    </div>
                                </CardContent>
                            </Card>

                            {isPasswordProvider && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your login password.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChangePasswordForm />
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-destructive bg-destructive/5">
                                <CardHeader>
                                    <CardTitle>Danger Zone</CardTitle>
                                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteAccountSection />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
