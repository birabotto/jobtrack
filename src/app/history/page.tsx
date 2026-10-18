
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
    BriefcaseBusiness,
    LayoutDashboard,
    CalendarDays,
    History,
    LogOut,
    ArrowRight,
    Clock3,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

async function HistoryContent() {
    await connection();

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    const [eventsResult, applicationsResult] = await Promise.all([
        supabase
            .from("application_events")
            .select(
                "id, application_id, event_type, old_status, new_status, notes, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100),

        supabase
            .from("applications")
            .select("id, company, position")
            .eq("user_id", user.id),
    ]);

    if (eventsResult.error) {
        throw new Error(eventsResult.error.message);
    }

    if (applicationsResult.error) {
        throw new Error(applicationsResult.error.message);
    }

    const applications = new Map(
        (applicationsResult.data ?? []).map((app) => [
            app.id,
            app,
        ])
    );

    const events = eventsResult.data ?? [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
            {/* SIDEBAR */}
            <aside className="flex flex-col border-b border-slate-800 bg-slate-900 p-5 md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
                <div className="mb-8 flex items-center gap-3 px-2">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5">
                        <BriefcaseBusiness
                            size={24}
                            className="text-emerald-400"
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight">
                        JobTrack
                    </h1>
                </div>

                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Workspace
                </p>

                <nav className="flex flex-col gap-2">
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/follow-ups"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        <CalendarDays size={19} />
                        <span>Follow-ups</span>
                    </Link>

                    <Link
                        href="/history"
                        aria-current="page"
                        className="flex w-full items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 font-medium text-emerald-400"
                    >
                        <History size={19} />
                        <span>History</span>
                    </Link>
                </nav>

                <div className="mt-8 border-t border-slate-800 pt-5 md:mt-auto">
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <LogOut size={19} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-10">
                <div className="mx-auto max-w-7xl">
                    {/* HEADER */}
                    <header className="mb-9">
                        <p className="mb-2 text-sm font-medium text-emerald-400">
                            Job Search Management
                        </p>

                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            <History
                                size={32}
                                className="text-emerald-400"
                            />
                            Application History
                        </h1>

                        <p className="mt-3 text-slate-400">
                            A timeline of your application status changes.
                        </p>
                    </header>

                    {/* SUMMARY */}
                    <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Clock3
                                    size={23}
                                    className="text-emerald-400"
                                />
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Recent Status Changes
                                </p>

                                <p className="mt-1 text-3xl font-bold">
                                    {events.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* HISTORY LIST */}
                    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="border-b border-slate-800 p-6">
                            <h2 className="text-xl font-semibold">
                                Recent Activity
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Showing the latest {events.length} events.
                            </p>
                        </div>

                        {events.length === 0 ? (
                            <div className="p-12 text-center">
                                <History
                                    size={40}
                                    className="mx-auto mb-4 text-slate-600"
                                />

                                <h3 className="font-semibold">
                                    No history yet
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    Change an application status to create
                                    your first history entry.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {events.map((event) => {
                                    const application = applications.get(
                                        event.application_id
                                    );

                                    return (
                                        <article
                                            key={event.id}
                                            className="flex items-start gap-4 p-6 transition-colors hover:bg-slate-800/40"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                                <BriefcaseBusiness
                                                    size={20}
                                                    className="text-emerald-400"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-white">
                                                    {application?.company ??
                                                        "Unknown company"}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {application?.position ?? ""}
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                                    <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300">
                                                        {event.old_status ?? "Unknown"}
                                                    </span>

                                                    <ArrowRight
                                                        size={17}
                                                        className="text-emerald-400"
                                                    />

                                                    <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-400">
                                                        {event.new_status ?? "Unknown"}
                                                    </span>
                                                </div>

                                                {event.notes && (
                                                    <p className="mt-3 text-sm text-slate-400">
                                                        {event.notes}
                                                    </p>
                                                )}

                                                <p className="mt-3 text-xs text-slate-500">
                                                    {new Intl.DateTimeFormat("en-CA", {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                        timeZone: "America/Toronto",
                                                    }).format(new Date(event.created_at))}
                                                    {" · Toronto time"}
                                                </p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <div className="border-t border-slate-800 px-6 py-4 text-sm text-slate-400">
                            Showing {events.length} recent events
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function HistoryLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
            <div className="text-center">
                <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

                <h1 className="mb-2 text-2xl font-bold text-emerald-400">
                    JobTrack
                </h1>

                <p className="text-sm text-slate-400">
                    Loading application history...
                </p>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<HistoryLoading />}>
            <HistoryContent />
        </Suspense>
    );
}
