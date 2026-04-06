'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, Send, Download, Mic, MicOff, Paperclip, Loader2, Volume2, StopCircle, Wand2, Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { searchGithubForChat, getTextToSpeech } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useUser, useFirestore } from '@/firebase';
import { saveConversation, loadConversation } from '@/lib/firestore';
import { doc as firestoreDoc, collection as firestoreCollection, Timestamp } from 'firebase/firestore';
import { CodeBlock } from './code-block';
import { triggerDownload } from '@/lib/export';
import { ChatResultCard } from './chat-result-card';
import type { Repository } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";


export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  results?: Repository[];
  searchType?: 'github';
  steps?: { type: 'tool_request' | 'tool_result'; name: string; payload: any; }[];
}

const getWelcomeMessage = (customModel?: any): Message => {
  const baseMessage = `Hi! I'm Repo Ranger, your AI coding assistant.`;
  
  if (customModel) {
    return {
      id: 'welcome-message',
      role: 'model',
      content: `Hi! I'm ${customModel.name}, your specialized AI assistant trained on ${customModel.repositories.join(', ')}. I have deep knowledge of these codebases and can help you with questions about them.`,
      timestamp: new Date(),
    };
  }
  
  return {
    id: 'welcome-message',
    role: 'model',
    content: `${baseMessage} What can I help you find or build today?`,
    timestamp: new Date(),
  };
};

export function ChatInterface({ conversationId: propConversationId, onConversationCreated, customModel }: { conversationId: string | null, onConversationCreated: (newId: string) => void, customModel?: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(propConversationId);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onConversationCreatedRef = useRef(onConversationCreated);

  const [isRecording, setIsRecording] = useState(false);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);

  // Sync prop changes to state
  useEffect(() => { setConversationId(propConversationId); }, [propConversationId]);
  useEffect(() => { onConversationCreatedRef.current = onConversationCreated; }, [onConversationCreated]);

  const scrollToBottom = useCallback(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load conversation history or show welcome message
  useEffect(() => {
    const loadHistory = async () => {
      if (!user || !db || !conversationId) {
        setMessages([getWelcomeMessage(customModel)]);
        if (conversationId) setConversationId(null);
        return;
      }
      setIsProcessing(true);
      try {
        const conversation = await loadConversation(db, user.uid, conversationId);
        if (conversation?.messages.length) {
          setMessages(conversation.messages.map((msg: any, index: number) => ({
            ...msg,
            id: `loaded-${conversationId}-${index}`,
            timestamp: (msg.timestamp as any)?.toDate() || new Date(),
          })));
        } else {
          setMessages([getWelcomeMessage(customModel)]);
          setConversationId(null);
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error Loading Chat', description: 'Could not load the conversation.' });
        setMessages([getWelcomeMessage(customModel)]);
      } finally {
        setIsProcessing(false);
      }
    };
    loadHistory();
  }, [user, db, conversationId, toast]);

  /**
   * Handles the entire process of sending a message and processing the streamed response.
   */
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    setInput('');

    const userMessage: Message = { id: `msg-user-${Date.now()}`, role: 'user', content: textToSend, timestamp: new Date() };
    const historyForApi = messages[0]?.id.startsWith('welcome-') ? [] : messages;
    setMessages([...historyForApi, userMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...historyForApi, userMessage],
          customModel: customModel ? {
            name: customModel.name,
            repositories: customModel.repositories
          } : null
        }),
      });

      if (!response.ok || !response.body) throw new Error(await response.text() || 'Failed to get streaming response.');
      
      await processStream(response.body);

    } catch (error: any) {
      console.error('Assistant chat failed:', error);
      const errorMessage: Message = { id: `msg-error-${Date.now()}`, role: 'model', content: `Sorry, I encountered an error: ${error.message}`, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
      toast({ variant: 'destructive', title: 'AI Chat Error', description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Processes the ReadableStream from the API, updating the chat state with content and tool calls.
   */
  const processStream = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const placeholderId = `msg-model-${Date.now()}`;

    // Add a placeholder message to update as chunks stream in.
    setMessages(prev => [...prev, { id: placeholderId, role: 'model', content: '', timestamp: new Date(), steps: [] }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.type === 'content') {
            setMessages(prev => prev.map(msg => msg.id === placeholderId ? { ...msg, content: msg.content + chunk.chunk } : msg));
          } else if (chunk.type === 'tool_request') {
            await handleToolRequest(placeholderId, chunk.name, chunk.args);
          }
        } catch (e) { console.error("Failed to parse stream chunk:", line, e); }
      }
    }
  };
  
  /**
   * Executes a tool requested by the AI and updates the message state with the results.
   */
  const handleToolRequest = async (messageId: string, toolName: string, args: any) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, steps: [...(msg.steps || []), { type: 'tool_request', name: toolName, payload: args }] } : msg));
    
    let results: Repository[] | null = null;
    
    try {
      if (toolName === 'searchGithub' && args.query) {
        results = await searchGithubForChat(args.query);
      }
      
      if (results) {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, results: results || undefined, searchType: 'github' } : msg));
      }
    } catch(e: any) {
      toast({ variant: 'destructive', title: `Tool Error: ${toolName}`, description: e.message });
    }
  };

  // Save conversation after processing is complete.
  useEffect(() => {
    if (!isProcessing && user && db && messages.length > 0 && !messages[0]?.id.startsWith('welcome-')) {
      let idToSave = conversationId;
      if (!idToSave) {
          const newId = firestoreDoc(firestoreCollection(db, 'users', user.uid, 'conversations')).id;
          idToSave = newId; // This is the fix
          setConversationId(newId);
          onConversationCreatedRef.current(newId);
      }
      saveConversation(db, user.uid, idToSave as string, messages);
    }
  }, [isProcessing, messages, user, db, conversationId]);

  // UI Handlers
  const handleExport = () => {
    const formatted = messages.map(m => `**${m.role.charAt(0).toUpperCase() + m.role.slice(1)} (${m.timestamp.toLocaleString()}):**\n${m.content}`).join('\n\n---\n\n');
    triggerDownload(`# Repo Ranger Chat\n\n${formatted}`, `repo-ranger-chat-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    toast({ title: "Chat export started!" });
  };
  
  const handlePlayAudio = async (message: Message) => {
    if (audioPlayingId === message.id) {
        audioRef.current?.pause();
        setAudioPlayingId(null);
        return;
    }
    if (audioPlayingId) audioRef.current?.pause();
    
    setAudioLoadingId(message.id);
    try {
        const text = message.content.replace(/```[\s\S]*?```/g, '(code block)');
        const { media } = await getTextToSpeech(text);
        if (audioRef.current && media) {
            audioRef.current.src = media;
            audioRef.current.play();
            setAudioPlayingId(message.id);
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Text-to-Speech Failed', description: e.message || 'Could not generate audio.' });
    } finally {
        setAudioLoadingId(null);
    }
  };

  // Voice & File Input Handlers... (simplified for brevity, no changes needed)
  const handleToggleVoice = () => {
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Voice input not supported' }); return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => setInput(p => (p ? p + ' ' : '') + event.results[0][0].transcript);
    recognition.onerror = (event: any) => toast({ variant: 'destructive', title: 'Voice Recognition Error', description: event.error });
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast({ variant: 'destructive', title: 'File too large', description: 'Please select a file smaller than 1MB.' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        const language = file.name.split('.').pop() || '';
        setInput(`File \`${file.name}\`:\n\`\`\`${language}\n${content}\n\`\`\`\n\nWhat does this code do?`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  useEffect(() => { return () => { recognitionRef.current?.stop(); }; }, []);
  
  const renderStepIcon = (name: string) => {
    if (name.toLowerCase().includes('search')) return <Search className="h-4 w-4 text-primary" />;
    return <Wand2 className="h-4 w-4 text-primary" />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Bot className="h-6 w-6 text-primary" />AI Assistant</h2>
        <Button variant="ghost" size="icon" onClick={handleExport} disabled={messages.length <= 1}><Download className="h-5 w-5" /><span className="sr-only">Export</span></Button>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-6 px-4 py-6">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className={`flex items-start gap-2 sm:gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && <div className="p-2 rounded-full bg-primary/10"><Bot className="h-6 w-6 text-primary" /></div>}
                <div className={`rounded-lg p-3 sm:p-4 text-sm max-w-[90%] w-fit ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  {message.steps && message.steps.length > 0 && (
                    <div className="mb-2 space-y-2 border-b border-primary/20 pb-2">
                      {message.steps.map((step, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          {renderStepIcon(step.name)}
                          <span>Using tool: <strong>{step.name}</strong></span>
                           {isProcessing && i === message.steps!.length - 1 && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none prose-p:my-0">
                     <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{ code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} onExplain={(code) => handleSend(`Explain this ${match[1]} code:\n\`\`\`${match[1]}\n${code}\n\`\`\``)} /> : <code className={className} {...props}>{children}</code>;
                        }}}
                    >{message.content}</ReactMarkdown>
                  </div>
                  {message.results && (
                    <div className="mt-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 pt-4 bg-background/30 rounded-b-lg overflow-hidden">
                        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                            <CarouselContent className="-ml-1 py-4">
                                {message.results.map((item, index) => (
                                    <CarouselItem key={item.id} className="pl-4 basis-4/5 sm:basis-2/3 md:basis-1/2">
                                        <ChatResultCard repo={item as Repository} rank={index + 1} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden sm:block"><CarouselPrevious className="ml-14" /><CarouselNext className="mr-14" /></div>
                        </Carousel>
                    </div>
                  )}
                  <div className={`text-xs mt-2 flex items-center ${message.role === 'user' ? 'justify-end text-primary-foreground/70' : 'justify-between text-muted-foreground'}`}>
                    {message.role === 'model' && message.content && <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={() => handlePlayAudio(message)}>{audioLoadingId === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : audioPlayingId === message.id ? <StopCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</Button>}
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {message.role === 'user' && <div className="p-2 rounded-full bg-secondary"><User className="h-6 w-6" /></div>}
              </div>
            </div>
          ))}
          {isProcessing && messages[messages.length - 1]?.role !== 'model' && (
             <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10"><Bot className="h-6 w-6 text-primary" /></div>
              <div className="rounded-lg p-4 text-sm bg-secondary flex items-center">
                 <div className="flex gap-1.5 items-center">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="relative">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} disabled={isProcessing} className="h-12 text-base pr-12" />
            <Button onClick={() => handleSend()} disabled={isProcessing || !input.trim()} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">{isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</Button>
          </div>
          <div className="mt-3 flex gap-2 text-sm">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleToggleVoice} disabled={isProcessing}>{isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}{isRecording ? 'Stop' : 'Voice'}</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}><Paperclip className="h-4 w-4" />Attach</Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".js,.ts,.jsx,.tsx,.py,.rb,.java,.c,.cpp,.h,.cs,.go,.rs,.php,.html,.css,.md,.txt,.json,.yaml,.yml" />
          </div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={() => setAudioPlayingId(null)} className="hidden" />
    </div>
  );
}
