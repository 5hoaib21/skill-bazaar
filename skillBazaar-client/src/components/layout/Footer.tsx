import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-deep-teal rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-charcoal">VolunteerConnect</span>
            </div>
            <p className="text-sm text-charcoal/60">Connect with meaningful volunteer opportunities in your community.</p>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal mb-3">Platform</h3>
            <div className="space-y-2">
              <Link href="/opportunities" className="block text-sm text-charcoal/60 hover:text-charcoal">Browse Opportunities</Link>
              <Link href="/about" className="block text-sm text-charcoal/60 hover:text-charcoal">About Us</Link>
              <Link href="/contact" className="block text-sm text-charcoal/60 hover:text-charcoal">Contact</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal mb-3">Legal</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-charcoal/60 hover:text-charcoal">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-charcoal/60 hover:text-charcoal">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal mb-3">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-charcoal/60 hover:text-charcoal">Help Center</Link>
              <Link href="/blogs" className="block text-sm text-charcoal/60 hover:text-charcoal">Blog</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-charcoal/40">
          &copy; {new Date().getFullYear()} VolunteerConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
