"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Opportunity } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [form, setForm] = useState({ message: "", skills: "", availability: "" });

  useEffect(() => {
    if (!params.id) return;
    api.get<Opportunity>(`/api/opportunities/${params.id}`)
      .then(setOpp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleApply = async () => {
    if (!session) { router.push(`/login?callbackUrl=/opportunities/${params.id}`); return; }
    setApplying(true);
    try {
      await api.post("/api/applications", {
        opportunityId: params.id,
        message: form.message,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        availability: form.availability,
      });
      setShowApplyForm(false);
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-teal" /></div>;
  if (error || !opp) return <div className="min-h-screen bg-off-white flex items-center justify-center"><p className="text-red-500">{error || "Not found"}</p></div>;

  const spotsLeft = opp.spotsAvailable - opp.spotsTaken;

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/opportunities" className="text-deep-teal hover:underline text-sm mb-4 inline-block">&larr; Back to opportunities</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {opp.images?.length > 0 && (
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img src={opp.images[0]} alt={opp.title} className="w-full aspect-[16/10] object-cover" />
              </div>
            )}

            <div>
              <span className="px-3 py-1 bg-deep-teal/10 text-deep-teal text-sm font-medium rounded-full">{opp.category}</span>
              <h1 className="text-3xl font-bold text-charcoal mt-3">{opp.title}</h1>
              <p className="text-charcoal/60 mt-2 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {opp.location?.isRemote ? "Remote" : `${opp.location?.city}, ${opp.location?.country}`}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {opp.duration || "Flexible"}
                </span>
                <span className="capitalize">{opp.commitmentType}</span>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-3">About This Opportunity</h2>
              <p className="text-charcoal/70 leading-relaxed whitespace-pre-line">{opp.fullDescription || opp.shortDescription}</p>
            </div>

            {opp.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Skills Needed</h3>
                <div className="flex flex-wrap gap-2">{opp.skills.map((s) => <span key={s} className="px-3 py-1 bg-gray-100 text-charcoal/70 text-sm rounded-full">{s}</span>)}</div>
              </div>
            )}

            {opp.responsibilities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Responsibilities</h3>
                <ul className="space-y-1.5">{opp.responsibilities.map((r, i) => <li key={i} className="flex items-start gap-2 text-charcoal/70 text-sm"><svg className="w-4 h-4 text-deep-teal mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{r}</li>)}</ul>
              </div>
            )}

            {opp.benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Benefits</h3>
                <ul className="space-y-1.5">{opp.benefits.map((b, i) => <li key={i} className="flex items-start gap-2 text-charcoal/70 text-sm"><svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>{b}</li>)}</ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
              <div>
                <p className="text-sm text-charcoal/50">Spots Available</p>
                <p className={`text-2xl font-bold ${spotsLeft <= 3 ? "text-red-500" : "text-deep-teal"}`}>{spotsLeft} / {opp.spotsAvailable}</p>
              </div>
              {opp.deadline && (
                <div>
                  <p className="text-sm text-charcoal/50">Application Deadline</p>
                  <p className="font-medium text-charcoal">{new Date(opp.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              )}
              {opp.startDate && (
                <div>
                  <p className="text-sm text-charcoal/50">Start Date</p>
                  <p className="font-medium text-charcoal">{new Date(opp.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-charcoal/50">Posted by</p>
                <p className="font-medium text-charcoal">{opp.organizerName}</p>
              </div>

              {!showApplyForm ? (
                <button onClick={() => { if (!session) { router.push(`/login?callbackUrl=/opportunities/${params.id}`); return; } setShowApplyForm(true); }} className="w-full py-3 bg-deep-teal text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors" disabled={spotsLeft <= 0}>
                  {spotsLeft <= 0 ? "No Spots Available" : "Apply Now"}
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Why do you want to volunteer?" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-deep-teal focus:outline-none" />
                  <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Skills (comma separated)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-deep-teal focus:outline-none" />
                  <input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Availability (e.g. weekends)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-deep-teal focus:outline-none" />
                  <button onClick={handleApply} disabled={applying} className="w-full py-3 bg-deep-teal text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50">
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button onClick={() => setShowApplyForm(false)} className="w-full py-2 text-sm text-charcoal/60 hover:text-charcoal">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
