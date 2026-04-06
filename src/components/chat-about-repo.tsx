'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { getChatAboutRepoResponse } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';

interface ChatAboutRepoProps {
    repoFullName: string;
    readmeContent: string;
}

export function ChatAboutRepo({ repoFullName, readmeContent }: ChatAboutRepoProps) {
    const [question, setQuestion] = useState('What problem does this project solve?');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAsk = async () => {
        if (!question.trim()) return;

        const userMessage = { role: 'user' as const, content: question };
        setChatHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        setQuestion('');

        try {
            const response = await getChatAboutRepoResponse({
                repoFullName,
                readmeContent,
                question: userMessage.content,
            });

            const modelResponse = { role: 'model' as const, content: response.answer };
            setChatHistory(prev => [...prev, modelResponse]);

        } catch (error) {
            console.error('AI chat failed:', error);
            const modelErrorResponse = { role: 'model' as const, content: "Sorry, I couldn't get a response. Please try again." };
            setChatHistory(prev => [...prev, modelErrorResponse]);
            toast({
                variant: 'destructive',
                title: 'AI Chat Error',
                description: 'There was a problem communicating with the AI. Please check your API key and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot />
                    AI Chat About This Repository 
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    {chatHistory.length > 0 && (
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/50">
                            {chatHistory.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'model' && <Bot className="h-6 w-6 flex-shrink-0 text-primary" />}
                                    <div className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        <p>{message.content}</p>
                                    </div>
                                    {message.role === 'user' && <User className="h-6 w-6 flex-shrink-0" />}
                                 </div>
                            ))}
                             {isLoading && (
                                <div className="flex items-start gap-3 mb-4">
                                     <Bot className="h-6 w-6 flex-shrink-0 text-primary" />
                                     <div className="rounded-lg p-3 text-sm bg-secondary flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                     </div>
                                </div>
                            )}
                        </ScrollArea>
                    )}

                    <div className="flex w-full items-center space-x-2">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about this repo..."
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
                            disabled={isLoading}
                        />
                        <Button onClick={handleAsk} disabled={isLoading || !question.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
