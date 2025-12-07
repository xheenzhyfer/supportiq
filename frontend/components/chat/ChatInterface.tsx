'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  chatbotId?: string; // Optional now
  initialMessage?: string;
  suggestions?: string[];
  demoMode?: boolean; // New Prop to toggle "Fake" mode
}

// Hardcoded "Brain" for the Landing Page
const DEMO_RESPONSES: Record<string, string> = {
  "pricing": "SupportIQ has a **Free Tier** for developers! \n\nPro plans start at **$29/mo** for unlimited scraping and 10,000 message credits. [View Pricing](/pricing)",
  "create": "Creating a bot is easy:\n1. **Sign Up** for an account.\n2. Click **'New Chatbot'**.\n3. Give it a name and a personality.",
  "train": "To train your bot, simply **paste your website URL**. \n\nOur engine will crawl your pages, extract text, and vectorise it automatically. No manual data entry required!",
  "embed": "You can add SupportIQ to your site in **30 seconds**. \n\nJust copy the `<script>` tag from your dashboard and paste it into your HTML `<head>`.",
  "default": "That's a great question! Since I'm just a demo, I can mostly tell you about **Pricing**, **Training**, and **Embedding**. \n\nWhy not try creating a real account to see my full potential?"
};

export function ChatInterface({ 
  chatbotId, 
  initialMessage = "Hello! How can I help you?", 
  suggestions = [],
  demoMode = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate AI Thinking
  const simulateResponse = async (text: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake 1.5s delay

    const lowerText = text.toLowerCase();
    let response = DEMO_RESPONSES.default;

    // Simple keyword matching
    if (lowerText.includes('cost') || lowerText.includes('price') || lowerText.includes('free')) response = DEMO_RESPONSES.pricing;
    else if (lowerText.includes('create') || lowerText.includes('build') || lowerText.includes('make')) response = DEMO_RESPONSES.create;
    else if (lowerText.includes('train') || lowerText.includes('learn') || lowerText.includes('url')) response = DEMO_RESPONSES.train;
    else if (lowerText.includes('embed') || lowerText.includes('add') || lowerText.includes('install')) response = DEMO_RESPONSES.embed;

    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: response 
    }]);
    setIsLoading(false);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Handle Demo Mode (No API)
    if (demoMode) {
      await simulateResponse(text);
      return;
    }

    // 3. Handle Real Mode (API Call)
    setIsLoading(true);
    try {
      if (!chatbotId) throw new Error("Missing Bot ID");
      
      const response = await api.post('/chat/message', {
        message: text,
        chatbotId
      });

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.data.data.answer 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errorMsg: Message = { 
        id: 'error', 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to the server." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-zinc-900 text-white flex items-center gap-2">
        <div className="p-2 bg-white/10 rounded-full">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {demoMode ? "SupportIQ Demo" : "Support Assistant"}
          </h3>
          <p className="text-xs text-zinc-400">
            {demoMode ? "Interactive Preview" : "Powered by SupportIQ"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-zinc-50">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 max-w-[85%]",
                msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-zinc-200 text-zinc-700"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white text-zinc-800 border rounded-tl-none"
              )}>
                <ReactMarkdown 
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} className="underline font-medium hover:text-indigo-200" target="_blank" rel="noopener noreferrer" />
                    ),
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mt-1" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mt-1" />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 self-start max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="p-3 bg-white border rounded-2xl rounded-tl-none shadow-sm flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        
        {/* Suggestions */}
        {suggestions.length > 0 && messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-xs text-zinc-600 rounded-full border transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex gap-2"
        >
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={demoMode ? "Try 'How much does it cost?'" : "Ask a question..."}
            className="flex-1 text-zinc-900 placeholder:text-zinc-500"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

    </div>
  );
}
