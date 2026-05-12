import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export default function Terms() {
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
          <Scale className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Terms of Service
          </h1>
          <p className="text-[#F5F0E8]/60">Last updated: May 2026</p>
        </div>

        <div className="space-y-8 text-[#F5F0E8]/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BaziReading, you agree to be bound by these Terms of Service.
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">2. Description of Service</h2>
            <p>
              BaziReading provides Chinese astrology (Bazi/Four Pillars) readings and compatibility analysis
              for entertainment and self-reflection purposes. Our reports are generated based on traditional
              Chinese astrological principles and should not be considered professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">3. User Accounts</h2>
            <p>
              You may use our basic services without creating an account. For premium features,
              you may need to provide accurate and complete information during the purchase process.
              You are responsible for maintaining the confidentiality of any account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">4. Payments and Subscriptions</h2>
            <p>
              We offer both one-time purchases and subscription plans. All payments are processed securely
              through Paddle. By making a purchase, you agree to Paddle's terms of service as well.
              Subscription fees are billed in advance on a recurring basis until cancelled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">5. Refund Policy</h2>
            <p>
              We offer a 7-day money-back guarantee for all purchases. If you are not satisfied with
              your reading, contact us within 7 days of purchase for a full refund. Subscription refunds
              are prorated based on unused time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">6. Intellectual Property</h2>
            <p>
              All content, reports, and materials provided by BaziReading are protected by copyright
              and other intellectual property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">7. Disclaimer</h2>
            <p>
              BaziReading is for entertainment purposes only. Our readings should not be used as a
              substitute for professional advice in legal, medical, financial, or psychological matters.
              We make no guarantees about the accuracy or outcomes of our readings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, BaziReading shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes by posting a notice on our website. Continued use of our services after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">10. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at support@bazireading.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
