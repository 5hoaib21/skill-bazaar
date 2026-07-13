"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Experience, Session } from "@/types";

export default function HostSessionsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExpId, setSelectedExpId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    startAt: "",
    endAt: "",
    capacity: 10,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Experience[]>("/api/experiences");
        setExperiences(data);
      } catch (err: any) {
        setError(err.message || "Failed to load experiences");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedExpId) {
      setSessions([]);
      return;
    }
    (async () => {
      setSessionsLoading(true);
      try {
        const data = await api.get<Session[]>(
          `/api/experiences/${selectedExpId}/sessions`
        );
        setSessions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load sessions");
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, [selectedExpId]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const newSession = await api.post<Session>(
        `/api/experiences/${selectedExpId}/sessions`,
        form
      );
      setSessions((prev) => [...prev, newSession]);
      setShowForm(false);
      setForm({ startAt: "", endAt: "", capacity: 10 });
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Cancel this session?")) return;
    try {
      await api.patch(`/api/sessions/${sessionId}/cancel`, {});
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, status: "cancelled" as const } : s
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to cancel session");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Manage Sessions</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Select Experience
        </label>
        <select
          value={selectedExpId}
          onChange={(e) => setSelectedExpId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
        >
          <option value="">Choose an experience</option>
          {experiences.map((exp) => (
            <option key={exp._id} value={exp._id}>
              {exp.title}
            </option>
          ))}
        </select>
      </div>

      {selectedExpId && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-charcoal">Sessions</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-deep-teal text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              {showForm ? "Cancel" : "Add Session"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddSession}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) =>
                      setForm({ ...form, startAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) =>
                      setForm({ ...form, endAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: Number(e.target.value) })
                    }
                    min={1}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-deep-teal text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Creating..." : "Create Session"}
              </button>
            </form>
          )}

          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" />
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.length === 0 && (
                <p className="text-charcoal/50 text-center py-8">
                  No sessions for this experience.
                </p>
              )}
              {sessions.map((session) => {
                const remainingSpots = session.capacity - session.confirmedSeats - session.reservedSeats;
                return (
                  <div
                    key={session._id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-charcoal">
                        {new Date(session.startAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-charcoal/60">
                        {new Date(session.startAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(session.endAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} |{" "}
                        Capacity: {remainingSpots}/{session.capacity} available
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        session.status === "scheduled"
                          ? "bg-deep-teal/10 text-deep-teal"
                          : session.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                        {session.status}
                      </span>
                      {session.status === "scheduled" && (
                        <button
                          onClick={() => handleCancelSession(session._id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
