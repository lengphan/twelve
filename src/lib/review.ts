import type { CheckIn } from '@/store';
import type { Goal, Plan } from './plan';

export interface Review {
  weightDelta: number;
  waistDelta?: number;
  calDelta: number;
  stepsDelta: number;
  message: string;
}

/**
 * Weekly adjustment rules. Small, explainable changes only:
 * calories move by at most 100 kcal and steps by 500 per week.
 */
export function weeklyReview(prev: CheckIn, now: CheckIn, plan: Plan, goal: Goal): Review {
  const weeks = Math.max(1, (now.at - prev.at) / (7 * 86_400_000));
  const weightDelta = Math.round((now.weightKg - prev.weightKg) * 10) / 10;
  const perWeek = (now.weightKg - prev.weightKg) / weeks;
  const waistDelta = now.waistCm && prev.waistCm ? Math.round((now.waistCm - prev.waistCm) * 10) / 10 : undefined;
  const [lo, hi] = plan.paceKgPerWeek;

  let calDelta = 0;
  let stepsDelta = 0;
  let message = 'Right on pace. Change nothing.';

  if (goal === 'recomp' || goal === 'fit') {
    const loss = -perWeek;
    if (loss < lo * 0.5) {
      if (now.hunger === 'high' || now.energy === 'low') {
        stepsDelta = 500;
        message = 'Slow week, but you were hungry or tired. More steps, same food.';
      } else {
        calDelta = -100;
        message = 'A bit slow. Trimming 100 kcal.';
      }
    } else if (loss > hi * 1.2) {
      calDelta = 100;
      message = 'Dropping fast. Adding 100 kcal to protect muscle.';
    } else if (waistDelta !== undefined && waistDelta < 0) {
      message = 'Waist down, on pace. That\'s fat leaving.';
    }
  } else {
    if (perWeek < lo * 0.5) {
      calDelta = 100;
      message = 'Gaining slowly. Adding 100 kcal.';
    } else if (perWeek > hi * 1.5) {
      calDelta = -100;
      message = 'Gaining fast. Trimming 100 kcal.';
    }
  }

  return { weightDelta, waistDelta, calDelta, stepsDelta, message };
}

/** Least-squares line through points; honest smoothing with no lag. */
export function linearTrend(values: number[]) {
  const n = values.length;
  if (n < 2) return { line: values.slice(), slope: 0 };
  const xs = values.map((_, i) => i);
  const mx = (n - 1) / 2;
  const my = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (values[i] - my);
    den += (x - mx) ** 2;
  });
  const slope = num / den;
  return { line: xs.map((x) => my + slope * (x - mx)), slope };
}
