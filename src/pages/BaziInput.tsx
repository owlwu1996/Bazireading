import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowLeft, Info, UserCircle } from 'lucide-react';
import { useStore } from '../store';
import { API_URLS } from '../lib/api';
import BaguaLoader from '../components/BaguaLoader';

export default function BaziInput() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setCurrentChart, setIsLoading, isLoading, user } = useStore();
  const isAuthenticated = !!user;

  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthTime: '',
    birthCity: '',
    gender: 'male',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      navigate(`/auth?redirect=${currentPath}`);
      return;
    }

    setIsLoading(true);

    const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;

    const startTime = Date.now();

    try {
      const response = await fetch(API_URLS.baziCalculate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime: formData.birthTime || '12:00',
          birthCity: formData.birthCity,
          gender: formData.gender,
          name: formData.name,
        }),
      });

      const data = await response.json();
      data.userName = formData.name;
      setCurrentChart(data);

      const elapsed = Date.now() - startTime;
      const minDelay = 2000;
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      navigate('/report');
    } catch (error) {
      console.error('Error calculating Bazi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.birthYear && formData.birthMonth && formData.birthDay && formData.gender;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <BaguaLoader isLoading={isLoading} userName={formData.name} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="relative inline-block">
            <Sparkles className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
            <div className="absolute -top-1 -right-1 w-4 h-4 opacity-60">
              <svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" fill="none" stroke="#D4A853" strokeWidth="1"/>
                <path d="M10,1 A4.5,4.5 0 0,1 10,9.5 A4.5,4.5 0 0,0 10,19 A9,9 0 0,1 10,1" fill="#D4A853"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            {t('form.title')}
          </h1>
          <p className="text-[#F5F0E8]/60">
            Enter your birth details to generate your personalized Bazi chart
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#F5F0E8]/80">
                <UserCircle className="w-4 h-4 inline mr-1 text-[#D4A853]" />
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors"
              />
              <p className="text-xs text-[#F5F0E8]/40 mt-1">Your name will appear on the report</p>
            </div>

            {/* Birth Date - Year/Month/Day separated */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#F5F0E8]/80">
                Birth Date *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    required
                    value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    className="w-full px-3 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    required
                    value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    className="w-full px-3 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    required
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="w-full px-3 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Birth Time - Optional */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#F5F0E8]/80">
                Birth Time
                <span className="text-xs text-[#F5F0E8]/40 font-normal ml-2">(Optional)</span>
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors"
              />
              {!formData.birthTime && (
                <div className="flex items-start mt-2 text-xs text-[#D4A853]/70">
                  <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span>Without birth time, the Hour Pillar and some detailed timing predictions will be missing. We will use noon (12:00) as default.</span>
                </div>
              )}
            </div>

            {/* Birth City - Optional */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#F5F0E8]/80">
                Birth City
                <span className="text-xs text-[#F5F0E8]/40 font-normal ml-2">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., New York, London, Tokyo"
                value={formData.birthCity}
                onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30 transition-colors"
              />
              {!formData.birthCity && (
                <div className="flex items-start mt-2 text-xs text-[#D4A853]/70">
                  <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span>Without birth city, timezone adjustments for your location will not be applied. The chart uses UTC by default.</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#F5F0E8]/80">
                {t('form.gender')} *
              </label>
              <div className="flex space-x-4">
                {['male', 'female'].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender })}
                    className={`flex-1 py-3 rounded-lg border transition-all ${
                      formData.gender === gender
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                        : 'bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60 hover:border-[#D4A853]/40'
                    }`}
                  >
                    {t(`form.${gender}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t('form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
