import { create } from 'zustand';

export interface BaziChart {
  id: string;
  dbId?: number;
  name?: string;
  userName?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  gender?: string;
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
  isPaid: boolean;
  isSubscribed: boolean;
  user: { id: number; email: string; name?: string } | null;
  authToken: string | null;
  setCurrentChart: (chart: BaziChart | null) => void;
  setCurrentReading: (reading: ReadingReport | null) => void;
  setIsLoading: (loading: boolean) => void;
  setLanguage: (lang: string) => void;
  setIsPaid: (paid: boolean) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  setUser: (user: { id: number; email: string; name?: string } | null) => void;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentChart: null,
  currentReading: null,
  isLoading: false,
  language: 'en',
  isPaid: localStorage.getItem('isPaid') === 'true',
  isSubscribed: localStorage.getItem('isSubscribed') === 'true',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  authToken: localStorage.getItem('authToken'),
  setCurrentChart: (chart) => set({ currentChart: chart }),
  setCurrentReading: (reading) => set({ currentReading: reading }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLanguage: (lang) => set({ language: lang }),
  setIsPaid: (paid) => {
    localStorage.setItem('isPaid', paid ? 'true' : 'false');
    set({ isPaid: paid });
  },
  setIsSubscribed: (subscribed) => {
    localStorage.setItem('isSubscribed', subscribed ? 'true' : 'false');
    set({ isSubscribed: subscribed });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    set({ authToken: token });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isPaid');
    localStorage.removeItem('isSubscribed');
    set({ authToken: null, user: null, isPaid: false, isSubscribed: false });
  },
}));
