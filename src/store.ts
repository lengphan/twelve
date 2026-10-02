import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { macros, type LoggedItem } from './lib/foods';
import { buildPlan, type Plan, type Profile } from './lib/plan';

export type Tier = 'free' | 'plus' | 'transformation';
export type Feeling = 'low' | 'ok' | 'high';

export interface Meal {
  id: string;
  name: string;
  at: number;
  items: LoggedItem[];
}

export interface CheckIn {
  at: number;
  weightKg: number;
  waistCm?: number;
  energy: Feeling;
  hunger: Feeling;
  sleep: Feeling;
}

interface State {
  profile?: Profile;
  plan?: Plan;
  startedAt?: number;
  tier: Tier;
  meals: Meal[];
  checkIns: CheckIn[];
  completedSets: Record<string, boolean[]>;
  finishedWorkouts: number[];
  finishWorkout: () => void;
  finishOnboarding: (p: Profile) => void;
  setTier: (t: Tier) => void;
  logMeal: (name: string, items: LoggedItem[]) => void;
  addCheckIn: (c: CheckIn) => void;
  adjustPlan: (calDelta: number, stepsDelta: number) => void;
  toggleSet: (exerciseId: string, index: number, total: number) => void;
  reset: () => void;
}

// Everything is saved on the phone first, so taps respond instantly and the app works offline.
export const useStore = create<State>()(
  persist(
    (set) => ({
      tier: 'free',
      meals: [],
      checkIns: [],
      completedSets: {},
      finishedWorkouts: [],
      finishWorkout: () => set((s) => ({ finishedWorkouts: [...s.finishedWorkouts, Date.now()] })),
      finishOnboarding: (p) =>
        set({
          profile: p,
          plan: buildPlan(p),
          startedAt: Date.now(),
          // The starting measurements count as the first check-in.
          checkIns: [{ at: Date.now(), weightKg: p.weightKg, waistCm: p.waistCm, energy: 'ok', hunger: 'ok', sleep: 'ok' }],
        }),
      setTier: (tier) => set({ tier }),
      logMeal: (name, items) => set((s) => ({ meals: [...s.meals, { id: String(Date.now()), name, at: Date.now(), items }] })),
      addCheckIn: (c) => set((s) => ({ checkIns: [...s.checkIns, c] })),
      adjustPlan: (calDelta, stepsDelta) =>
        set((s) => {
          if (!s.plan || !s.profile) return {};
          const floor = s.profile.sex === 'male' ? 1500 : 1200;
          return { plan: { ...s.plan, calories: Math.max(floor, s.plan.calories + calDelta), steps: s.plan.steps + stepsDelta } };
        }),
      toggleSet: (exerciseId, index, total) =>
        set((s) => {
          const current = s.completedSets[exerciseId] ?? Array(total).fill(false);
          const next = current.slice();
          next[index] = !next[index];
          return { completedSets: { ...s.completedSets, [exerciseId]: next } };
        }),
      reset: () => set({ profile: undefined, plan: undefined, startedAt: undefined, meals: [], checkIns: [], completedSets: {}, finishedWorkouts: [], tier: 'free' }),
    }),
    { name: 'twelve-store', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function todayTotals(meals: Meal[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = meals.filter((m) => m.at >= start.getTime());
  const all = today.flatMap((m) => m.items);
  return { ...macros(all), mealsToday: today };
}

/** Week (1–12) and day (1–7) of the program. */
export function programDay(startedAt?: number) {
  const days = startedAt ? Math.floor((Date.now() - startedAt) / 86_400_000) : 0;
  return { week: Math.min(12, Math.floor(days / 7) + 1), day: (days % 7) + 1 };
}
