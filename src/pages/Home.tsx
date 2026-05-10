import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart, Briefcase, Calendar, ChevronRight, Globe, User, LogOut } from 'lucide-react';
import { useStore } from '../store';
import { useEffect } from 'react';

function YinYangSVG({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M50,2 A24,24 0 0,1 50,48 A24,24 0 0,0 50,98 A48,48 0 0,1 50,2" fill="currentColor" opacity="0.4"/>
      <circle cx="50" cy="26" r="6" fill="#0F0F0F" opacity="0.6"/>
      <circle cx="50" cy="74" r="6" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

function BaguaSVG({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 88;
        const y1 = 100 + Math.sin(rad) * 88;
        const x2 = 100 + Math.cos(rad) * 98;
        const y2 = 100 + Math.sin(rad) * 98;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" opacity="0.4"/>
            {[0, 1, 2].map((line) => {
              const lx = 100 + Math.cos(rad) * (75 - line * 8);
              const ly = 100 + Math.sin(rad) * (75 - line * 8);
              const isYang = [1, 1, 0, 0, 1, 0, 0, 1][i];
              return (
                <circle
                  key={line}
                  cx={lx}
                  cy={ly}
                  r={isYang ? 2.5 : 1.5}
                  fill={isYang ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setLanguage, user, authToken, setUser, setAuthToken, setIsPaid, setIsSubscribed, logout } = useStore();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const isPaid = localStorage.getItem('isPaid') === 'true';
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
      setIsPaid(isPaid);
      setIsSubscribed(isSubscribed);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Personality Profile',
      description: 'Discover your core essence through the lens of Chinese astrology',
    },
    {
      icon: Heart,
      title: 'Love & Compatibility',
      description: 'Understand your relationship patterns and find cosmic connections',
    },
    {
      icon: Briefcase,
      title: 'Career & Money',
      description: 'Align your professional path with your elemental strengths',
    },
    {
      icon: Calendar,
      title: 'Annual Forecast',
      description: 'Navigate the year ahead with cosmic timing insights',
    },
  ];

  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: '',
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      highlighted: false,
    },
    {
      name: t('pricing.monthly.name'),
      price: t('pricing.monthly.price'),
      period: t('pricing.monthly.period'),
      features: t('pricing.monthly.features', { returnObjects: true }) as string[],
      highlighted: false,
    },
    {
      name: t('pricing.yearly.name'),
      price: t('pricing.yearly.price'),
      period: t('pricing.yearly.period'),
      features: t('pricing.yearly.features', { returnObjects: true }) as string[],
      highlighted: true,
      badge: t('pricing.yearly.badge'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#D4A853]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <YinYangSVG size={28} className="text-[#D4A853]" />
              <span className="text-xl font-bold tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
                {t('brand')}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm text-[#F5F0E8]/70 hover:text-[#D4A853] transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>{languages.find((l) => l.code === i18n.language)?.label || 'English'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-[#1a1a1a] border border-[#D4A853]/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[#D4A853]/10 hover:text-[#D4A853] transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/account')}
                    className="flex items-center space-x-1 text-sm text-[#F5F0E8]/70 hover:text-[#D4A853] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Account</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm text-[#F5F0E8]/70 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center space-x-1 text-sm text-[#F5F0E8]/70 hover:text-[#D4A853] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Yin-Yang background decorations */}
        <div className="absolute top-20 left-10 opacity-[0.04]">
          <YinYangSVG size={300} className="text-[#D4A853]" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-[0.03]">
          <BaguaSVG size={250} className="text-[#D4A853]" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-[0.02]">
          <YinYangSVG size={180} className="text-[#D4A853]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4A853]/10 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 168, 83, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(199, 62, 58, 0.03) 0%, transparent 50%)`,
        }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <YinYangSVG size={64} className="text-[#D4A853]" />
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-wide"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {t('brand')}
          </h1>
          <p className="text-xl sm:text-2xl text-[#D4A853] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('tagline')}
          </p>
          <p className="text-base sm:text-lg text-[#F5F0E8]/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <button
            onClick={() => navigate('/input')}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] hover:scale-105"
          >
            <span className="relative z-10">{t('cta.discover')}</span>
            <ChevronRight className="relative z-10 w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#B87333] to-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute top-10 right-10 opacity-[0.02]">
          <BaguaSVG size={200} className="text-[#D4A853]" />
        </div>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Cinzel, serif' }}>
            What You Will <span className="text-[#D4A853]">Discover</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl hover:border-[#D4A853]/30 hover:bg-[#1a1a1a]/80 transition-all duration-300 hover:-translate-y-1"
              >
                <feature.icon className="w-10 h-10 text-[#D4A853] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[#F5F0E8]/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-[#0a0a0a] relative">
        <div className="absolute bottom-10 left-10 opacity-[0.02]">
          <YinYangSVG size={180} className="text-[#D4A853]" />
        </div>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            {t('pricing.title')}
          </h2>
          <p className="text-center text-[#F5F0E8]/60 mb-16">{t('pricing.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-[#1a1a1a] border-[#D4A853] shadow-[0_0_30px_rgba(212,168,83,0.15)]'
                    : 'bg-[#1a1a1a]/50 border-[#D4A853]/10 hover:border-[#D4A853]/30'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4A853] text-[#0F0F0F] text-xs font-semibold rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-[#D4A853]">{plan.price}</span>
                  <span className="text-[#F5F0E8]/60 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start text-sm text-[#F5F0E8]/70">
                      <Sparkles className="w-4 h-4 text-[#D4A853] mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.name === 'Free' || plan.name === 'Gratis' ? '/input' : '/pricing')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]'
                      : 'border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10'
                  }`}
                >
                  {plan.name === 'Free' || plan.name === 'Gratis' ? t('cta.getStarted') : t('cta.subscribe')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Translation Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute top-20 left-10 opacity-[0.02]">
          <BaguaSVG size={200} className="text-[#D4A853]" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
            Ancient Wisdom, <span className="text-[#D4A853]">Modern Understanding</span>
          </h2>
          <p className="text-[#F5F0E8]/60 mb-12 leading-relaxed">
            We translate traditional Chinese astrology concepts into language that resonates with modern seekers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { original: '五行', translated: 'Five Elements', desc: 'Wood, Fire, Earth, Metal, Water' },
              { original: '阴阳', translated: 'Yin/Yang', desc: 'Complementary cosmic forces' },
              { original: '十神', translated: 'Personality Archetypes', desc: 'Core personality patterns' },
              { original: '大运', translated: 'Life Cycles', desc: '10-year fortune periods' },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-lg relative overflow-hidden">
                <div className="absolute top-1 right-1 opacity-10">
                  <YinYangSVG size={20} className="text-[#D4A853]" />
                </div>
                <div className="text-[#D4A853] text-lg mb-1">{item.original}</div>
                <div className="font-semibold mb-1">{item.translated}</div>
                <div className="text-xs text-[#F5F0E8]/50">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#D4A853]/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <YinYangSVG size={20} className="text-[#D4A853] mr-2" />
            <p className="text-sm text-[#F5F0E8]/40">{t('footer.disclaimer')}</p>
          </div>
          <div className="flex space-x-6 text-sm text-[#F5F0E8]/40">
            <span onClick={() => navigate('/privacy')} className="hover:text-[#D4A853] cursor-pointer transition-colors">{t('footer.privacy')}</span>
            <span onClick={() => navigate('/terms')} className="hover:text-[#D4A853] cursor-pointer transition-colors">{t('footer.terms')}</span>
            <span onClick={() => navigate('/refund')} className="hover:text-[#D4A853] cursor-pointer transition-colors">Refund Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
