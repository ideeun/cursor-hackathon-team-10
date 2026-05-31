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
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/30 to-sky-50">
        <Loader2 size={32} className="animate-spin text-orange-500" />
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
