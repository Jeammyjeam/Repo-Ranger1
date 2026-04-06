import type { Metadata } from 'next';
import { Inter, Source_Code_Pro, Lora } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { FirebaseClientProvider } from '@/firebase';
import './globals.css';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Repo Ranger',
  description: 'An Open-Source App Store built on top of GitHub.',
};

const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fontCode = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-code',
});

const fontSerif = Lora({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-serif',
    weight: ['400', '700'],
});

function RootLoader() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased min-h-screen bg-background font-sans", fontSans.variable, fontCode.variable, fontSerif.variable)}>
        <FirebaseClientProvider>
            <ThemeProvider>
                <Suspense fallback={<RootLoader />}>
                  {children}
                </Suspense>
                <Toaster />
            </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
