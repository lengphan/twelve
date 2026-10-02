// Plan maths. General fitness guidance, not medical advice.

export type Sex = 'male' | 'female';
export type Goal = 'recomp' | 'muscle' | 'fit';
export type Activity = 'desk' | 'feet' | 'physical';
export type Place = 'home' | 'gym' | 'none';
export type Diet = 'any' | 'vegetarian' | 'pescatarian' | 'vegan';

export interface Profile {
  goal: Goal;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  activity: Activity;
  daysPerWeek: number;
  place: Place;
  diet: Diet;
  avoid: string;
  mealsPerDay: number;
}

export interface Plan {
  calories: number;
  proteinG: number;
  steps: number;
  waterL: number;
  workoutMinutes: number;
  paceKgPerWeek: [number, number];
  bmi: number;
  waistToHeight?: number;
}

const ACTIVITY_FACTOR: Record<Activity, number> = { desk: 1.3, feet: 1.45, physical: 1.6 };

/** Mifflin–St Jeor resting energy. */
export function restingCalories(p: Pick<Profile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === 'male' ? base + 5 : base - 161;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return round1(weightKg / (m * m));
}

export function waistToHeight(waistCm: number | undefined, heightCm: number): number | undefined {
  if (!waistCm || !heightCm) return undefined;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

export function buildPlan(p: Profile): Plan {
  const workoutBoost = 1 + Math.min(p.daysPerWeek, 6) * 0.025;
  const maintenance = restingCalories(p) * ACTIVITY_FACTOR[p.activity] * workoutBoost;

  // Fat loss: ~20% deficit. Muscle: small surplus. Fitness: slight deficit.
  const adjust = p.goal === 'recomp' ? 0.8 : p.goal === 'muscle' ? 1.08 : 0.92;
  const floor = p.sex === 'male' ? 1500 : 1200; // safety floor, never go below
  const calories = Math.max(floor, roundTo(maintenance * adjust, 50));

  // ~1.8 g per kg of body weight, rounded to 5 g.
  const proteinG = roundTo(p.weightKg * 1.8, 5);

  const pace: [number, number] =
    p.goal === 'recomp'
      ? [round1(p.weightKg * 0.005), round1(p.weightKg * 0.01)]
      : p.goal === 'muscle'
        ? [0.1, 0.25]
        : [0.2, 0.4];

  return {
    calories,
    proteinG,
    steps: p.activity === 'desk' ? 8000 : 10000,
    waterL: round1(Math.max(2, p.weightKg * 0.033)),
    workoutMinutes: p.daysPerWeek >= 5 ? 30 : 35,
    paceKgPerWeek: pace,
    bmi: bmi(p.weightKg, p.heightCm),
    waistToHeight: waistToHeight(p.waistCm, p.heightCm),
  };
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
export function roundTo(n: number, step: number) {
  return Math.round(n / step) * step;
}
export function fmt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}
