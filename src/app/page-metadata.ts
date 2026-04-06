import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Repo Ranger - Discover trending GitHub repositories, create personal collections, and explore the best open source projects.',
  openGraph: {
    title: 'Repo Ranger - Discover & Organize GitHub Repositories',
    description: 'Discover trending repositories, create collections, and explore the best code in the developer community.',
    type: 'website',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Repo Ranger Home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repo Ranger - Discover & Organize GitHub Repositories',
    description: 'Discover trending repositories, create collections, and explore the best code in the developer community.',
    images: ['/og-home.png'],
  },
};