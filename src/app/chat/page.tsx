'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/header';
import { ChatInterface } from '@/components/chat-interface';
import { ChatSidebar } from '@/components/chat-sidebar';
import { loadConversationSummaries } from '@/lib/firestore';
import { AuthGuard } from '@/components/auth-guard';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const searchParams = useSearchParams();
  
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isSummariesLoading, setIsSummariesLoading] = useState(true);
  
  const activeConversationId = searchParams.get('id') || null;

  const fetchSummaries = useCallback(() => {
    if (user && db) {
      setIsSummariesLoading(true);
      loadConversationSummaries(db, user.uid)
        .then(setSummaries)
        .finally(() => setIsSummariesLoading(false));
    }
  }, [user, db]);

  useEffect(() => {
    if (user) { // Only fetch if user is available (guaranteed by AuthGuard)
      fetchSummaries();
    }
  }, [user, fetchSummaries]);

  const handleConversationCreated = (newId: string) => {
    // Navigate to the new conversation URL and refetch summaries
    router.push(`/chat?id=${newId}`);
    fetchSummaries();
  };

  const handleConversationDeleted = () => {
    // If the active chat was deleted, navigate back to the base chat page
    if (activeConversationId) {
      router.push('/chat');
    }
    fetchSummaries();
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 grid md:grid-cols-[280px_1fr] overflow-hidden">
          <div className="hidden md:flex">
            <ChatSidebar 
              summaries={summaries}
              activeId={activeConversationId}
              isLoading={isSummariesLoading}
              onDeleted={handleConversationDeleted}
            />
          </div>
          <main className="overflow-hidden">
              <ChatInterface 
                  conversationId={activeConversationId}
                  onConversationCreated={handleConversationCreated}
              />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
