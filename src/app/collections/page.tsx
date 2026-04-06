"use client";
import { useState, useEffect } from "react";
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Edit, Trash2, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { migrateSavedReposToDefaultCollection } from "@/lib/firestore";
import type { Collection } from "@/lib/types";

export default function CollectionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  const collectionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "collections"),
      orderBy("createdAt", "desc"),
    );
  }, [db, user]);

  const { data: collections, isLoading } = useCollection(collectionsQuery);

  // Migrate old saved repos to default collection on first visit
  useEffect(() => {
    if (user && db && !isLoading) {
      migrateSavedReposToDefaultCollection(db, user.uid).catch(console.error);
    }
  }, [user, db, isLoading]);

  const handleCreateCollection = async () => {
    if (!db || !user || !newCollectionName.trim()) return;

    try {
      await addDoc(collection(db, "users", user.uid, "collections"), {
        userId: user.uid,
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        itemCount: 0,
      });

      setNewCollectionName("");
      setNewCollectionDescription("");
      setIsCreateDialogOpen(false);
      toast({ title: "Collection created successfully!" });
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({ variant: "destructive", title: "Failed to create collection" });
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!db || !user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "collections", collectionId));
      toast({ title: "Collection deleted successfully!" });
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({ variant: "destructive", title: "Failed to delete collection" });
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                My Collections
              </h1>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                      Create a new collection to organize your saved
                      repositories.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Collection Name</Label>
                      <Input
                        id="name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., React Projects"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={newCollectionDescription}
                        onChange={(e) =>
                          setNewCollectionDescription(e.target.value)
                        }
                        placeholder="Describe what this collection is for..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim()}
                    >
                      Create Collection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {!collections || collections.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  No collections yet
                </h2>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to start organizing your saved
                  repositories.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col) => (
                  <Link key={col.id} href={`/collections/${col.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {col.name}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCollection(col.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {col.description && (
                          <CardDescription>{col.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Github className="mr-1 h-4 w-4" />
                            {col.itemCount} repositories
                          </span>
                          <span>
                            {new Date(col.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
