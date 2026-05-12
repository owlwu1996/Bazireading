import { BaziChart } from './baziCalculation.js';

export interface ReadingSection {
  title: string;
  content: string;
  icon: string;
}

export interface ReadingReport {
  id: string;
  baziId: string;
  type: 'basic' | 'full' | 'compatibility';
  sections: ReadingSection[];
  createdAt: string;
}

function getElementTraits(element: string): string {
  const traits: Record<string, string> = {
    wood: 'growth, creativity, and vision',
    fire: 'passion, expression, and transformation',
    earth: 'stability, nurturing, and practicality',
    metal: 'precision, discipline, and clarity',
    water: 'wisdom, adaptability, and intuition',
  };
  return traits[element.toLowerCase()] || 'balance and harmony';
}

function generatePersonalityProfile(chart: BaziChart): string {
  const dm = chart.dayMaster;
  const personalities: Record<string, Record<string, string>> = {
    Wood: {
      Yang: 'Like a mighty oak tree — resilient, ambitious, naturally inclined to grow. You possess strong leadership qualities and an unwavering determination to reach your goals. Your presence inspires others to grow alongside you.',
      Yin: 'Like a graceful willow — adaptable, creative, deeply intuitive. You flow with life\'s changes while maintaining your inner strength. Your gentle approach often achieves what force cannot.',
    },
    Fire: {
      Yang: 'Like the midday sun — radiant, charismatic, full of life. Your enthusiasm is contagious, and you naturally draw people into your orbit. You thrive when you can express yourself fully.',
      Yin: 'Like a candle flame — warm, perceptive, deeply emotional. You illuminate the hidden depths of situations and people. Your inner light guides others through darkness.',
    },
    Earth: {
      Yang: 'Like a mountain — steady, reliable, profoundly grounded. Others naturally turn to you for support and stability. Your patience and perseverance are your greatest strengths.',
      Yin: 'Like fertile soil — nurturing, receptive, endlessly giving. You have an extraordinary ability to cultivate growth in others. Your compassion creates safe spaces for everyone.',
    },
    Metal: {
      Yang: 'Like a sword — sharp, decisive, principled. You cut through confusion to find truth. Your integrity and precision make you a natural leader in times of crisis.',
      Yin: 'Like fine jewelry — refined, elegant, detail-oriented. You appreciate beauty and quality in all things. Your discernment helps others see what truly matters.',
    },
    Water: {
      Yang: 'Like the ocean — vast, powerful, endlessly curious. Your intellect knows no bounds, and you navigate life\'s complexities with remarkable ease. Change is your natural element.',
      Yin: 'Like a deep well — wise, introspective, profoundly intuitive. You see beneath the surface of things. Your quiet wisdom is a beacon for those seeking understanding.',
    },
  };

  const personality = personalities[dm.element]?.[dm.yinYang] || 'You possess a unique and complex personality shaped by the interplay of cosmic energies at your birth.';
  const dominantElement = Object.entries(chart.fiveElements).sort((a, b) => b[1] - a[1])[0];

  return `${personality} Your Day Master is **${dm.stemPinyin}** (${dm.stem}), representing the **${dm.element}** element with **${dm.yinYang}** energy. This is the core of your being — your authentic self that remains constant throughout life\'s changes. Your elemental composition shows a strong presence of **${dominantElement[0].charAt(0).toUpperCase() + dominantElement[0].slice(1)}** energy, which amplifies your natural tendencies toward ${getElementTraits(dominantElement[0])}.`;
}

function generateStrengthsWeaknesses(chart: BaziChart): string {
  const sorted = Object.entries(chart.fiveElements).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const strengthsMap: Record<string, string> = {
    wood: 'Exceptional creativity and vision. You see possibilities where others see obstacles.',
    fire: 'Unmatched charisma and communication skills. Your passion is your superpower.',
    earth: 'Remarkable reliability and nurturing capacity. People trust you implicitly.',
    metal: 'Outstanding analytical abilities and attention to detail. You excel at creating order from chaos.',
    water: 'Profound intuition and adaptability. You navigate change with grace and uncover hidden truths.',
  };

  const weaknessesMap: Record<string, string> = {
    wood: 'You may sometimes be overly stubborn. Learning to bend without breaking is your growth edge.',
    fire: 'Intensity can lead to burnout. Learning to moderate your energy is essential for sustainable success.',
    earth: 'You may resist change and hold on too long. Trusting natural cycles will bring you peace.',
    metal: 'Perfectionism can paralyze you. Embracing "good enough" sometimes opens doors that perfection closes.',
    water: 'Overthinking can drown your intuition. Finding stillness helps you hear your inner wisdom.',
  };

  return `**Core Strengths:** ${strengthsMap[strongest[0]]} Your ${strongest[0].charAt(0).toUpperCase() + strongest[0].slice(1)} element dominance gives you natural advantages in areas requiring ${getElementTraits(strongest[0])}. **Growth Opportunities:** ${weaknessesMap[weakest[0]]} Your ${weakest[0].charAt(0).toUpperCase() + weakest[0].slice(1)} element represents an area for development. By consciously cultivating ${getElementTraits(weakest[0])}, you create greater balance in your life. **Life Advice:** Focus on leveraging your natural strengths while gently expanding your comfort zone.`;
}

function generateLoveCompatibility(chart: BaziChart): string {
  const dm = chart.dayMaster;
  const compatibleElements: Record<string, string[]> = {
    Wood: ['Water', 'Fire'], Fire: ['Wood', 'Earth'], Earth: ['Fire', 'Metal'], Metal: ['Earth', 'Water'], Water: ['Metal', 'Wood'],
  };
  const growthElement: Record<string, string> = { Wood: 'Metal', Fire: 'Water', Earth: 'Wood', Metal: 'Fire', Water: 'Earth' };
  const relTraits: Record<string, string> = {
    Wood: 'growth-oriented energy and visionary inspiration', Fire: 'warmth, passion, and emotional depth',
    Earth: 'stability, loyalty, and nurturing care', Metal: 'commitment, clarity, and principled love', Water: 'emotional intelligence and intuitive understanding',
  };
  const commStyle: Record<string, string> = {
    Wood: 'Direct and goal-oriented. You express needs clearly.',
    Fire: 'Expressive and emotional. You wear your heart on your sleeve.',
    Earth: 'Steady and supportive. You show love through actions.',
    Metal: 'Honest and precise. You value clear communication.',
    Water: 'Intuitive and nuanced. You read between the lines.',
  };
  const relAdvice: Record<string, string> = {
    Wood: 'allow relationships to grow naturally without forcing outcomes',
    Fire: 'balance intensity with moments of calm reflection',
    Earth: 'create stable foundations while remaining open to change',
    Metal: 'soften your edges and embrace vulnerability',
    Water: 'flow with the relationship while maintaining your boundaries',
  };

  const compat = compatibleElements[dm.element] || ['Earth'];
  return `As a **${dm.element}** Day Master with **${dm.yinYang}** energy, you are most compatible with partners who embody **${compat.join(' and ')}** energies. These elements naturally support and enhance your own. You bring **${relTraits[dm.element]}** to your partnerships. **Best Matches:** Those with strong ${compat[0]} or ${compat[1]} elements. **Growth Partners:** ${growthElement[dm.element]} types challenge you to evolve. **Communication Style:** ${commStyle[dm.element]} **Relationship Advice:** Your chart suggests that meaningful connections develop when you ${relAdvice[dm.element]}. Trust your intuition when choosing partners — your Day Master energy knows what it needs.`;
}

function generateCareerMoney(chart: BaziChart): string {
  const dm = chart.dayMaster;
  const hasWealth = Object.values(chart.tenGods).some((g) => g.includes('Wealth'));
  const careerPaths: Record<string, string[]> = {
    Wood: ['Creative industries', 'Education', 'Environmental work', 'Leadership'],
    Fire: ['Marketing', 'Entertainment', 'Public speaking', 'Counseling'],
    Earth: ['Real estate', 'Healthcare', 'Finance', 'Project management'],
    Metal: ['Technology', 'Law', 'Finance', 'Engineering'],
    Water: ['Research', 'Writing', 'Therapy', 'Strategic planning'],
  };
  const moneyAdvice: Record<string, string> = {
    Wood: 'investing in growth opportunities and long-term projects will yield the best returns.',
    Fire: 'your enthusiasm attracts financial opportunities. Channel your energy into focused ventures.',
    Earth: 'steady, conservative approaches to wealth building suit you best. Real assets provide security.',
    Metal: 'precision and analysis give you an edge in financial matters. Trust your research.',
    Water: 'adaptability allows you to spot trends early. Flow with market changes rather than resisting them.',
  };

  return `Your **${dm.element}** Day Master energy aligns beautifully with careers involving ${getElementTraits(dm.element)}. **Recommended Paths:** ${careerPaths[dm.element]?.join(', ') || 'Fields that align with your passions and values'}. ${hasWealth ? 'Your chart shows strong wealth indicators. Money flows to you when you align your work with your authentic self.' : 'Your wealth comes through steady effort and building lasting value. Patience is your financial ally.'} **Career Advice:** Your Life Cycles indicate that major career shifts may occur around ages ${chart.lifeCycles.slice(1, 4).map((c) => c.age).join(', ')}. These transitions ultimately lead to greater fulfillment. **Money Mindset:** Your elemental balance suggests that ${moneyAdvice[dm.element]}`;
}

function generateAnnualForecast(): string {
  const currentYear = new Date().getFullYear();
  return `**${currentYear} Annual Forecast:** This year brings dynamic energy that invites transformation and growth. The cosmic currents support: **Personal Growth** — A powerful year for self-discovery and developing hidden talents. **Relationships** — Meaningful connections deepen; new alliances form around shared values. **Career** — Opportunities emerge through unexpected channels — stay open and adaptable. **Wellness** — Balance activity with rest; your element needs both movement and stillness. **Favorable Months:** Spring and autumn carry particularly supportive energy for major decisions. **Advice:** Trust the process of change. What appears as disruption is often the universe redirecting you toward your highest path.`;
}

function generateMonthlyForecast(): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = new Date().getMonth();
  const forecasts = [
    'New beginnings and fresh energy. Plant seeds for future growth.',
    'Building momentum. Your efforts start showing results.',
    'A time for collaboration. Partnerships bring success.',
    'Energy peaks. Take bold action on your most important goals.',
    'Harvest time. Reap the rewards of your consistent efforts.',
    'Reflection and integration. Rest and prepare for the next cycle.',
  ];

  let result = '**6-Month Outlook:** ';
  for (let i = 0; i < 6; i++) {
    const month = months[(currentMonth + i) % 12];
    result += `**${month}:** ${forecasts[i]} `;
  }
  result += '**Monthly Guidance:** Each month carries its own unique energy signature. By aligning your actions with these natural rhythms, you maximize your effectiveness. Remember: timing is everything in the art of living well.';
  return result;
}

export function generateReading(chart: BaziChart, type: 'basic' | 'full' = 'full'): ReadingReport {
  const sections: ReadingSection[] = [
    { title: 'Personality Profile', content: generatePersonalityProfile(chart), icon: 'User' },
    { title: 'Strengths & Weaknesses', content: generateStrengthsWeaknesses(chart), icon: 'Scale' },
    { title: 'Love & Compatibility', content: type === 'full' ? generateLoveCompatibility(chart) : '[LOCKED]', icon: 'Heart' },
    { title: 'Career & Money', content: type === 'full' ? generateCareerMoney(chart) : '[LOCKED]', icon: 'Briefcase' },
    { title: 'Annual Forecast', content: type === 'full' ? generateAnnualForecast() : '[LOCKED]', icon: 'Calendar' },
    { title: 'Monthly Forecast', content: type === 'full' ? generateMonthlyForecast() : '[LOCKED]', icon: 'TrendingUp' },
  ];

  return {
    id: `reading_${Date.now()}`,
    baziId: chart.id,
    type,
    sections,
    createdAt: new Date().toISOString(),
  };
}

export function generateCompatibilityReading(chartA: BaziChart, chartB: BaziChart): ReadingReport {
  const score = calculateCompatibilityScore(chartA, chartB);
  const elemInteract: Record<string, Record<string, string>> = {
    Wood: { Fire: 'Wood fuels Fire — a dynamic, creative partnership.', Earth: 'Wood shapes Earth — growth through structure.', Metal: 'Metal cuts Wood — challenging but refining.', Water: 'Water feeds Wood — deeply nurturing bond.' },
    Fire: { Wood: 'Wood feeds Fire — warmth and mutual inspiration.', Earth: 'Fire creates Earth — transformative and productive.', Metal: 'Fire tempers Metal — passionate refinement.', Water: 'Water extinguishes Fire — requires balance and patience.' },
    Earth: { Wood: 'Wood grows through Earth — structured growth.', Fire: 'Earth receives Fire — stable and supportive.', Metal: 'Earth bears Metal — grounded and valuable.', Water: 'Water erodes Earth — needs boundaries and flow.' },
    Metal: { Wood: 'Metal shapes Wood — precision meets vision.', Fire: 'Fire refines Metal — passionate strength.', Earth: 'Earth bears Metal — solid foundation.', Water: 'Metal carries Water — directed wisdom.' },
    Water: { Wood: 'Water feeds Wood — creative nurturing.', Fire: 'Water tempers Fire — balancing intensity.', Earth: 'Earth absorbs Water — needs flow and space.', Metal: 'Metal carries Water — wisdom with direction.' },
  };

  const interaction = elemInteract[chartA.dayMaster.element]?.[chartB.dayMaster.element] || 'A unique dynamic offering growth opportunities.';

  const analysis = `**Compatibility Score: ${score}/100** ${getCompatibilityDescription(score)} **Element Dynamics:** ${chartA.dayMaster.stemPinyin} (${chartA.dayMaster.element}) meets ${chartB.dayMaster.stemPinyin} (${chartB.dayMaster.element}). ${interaction} **Strengths as a Couple:** Complementary energies create balance. Different perspectives enrich problem-solving. Mutual growth through shared experiences. Natural attraction based on elemental harmony. **Potential Challenges:** Different communication styles may require patience. Elemental conflicts can create tension during stress. Balancing individual needs with partnership goals. **Relationship Advice:** Honor your differences as complementary strengths. ${chartA.dayMaster.stemPinyin} brings ${getElementTraits(chartA.dayMaster.element)}, while ${chartB.dayMaster.stemPinyin} offers ${getElementTraits(chartB.dayMaster.element)}. Together, you have all the elements needed for a rich, balanced relationship. Practice active listening and seek to understand before being understood.`;

  return {
    id: `compat_${Date.now()}`,
    baziId: `${chartA.id}_${chartB.id}`,
    type: 'compatibility',
    sections: [{ title: 'Compatibility Analysis', content: analysis, icon: 'Heart' }],
    createdAt: new Date().toISOString(),
  };
}

function calculateCompatibilityScore(chartA: BaziChart, chartB: BaziChart): number {
  let score = 50;
  const compat: Record<string, string[]> = {
    Wood: ['Water', 'Fire'], Fire: ['Wood', 'Earth'], Earth: ['Fire', 'Metal'], Metal: ['Earth', 'Water'], Water: ['Metal', 'Wood'],
  };
  if (compat[chartA.dayMaster.element]?.includes(chartB.dayMaster.element)) score += 20;
  if (chartA.dayMaster.yinYang !== chartB.dayMaster.yinYang) score += 10;
  const aElements = Object.values(chartA.fiveElements);
  const bElements = Object.values(chartB.fiveElements);
  const similarity = aElements.reduce((sum, val, i) => sum + Math.abs(val - bElements[i]), 0);
  score += Math.max(0, 20 - similarity * 2);
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getCompatibilityDescription(score: number): string {
  if (score >= 80) return 'Exceptional compatibility! Your energies harmonize beautifully, creating a relationship filled with mutual understanding and support.';
  if (score >= 60) return 'Good compatibility. You have complementary strengths that can create a balanced and fulfilling partnership with conscious effort.';
  if (score >= 40) return 'Moderate compatibility. Your differences offer growth opportunities. Success depends on mutual respect and open communication.';
  return 'Challenging compatibility. Significant differences exist, but with awareness and commitment, you can build a meaningful connection.';
}