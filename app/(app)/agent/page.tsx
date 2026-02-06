'use client';

import { Suspense } from 'react';
import { ChatPanel } from '@/components/ai-chat-panel';
import { Loader2 } from 'lucide-react';

export default function AIAgentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading AI Assistant...</p>
          </div>
        </div>
      }
    >
      <ChatPanel />
    </Suspense>
  );
}
