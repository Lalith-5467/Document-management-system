'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-400">Redirecting to /user...</p>
    </div>
  );
}
