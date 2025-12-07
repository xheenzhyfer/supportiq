'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Terminal, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'creating' | 'training' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const addLog = (message: string) => setLogs((prev) => [...prev, message]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setStep('creating');
    setLogs([]);

    try {
      // 1. Create the Chatbot
      addLog('🤖 Initializing Chatbot...');
      
      // Using the "System" Org ID we created in SQL migration for now.
      const TEST_ORG_ID = '00000000-0000-0000-0000-000000000000'; 
      
      const createRes = await api.post('/chatbots', {
        name: name,
        welcomeMessage: `Hi! Ask me anything about ${name}.`
      });

      const chatbotId = createRes.data.data.id;
      addLog(`✅ Chatbot Created (ID: ${chatbotId.slice(0, 8)}...)`);

      // 2. Trigger Training (Ingestion)
      setStep('training');
      addLog(`🕷️ Starting Scraper for: ${url}`);
      addLog('⏳ This may take up to 60 seconds (rate limits)...');

      const ingestRes = await api.post('/scraper/ingest', {
        url: url,
        chatbotId: chatbotId
      });

      // Fire and Forget Response Handling
      addLog(`✅ Process Started!`);
      addLog(`⏳ The server is processing your data in the background.`);
      addLog(`⚠️ You can chat now, but the bot needs ~2 minutes to learn.`);

      setStep('done');
      toast.success('Chatbot is ready!');

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/dashboard/bot/${chatbotId}`);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      addLog(`❌ Error: ${error.response?.data?.error || error.message}`);
      toast.error('Failed to create bot');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      {/* NEW: Back Link */}
    <div className="w-full max-w-lg mb-6">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>

    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
          <CardTitle>Create New Chatbot</CardTitle>
          <CardDescription>
            Enter a website URL, and we will build a custom AI agent for it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="name">Chatbot Name</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Support"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL to Train On</Label>
              <Input
                id="url"
                placeholder="https://example.com/docs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-zinc-500">
                We will scrape this page and use it as the chatbot's knowledge base.
              </p>
            </div>

            {/* Live Logs Section */}
            {logs.length > 0 && (
              <div className="rounded-md bg-zinc-950 p-4 font-mono text-xs text-green-400">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1 flex items-start gap-2">
                    <Terminal className="mt-0.5 h-3 w-3 shrink-0 opacity-50" />
                    <span>{log}</span>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 animate-pulse text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}

            {step === 'done' ? (
              <Button type="button" className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Success! Redirecting...
              </Button>
            ) : (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === 'creating' ? 'Creating Bot...' : 'Training AI...'}
                  </>
                ) : (
                  'Create & Train Chatbot'
                )}
              </Button>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}