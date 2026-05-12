import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { Camera, Unlock, User, Scale, Heart, Briefcase, Calendar, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { API_URLS } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, any> = {
  User,
  Scale,
  Heart,
  Briefcase,
  Calendar,
  TrendingUp,
  Sparkles,
};

const elementColors: Record<string, string> = {
  wood: '#22C55E',
  fire: '#EF4444',
  earth: '#F59E0B',
  metal: '#6B7280',
  water: '#3B82F6',
};

const elementNames: Record<string, string> = {
  wood: 'Wood',
  fire: 'Fire',
  earth: 'Earth',
  metal: 'Metal',
  water: 'Water',
};

export default function Report() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { currentChart, currentReading, setCurrentReading, isPaid } = useStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const generateReading = async (type: 'basic' | 'full') => {
    if (!currentChart) return;
    setLoading(true);
    try {
      const response = await fetch(API_URLS.baziReading, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baziId: currentChart.dbId || 1, type }),
      });
      const data = await response.json();
      setReading(data); setCurrentReading(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const saveAsImage = async () => {
    if (!reportRef.current) return;
    setSavingImage(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0F0F0F',
        scale: 2,
        allowTaint: true,
        foreignObjectRendering: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      // Open in new tab to verify the image renders correctly
      window.open(dataUrl, '_blank');
      const link = document.createElement('a');
      link.download = `bazi-reading-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Save failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSavingImage(false);
    }
  };

  useEffect(() => {
    if (currentReading && currentReading.type === 'full') {
      setReading(currentReading);
    } else if (currentReading && currentReading.type === 'basic' && isPaid) {
      generateReading('full');
    } else if (currentReading) {
      setReading(currentReading);
    } else if (currentChart) {
      generateReading(isPaid ? 'full' : 'basic');
    }
  }, [currentChart, currentReading, isPaid]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#D4A853] mb-2">{t('report.title')}</h1>
          <p className="text-sm text-[#F5F0E8]/60">{t('report.subtitle')}</p>
        </div>

        <div ref={reportRef} className="bg-[#1a1a1a]/50 rounded-2xl border border-[#D4A853]/20 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-[#D4A853] animate-spin" /></div>
          ) : currentChart ? (
            <>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['year', 'month', 'day', 'hour'].map((pillar, index) => {
                  const data = currentChart.fourPillars[pillar as keyof typeof currentChart.fourPillars];
                  return (
                    <div key={pillar} className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-[#F5F0E8]/50 mb-1 uppercase">{pillar}</div>
                      <div className="text-lg font-bold text-[#D4A853]">{data.stem}{data.branch}</div>
                      <div className="text-xs text-[#F5F0E8]/60">{data.element}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-[#D4A853] mb-3 text-center">Five Elements</h3>
                <div className="space-y-2">
                  {Object.entries(currentChart.fiveElements).map(([element, value]) => (
                    <div key={element} className="flex items-center">
                      <span className="w-16 text-sm text-[#F5F0E8]/70">{elementNames[element]}</span>
                      <div className="flex-1 mx-2 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(value / 10) * 100}%`, backgroundColor: elementColors[element] }}
                        />
                      </div>
                      <span className="w-8 text-sm text-[#F5F0E8]/50 text-right">{value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-[#D4A853] mb-3 text-center">Life Cycles</h3>
                <div className="grid grid-cols-6 gap-1">
                  {currentChart.lifeCycles.map((cycle, index) => (
                    <div key={index} className="text-center p-1">
                      <div className="text-xs text-[#F5F0E8]/70">{cycle.age}</div>
                      <div className="text-sm font-semibold" style={{ color: elementColors[cycle.element] }}>
                        {cycle.stem}{cycle.branch}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {reading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {reading.type === 'basic' ? 'Your Reading' : 'Full Report'}
                    </h2>
                    <div className="flex space-x-2">
                      <button onClick={saveAsImage} disabled={savingImage}
                        className="flex items-center px-3 py-1.5 bg-[#1a1a1a] border border-[#D4A853]/30 text-[#D4A853] rounded-lg hover:bg-[#D4A853]/10 transition-all text-sm disabled:opacity-50">
                        <Camera className="w-3.5 h-3.5 mr-1.5" />
                        {savingImage ? 'Saving...' : 'Save Image'}
                      </button>
                    </div>
                  </div>

                  {reading.sections.map((section: any, index: number) => {
                    const Icon = iconMap[section.icon] || Sparkles;
                    const isLocked = reading.type === 'basic' && index >= 2;
                    return (
                      <div key={index} className={`bg-[#1a1a1a]/70 border rounded-xl overflow-hidden transition-all ${isLocked ? 'border-[#D4A853]/30' : 'border-[#D4A853]/15'}`}>
                        <button onClick={() => {
                          if (isLocked) {
                            setShowPaymentModal(true);
                            return;
                          }
                          const newSet = new Set(expandedSections);
                          if (newSet.has(index)) newSet.delete(index);
                          else newSet.add(index);
                          setExpandedSections(newSet);
                        }}
                          className="w-full flex items-center justify-between p-3 text-left">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-[#D4A853]/10 flex items-center justify-center mr-3">
                              <Icon className="w-4 h-4 text-[#D4A853]" />
                            </div>
                            <span className="text-sm font-semibold">{section.title}</span>
                          </div>
                          {isLocked ? (
                            <button onClick={(e) => { e.stopPropagation(); setShowPaymentModal(true); }}
                              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] text-xs font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all">
                              <Unlock className="w-3 h-3 mr-1" />
                              Unlock
                            </button>
                          ) : expandedSections.has(index) ? (
                            <svg className="w-4 h-4 text-[#D4A853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-[#D4A853]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                        {expandedSections.has(index) && !isLocked && (
                          <div className="px-3 pb-2">
                            <div className="text-sm text-[#F5F0E8]/80 leading-relaxed">
                              <span dangerouslySetInnerHTML={{
                                __html: section.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#D4A853]">$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              }} />
                            </div>
                          </div>
                        )}
                        {expandedSections.has(index) && isLocked && (
                          <div className="px-3 pb-2">
                            <div className="text-sm text-[#F5F0E8]/40 text-center py-4 italic">
                              {t('report.locked_content') || 'Content locked'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="mt-6 p-3 bg-[#1a1a1a]/30 border border-[#D4A853]/10 rounded-lg text-center">
          <p className="text-[10px] text-[#F5F0E8]/40">{t('report.disclaimer')}</p>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#D4A853]/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#D4A853] mb-4 text-center">Unlock Full Report</h3>
            <p className="text-[#F5F0E8]/70 text-sm mb-6 text-center">
              Get complete access to all sections of your Bazi reading including personality, love, career, and annual forecasts.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowPaymentModal(false); navigate('/pricing'); }}
                className="w-full py-3 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all"
              >
                Go to Pricing - $29
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}