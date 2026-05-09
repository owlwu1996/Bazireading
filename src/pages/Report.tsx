import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, User, Scale, Heart, Briefcase, Calendar, TrendingUp, Lock, ArrowLeft, Loader2, Camera, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { API_URLS } from '../lib/api';

const iconMap: Record<string, React.ElementType> = {
  User, Scale, Heart, Briefcase, Calendar, TrendingUp,
};

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

function ElementIcon({ element, size = 32 }: { element: string; size?: number }) {
  const colors: Record<string, string> = {
    Wood: '#4A6741', Fire: '#C73E3A', Earth: '#B87333', Metal: '#9CA3AF', Water: '#3B82F6',
  };
  const icons: Record<string, string> = {
    Wood: '\uD83C\uDF33', Fire: '\uD83D\uDD25', Earth: '\uD83C\uDFD4', Metal: '\u2694', Water: '\uD83D\uDCA7',
  };
  return (
    <div className="inline-flex items-center justify-center rounded-full border-2" style={{
      width: size, height: size, borderColor: colors[element] || '#D4A853', backgroundColor: `${colors[element]}20` || '#D4A85320'
    }}>
      <span style={{ fontSize: size * 0.5 }}>{icons[element] || '\u2728'}</span>
    </div>
  );
}

function BrandWatermark() {
  return (
    <div className="flex items-center justify-center py-3 border-t border-[#D4A853]/20 mt-4">
      <YinYangSVG size={20} className="text-[#D4A853] mr-2" />
      <span className="text-sm font-semibold text-[#D4A853]" style={{ fontFamily: 'Cinzel, serif' }}>DestinyMap</span>
      <span className="text-xs text-[#F5F0E8]/40 ml-2">destinymap.com</span>
    </div>
  );
}

function ShareCTA() {
  return (
    <div className="bg-gradient-to-r from-[#D4A853]/20 to-[#B87333]/20 border border-[#D4A853]/30 rounded-xl p-4 text-center">
      <p className="text-sm text-[#F5F0E8]/80 mb-2">
        <Sparkles className="w-4 h-4 inline mr-1 text-[#D4A853]" />
        Want to discover your own destiny?
      </p>
      <div className="flex items-center justify-center space-x-2 text-xs text-[#D4A853]">
        <ExternalLink className="w-3 h-3" />
        <span>Visit destinymap.com for your free Bazi reading</span>
      </div>
    </div>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentChart, setCurrentReading } = useStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]));
  const [savingImage, setSavingImage] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentChart) { navigate('/input'); return; }
    generateReading('basic');
  }, [currentChart]);

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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = reportRef.current.getBoundingClientRect();
      const scale = 2;
      canvas.width = 800 * scale;
      canvas.height = Math.max(rect.height, 1000) * scale;
      ctx.scale(scale, scale);

      ctx.fillStyle = '#0F0F0F';
      ctx.fillRect(0, 0, 800, canvas.height / scale);

      ctx.strokeStyle = '#D4A853';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, 770, (canvas.height / scale) - 30);

      ctx.strokeStyle = '#D4A85340';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 25, 750, (canvas.height / scale) - 50);

      let y = 55;

      ctx.save();
      ctx.translate(400, y + 20);
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#D4A853'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -11, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#D4A853'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 11, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#0F0F0F'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -11, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0F0F0F'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 11, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#D4A853'; ctx.fill();
      ctx.restore();
      y += 60;

      ctx.font = 'bold 32px Cinzel, serif';
      ctx.fillStyle = '#D4A853';
      ctx.textAlign = 'center';
      ctx.fillText('DestinyMap', 400, y);
      y += 30;
      ctx.font = '16px Outfit, sans-serif';
      ctx.fillStyle = '#F5F0E8';
      ctx.fillText('Chinese Astrology Bazi Reading', 400, y);
      y += 35;

      if (currentChart?.userName) {
        ctx.font = '22px Crimson Text, serif';
        ctx.fillStyle = '#D4A853';
        ctx.fillText(`Personal Reading for ${currentChart.userName}`, 400, y);
        y += 30;
      }

      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(740, y);
      ctx.strokeStyle = '#D4A853'; ctx.lineWidth = 1; ctx.stroke();
      y += 25;

      ctx.font = 'bold 18px Cinzel, serif';
      ctx.fillStyle = '#D4A853';
      ctx.fillText('Four Pillars of Destiny', 400, y);
      y += 30;

      const pillars = [
        { label: 'Year', data: currentChart.fourPillars.year },
        { label: 'Month', data: currentChart.fourPillars.month },
        { label: 'Day', data: currentChart.fourPillars.day },
        { label: 'Hour', data: currentChart.fourPillars.hour },
      ];
      const colW = 170;
      const startX = 60;

      ctx.fillStyle = '#D4A85330';
      ctx.fillRect(startX, y, colW * 4, 30);
      ctx.strokeStyle = '#D4A853';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, y, colW * 4, 30);

      pillars.forEach((p, i) => {
        ctx.font = '12px Outfit, sans-serif';
        ctx.fillStyle = '#D4A853';
        ctx.fillText(p.label, startX + i * colW + colW / 2, y + 20);
      });
      y += 30;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(startX, y, colW * 4, 40);
      ctx.strokeRect(startX, y, colW * 4, 40);
      pillars.forEach((p, i) => {
        ctx.font = 'bold 20px Cinzel, serif';
        ctx.fillStyle = '#D4A853';
        ctx.fillText(p.data.stem, startX + i * colW + colW / 2, y + 28);
      });
      y += 40;

      ctx.fillStyle = '#0F0F0F';
      ctx.fillRect(startX, y, colW * 4, 40);
      ctx.strokeRect(startX, y, colW * 4, 40);
      pillars.forEach((p, i) => {
        ctx.font = 'bold 20px Cinzel, serif';
        ctx.fillStyle = '#F5F0E8';
        ctx.fillText(p.data.branch, startX + i * colW + colW / 2, y + 28);
      });
      y += 55;

      ctx.font = '16px Outfit, sans-serif';
      ctx.fillStyle = '#F5F0E8';
      ctx.fillText(`Day Master: ${currentChart.dayMaster.stemPinyin} (${currentChart.dayMaster.element} / ${currentChart.dayMaster.yinYang})`, 400, y);
      y += 30;

      ctx.font = 'bold 16px Cinzel, serif';
      ctx.fillStyle = '#D4A853';
      ctx.fillText('Five Elements Balance', 400, y);
      y += 25;

      const elements = Object.entries(currentChart.fiveElements);
      const maxVal = Math.max(...elements.map(([, v]) => v));
      elements.forEach(([name, val], i) => {
        const barWidth = (val / maxVal) * 300;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(200, y + i * 22, 400, 18);
        const colors: Record<string, string> = { wood: '#4A6741', fire: '#C73E3A', earth: '#B87333', metal: '#9CA3AF', water: '#3B82F6' };
        ctx.fillStyle = colors[name] || '#D4A853';
        ctx.fillRect(200, y + i * 22, barWidth, 18);
        ctx.font = '11px Outfit, sans-serif';
        ctx.fillStyle = '#F5F0E8';
        ctx.textAlign = 'left';
        ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), 150, y + i * 22 + 13);
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), 610, y + i * 22 + 13);
      });
      ctx.textAlign = 'center';
      y += elements.length * 22 + 20;

      if (reading?.sections) {
        reading.sections.forEach((section: any) => {
          if (y > (canvas.height / scale) - 150) return;
          ctx.font = 'bold 15px Cinzel, serif';
          ctx.fillStyle = '#D4A853';
          ctx.fillText(section.title, 400, y);
          y += 22;

          ctx.font = '12px Crimson Text, serif';
          ctx.fillStyle = '#F5F0E8';
          const words = section.content.split(' ');
          let line = '';
          words.forEach((word: string) => {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > 680 && line !== '') {
              ctx.fillText(line, 400, y);
              line = word + ' ';
              y += 16;
            } else {
              line = testLine;
            }
          });
          ctx.fillText(line, 400, y);
          y += 22;
        });
      }

      y += 10;
      ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(700, y);
      ctx.strokeStyle = '#D4A85340'; ctx.lineWidth = 1; ctx.stroke();
      y += 20;

      ctx.font = 'bold 16px Cinzel, serif';
      ctx.fillStyle = '#D4A853';
      ctx.fillText('DestinyMap', 400, y);
      y += 18;
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillStyle = '#F5F0E8';
      ctx.fillText('Discover Your Chinese Astrology at destinymap.com', 400, y);
      y += 15;
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillStyle = '#F5F0E8';
      ctx.globalAlpha = 0.5;
      ctx.fillText('For entertainment purposes only.', 400, y);
      ctx.globalAlpha = 1;

      const link = document.createElement('a');
      link.download = `DestinyMap-Bazi-${currentChart?.userName || 'Reading'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) { console.error('Error:', error); }
    finally { setSavingImage(false); }
  };

  if (!currentChart) return null;

  const { fourPillars, dayMaster, fiveElements, lifeCycles, userName } = currentChart;

  const elementColors: Record<string, string> = {
    Wood: '#4A6741', Fire: '#C73E3A', Earth: '#B87333', Metal: '#9CA3AF', Water: '#3B82F6',
  };

  const maxElement = Math.max(...Object.values(fiveElements));

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-8 opacity-[0.03]"><YinYangSVG size={200} /></div>
        <div className="absolute bottom-20 right-8 opacity-[0.03]"><YinYangSVG size={160} /></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/input')} className="flex items-center text-[#F5F0E8]/60 hover:text-[#D4A853] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <YinYangSVG size={36} className="text-[#D4A853]" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>{t('report.title')}</h1>
          {userName && (
            <p className="text-base text-[#D4A853] mt-1" style={{ fontFamily: 'Crimson Text, serif' }}>
              Personal Reading for <span className="font-semibold">{userName}</span>
            </p>
          )}
          <p className="text-sm text-[#F5F0E8]/60 mt-1">
            Day Master: <span className="text-[#D4A853]">{dayMaster.stemPinyin}</span> ({dayMaster.element} / {dayMaster.yinYang})
          </p>
        </div>

        <div ref={reportRef} className="space-y-5">
          <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-xl overflow-hidden">
            <div className="bg-[#D4A853]/10 px-4 py-2 border-b border-[#D4A853]/20">
              <h2 className="text-sm font-semibold text-center text-[#D4A853]">Four Pillars of Destiny</h2>
            </div>
            <div className="grid grid-cols-4 divide-x divide-[#D4A853]/10">
              {[
                { label: 'Year', data: fourPillars.year },
                { label: 'Month', data: fourPillars.month },
                { label: 'Day', data: fourPillars.day },
                { label: 'Hour', data: fourPillars.hour },
              ].map((pillar) => (
                <div key={pillar.label} className="text-center py-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#F5F0E8]/40 mb-1">{pillar.label}</div>
                  <div className="text-xl font-bold" style={{ color: elementColors[pillar.data.element] }}>{pillar.data.stem}</div>
                  <div className="text-[10px] text-[#F5F0E8]/50">{pillar.data.stemPinyin}</div>
                  <div className="text-base font-semibold mt-1" style={{ color: elementColors[pillar.data.element] }}>{pillar.data.branch}</div>
                  <div className="text-[10px] text-[#F5F0E8]/50">{pillar.data.branchPinyin}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-center text-[#D4A853] mb-3">Five Elements Balance</h2>
            <div className="space-y-2">
              {Object.entries(fiveElements).map(([element, value]) => (
                <div key={element} className="flex items-center">
                  <div className="flex items-center w-20">
                    <ElementIcon element={element.charAt(0).toUpperCase() + element.slice(1)} size={24} />
                    <span className="text-xs capitalize ml-2">{element}</span>
                  </div>
                  <div className="flex-1 mx-2 h-5 bg-[#0F0F0F] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-1"
                      style={{ width: `${(value / maxElement) * 100}%`, backgroundColor: elementColors[element.charAt(0).toUpperCase() + element.slice(1)] }}>
                      <span className="text-[9px] text-white font-bold">{value.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a]/70 border border-[#D4A853]/20 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-center text-[#D4A853] mb-3">Life Cycles</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {lifeCycles.slice(0, 6).map((cycle, index) => (
                <div key={index} className="text-center py-2 bg-[#0F0F0F] rounded-lg border border-[#D4A853]/10">
                  <div className="text-[9px] text-[#F5F0E8]/40">{cycle.age}-{cycle.age + 9}</div>
                  <div className="text-sm font-semibold" style={{ color: elementColors[cycle.element] }}>{cycle.stem}{cycle.branch}</div>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-[#D4A853] animate-spin" /></div>
          ) : reading ? (
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
                  {reading.type === 'basic' && (
                    <button onClick={() => generateReading('full')}
                      className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#D4A853] to-[#B87333] text-[#0F0F0F] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all text-sm">
                      <Lock className="w-3.5 h-3.5 mr-1.5" /> Unlock Full
                    </button>
                  )}
                </div>
              </div>

              {reading.sections.map((section: any, index: number) => {
                const Icon = iconMap[section.icon] || Sparkles;
                const isLocked = reading.type === 'basic' && index >= 2;
                return (
                  <div key={index} className={`bg-[#1a1a1a]/70 border rounded-xl overflow-hidden transition-all ${isLocked ? 'border-[#D4A853]/5 opacity-50' : 'border-[#D4A853]/15'}`}>
                    <button onClick={() => {
                      if (isLocked) return;
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
                      {isLocked && <Lock className="w-3.5 h-3.5 text-[#D4A853]" />}
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
                  </div>
                );
              })}
            </div>
          ) : null}

          <ShareCTA />
          <BrandWatermark />
        </div>

        <div className="mt-6 p-3 bg-[#1a1a1a]/30 border border-[#D4A853]/10 rounded-lg text-center">
          <p className="text-[10px] text-[#F5F0E8]/40">{t('report.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
