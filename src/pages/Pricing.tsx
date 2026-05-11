import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, ArrowLeft, User, Bitcoin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Pricing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, setIsPaid, setIsSubscribed } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bitcoin' | 'lemon'>('bitcoin');

  const plans = [
    {
      id: 'single',
      name: 'Single Report',
      price: '$9.9',
      period: '',
      description: 'One full Bazi reading with complete analysis',
      features: [
        'Complete personality profile',
        'Strengths & weaknesses analysis',
        'Love & compatibility insights',
        'Career & money guidance',
        'Annual forecast',
        'Monthly forecast',
      ],
      highlighted: false,
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$9.9',
      period: '/month',
      description: 'Unlimited readings and full access',
      features: [
        'Unlimited Bazi readings',
        'Full reports every time',
        'Compatibility analysis',
        'Monthly forecasts',
        'Priority support',
        'Cancel anytime',
      ],
      highlighted: false,
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: '$79',
      period: '/year',
      description: 'Best value with annual savings',
      features: [
        'Everything in Monthly',
        'Annual forecasts included',
        'Priority support',
        'Exclusive content',
        'Save 34% vs monthly',
        'Early access to features',
      ],
      highlighted: true,
      badge: 'Best Value',
    },
  ];

  const selectedPlanInfo = plans.find((p) => p.id === selectedPlan);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setIsPaid(true);
      if (selectedPlan === 'monthly' || selectedPlan === 'yearly') {
        setIsSubscribed(true);
      }
      alert('Payment successful! Thank you for your purchase. Your account has been upgraded.');
      navigate('/');
    }
  }, []);

  const handleBitcoinCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/nowpayments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
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

  const handleLemonSqueezyCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/lemonsqueezy/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          email: user?.email || '',
          name: user?.name || '',
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to initialize payment: ' + (error.message || 'Please try again later.'));
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'bitcoin') {
      handleBitcoinCheckout();
    } else {
      handleLemonSqueezyCheckout();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-5xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                selectedPlan === plan.id
                  ? 'bg-[#1a1a1a] border-[#D4A853] shadow-[0_0_30px_rgba(212,168,83,0.15)]'
                  : plan.highlighted
                  ? 'bg-[#1a1a1a] border-[#D4A853]/50'
                  : 'bg-[#1a1a1a]/50 border-[#D4A853]/10 hover:border-[#D4A853]/30'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4A853] text-[#0F0F0F] text-xs font-semibold rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm text-[#F5F0E8]/60 mb-4">{plan.description}</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-[#D4A853]">{plan.price}</span>
                <span className="text-[#F5F0E8]/60 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start text-sm text-[#F5F0E8]/70">
                    <Check className="w-4 h-4 text-[#D4A853] mr-2 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {selectedPlanInfo?.name} - {selectedPlanInfo?.price}{selectedPlanInfo?.period}
            </h3>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('bitcoin')}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                  paymentMethod === 'bitcoin'
                    ? 'border-[#F7931A] bg-[#F7931A]/10 text-[#F7931A]'
                    : 'border-[#F5F0E8]/20 text-[#F5F0E8]/60 hover:border-[#F5F0E8]/40'
                }`}
              >
                <Bitcoin className="w-5 h-5 mr-2" />
                Bitcoin
              </button>
              <button
                onClick={() => setPaymentMethod('lemon')}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                  paymentMethod === 'lemon'
                    ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853]'
                    : 'border-[#F5F0E8]/20 text-[#F5F0E8]/60 hover:border-[#F5F0E8]/40'
                }`}
              >
                Credit Card / PayPal
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : paymentMethod === 'bitcoin' ? 'Pay with Bitcoin' : 'Subscribe Now'}
            </button>

            <p className="mt-4 text-center text-[#F5F0E8]/40 text-xs">
              {paymentMethod === 'bitcoin'
                ? 'Secure payment powered by NowPayments. Cryptocurrency accepted worldwide.'
                : 'Secure payment powered by LemonSqueezy. Cancel anytime.'}
            </p>

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
          </div>
        )}
      </div>
    </div>
  );
}
