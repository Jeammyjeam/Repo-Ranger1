'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { createCustomModel, getCustomModels, deleteCustomModel } from '@/lib/firestore';
import type { CustomModel } from '@/lib/types';

export default function CustomAIPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [models, setModels] = useState<CustomModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);

  // Load user's custom models
  useEffect(() => {
    if (user && db) {
      loadModels();
    }
  }, [user, db]);

  const loadModels = async () => {
    if (!user || !db) return;

    try {
      const userModels = await getCustomModels(db, user.uid);
      setModels(userModels);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast({ variant: 'destructive', title: 'Failed to load models' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!user || !db || !newModelName.trim() || selectedRepos.length === 0) return;

    try {
      await createCustomModel(db, user.uid, {
        name: newModelName.trim(),
        description: newModelDescription.trim(),
        repositories: selectedRepos,
      });

      toast({ title: 'Custom AI model created successfully!' });

      setNewModelName('');
      setNewModelDescription('');
      setSelectedRepos([]);
      setIsCreateDialogOpen(false);
      loadModels();
    } catch (error) {
      console.error('Error creating model:', error);
      toast({ variant: 'destructive', title: 'Failed to create model' });
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!user || !db) return;

    try {
      await deleteCustomModel(db, user.uid, modelId);
      toast({ title: 'Model deleted successfully!' });
      loadModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({ variant: 'destructive', title: 'Failed to delete model' });
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
              <div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                  Custom AI Models
                </h1>
                <p className="text-muted-foreground mt-2">
                  Train AI assistants on specific repositories for personalized coding help
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Custom AI Model</DialogTitle>
                    <DialogDescription>
                      Train an AI assistant on selected repositories. The model will have deep knowledge of the chosen codebases.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Model Name</Label>
                      <Input
                        id="name"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="e.g., React Expert"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={newModelDescription}
                        onChange={(e) => setNewModelDescription(e.target.value)}
                        placeholder="Describe what this model specializes in..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Training Repositories</Label>
                      <Textarea
                        value={selectedRepos.join('\n')}
                        onChange={(e) => setSelectedRepos(e.target.value.split('\n').filter(r => r.trim()))}
                        placeholder="Enter repository names (one per line):&#10;facebook/react&#10;vercel/next.js&#10;tailwindlabs/tailwindcss"
                        rows={5}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter repository names in owner/repo format
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateModel} disabled={!newModelName.trim() || selectedRepos.length === 0}>
                      Create Model
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {models.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No custom models yet</h2>
                <p className="text-muted-foreground mb-4">
                  Create your first AI model trained on specific repositories for personalized coding assistance.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First Model
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card key={model.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteModel(model.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {model.description && (
                        <CardDescription>{model.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Training Repositories:</p>
                          <div className="flex flex-wrap gap-1">
                            {model.repositories.slice(0, 3).map((repo) => (
                              <Badge key={repo} variant="secondary" className="text-xs">
                                {repo}
                              </Badge>
                            ))}
                            {model.repositories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{model.repositories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1">
                            <Link href={`/ai/chat/${model.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}