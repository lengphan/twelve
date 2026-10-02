# Twelve — 12-week transformation app

Expo (SDK 57) + Expo Router, TypeScript. Slate & ivory design, built to match the approved canvas.

## Run it

```bash
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with Expo Go, or press `w` for the web preview.

## What works now

- **Onboarding** (4 steps) → real plan maths: calories (Mifflin–St Jeor, 20% deficit, safety floor), protein (~1.8 g/kg), BMI, waist-to-height.
- **Paywall** right after the plan: Free / Plus / 12-week Transformation, exact prices on the button. *Purchases not wired yet.*
- **Today**: protein, calories, workout, next suggested meal ("I ate this" logs it in one tap).
- **Log a meal**: quick-add chips, photo / voice / type, ± grams with live totals.
- **Workout**: one exercise at a time, tap each set, sets reset daily.
- **Progress**: weight trend line, waist, workouts this week (sample data until first check-in, clearly labelled).
- **Weekly check-in**: weigh-in → waist → 3 questions → review that adjusts next week's plan (max ±100 kcal or +500 steps).

Everything is saved on the phone first, so it works offline and taps respond instantly.

## Where things live

| File | What |
|---|---|
| `src/theme.ts` | **All colors, fonts, spacing and the one spring used for motion.** Change the look here. |
| `src/components/ui.tsx` | Shared building blocks (Tap with spring + haptics, Button, Option, Bar, Card) and shared styles. |
| `src/lib/plan.ts` | Calorie / protein / BMI maths. |
| `src/lib/review.ts` | Weekly adjustment rules and trend line. |
| `src/lib/ai.ts` | Meal recognition — **currently a local stand-in**. |
| `src/store.ts` | Saved data (profile, plan, meals, check-ins, workouts). |

## Next to build

1. Real meal AI: send photo/voice to your own server, which calls the model; never put an API key in the app.
2. Camera and microphone (`expo-camera`, `expo-audio`).
3. In-app purchases (RevenueCat or StoreKit / Play Billing).
4. Apple Health / Health Connect for steps and sleep (needs a development build).
5. Workout generator from the profile and last week's logs; form videos.

General fitness guidance, not medical advice.

## Ship to TestFlight

You need an Apple Developer Program membership ($99/year) and a free Expo account.

1. The app ID is `com.twelveapp.ios` (Android: `com.twelveapp.app`). **It can't be changed after the first upload.**
2. Run, from this folder:

```bash
npm install --legacy-peer-deps
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

EAS asks for your Apple ID once, creates the signing certificates and the App Store Connect app for you, builds in the cloud (no Mac needed) and uploads to TestFlight.
3. After Apple finishes processing (usually 10–30 minutes), open App Store Connect → your app → TestFlight, and add yourself as an internal tester. Install the TestFlight app on your iPhone to get the build.
