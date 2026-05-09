import { create } from 'zustand';

export interface BaziChart {
  id: string;
  dbId?: number;
  userName?: string;
  fourPillars: {
    year: { stem: string; branch: string; element: string; stemPinyin: string; branchPinyin: string };
    month: { stem: string; branch: string; element: string; stemPinyin: string; branchPinyin: string };
    day: { stem: string; branch: string; element: string; stemPinyin: string; branchPinyin: string };
    hour: { stem: string; branch: string; element: string; stemPinyin: string; branchPinyin: string };
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

interface AppState {
  currentChart: BaziChart | null;
  currentReading: ReadingReport | null;
  isLoading: boolean;
  language: string;
  setCurrentChart: (chart: BaziChart | null) => void;
  setCurrentReading: (reading: ReadingReport | null) => void;
  setIsLoading: (loading: boolean) => void;
  setLanguage: (lang: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentChart: null,
  currentReading: null,
  isLoading: false,
  language: 'en',
  setCurrentChart: (chart) => set({ currentChart: chart }),
  setCurrentReading: (reading) => set({ currentReading: reading }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLanguage: (lang) => set({ language: lang }),
}));
