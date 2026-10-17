
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    History,
    ArrowRight,
    BriefcaseBusiness,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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
        <main className="min-h-screen bg-slate-950 p-5 text-slate-100 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <header className="mb-9">
                    <p className="mb-2 text-sm font-medium text-emerald-400">
                        Job Search Management
                    </p>

                    <h1 className="flex items-center gap-3 text-3xl font-bold sm:text-4xl">
                        <History className="text-emerald-400" size={32} />
                        Application History
                    </h1>

                    <p className="mt-3 text-slate-400">
                        A timeline of your application status changes.
                    </p>
                </header>

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
                                        className="flex items-start gap-4 p-6"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                            <BriefcaseBusiness
                                                size={20}
                                                className="text-emerald-400"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold">
                                                {application?.company ??
                                                    "Unknown company"}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {application?.position}
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
                </section>
            </div>
        </main>
    );
}

export default function HistoryPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-slate-950 p-10 text-slate-300">
                    Loading application history...
                </main>
            }
        >
            <HistoryContent />
        </Suspense>
    );
}
