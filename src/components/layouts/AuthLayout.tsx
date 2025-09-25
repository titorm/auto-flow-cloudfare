import React from 'react';
import { Logo } from '@/components/Logo';
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary),0.1),rgba(255,255,255,0))]"></div>
      <div className="w-full max-w-md animate-fade-in space-y-6">
        <div className="flex justify-center">
          <Logo className="text-3xl" />
        </div>
        {children}
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Built with ���️ at Cloudflare
      </footer>
    </div>
  );
}