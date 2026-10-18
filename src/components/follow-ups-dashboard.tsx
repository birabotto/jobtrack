
"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import Link from "next/link";
import {
    BriefcaseBusiness,
    LayoutDashboard,
    CalendarDays,
    CalendarClock,
    Clock3,
    CheckCircle2,
    AlertCircle,
    LogOut,
    Plus,
    Trash2,
    Check,
    ArrowUpRight,
    X,
    History,
} from "lucide-react";

import {
    createFollowUp,
    completeFollowUp,
    deleteFollowUp,
    signOut,
} from "@/app/actions";

type Application = {
    id: string;
    company: string;
    position: string;
};

type FollowUp = {
    id: string;
    application_id: string;
    due_at: string;
    status: string;
    notes: string | null;
    completed_at: string | null;
};

type FollowUpFilter = "All" | "Pending" | "Overdue" | "Completed";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

// Relógio externo: atualiza a cada minuto sem chamar
// setState diretamente dentro de um useEffect.
let currentTime = 0;
let clockInterval: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();

function subscribeToClock(callback: () => void) {
    clockListeners.add(callback);

    if (clockInterval === null) {
        currentTime = Date.now();

        clockInterval = setInterval(() => {
            currentTime = Date.now();

            clockListeners.forEach((listener) => listener());
        }, 60_000);
    }

    return () => {
        clockListeners.delete(callback);

        if (clockListeners.size === 0 && clockInterval !== null) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    };
}

function getClockSnapshot() {
    return currentTime;
}

function getServerClockSnapshot() {
    return 0;
}

function useCurrentTime() {
    return useSyncExternalStore(
        subscribeToClock,
        getClockSnapshot,
        getServerClockSnapshot
    );
}

export default function FollowUpsDashboard({
    applications,
    followUps,
}: {
    applications: Application[];
    followUps: FollowUp[];
}) {
    const [showForm, setShowForm] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<FollowUpFilter>("All");

    const [selectedApplication, setSelectedApplication] = useState(
        applications[0]?.id ?? ""
    );

    const now = useCurrentTime();

    const pendingItems = followUps.filter(
        (item) => item.status === "Pending"
    );

    const overdueItems = pendingItems.filter(
        (item) =>
            now > 0 &&
            new Date(item.due_at).getTime() < now
    );

    const completedItems = followUps.filter(
        (item) => item.status === "Completed"
    );

    const filteredItems = followUps.filter((item) => {
        if (filter === "All") {
            return true;
        }

        if (filter === "Pending") {
            return item.status === "Pending";
        }

        if (filter === "Completed") {
            return item.status === "Completed";
        }

        return (
            item.status === "Pending" &&
            now > 0 &&
            new Date(item.due_at).getTime() < now
        );
    });

    function runAction(action: () => Promise<void>) {
        setError("");

        startTransition(async () => {
            try {
                await action();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong"
                );
            }
        });
    }

    function findApplication(id: string) {
        return applications.find((app) => app.id === id);
    }

    const stats = [
        {
            label: "Pending Follow-ups",
            value: pendingItems.length,
            icon: Clock3,
            color: "text-amber-400",
            background: "bg-amber-500/10",
        },
        {
            label: "Overdue",
            value: overdueItems.length,
            icon: AlertCircle,
            color: "text-red-400",
            background: "bg-red-500/10",
        },
        {
            label: "Completed",
            value: completedItems.length,
            icon: CheckCircle2,
            color: "text-emerald-400",
            background: "bg-emerald-500/10",
        },
    ];

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
                        aria-current="page"
                        className="flex w-full items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 font-medium text-emerald-400"
                    >
                        <CalendarDays size={19} />
                        <span>Follow-ups</span>
                    </Link>

                    <Link
                        href="/history"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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
                    <header className="mb-9 flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <p className="mb-2 text-sm font-medium text-emerald-400">
                                Job Search Management
                            </p>

                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                <CalendarClock
                                    size={32}
                                    className="text-emerald-400"
                                />
                                Follow-ups
                            </h1>

                            <p className="mt-2 text-slate-400">
                                Never miss an opportunity to reconnect.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-400"
                        >
                            {showForm ? <X size={19} /> : <Plus size={19} />}
                            {showForm ? "Close Form" : "New Follow-up"}
                        </button>
                    </header>

                    {/* STATISTICS */}
                    <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm"
                            >
                                <div
                                    className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${stat.background}`}
                                >
                                    <stat.icon
                                        size={23}
                                        className={stat.color}
                                    />
                                </div>

                                <p className="text-sm font-medium text-slate-400">
                                    {stat.label}
                                </p>

                                <p className="mt-2 text-4xl font-bold tracking-tight">
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-6 rounded-xl border border-red-800 bg-red-950/50 p-4 text-red-300"
                        >
                            {error}
                        </div>
                    )}

                    {/* NEW FOLLOW-UP FORM */}
                    {showForm && (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                const form = event.currentTarget;
                                const formData = new FormData(form);

                                const localDate = String(
                                    formData.get("due_at") ?? ""
                                );

                                const timestamp = new Date(localDate).getTime();

                                if (
                                    !localDate ||
                                    !Number.isFinite(timestamp)
                                ) {
                                    setError(
                                        "Please select a valid date and time."
                                    );
                                    return;
                                }

                                formData.set(
                                    "due_at",
                                    new Date(timestamp).toISOString()
                                );

                                runAction(async () => {
                                    await createFollowUp(formData);
                                    form.reset();
                                    setShowForm(false);
                                });
                            }}
                            className="mb-8 grid gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-2"
                        >
                            <div className="sm:col-span-2">
                                <h2 className="text-xl font-semibold">
                                    Schedule a Follow-up
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Choose an application and set a reminder.
                                </p>
                            </div>

                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Application

                                <select
                                    name="application_id"
                                    required
                                    value={selectedApplication}
                                    onChange={(event) =>
                                        setSelectedApplication(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                >
                                    {applications.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.company} — {app.position}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Date and Time

                                <input
                                    name="due_at"
                                    type="datetime-local"
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                                Notes

                                <textarea
                                    name="notes"
                                    maxLength={2000}
                                    rows={3}
                                    placeholder="Example: Send a follow-up email to the recruiter..."
                                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                />
                            </label>

                            <div className="flex justify-end gap-3 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        pending || applications.length === 0
                                    }
                                    className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                                >
                                    {pending
                                        ? "Saving..."
                                        : "Save Follow-up"}
                                </button>
                            </div>

                            {applications.length === 0 && (
                                <p className="text-sm text-amber-300 sm:col-span-2">
                                    Add an application before scheduling a follow-up.
                                </p>
                            )}
                        </form>
                    )}

                    {/* FOLLOW-UP LIST */}
                    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Scheduled Follow-ups
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Keep track of your upcoming actions.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(
                                    [
                                        "All",
                                        "Pending",
                                        "Overdue",
                                        "Completed",
                                    ] as const
                                ).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setFilter(option)}
                                        aria-pressed={filter === option}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${filter === option
                                                ? "bg-emerald-500 text-slate-950"
                                                : "bg-slate-800 text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <CalendarClock
                                    size={38}
                                    className="mx-auto mb-4 text-slate-600"
                                />

                                <h3 className="font-semibold text-slate-200">
                                    No follow-ups found
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    {filter === "All"
                                        ? "Schedule your first follow-up to get started."
                                        : `No ${filter.toLowerCase()} follow-ups.`}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {filteredItems.map((item) => {
                                    const application = findApplication(
                                        item.application_id
                                    );

                                    const isOverdue =
                                        item.status === "Pending" &&
                                        now > 0 &&
                                        new Date(item.due_at).getTime() < now;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-wrap items-center justify-between gap-5 p-6 transition-colors hover:bg-slate-800/40"
                                        >
                                            <div className="flex min-w-0 items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-bold text-emerald-400">
                                                    {application?.company
                                                        ?.charAt(0)
                                                        .toUpperCase() ?? "?"}
                                                </div>

                                                <div className="min-w-0 space-y-2">
                                                    <h3 className="font-semibold text-white">
                                                        {application?.company ??
                                                            "Unknown company"}
                                                    </h3>

                                                    <p className="text-sm text-slate-400">
                                                        {application?.position}
                                                    </p>

                                                    <p className="flex items-center gap-2 text-sm text-slate-300">
                                                        <CalendarDays size={15} />
                                                        {formatDate(item.due_at)}
                                                    </p>

                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isOverdue
                                                                ? "bg-red-500/10 text-red-400"
                                                                : item.status === "Completed"
                                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                                    : "bg-amber-500/10 text-amber-400"
                                                            }`}
                                                    >
                                                        {isOverdue
                                                            ? "Overdue"
                                                            : item.status}
                                                    </span>

                                                    {item.notes && (
                                                        <p className="max-w-xl whitespace-pre-wrap text-sm text-slate-400">
                                                            {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.status === "Pending" && (
                                                    <button
                                                        type="button"
                                                        disabled={pending}
                                                        onClick={() =>
                                                            runAction(() =>
                                                                completeFollowUp(item.id)
                                                            )
                                                        }
                                                        title="Mark as completed"
                                                        aria-label="Mark as completed"
                                                        className="rounded-xl bg-emerald-500 p-3 text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
                                                    >
                                                        <Check size={19} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    disabled={pending}
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                "Delete this follow-up?"
                                                            )
                                                        ) {
                                                            runAction(() =>
                                                                deleteFollowUp(item.id)
                                                            );
                                                        }
                                                    }}
                                                    title="Delete follow-up"
                                                    aria-label="Delete follow-up"
                                                    className="rounded-xl border border-slate-700 p-3 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                                >
                                                    <Trash2 size={19} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 text-sm text-slate-400">
                            <span>
                                Showing {filteredItems.length} of{" "}
                                {followUps.length} follow-ups
                            </span>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                            >
                                Dashboard
                                <ArrowUpRight size={15} />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
