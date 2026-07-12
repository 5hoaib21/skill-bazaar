export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-charcoal">
          Cancellation Policy
        </h1>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-deep-teal text-white">
                <th className="px-6 py-4 font-semibold">Time Before Session</th>
                <th className="px-6 py-4 font-semibold">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-charcoal">
                  More than 48 hours
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-600 font-medium">
                    Full Refund
                  </span>
                  <p className="text-sm text-charcoal/60 mt-1">
                    You will receive 100% of the booking amount back.
                  </p>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-charcoal">
                  24 - 48 hours
                </td>
                <td className="px-6 py-4">
                  <span className="text-warm-amber font-medium">
                    Partial Refund (50%)
                  </span>
                  <p className="text-sm text-charcoal/60 mt-1">
                    You will receive 50% of the booking amount back. Platform
                    fees are non-refundable.
                  </p>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-charcoal">
                  Less than 24 hours
                </td>
                <td className="px-6 py-4">
                  <span className="text-red-500 font-medium">
                    No Refund
                  </span>
                  <p className="text-sm text-charcoal/60 mt-1">
                    Cancellations made within 24 hours of the session are
                    non-refundable.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal">
            Important Notes
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
            <li>
              Cancellation requests must be submitted through your account or
              by contacting support.
            </li>
            <li>
              Refunds are processed within 5-10 business days and will be
              credited to your original payment method.
            </li>
            <li>
              Platform fees are non-refundable for partial and no-refund
              cancellations.
            </li>
            <li>
              Hosts may cancel sessions at any time. If a host cancels, you
              will receive a full refund.
            </li>
            <li>
              SkillBazaar reserves the right to make exceptions in
              extraordinary circumstances (e.g., medical emergencies, severe
              weather).
            </li>
          </ul>
        </section>

        <section className="bg-warm-amber/5 border border-warm-amber/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-2">
            Need Help?
          </h2>
          <p className="text-charcoal/70 text-sm">
            If you have any questions about our cancellation policy or need
            assistance with a cancellation, please contact our support team at
            support@skillbazaar.com.
          </p>
        </section>
      </div>
    </div>
  );
}
