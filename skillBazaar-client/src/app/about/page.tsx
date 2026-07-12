export default function AboutPage() {
  const values = [
    {
      title: "Community First",
      description:
        "We believe in the power of shared experiences to build stronger communities. Every booking supports local hosts and their craft.",
    },
    {
      title: "Authenticity",
      description:
        "All experiences are created and led by real locals. No corporate packages - just genuine, handcrafted experiences.",
    },
    {
      title: "Accessibility",
      description:
        "We make unique local experiences accessible to everyone. From cooking classes to adventure sports, there's something for every budget and interest.",
    },
    {
      title: "Safety & Trust",
      description:
        "Every host is verified, every experience is reviewed, and every booking is protected by our satisfaction guarantee.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Browse Experiences",
      description:
        "Explore a curated collection of local experiences - from art workshops to culinary tours.",
    },
    {
      step: "02",
      title: "Book a Session",
      description:
        "Choose your preferred date and time, select the number of participants, and book instantly.",
    },
    {
      step: "03",
      title: "Show Up & Enjoy",
      description:
        "Meet your host, immerse yourself in the experience, and create lasting memories.",
    },
    {
      step: "04",
      title: "Share Your Feedback",
      description:
        "Rate your experience and leave a review to help the community discover the best offerings.",
    },
  ];

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-charcoal">
            About SkillBazaar
          </h1>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            SkillBazaar is a local experience marketplace that connects curious
            travelers and locals with passionate hosts who share their skills,
            knowledge, and culture through unforgettable experiences.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-charcoal text-center">
            Our Mission
          </h2>
          <p className="text-charcoal/70 text-center max-w-2xl mx-auto">
            To make the world smaller by connecting people through shared
            experiences, empowering local hosts, and fostering cultural exchange
            in every community.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-charcoal text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <h3 className="font-semibold text-deep-teal mb-2">
                  {value.title}
                </h3>
                <p className="text-charcoal/70 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-charcoal text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="text-center space-y-2">
                <div className="text-4xl font-bold text-deep-teal opacity-30">
                  {step.step}
                </div>
                <h3 className="font-semibold text-charcoal">{step.title}</h3>
                <p className="text-sm text-charcoal/60">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-4">
          <h2 className="text-2xl font-bold text-charcoal text-center">
            Trust & Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-deep-teal mb-2">
                Verified Hosts
              </h3>
              <p className="text-sm text-charcoal/70">
                Every host goes through a verification process to ensure
                quality and authenticity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-deep-teal mb-2">
                Secure Payments
              </h3>
              <p className="text-sm text-charcoal/70">
                All transactions are processed securely through Stripe with
                built-in fraud protection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-deep-teal mb-2">
                Satisfaction Guarantee
              </h3>
              <p className="text-sm text-charcoal/70">
                Not satisfied? Our fair cancellation policy ensures you get
                a refund when eligible.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
