import Link from "next/link";
import { api } from "@/lib/api";
import type { Experience } from "@/types";
import { ExperienceCard } from "@/components/ui/ExperienceCard";

async function getLatestExperiences(): Promise<Experience[]> {
  try {
    return await api.get<Experience[]>("/api/experiences?limit=4&sort=newest");
  } catch {
    return [];
  }
}

const categories = [
  { name: "Cooking", icon: "🍳", slug: "cooking" },
  { name: "Music", icon: "🎵", slug: "music" },
  { name: "Art & Craft", icon: "🎨", slug: "art-craft" },
  { name: "Fitness", icon: "💪", slug: "fitness" },
  { name: "Photography", icon: "📷", slug: "photography" },
  { name: "Languages", icon: "🌍", slug: "languages" },
  { name: "Technology", icon: "💻", slug: "technology" },
  { name: "Wellness", icon: "🧘", slug: "wellness" },
];

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-deep-teal/5 via-white to-warm-amber/5 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal">
            Discover Skills and Experiences Near You
          </h1>
          <p className="mt-4 text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto">
            Find unique local experiences hosted by talented people in your community
          </p>
          <form
            action="/explore"
            method="GET"
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="search"
                type="text"
                placeholder="Search experiences..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-charcoal/20 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal transition-all text-sm"
              />
            </div>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                name="city"
                type="text"
                placeholder="City..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-charcoal/20 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal transition-all text-sm"
              />
            </div>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                name="date"
                type="date"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-teal/40 focus:border-deep-teal transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-deep-teal text-white font-medium hover:bg-deep-teal/90 transition-colors text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>
          <div className="mt-6">
            <Link
              href="/dashboard/become-a-host"
              className="inline-flex items-center gap-2 text-sm font-medium text-deep-teal hover:text-deep-teal/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Become a Host
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularCategories() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-charcoal">Popular Categories</h2>
          <p className="mt-2 text-charcoal/60">Explore experiences by category</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="flex flex-col items-center p-6 rounded-xl border border-charcoal/10 bg-white hover:border-deep-teal/30 hover:shadow-md transition-all group"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-medium text-charcoal text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function LatestExperiences() {
  const experiences = await getLatestExperiences();

  return (
    <section className="py-16 md:py-20 bg-charcoal/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-charcoal">Latest Experiences</h2>
            <p className="mt-2 text-charcoal/60">Newest experiences added by hosts</p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-medium text-deep-teal hover:text-deep-teal/80 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard key={exp._id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal/40">
            <p>No experiences available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Discover",
      description: "Browse unique experiences hosted by talented locals in your area.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Book & Pay",
      description: "Secure your spot with easy booking and secure payment.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Attend & Experience",
      description: "Show up, learn something new, and make meaningful connections.",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-charcoal">How It Works</h2>
          <p className="mt-2 text-charcoal/60">Three simple steps to your next experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full bg-deep-teal/10 flex items-center justify-center mx-auto mb-4 text-deep-teal">
                {step.icon}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-semibold text-deep-teal">Step {i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">{step.title}</h3>
              <p className="text-sm text-charcoal/60 max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HostCta() {
  return (
    <section className="py-16 md:py-20 bg-warm-amber/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
          Turn Your Skill Into an Experience
        </h2>
        <p className="mt-3 text-lg text-charcoal/60 max-w-xl mx-auto">
          Share your passion, earn money, and build your reputation
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/become-a-host"
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-warm-amber text-white font-semibold hover:bg-warm-amber/90 transition-colors text-base"
          >
            Start Hosting Today
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection />
      <PopularCategories />
      <LatestExperiences />
      <HowItWorks />
      <HostCta />
    </div>
  );
}
