'use client';

import { Suspense } from 'react';
import { ChatKitPanel } from '@/components/chat-kit-panel';
import { Loader2 } from 'lucide-react';

export default function AIAgentPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI Career Assistant</h1>
        <p className="text-muted-foreground">Chat with AIM to get career advice, resume reviews, and job recommendations</p>
      </div>
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-card border border-border rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
            </div>
          </div>
        }
      >
        <ChatKitPanel />
      </Suspense>
    </div>
  );
}
