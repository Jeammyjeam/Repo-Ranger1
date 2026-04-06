'use client';
import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection as firestoreCollection, query, orderBy, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { RepoCard } from '@/components/repo-card';
import { RepoCardSkeleton } from '@/components/repo-card-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateExportContent, triggerDownload } from '@/lib/export';
import Link from 'next/link';
import type { Collection as CollectionType, CollectionItem, Repository } from '@/lib/types';

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [collectionId, setCollectionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolved) => {
      setCollectionId(resolved.id);
    });
  }, [params]);

  const collectionRef = useMemoFirebase(() => {
    if (!db || !user || !collectionId) return null;
    return doc(db, 'users', user.uid, 'collections', collectionId);
  }, [db, user, collectionId]);

  const { data: collectionData, isLoading: collectionLoading } = useDoc(collectionRef);

  const collectionItemsQuery = useMemoFirebase(() => {
    if (!db || !user || !collectionId) return null;
    return query(firestoreCollection(db, 'users', user.uid, 'collections', collectionId, 'items'), orderBy('addedAt', 'desc'));
  }, [db, user, collectionId]);

  const { data: collectionItems, isLoading: itemsLoading } = useCollection(collectionItemsQuery as any);

  const handleExport = (format: 'md' | 'json' | 'csv' | 'txt') => {
    if (!collectionItems || collectionItems.length === 0) return;
    const repos = collectionItems.map(item => item.itemData as Repository);
    const content = generateExportContent(format, repos);
    const filename = `${collectionData?.name || 'collection'}-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeType = format === 'md' ? 'text/markdown' : format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain';
    triggerDownload(content, filename, mimeType);
  };

  const handleRemoveFromCollection = async (itemId: string) => {
    if (!db || !user || !collectionId) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'collections', collectionId, 'items', itemId));
      toast({ title: 'Repository removed from collection' });
    } catch (error) {
      console.error('Error removing repository from collection:', error);
      toast({ variant: 'destructive', title: 'Failed to remove repository' });
    }
  };

  if (collectionLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  if (!collectionData) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
                <p className="text-muted-foreground mb-4">
                  The collection you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link href="/collections">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Collections
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const collection = collectionData as CollectionType;

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link href="/collections">
                  <Button variant="ghost" className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Collections
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-muted-foreground mt-2">{collection.description}</p>
                )}
              </div>
              {collectionItems && collectionItems.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('md')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export MD
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              )}
            </div>

            {itemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <RepoCardSkeleton count={6} />
              </div>
            ) : !collectionItems || collectionItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No repositories in this collection</h2>
                <p className="text-muted-foreground mb-4">
                  Start adding repositories to organize your discoveries.
                </p>
                <Link href="/search">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Browse Repositories
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionItems.map((item) => (
                  <RepoCard
                    key={item.id}
                    repo={item.itemData as Repository}
                    onRemove={() => handleRemoveFromCollection(item.id)}
                    showRemoveButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}