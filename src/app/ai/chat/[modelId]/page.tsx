"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { getCustomModels } from "@/lib/firestore";
import type { CustomModel } from "@/lib/types";

export default function CustomModelChatPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const modelId = params.modelId as string;

  const [model, setModel] = useState<CustomModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && db && modelId) {
      loadModel();
    }
  }, [user, db, modelId]);

  const loadModel = async () => {
    if (!user || !db || !modelId) return;

    try {
      const models = await getCustomModels(db, user.uid);
      const foundModel = models.find((m) => m.id === modelId);

      if (foundModel) {
        setModel(foundModel);
      } else {
        // Model not found, redirect
        router.push("/ai");
      }
    } catch (error) {
      console.error("Failed to load model:", error);
      router.push("/ai");
    } finally {
      setIsLoading(false);
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
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  if (!model) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <div className="text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Model not found</h2>
                <p className="text-muted-foreground mb-4">
                  The custom AI model you're looking for doesn't exist.
                </p>
                <Button asChild>
                  <Link href="/ai">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Models
                  </Link>
                </Button>
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
          <div className="container py-4">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" asChild>
                <Link href="/ai">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Models
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  {model.name}
                </h1>
                {model.description && (
                  <p className="text-muted-foreground">{model.description}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Trained on repositories:
              </p>
              <div className="flex flex-wrap gap-2">
                {model.repositories.map((repo) => (
                  <Link
                    key={repo}
                    href={`/repo/${repo}`}
                    className="text-sm bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md transition-colors"
                  >
                    {repo}
                  </Link>
                ))}
              </div>
            </div>

            <ChatInterface
              conversationId={`custom-${modelId}`}
              onConversationCreated={() => {}}
              customModel={model}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
