"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject, message: form.message, website: form.website }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", text: "Thank you! We'll get back to you shortly." });
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
      } else {
        setStatus({ type: "error", text: data.message || "Failed to send" });
      }
    } catch {
      setStatus({ type: "error", text: "Failed to send message" });
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-deep-teal focus:outline-none";

  return (
    <div className="min-h-screen bg-off-white py-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-charcoal text-center mb-8">Contact Us</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required /></div>
          </div>
          <div><label className="block text-sm font-medium text-charcoal mb-1">Subject</label><input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} required /></div>
          <div><label className="block text-sm font-medium text-charcoal mb-1">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className={inputCls} required /></div>
          {status && <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-500"}`}>{status.text}</p>}
          <button type="submit" disabled={sending} className="px-6 py-3 bg-deep-teal text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
