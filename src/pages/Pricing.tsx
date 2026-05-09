import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { API_URLS } from '../lib/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function Pricing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('paypal');
  const [loading, setLoading] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

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
    if (selectedPlan && paymentMethod === 'paypal' && paypalRef.current) {
      loadPayPalButton();
    }
  }, [selectedPlan, paymentMethod]);

  const loadPayPalButton = () => {
    if (!paypalRef.current) return;
    paypalRef.current.innerHTML = '';

    if (window.paypal) {
      renderPayPalButton();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'}&currency=USD`;
    script.async = true;
    script.onload = renderPayPalButton;
    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalRef.current) return;

    window.paypal.Buttons({
      createOrder: async () => {
        setLoading(true);
        try {
          const response = await fetch(API_URLS.paypalCreateOrder, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: selectedPlan }),
          });

          const data = await response.json();
          if (data.paypalOrderId) {
            return data.paypalOrderId;
          }
          throw new Error('Failed to create order');
        } catch (error) {
          console.error('PayPal create order error:', error);
          alert('Failed to initialize PayPal payment');
          setLoading(false);
          throw error;
        }
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const orderResponse = await fetch(API_URLS.paypalCapture, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paypalOrderId: data.orderID,
            }),
          });

          const orderResult = await orderResponse.json();
          if (!orderResult.success) {
            throw new Error('Backend capture failed');
          }

          const details = await actions.order.capture();

          if (details.status === 'COMPLETED') {
            alert('Payment successful! Thank you for your purchase.');
            navigate('/');
          } else {
            alert('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('PayPal capture error:', error);
          alert('Payment failed. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        alert('PayPal payment error. Please try again.');
        setLoading(false);
      },
      onCancel: () => {
        setLoading(false);
      },
    }).render(paypalRef.current);
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const response = await fetch(API_URLS.paymentCreateIntent, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod }),
      });

      const data = await response.json();

      if (data.orderId) {
        await fetch(API_URLS.paymentConfirm, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId }),
        });

        alert('Payment successful! Thank you for your purchase.');
        navigate('/');
      }
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
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 flex items-center justify-center py-3 rounded-lg border transition-all ${
                  paymentMethod === 'stripe'
                    ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                    : 'bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60 hover:border-[#D4A853]/40'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Credit Card (Stripe)
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 flex items-center justify-center py-3 rounded-lg border transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                    : 'bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60 hover:border-[#D4A853]/40'
                }`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                PayPal
              </button>
            </div>

            {paymentMethod === 'paypal' ? (
              <div ref={paypalRef} className="flex justify-center" />
            ) : (
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ${selectedPlanInfo?.price}${selectedPlanInfo?.period}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
