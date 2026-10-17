
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >
                <h1 className="text-3xl font-bold text-emerald-400">
                    JobTrack
                </h1>

                <p className="text-slate-400">
                    Sign in to manage your applications.
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                />

                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                />

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </main>
    );
}
