"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session");
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          router.replace("/admin");
          return;
        }

        setAuthenticated(true);
        setAdminEmail(data.email || "");
      } catch {
        router.replace("/admin");
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-poppins text-sm text-ink/60">Loading dashboard...</p>
      </div>
    );
  }

  if (!authenticated) return null;

  return <AdminDashboard adminEmail={adminEmail} />;
}
