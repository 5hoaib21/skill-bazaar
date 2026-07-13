export default function HelpPage() {
  return (
    <div className="min-h-screen bg-off-white py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-charcoal">Help Center</h1>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-charcoal mb-2">How do I volunteer?</h3><p className="text-charcoal/70 text-sm">Browse opportunities, find one that matches your interests, and click Apply. The organization will review your application and get back to you.</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-charcoal mb-2">How do I post an opportunity?</h3><p className="text-charcoal/70 text-sm">Create an account, go to Dashboard, and click Add Opportunity. Fill in the details and publish it.</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-charcoal mb-2">Can I withdraw my application?</h3><p className="text-charcoal/70 text-sm">Yes, you can withdraw a pending or approved application from your dashboard.</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-charcoal mb-2">Is VolunteerConnect free?</h3><p className="text-charcoal/70 text-sm">Yes, VolunteerConnect is completely free for both volunteers and organizations.</p></div>
        </div>
      </div>
    </div>
  );
}
