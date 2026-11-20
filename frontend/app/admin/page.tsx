"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, Trash2, HardDrive, LogOut, ArrowLeft } from "lucide-react";

interface Summary {
  counts: {
    activities: number;
    programs: number;
    volunteers: number;
    donations_inr: number;
  };
  storage: {
    used_mb: number;
    max_mb: number;
    percent_used: number;
  };
}

interface Activity {
  id: number;
  headline: string;
  location: string;
  event_date: string;
  images: { id: number; public_url: string; size_bytes: number }[];
}

export default function AdminDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Dashboard data
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // New Activity Form
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Kurkheda, Gadchiroli");
  const [eventDate, setEventDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gag_admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadDashboardData(token);
  }, [token]);

  async function loadDashboardData(jwtToken: string) {
    try {
      const [sumRes, actRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/summary`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
        fetch(`${apiUrl}/api/activities/`),
      ]);

      if (sumRes.status === 401) {
        handleLogout();
        return;
      }

      setSummary(await sumRes.json());
      setActivities(await actRes.json());
    } catch {
      setStatusMsg("Could not connect to backend API.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch(`${apiUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setAuthError("Invalid admin username or password.");
      return;
    }

    const data = await res.json();
    localStorage.setItem("gag_admin_token", data.access_token);
    setToken(data.access_token);
  }

  function handleLogout() {
    localStorage.removeItem("gag_admin_token");
    setToken(null);
    setSummary(null);
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (files && files.length > 3) {
      setStatusMsg("Please select a maximum of 3 photos.");
      return;
    }

    setSubmitting(true);
    setStatusMsg("");

    const formData = new FormData();
    formData.append("headline", headline);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("event_date", eventDate);
    if (files) {
      Array.from(files).forEach((file) => formData.append("files", file));
    }

    const res = await fetch(`${apiUrl}/api/activities/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      setStatusMsg("Failed to publish activity. Check file types or session.");
      return;
    }

    setHeadline("");
    setDescription("");
    setEventDate("");
    setFiles(null);
    setStatusMsg("Activity published and photos compressed to Supabase!");
    loadDashboardData(token);
  }

  async function handleDeleteActivity(id: number) {
    if (!token || !confirm("Delete this activity and its stored photos?")) return;
    await fetch(`${apiUrl}/api/activities/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadDashboardData(token);
  }

  // --- Login View ---
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50/50 px-4">
        <div className="w-full max-w-md rounded-xl border border-green-100 bg-white p-8 shadow-xs">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-green-800 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Public Site
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-green-950">Staff Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">Gram Arogya Ghati • Kurkheda Portal</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-green-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-green-700 focus:outline-none"
              />
            </div>

            {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-900"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated Dashboard View ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-green-950">Gram Arogya Ghati • Admin CMS</h1>
            <Link href="/" className="text-xs text-green-800 hover:underline">
              View Live Public Website →
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Top Metrics & Supabase Storage Meter */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-green-100 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Published Activities</p>
              <p className="mt-1 text-2xl font-bold text-green-950">{summary.counts.activities}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Registered Volunteers</p>
              <p className="mt-1 text-2xl font-bold text-green-950">{summary.counts.volunteers}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Active Programs</p>
              <p className="mt-1 text-2xl font-bold text-green-950">{summary.counts.programs}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-green-700" /> Gallery Storage
                </span>
                <span>{summary.storage.percent_used}%</span>
              </div>
              <p className="mt-1 text-lg font-bold text-green-950">
                {summary.storage.used_mb} / {summary.storage.max_mb} MB
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-green-100">
                <div
                  className="h-full bg-green-700"
                  style={{ width: `${Math.min(summary.storage.percent_used, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Post New Field Activity Form */}
          <section className="rounded-xl border border-green-100 bg-white p-6 lg:col-span-2">
            <h2 className="text-base font-bold text-green-950">Post New Field Activity</h2>
            <p className="mt-1 text-xs text-slate-500">
              Upload up to 3 photos. Oldest photos auto-archive if storage exceeds 800 MB.
            </p>

            <form onSubmit={handleCreateActivity} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Headline *</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Jambhali Forest Boundary Cleaning"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Village / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the Gram Sabha initiative, participants, and outcome..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Photos (Optional, max 3)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-semibold file:text-green-800 hover:file:bg-green-100"
                />
              </div>

              {statusMsg && (
                <p className="text-xs font-medium text-green-800">{statusMsg}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  "Compressing & Uploading..."
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Publish Activity
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Right: Manage Existing Activities */}
          <section className="lg:col-span-3">
            <h2 className="text-base font-bold text-green-950">Published Field Activities</h2>

            <div className="mt-4 space-y-3">
              {activities.map((act) => (
                <article
                  key={act.id}
                  className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-green-950">{act.headline}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {act.event_date} • {act.location} • {act.images.length} photo(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(act.id)}
                    title="Delete activity & free storage"
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}

              {activities.length === 0 && (
                <p className="rounded-xl border border-dashed border-green-200 bg-white p-6 text-center text-xs text-slate-500">
                  No published activities yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}