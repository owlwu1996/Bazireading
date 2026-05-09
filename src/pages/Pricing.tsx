import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, ArrowLeft, CreditCard, Zap } from 'lucide-react';
import { useState } from 'react';

declare global {
  interface Window {
    Paddle?: any;
  }
}

const PADDLE_CLIENT_TOKEN = 'test_7d279f1a349e22d30de1c93bf2c9e'; // Paddle sandbox client-side token
const PADDLE_ENVIRONMENT = 'sandbox'; // Change to 'production' when live

// Product IDs from Paddle Dashboard
const PADDLE_PRODUCTS = {
  single: 'pro_01kr6h63sderby6y2y99fhkgry',
  monthly: 'pro_01kr6jxc5x77f09pskgv5xmm95',
  yearly: 'pro_01kr6jyegkfejk14rbrdq8hqra',
};

export default function Pricing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

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

  const loadPaddle = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.Paddle) {
        resolve(window.Paddle);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Environment.set(PADDLE_ENVIRONMENT);
          window.Paddle.Initialize({
            token: PADDLE_CLIENT_TOKEN,
          });
          setPaddleLoaded(true);
          resolve(window.Paddle);
        } else {
          reject(new Error('Paddle failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Paddle script'));
      document.body.appendChild(script);
    });
  };

  const handlePaddleCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const Paddle = await loadPaddle();

      const productId = PADDLE_PRODUCTS[selectedPlan as keyof typeof PADDLE_PRODUCTS];

      Paddle.Checkout.open({
        items: [
          {
            priceId: productId,
            quantity: 1,
          },
        ],
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        },
        customData: {
          plan: selectedPlan,
          source: 'bazireading_web',
        },
        successCallback: (data: any) => {
          console.log('Paddle payment success:', data);
          alert('Payment successful! Thank you for your purchase.');
          navigate('/');
        },
        closeCallback: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Paddle checkout error:', error);
      alert('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      // Simulate Stripe payment for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('Payment successful! Thank you for your purchase.');
      navigate('/');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
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
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleStripePayment()}
                disabled={loading}
                className="flex-1 flex items-center justify-center py-3 rounded-lg border transition-all bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60 hover:border-[#D4A853]/40"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Credit Card (Stripe)
              </button>
              <button
                onClick={() => handlePaddleCheckout()}
                disabled={loading}
                className={`flex-1 flex items-center justify-center py-3 rounded-lg border transition-all ${
                  paddleLoaded
                    ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                    : 'bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60 hover:border-[#D4A853]/40'
                }`}
              >
                <Zap className="w-5 h-5 mr-2" />
                {loading ? 'Loading...' : 'Paddle Checkout'}
              </button>
            </div>

            <div className="text-center text-xs text-[#F5F0E8]/40">
              Secure payment processing. Your data is protected.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
