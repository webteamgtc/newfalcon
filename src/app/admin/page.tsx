"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session");
        if (response.ok) {
          router.replace("/admin/dashboard");
          return;
        }
      } catch {
        // show login
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-poppins text-sm text-ink/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.2)]">
        <div className="mb-8 text-center">
          <p className="font-poppins text-xs uppercase tracking-[0.12em] text-ink/50">
            Golden Falcon Night
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">Admin Portal</h1>
          <p className="mt-2 font-poppins text-sm text-ink/65">
            Sign in to manage VIP registrations
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
