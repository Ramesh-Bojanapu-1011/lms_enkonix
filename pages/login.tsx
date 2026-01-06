import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Mail, Lock, Shield } from "lucide-react";

const roles = ["Student", "Faculty", "Admin"] as const;
type Role = (typeof roles)[number];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleRedirect: Record<Role, string> = {
    Student: "/",
    Faculty: "/courses",
    Admin: "/dashbord",
  };

  const demoCreds: Record<Role, { email: string; password: string }> = {
    Student: { email: "student@school.edu", password: "password" },
    Faculty: { email: "faculty@school.edu", password: "password" },
    Admin: { email: "admin@school.edu", password: "password" },
  };

  const applyDemo = (r: Role) => {
    setRole(r);
    setEmail(demoCreds[r].email);
    setPassword(demoCreds[r].password);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      // store token + role
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("role", data.role || role);
      }
      // redirect by role
      router.push(roleRedirect[role]);
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign in - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-orange-50 via-white to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-64 h-64 bg-orange-200/40 dark:bg-orange-500/10 rounded-full blur-3xl -top-16 -left-10" />
          <div className="absolute w-72 h-72 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl bottom-0 right-0" />
        </div>

        <div className="w-full max-w-md relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 dark:border-gray-800 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to continue to the ESS Student Hub
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  role === r
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Quick demo logins
            </div>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={`${r}-demo`}
                  type="button"
                  onClick={() => applyDemo(r)}
                  className="px-2 py-2 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500">
                <Mail size={16} className="text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
                  placeholder="you@school.edu"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500">
                <Lock size={16} className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a className="hover:text-orange-500" href="#">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60 shadow-md shadow-orange-500/20"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
