import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
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
          <Shield className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Privacy Policy
          </h1>
          <p className="text-[#F5F0E8]/60">Last updated: May 2026</p>
        </div>

        <div className="space-y-8 text-[#F5F0E8]/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">1. Introduction</h2>
            <p>
              At BaziReading, we respect your privacy and are committed to protecting your personal data.
              This Privacy Policy explains how we collect, use, and safeguard your information when you
              use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Birth Information:</strong> Date, time, and location of birth for Bazi calculations.</li>
              <li><strong>Personal Information:</strong> Name and email address (only for purchases).</li>
              <li><strong>Payment Information:</strong> Processed securely by Paddle; we do not store card details.</li>
              <li><strong>Usage Data:</strong> Anonymous analytics about how you interact with our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your data to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Generate your personalized Bazi reading reports</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our services and user experience</li>
              <li>Send occasional updates (only with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Birth information and
              reports are stored in our database only to provide you with access to your readings.
              We implement appropriate technical and organizational measures to protect against
              unauthorized access or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">5. Third-Party Services</h2>
            <p>
              We use Paddle for payment processing. When you make a purchase, your payment information
              is handled directly by Paddle in accordance with their privacy policy. We do not have
              access to your full payment card details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">6. Cookies</h2>
            <p>
              We use essential cookies to ensure our website functions properly. We may also use
              analytics cookies to understand how visitors interact with our site. You can control
              cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as necessary to provide our services or as required by law.
              If you request deletion, we will remove your personal data within 30 days, except where
              we are legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">9. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected
              such data, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting the updated policy on this page with a new effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#D4A853] mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at support@bazireading.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
