import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, ArrowLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'https://bazi-reading.onrender.com';

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
  }, [navigate, setIsPaid]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth?redirect=/pricing');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/nowpayments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.id,
          email: user.email,
          name: user.name || '',
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
              Please sign in or create an account to make a purchase
            </p>
            <button
              onClick={() => navigate('/auth?redirect=/pricing')}
              className="inline-flex items-center px-4 py-2 bg-[#D4A853] text-[#0F0F0F] font-semibold rounded-lg hover:bg-[#D4A853]/90 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </button>
          </div>
        )}

        {user && (
          <div className="mb-8 p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg text-center">
            <p className="text-[#22C55E] mb-1">
              ✓ Signed in as {user.email}
            </p>
          </div>
        )}

        <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/30 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="text-4xl font-bold text-[#D4A853] mb-2">{plan.price}</div>
            <p className="text-[#F5F0E8]/60">{plan.description}</p>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="w-5 h-5 text-[#D4A853] mr-3 flex-shrink-0" />
                <span className="text-[#F5F0E8]/80">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading || !user}
            className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? 'Sign in to Purchase' : loading ? 'Redirecting...' : 'Pay with Crypto'}
          </button>

          <p className="text-center text-xs text-[#F5F0E8]/40 mt-4">
            Secure payment powered by NowPayments
          </p>
        </div>

        <div className="mt-8 p-4 bg-[#1a1a1a]/30 border border-[#D4A853]/10 rounded-lg">
          <h3 className="text-sm font-semibold text-[#D4A853] mb-3">How it works:</h3>
          <ol className="text-xs text-[#F5F0E8]/60 space-y-2">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mr-2 flex-shrink-0 text-xs">1</span>
              Sign in or create an account
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mr-2 flex-shrink-0 text-xs">2</span>
              Click the payment button above
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mr-2 flex-shrink-0 text-xs">3</span>
              Select your preferred cryptocurrency
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mr-2 flex-shrink-0 text-xs">4</span>
              Complete the payment
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mr-2 flex-shrink-0 text-xs">5</span>
              You'll be redirected back and get instant access
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}