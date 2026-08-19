"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/55">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass()}
          placeholder="admin@gtcfx.com"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/55">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass()}
          placeholder="Enter password"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-poppins text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-falcon-deep font-poppins text-sm uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
