import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';

export default function Compatibility() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [personA, setPersonA] = useState({ birthDate: '', birthTime: '', gender: 'male' });
  const [personB, setPersonB] = useState({ birthDate: '', birthTime: '', gender: 'female' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/bazi/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personA, personB }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    person: typeof personA,
    setPerson: typeof setPersonA,
    label: string
  ) => (
    <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#D4A853]">{label}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#F5F0E8]/70 mb-1">Birth Date *</label>
          <input
            type="date"
            required
            value={person.birthDate}
            onChange={(e) => setPerson({ ...person, birthDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-[#F5F0E8]/70 mb-1">Birth Time</label>
          <input
            type="time"
            value={person.birthTime}
            onChange={(e) => setPerson({ ...person, birthTime: e.target.value })}
            className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#D4A853]/20 rounded-lg text-[#F5F0E8] focus:border-[#D4A853] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-[#F5F0E8]/70 mb-1">Gender *</label>
          <div className="flex space-x-2">
            {['male', 'female'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setPerson({ ...person, gender })}
                className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                  person.gender === gender
                    ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                    : 'bg-[#0F0F0F] border-[#D4A853]/20 text-[#F5F0E8]/60'
                }`}
              >
                {gender === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <Heart className="w-12 h-12 text-[#C73E3A] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            {t('compatibility.title')}
          </h1>
          <p className="text-[#F5F0E8]/60">{t('compatibility.subtitle')}</p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {renderForm(personA, setPersonA, t('compatibility.personA'))}
              {renderForm(personB, setPersonB, t('compatibility.personB'))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#C73E3A] to-[#D4A853] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(199,62,58,0.3)] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Calculate Compatibility
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Match Score */}
            <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-8 text-center">
              <h2 className="text-lg font-semibold mb-6">{t('compatibility.matchScore')}</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#1a1a1a"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#D4A853"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.reading.sections[0].content.match(/(\d+)\/100/)?.[1] / 100 || 0)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#D4A853]">
                    {result.reading.sections[0].content.match(/(\d+)\/100/)?.[1] || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#D4A853]">{t('compatibility.personA')}</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{result.chartA.dayMaster.stem}</div>
                  <div className="text-sm text-[#F5F0E8]/60">
                    {result.chartA.dayMaster.stemPinyin} / {result.chartA.dayMaster.element} / {result.chartA.dayMaster.yinYang}
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#D4A853]">{t('compatibility.personB')}</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{result.chartB.dayMaster.stem}</div>
                  <div className="text-sm text-[#F5F0E8]/60">
                    {result.chartB.dayMaster.stemPinyin} / {result.chartB.dayMaster.element} / {result.chartB.dayMaster.yinYang}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-[#1a1a1a]/50 border border-[#D4A853]/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">{t('compatibility.analysis')}</h3>
              <div className="prose prose-invert max-w-none">
                {result.reading.sections[0].content.split('\n\n').map((paragraph: string, pi: number) => (
                  <p key={pi} className="text-[#F5F0E8]/80 leading-relaxed mb-4">
                    {paragraph.startsWith('**') ? (
                      <span dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#D4A853]">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }} />
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 border border-[#D4A853]/30 text-[#D4A853] rounded-lg hover:bg-[#D4A853]/10 transition-all"
            >
              Calculate Another Pair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
