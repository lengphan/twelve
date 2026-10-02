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
  let message = 'Right on pace. Keep everything the same.';

  if (goal === 'recomp' || goal === 'fit') {
    const loss = -perWeek;
    if (loss < lo * 0.5) {
      if (now.hunger === 'high' || now.energy === 'low') {
        stepsDelta = 500;
        message = 'Weight is moving slowly, but you felt hungry or tired, so we add steps instead of cutting food.';
      } else {
        calDelta = -100;
        message = 'Weight is moving slower than planned. A small 100 kcal trim gets you back on pace.';
      }
    } else if (loss > hi * 1.2) {
      calDelta = 100;
      message = 'You are losing faster than planned. We add 100 kcal to protect your muscle and energy.';
    } else if (waistDelta !== undefined && waistDelta < 0) {
      message = 'Waist down while staying on pace — that is fat, not muscle. Keep going.';
    }
  } else {
    if (perWeek < lo * 0.5) {
      calDelta = 100;
      message = 'Gaining slower than planned. Adding 100 kcal to support muscle growth.';
    } else if (perWeek > hi * 1.5) {
      calDelta = -100;
      message = 'Gaining a little fast. Trimming 100 kcal to keep it lean.';
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
