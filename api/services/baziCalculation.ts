export interface FourPillar {
  stem: string;
  branch: string;
  element: string;
  stemPinyin: string;
  branchPinyin: string;
}

export interface BaziChart {
  id: string;
  fourPillars: {
    year: FourPillar;
    month: FourPillar;
    day: FourPillar;
    hour: FourPillar;
  };
  dayMaster: {
    stem: string;
    element: string;
    yinYang: string;
    stemPinyin: string;
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  tenGods: Record<string, string>;
  lifeCycles: Array<{
    age: number;
    stem: string;
    branch: string;
    element: string;
  }>;
}

const STEMS = [
  { name: '甲', pinyin: 'Jia', element: 'Wood', yinYang: 'Yang' },
  { name: '乙', pinyin: 'Yi', element: 'Wood', yinYang: 'Yin' },
  { name: '丙', pinyin: 'Bing', element: 'Fire', yinYang: 'Yang' },
  { name: '丁', pinyin: 'Ding', element: 'Fire', yinYang: 'Yin' },
  { name: '戊', pinyin: 'Wu', element: 'Earth', yinYang: 'Yang' },
  { name: '己', pinyin: 'Ji', element: 'Earth', yinYang: 'Yin' },
  { name: '庚', pinyin: 'Geng', element: 'Metal', yinYang: 'Yang' },
  { name: '辛', pinyin: 'Xin', element: 'Metal', yinYang: 'Yin' },
  { name: '壬', pinyin: 'Ren', element: 'Water', yinYang: 'Yang' },
  { name: '癸', pinyin: 'Gui', element: 'Water', yinYang: 'Yin' },
];

const BRANCHES = [
  { name: '子', pinyin: 'Zi', element: 'Water', hiddenStems: ['癸'] },
  { name: '丑', pinyin: 'Chou', element: 'Earth', hiddenStems: ['己', '癸', '辛'] },
  { name: '寅', pinyin: 'Yin', element: 'Wood', hiddenStems: ['甲', '丙', '戊'] },
  { name: '卯', pinyin: 'Mao', element: 'Wood', hiddenStems: ['乙'] },
  { name: '辰', pinyin: 'Chen', element: 'Earth', hiddenStems: ['戊', '乙', '癸'] },
  { name: '巳', pinyin: 'Si', element: 'Fire', hiddenStems: ['丙', '庚', '戊'] },
  { name: '午', pinyin: 'Wu', element: 'Fire', hiddenStems: ['丁', '己'] },
  { name: '未', pinyin: 'Wei', element: 'Earth', hiddenStems: ['己', '丁', '乙'] },
  { name: '申', pinyin: 'Shen', element: 'Metal', hiddenStems: ['庚', '壬', '戊'] },
  { name: '酉', pinyin: 'You', element: 'Metal', hiddenStems: ['辛'] },
  { name: '戌', pinyin: 'Xu', element: 'Earth', hiddenStems: ['戊', '辛', '丁'] },
  { name: '亥', pinyin: 'Hai', element: 'Water', hiddenStems: ['壬', '甲'] },
];

const MONTH_BRANCH_MAP = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

const HOUR_BRANCH_MAP: Record<string, number> = {
  '23': 0, '00': 0, '01': 1, '02': 2, '03': 3, '04': 4,
  '05': 5, '06': 6, '07': 7, '08': 8, '09': 9, '10': 10,
  '11': 11, '12': 0, '13': 1, '14': 2, '15': 3, '16': 4,
  '17': 5, '18': 6, '19': 7, '20': 8, '21': 9, '22': 10,
};

function getYearStem(year: number): number {
  return (year - 4) % 10;
}

function getYearBranch(year: number): number {
  return (year - 4) % 12;
}

function getMonthStem(yearStem: number, month: number): number {
  const monthBranch = MONTH_BRANCH_MAP[month - 1];
  const base = [2, 14, 26, 38, 50, 62, 74, 86, 98, 110];
  return (base[yearStem] + monthBranch) % 10;
}

function getDayStem(year: number, month: number, day: number): number {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays + 36) % 10;
}

function getDayBranch(year: number, month: number, day: number): number {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays + 36) % 12;
}

function getHourStem(dayStem: number, hour: string): number {
  const hourBranch = HOUR_BRANCH_MAP[hour] ?? 0;
  const base = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  return (base[dayStem] + hourBranch) % 10;
}

function getTenGod(dayStem: number, targetStem: number): string {
  const dayElement = STEMS[dayStem].element;
  const dayYinYang = STEMS[dayStem].yinYang;
  const targetElement = STEMS[targetStem].element;
  const targetYinYang = STEMS[targetStem].yinYang;

  const elementRelation: Record<string, Record<string, string>> = {
    Wood: { Wood: 'Friend', Fire: 'Output', Earth: 'Wealth', Metal: 'Influence', Water: 'Resource' },
    Fire: { Wood: 'Resource', Fire: 'Friend', Earth: 'Output', Metal: 'Wealth', Water: 'Influence' },
    Earth: { Wood: 'Influence', Fire: 'Resource', Earth: 'Friend', Metal: 'Output', Water: 'Wealth' },
    Metal: { Wood: 'Wealth', Fire: 'Influence', Earth: 'Resource', Metal: 'Friend', Water: 'Output' },
    Water: { Wood: 'Output', Fire: 'Wealth', Earth: 'Influence', Metal: 'Resource', Water: 'Friend' },
  };

  const baseRelation = elementRelation[dayElement]?.[targetElement] ?? 'Unknown';

  if (baseRelation === 'Friend' || baseRelation === 'Resource') {
    return dayYinYang === targetYinYang ? baseRelation : `Alternative ${baseRelation}`;
  }
  return dayYinYang === targetYinYang ? `Direct ${baseRelation}` : `Indirect ${baseRelation}`;
}

function calculateFiveElements(fourPillars: BaziChart['fourPillars']): BaziChart['fiveElements'] {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const allStems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];

  allStems.forEach((stem) => {
    const stemInfo = STEMS.find((s) => s.name === stem);
    if (stemInfo) {
      const key = stemInfo.element.toLowerCase() as keyof typeof counts;
      counts[key]++;
    }
  });

  const allBranches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  allBranches.forEach((branch) => {
    const branchInfo = BRANCHES.find((b) => b.name === branch);
    if (branchInfo) {
      const key = branchInfo.element.toLowerCase() as keyof typeof counts;
      counts[key]++;
      branchInfo.hiddenStems.forEach((hiddenStem) => {
        const stemInfo = STEMS.find((s) => s.name === hiddenStem);
        if (stemInfo) {
          const hiddenKey = stemInfo.element.toLowerCase() as keyof typeof counts;
          counts[hiddenKey] += 0.3;
        }
      });
    }
  });

  return counts;
}

function calculateLifeCycles(yearStem: number, gender: string): BaziChart['lifeCycles'] {
  const cycles: BaziChart['lifeCycles'] = [];
  const isYang = STEMS[yearStem].yinYang === 'Yang';
  const isMale = gender === 'male';
  const forward = (isYang && isMale) || (!isYang && !isMale);

  for (let i = 0; i < 8; i++) {
    const age = i * 10;
    const stemIndex = forward ? (yearStem + i + 1) % 10 : (yearStem - i - 1 + 10) % 10;
    const branchIndex = forward ? (getYearBranch(new Date().getFullYear()) + i + 1) % 12 : (getYearBranch(new Date().getFullYear()) - i - 1 + 12) % 12;

    cycles.push({
      age,
      stem: STEMS[stemIndex].name,
      branch: BRANCHES[branchIndex].name,
      element: STEMS[stemIndex].element,
    });
  }

  return cycles;
}

export function calculateBazi(
  birthDate: string,
  birthTime: string,
  gender: string
): BaziChart {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = birthTime.split(':')[0];

  const yearStemIdx = getYearStem(year);
  const yearBranchIdx = getYearBranch(year);
  const monthStemIdx = getMonthStem(yearStemIdx, month);
  const monthBranchIdx = MONTH_BRANCH_MAP[month - 1];
  const dayStemIdx = getDayStem(year, month, day);
  const dayBranchIdx = getDayBranch(year, month, day);
  const hourStemIdx = getHourStem(dayStemIdx, hour);
  const hourBranchIdx = HOUR_BRANCH_MAP[hour] ?? 0;

  const chart: BaziChart = {
    id: `bazi_${Date.now()}`,
    fourPillars: {
      year: {
        stem: STEMS[yearStemIdx].name,
        branch: BRANCHES[yearBranchIdx].name,
        element: STEMS[yearStemIdx].element,
        stemPinyin: STEMS[yearStemIdx].pinyin,
        branchPinyin: BRANCHES[yearBranchIdx].pinyin,
      },
      month: {
        stem: STEMS[monthStemIdx].name,
        branch: BRANCHES[monthBranchIdx].name,
        element: STEMS[monthStemIdx].element,
        stemPinyin: STEMS[monthStemIdx].pinyin,
        branchPinyin: BRANCHES[monthBranchIdx].pinyin,
      },
      day: {
        stem: STEMS[dayStemIdx].name,
        branch: BRANCHES[dayBranchIdx].name,
        element: STEMS[dayStemIdx].element,
        stemPinyin: STEMS[dayStemIdx].pinyin,
        branchPinyin: BRANCHES[dayBranchIdx].pinyin,
      },
      hour: {
        stem: STEMS[hourStemIdx].name,
        branch: BRANCHES[hourBranchIdx].name,
        element: STEMS[hourStemIdx].element,
        stemPinyin: STEMS[hourStemIdx].pinyin,
        branchPinyin: BRANCHES[hourBranchIdx].pinyin,
      },
    },
    dayMaster: {
      stem: STEMS[dayStemIdx].name,
      element: STEMS[dayStemIdx].element,
      yinYang: STEMS[dayStemIdx].yinYang,
      stemPinyin: STEMS[dayStemIdx].pinyin,
    },
    fiveElements: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
    tenGods: {},
    lifeCycles: [],
  };

  chart.fiveElements = calculateFiveElements(chart.fourPillars);

  const stemIndices = [yearStemIdx, monthStemIdx, dayStemIdx, hourStemIdx];
  const positions = ['Year', 'Month', 'Day', 'Hour'];
  stemIndices.forEach((stemIdx, index) => {
    if (stemIdx !== dayStemIdx) {
      chart.tenGods[`${positions[index]} Stem`] = getTenGod(dayStemIdx, stemIdx);
    }
  });

  chart.lifeCycles = calculateLifeCycles(yearStemIdx, gender);

  return chart;
}
