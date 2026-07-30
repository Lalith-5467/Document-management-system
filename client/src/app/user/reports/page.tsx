'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function UserReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-base font-semibold text-slate-400">Redirecting to My Workspace...</p>
    </div>
  );
}
