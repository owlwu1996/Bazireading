import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, ArrowLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Pricing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, setIsPaid } = useStore();
  const [loading, setLoading] = useState(false);

  const plan = {
    id: 'full',
    name: 'Full Report',
    price: '$29',
    description: 'Unlock your complete Bazi reading with all features',
    features: [
      'Complete personality profile',
      'Strengths & weaknesses analysis',
      'Love & compatibility insights',
      'Career & money guidance',
      'Annual forecast',
      'Monthly forecast',
      'Lifetime access',
    ],
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setIsPaid(true);
      alert('Payment successful! Thank you for your purchase. You now have full access to all reports.');
      navigate('/');
    }
  }, []);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/nowpayments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.id,
          email: user?.email || '',
          name: user?.name || '',
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to initialize payment: ' + (error.message || 'Please try again later.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <Sparkles className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            {t('pricing.title')}
          </h1>
          <p className="text-[#F5F0E8]/60">{t('pricing.subtitle')}</p>
        </div>

        {!user && (
          <div className="mb-8 p-4 bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-lg text-center">
            <p className="text-[#F5F0E8]/80 mb-3">
              Create an account to save your purchases and access them anytime
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center px-4 py-2 bg-[#D4A853] text-[#0F0F0F] font-semibold rounded-lg hover:bg-[#D4A853]/90 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </button>
          </div>
        )}

        {user && (
          <div className="mb-8 p-4 bg-[#4CAF50]/10 border border-[#4CAF50]/30 rounded-lg text-center">
            <p className="text-[#4CAF50]">
              Logged in as {user.email}. Your purchase will be saved to your account.
            </p>
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-[#D4A853] rounded-xl p-8 shadow-[0_0_40px_rgba(212,168,83,0.15)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-[#F5F0E8]/60 mb-6">{plan.description}</p>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-[#D4A853]">{plan.price}</span>
              <span className="text-[#F5F0E8]/60 ml-2">one-time payment</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, fi) => (
              <li key={fi} className="flex items-start text-[#F5F0E8]/80">
                <Check className="w-5 h-5 text-[#D4A853] mr-3 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Pay Now'}
          </button>

          <div className="mt-6 flex items-center justify-center space-x-6 text-[#F5F0E8]/40 text-xs">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              Secure Checkout
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Instant Access
            </div>
          </div>

          <p className="mt-4 text-center text-[#F5F0E8]/40 text-xs">
            Payment powered by NowPayments. Cryptocurrency accepted worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
