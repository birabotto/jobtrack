
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    LayoutDashboard,
    LogOut,
    Plus,
    Search,
    Trash2,
    History,
} from "lucide-react";

import {
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    signOut,
} from "@/app/actions";

const statuses = [
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Offer",
    "Rejected",
] as const;

type Status = (typeof statuses)[number];

export type Application = {
    id: string;
    company: string;
    position: string;
    status: string;
    applied_at: string | null;
    job_url: string | null;
    notes: string | null;
};

export default function ApplicationDashboard({
    applications,
}: {
    applications: Application[];
}) {
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const filtered = applications.filter((app) =>
        `${app.company} ${app.position}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const stats = [
        {
            label: "Total Applications",
            value: applications.length,
            icon: BriefcaseBusiness,
        },
        {
            label: "Interviews",
            value: applications.filter(
                (app) => app.status === "Interview"
            ).length,
            icon: CalendarDays,
        },
        {
            label: "Active Applications",
            value: applications.filter((app) =>
                ["Applied", "Screening"].includes(app.status)
            ).length,
            icon: Clock3,
        },
    ];

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
                        className="flex w-full items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 font-medium text-emerald-400"
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
                                Job Search Overview
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Dashboard
                            </h2>

                            <p className="mt-2 text-slate-400">
                                Your job search, organized.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-400"
                        >
                            <Plus size={19} />
                            Add Application
                        </button>
                    </header>

                    {/* STATISTICS */}
                    <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <stat.icon
                                        size={23}
                                        className="text-emerald-400"
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

                    {/* ADD APPLICATION */}
                    {showForm && (
                        <form
                            action={async (formData) => {
                                runAction(async () => {
                                    await addApplication(formData);
                                    setShowForm(false);
                                });
                            }}
                            className="mb-8 grid gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-2"
                        >
                            <div className="sm:col-span-2">
                                <h3 className="text-xl font-semibold">
                                    New Application
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Add a job application to your tracker.
                                </p>
                            </div>

                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Company
                                <input
                                    name="company"
                                    required
                                    maxLength={200}
                                    placeholder="Company name"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Job Title
                                <input
                                    name="position"
                                    required
                                    maxLength={200}
                                    placeholder="Position"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                                Job URL
                                <input
                                    name="job_url"
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                                Notes
                                <textarea
                                    name="notes"
                                    maxLength={5000}
                                    rows={3}
                                    placeholder="Add notes about this application..."
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
                                    disabled={pending}
                                    className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                                >
                                    {pending ? "Saving..." : "Save Application"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* APPLICATIONS TABLE */}
                    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-6">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    Applications
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Manage and track your job applications.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4">
                                <Search
                                    size={18}
                                    className="shrink-0 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search applications..."
                                    aria-label="Search applications"
                                    className="w-44 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:w-60"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Company
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Position
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Applied
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filtered.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="border-t border-slate-800 transition-colors hover:bg-slate-800/40"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-emerald-400">
                                                        {app.company.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div className="font-semibold text-white">
                                                        {app.job_url ? (
                                                            <a
                                                                href={app.job_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:text-emerald-400"
                                                            >
                                                                {app.company}
                                                            </a>
                                                        ) : (
                                                            app.company
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-slate-300">
                                                {app.position}
                                            </td>

                                            <td className="px-6 py-5">
                                                <select
                                                    aria-label={`Status for ${app.company}`}
                                                    disabled={pending}
                                                    value={app.status}
                                                    onChange={(e) =>
                                                        runAction(() =>
                                                            updateApplicationStatus(
                                                                app.id,
                                                                e.target.value as Status
                                                            )
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50"
                                                >
                                                    {statuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="px-6 py-5 text-slate-400">
                                                {app.applied_at ?? "—"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <button
                                                    type="button"
                                                    aria-label={`Delete ${app.company}`}
                                                    disabled={pending}
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Delete application for ${app.company}?`
                                                            )
                                                        ) {
                                                            runAction(() =>
                                                                deleteApplication(app.id)
                                                            );
                                                        }
                                                    }}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filtered.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <BriefcaseBusiness
                                        size={36}
                                        className="mx-auto mb-4 text-slate-600"
                                    />

                                    <h4 className="font-semibold text-slate-200">
                                        No applications found
                                    </h4>

                                    <p className="mt-2 text-sm text-slate-400">
                                        {search
                                            ? "Try searching for a different company or position."
                                            : "Add your first application to get started."}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-800 px-6 py-4 text-sm text-slate-400">
                            Showing {filtered.length} of {applications.length} applications
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
