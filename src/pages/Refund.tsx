import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Refund() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <RefreshCw className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Refund Policy
          </h1>
          <p className="text-[#F5F0E8]/60">Last updated: May 2026</p>
        </div>

        <div className="space-y-8 text-[#F5F0E8]/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">1. Money-Back Guarantee</h2>
            <p>
              We want you to be completely satisfied with your BaziReading experience. We offer a
              <strong className="text-[#D4A853]"> 7-day money-back guarantee</strong> on all purchases.
              If you are not happy with your reading for any reason, contact us within 7 days of
              purchase for a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">2. Eligibility for Refunds</h2>
            <p className="mb-2">You are eligible for a refund if:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You request a refund within 7 days of purchase</li>
              <li>You have not extensively used the service (e.g., generated multiple full reports)</li>
              <li>You contact us with your order details and reason for the refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">3. Subscription Refunds</h2>
            <p>
              For monthly and yearly subscriptions, you may request a refund within 7 days of the
              initial purchase or renewal. Refunds for subscriptions are prorated based on the
              unused portion of your subscription period. After 7 days, you may cancel your
              subscription at any time, but no refund will be issued for the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">4. How to Request a Refund</h2>
            <p className="mb-2">To request a refund, please:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Email us at support@bazireading.com with subject "Refund Request"</li>
              <li>Include your order ID (found in your purchase confirmation email)</li>
              <li>Briefly explain why you are requesting a refund</li>
              <li>Allow up to 5-7 business days for processing</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">5. Refund Processing</h2>
            <p>
              Approved refunds will be processed to your original payment method within 5-10 business
              days. The exact timing depends on your bank or payment provider. You will receive an
              email confirmation once your refund has been processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">6. Non-Refundable Cases</h2>
            <p className="mb-2">Refunds may not be granted if:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The refund request is made after the 7-day window</li>
              <li>There is evidence of abuse or fraudulent activity</li>
              <li>The service was extensively used before requesting a refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">7. Cancellation</h2>
            <p>
              You can cancel your subscription at any time from your account settings or by contacting
              us. Cancellation will take effect at the end of your current billing period. You will
              continue to have access to premium features until the end of the paid period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">8. Contact</h2>
            <p>
              For any questions about refunds or cancellations, please contact us at
              support@bazireading.com. We aim to respond to all inquiries within 24 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
