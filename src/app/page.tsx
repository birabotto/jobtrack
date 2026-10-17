
"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

type Status =
  | "Saved"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

type Application = {
  id: string;
  company: string;
  position: string;
  status: Status;
  date: string;
};

const statuses: Status[] = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      applications.filter((app) =>
        `${app.company} ${app.position}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [applications, search]
  );

  function addApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    setApplications((prev) => [
      {
        id: crypto.randomUUID(),
        company: company.trim(),
        position: position.trim(),
        status: "Applied",
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);

    setCompany("");
    setPosition("");
    setShowForm(false);
  }

  function updateStatus(id: string, status: Status) {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
  }

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: BriefcaseBusiness,
    },
    {
      label: "Interviews",
      value: applications.filter((a) => a.status === "Interview").length,
      icon: CalendarDays,
    },
    {
      label: "Active Applications",
      value: applications.filter((a) =>
        ["Applied", "Screening"].includes(a.status)
      ).length,
      icon: Clock3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <aside className="border-b border-slate-800 bg-slate-900 p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-10 flex items-center gap-3">
          <BriefcaseBusiness className="text-emerald-400" />
          <h1 className="text-2xl font-bold">JobTrack</h1>
        </div>

        <nav className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800 p-3 text-emerald-400">
            <LayoutDashboard size={19} />
            Dashboard
          </div>
          <p className="px-3 text-xs text-slate-500">
            Applications · Follow-ups · Interviews
          </p>
        </nav>
      </aside>

      <main className="w-full min-w-0 flex-1 p-5 md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="mt-2 text-slate-400">
              Track your job applications in one place.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <Plus size={18} /> Add Application
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <stat.icon className="mb-4 text-emerald-400" />
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <form
            onSubmit={addApplication}
            className="mb-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-3"
          >
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              required
              className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3"
            />
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job title"
              required
              className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950"
            >
              Save Application
            </button>
          </form>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-5">
            <h3 className="text-lg font-semibold">Applications</h3>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-48 bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-t border-slate-800">
                    <td className="p-4 font-medium">{app.company}</td>
                    <td className="p-4">{app.position}</td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateStatus(app.id, e.target.value as Status)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-400">{app.date}</td>
                    <td className="p-4">
                      <button
                        aria-label={`Delete ${app.company} application`}
                        onClick={() =>
                          setApplications((prev) =>
                            prev.filter((a) => a.id !== app.id)
                          )
                        }
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-10 text-center text-slate-400">
                No applications found. Add your first job application!
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
