"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import AuthScreen from "@/components/AuthScreen";
import AppShell from "@/components/layout/AppShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="sf-page flex min-h-dvh items-center justify-center">
        <Loader2 size={32} className="animate-spin text-peach-muted" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
    </AppDataProvider>
  );
}
