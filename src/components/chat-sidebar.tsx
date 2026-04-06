'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/time-ago';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteConversation } from '@/lib/firestore';
import { useUser, useFirestore } from '@/firebase';

interface ConversationSummary {
    id: string;
    lastMessage: string;
    updatedAt: any; // Firestore Timestamp
}

export function ChatSidebar({ summaries, activeId, isLoading, onDeleted }: { summaries: ConversationSummary[], activeId: string | null, isLoading: boolean, onDeleted: () => void }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{id: string, name: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const openDeleteDialog = (summary: ConversationSummary) => {
        setToDelete({ id: summary.id, name: summary.lastMessage.slice(0, 30) + '...' });
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete || !user || !db) return;

        setIsDeleting(true);
        try {
            await deleteConversation(db, user.uid, toDelete.id);
            toast({ title: "Conversation Deleted" });
            if (activeId === toDelete.id) {
                router.push('/chat');
            }
            onDeleted(); // Tell parent to refetch summaries
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete conversation" });
        } finally {
            setIsDeleting(false);
            setDialogOpen(false);
            setToDelete(null);
        }
    };
    
    return (
        <div className="flex h-full flex-col p-3 border-r bg-secondary/50">
            <Button asChild>
                <Link href="/chat">
                    <Plus /> New Chat
                </Link>
            </Button>
            <ScrollArea className="mt-4 flex-1 -mx-3">
                <div className="px-3 space-y-1">
                    {isLoading && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                    {!isLoading && summaries.map(summary => (
                         <Link key={summary.id} href={`/chat?id=${summary.id}`} passHref>
                            <div className={cn(
                                "relative group flex cursor-pointer items-start rounded-md p-2 text-sm transition-colors hover:bg-background",
                                activeId === summary.id && "bg-background"
                            )}>
                                <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium line-clamp-1">{summary.lastMessage || "New Chat"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <TimeAgo dateString={summary.updatedAt?.toDate().toISOString()} />
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => { e.preventDefault(); openDeleteDialog(summary); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                         </Link>
                    ))}
                    {!isLoading && summaries.length === 0 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">No past conversations.</p>
                    )}
                </div>
            </ScrollArea>
             <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This will permanently delete the chat "{toDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                             {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}