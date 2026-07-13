"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Opportunity } from "@/types";

const categories = [
  { name: "Environment", slug: "environment", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z", count: "120+", color: "bg-green-100 text-green-700" },
  { name: "Education", slug: "education", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", count: "85+", color: "bg-blue-100 text-blue-700" },
  { name: "Healthcare", slug: "healthcare", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", count: "60+", color: "bg-red-100 text-red-700" },
  { name: "Community", slug: "community", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", count: "95+", color: "bg-purple-100 text-purple-700" },
  { name: "Animals", slug: "animals", icon: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5", count: "40+", color: "bg-amber-100 text-amber-700" },
  { name: "Technology", slug: "technology", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", count: "55+", color: "bg-cyan-100 text-cyan-700" },
];

const steps = [
  { step: "1", title: "Browse Opportunities", desc: "Explore volunteer opportunities that match your interests and skills." },
  { step: "2", title: "Apply to Volunteer", desc: "Submit your application with a message about why you want to help." },
  { step: "3", title: "Make a Difference", desc: "Get approved, show up, and contribute to causes you care about." },
];

const faqs = [
  { q: "How do I volunteer?", a: "Browse opportunities, find one that matches your interests, and click Apply. The organization will review your application and get back to you." },
  { q: "How do I post an opportunity?", a: "Create an account, go to Dashboard, and click Add Opportunity. Fill in the details and publish it." },
  { q: "Can I withdraw my application?", a: "Yes, you can withdraw a pending or approved application from your dashboard at any time." },
  { q: "Is VolunteerConnect free?", a: "Yes, VolunteerConnect is completely free for both volunteers and organizations." },
  { q: "How are applications reviewed?", a: "Organizers review each application and can approve or reject based on fit and availability." },
];

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const spotsLeft = opp.spotsAvailable - opp.spotsTaken;
  return (
    <Link href={`/opportunities/${opp._id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-deep-teal/30 transition-all flex flex-col">
      <div className="relative aspect-[16/10] bg-gray-100">
        {opp.images?.[0] ? (
          <img src={opp.images[0]} alt={opp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/20">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 text-xs font-medium text-charcoal rounded-full backdrop-blur-sm">{opp.category}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-charcoal group-hover:text-deep-teal transition-colors line-clamp-1">{opp.title}</h3>
        <p className="text-sm text-charcoal/60 mt-1 line-clamp-2">{opp.shortDescription}</p>
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-charcoal/50">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {opp.location?.isRemote ? "Remote" : opp.location?.city || "TBD"}
          </span>
          <span className={spotsLeft <= 3 ? "text-red-500 font-medium" : "text-deep-teal font-medium"}>
            {spotsLeft} spots left
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({ totalOpportunities: 0, totalApplications: 0, totalOrganizations: 0, totalVolunteers: 0 });
  const [featured, setFeatured] = useState<Opportunity[]>([]);
  const [urgent, setUrgent] = useState<Opportunity[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>("/api/landing/stats").then(setStats).catch(() => {});
    api.get<Opportunity[]>("/api/landing/featured").then(setFeatured).catch(() => {});
    api.get<Opportunity[]>("/api/landing/urgent").then(setUrgent).catch(() => {});
    api.get<any[]>("/api/landing/organizations").then(setOrgs).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-deep-teal to-teal-800 text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Make a Difference<br />in Your Community
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Connect with meaningful volunteer opportunities. Find causes you care about and start making an impact today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/opportunities" className="px-8 py-3.5 bg-white text-deep-teal font-semibold rounded-xl hover:bg-gray-50 transition-colors text-lg">
              Browse Opportunities
            </Link>
            <Link href="/register" className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: `${stats.totalVolunteers || 0}+`, label: "Active Volunteers" },
              { value: `${stats.totalOpportunities || 0}+`, label: "Opportunities" },
              { value: `${stats.totalOrganizations || 0}+`, label: "Organizations" },
              { value: `${stats.totalApplications || 0}+`, label: "Applications" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-deep-teal">{stat.value}</p>
                <p className="text-sm text-charcoal/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">Explore by Category</h2>
            <p className="text-charcoal/60">Find opportunities in the cause areas you care about most</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/opportunities?category=${cat.slug}`} className="group bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md hover:border-deep-teal/30 transition-all">
                <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} /></svg>
                </div>
                <p className="font-medium text-charcoal group-hover:text-deep-teal transition-colors">{cat.name}</p>
                <p className="text-xs text-charcoal/50 mt-1">{cat.count} opportunities</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-charcoal mb-2">Featured Opportunities</h2>
                <p className="text-charcoal/60">Popular opportunities with the most applicants</p>
              </div>
              <Link href="/opportunities" className="text-deep-teal hover:underline font-medium text-sm hidden sm:block">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((opp) => <OpportunityCard key={opp._id} opp={opp} />)}
            </div>
          </div>
        </section>
      )}

      {/* Urgent Opportunities */}
      {urgent.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-charcoal mb-2">Deadline Approaching</h2>
                <p className="text-charcoal/60">These opportunities have application deadlines coming up soon</p>
              </div>
              <Link href="/opportunities" className="text-deep-teal hover:underline font-medium text-sm hidden sm:block">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {urgent.map((opp) => <OpportunityCard key={opp._id} opp={opp} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">How It Works</h2>
            <p className="text-charcoal/60">Three simple steps to start volunteering</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 bg-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-deep-teal">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">{step.title}</h3>
                <p className="text-charcoal/60 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Organizers */}
      {orgs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-charcoal mb-3">Top Organizations</h2>
              <p className="text-charcoal/60">Organizations with the most active opportunities</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {orgs.map((org: any) => (
                <div key={org._id} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="w-14 h-14 bg-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-deep-teal">{org.name?.charAt(0) || "O"}</span>
                  </div>
                  <p className="font-semibold text-charcoal">{org.name}</p>
                  <p className="text-sm text-charcoal/50 mt-1">{org.count} opportunities</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5 group">
                <summary className="font-medium text-charcoal cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-charcoal/40 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <p className="text-charcoal/60 text-sm mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-deep-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands of volunteers and organizations making a difference.</p>
          <Link href="/register" className="inline-block px-8 py-3.5 bg-white text-deep-teal font-semibold rounded-xl hover:bg-gray-50 transition-colors text-lg">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
