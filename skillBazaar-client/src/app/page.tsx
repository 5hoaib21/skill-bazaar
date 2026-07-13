import Link from "next/link";

const categories = [
  { name: "Environment", slug: "environment", icon: "leaf", count: "120+", color: "bg-green-100 text-green-700" },
  { name: "Education", slug: "education", icon: "book", count: "85+", color: "bg-blue-100 text-blue-700" },
  { name: "Healthcare", slug: "healthcare", icon: "heart", count: "60+", color: "bg-red-100 text-red-700" },
  { name: "Community", slug: "community", icon: "users", count: "95+", color: "bg-purple-100 text-purple-700" },
  { name: "Animals", slug: "animals", icon: "paw", count: "40+", color: "bg-amber-100 text-amber-700" },
  { name: "Technology", slug: "technology", icon: "code", count: "55+", color: "bg-cyan-100 text-cyan-700" },
];

const steps = [
  { step: "1", title: "Browse Opportunities", desc: "Explore volunteer opportunities that match your interests and skills." },
  { step: "2", title: "Apply to Volunteer", desc: "Submit your application with a message about why you want to help." },
  { step: "3", title: "Make a Difference", desc: "Get approved, show up, and contribute to causes you care about." },
];

const testimonials = [
  { name: "Sarah M.", role: "Volunteer", text: "VolunteerConnect made it so easy to find meaningful work in my community. I've met incredible people and learned new skills." },
  { name: "James L.", role: "Organizer", text: "As a non-profit organizer, this platform helps us find dedicated volunteers quickly. The application process is smooth." },
  { name: "Priya K.", role: "Volunteer", text: "I was looking for ways to give back after work hours. Found a weekly tutoring program that fits perfectly into my schedule." },
];

export default function HomePage() {
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
              { value: "2,500+", label: "Active Volunteers" },
              { value: "450+", label: "Opportunities" },
              { value: "120+", label: "Organizations" },
              { value: "15,000+", label: "Hours Contributed" },
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-charcoal group-hover:text-deep-teal transition-colors">{cat.name}</p>
                <p className="text-xs text-charcoal/50 mt-1">{cat.count} opportunities</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      {/* Testimonials */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">What People Say</h2>
            <p className="text-charcoal/60">Hear from our volunteers and organizers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-warm-amber" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-charcoal/70 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-medium text-charcoal text-sm">{t.name}</p>
                  <p className="text-xs text-charcoal/50">{t.role}</p>
                </div>
              </div>
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
