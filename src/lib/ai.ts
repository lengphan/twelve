import type { LoggedItem } from './foods';

/**
 * Turns a meal photo, voice note or typed text into food items with grams.
 *
 * This is a local stand-in so the flow works end to end today.
 * In production, send the photo/transcript to YOUR server, which calls the
 * AI model (e.g. Claude Haiku for simple meals, Sonnet for complex ones) and
 * matches results against the nutrition database. Never put an API key in the app.
 */
export async function analyzeMeal(_input: { kind: 'photo' | 'voice' | 'text'; text?: string }): Promise<LoggedItem[]> {
  await new Promise((r) => setTimeout(r, 650)); // simulate network
  return [
    { foodId: 'salmon', grams: 180 },
    { foodId: 'potatoes', grams: 200 },
    { foodId: 'beans', grams: 150 },
    { foodId: 'oliveOil', grams: 5 },
  ];
}
