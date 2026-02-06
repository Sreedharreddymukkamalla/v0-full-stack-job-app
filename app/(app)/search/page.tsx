'use client';

import { Suspense } from 'react';
import { SearchContent } from './search-content';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SearchLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Loading search results...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
