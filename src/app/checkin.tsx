import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '@/components/icons';
import { Button, Card, Label, Num, Option, Tap, shared } from '@/components/ui';
import { fmt } from '@/lib/plan';
import { weeklyReview, type Review } from '@/lib/review';
import { useStore, type CheckIn, type Feeling } from '@/store';
import { colors, fonts, radius } from '@/theme';

const QUESTIONS: { key: 'energy' | 'hunger' | 'sleep'; t: string; opts: [Feeling, string][] }[] = [
  { key: 'energy', t: 'Energy', opts: [['low', 'Low'], ['ok', 'OK'], ['high', 'High']] },
  { key: 'hunger', t: 'Hunger', opts: [['low', 'Rarely'], ['ok', 'Sometimes'], ['high', 'Often']] },
  { key: 'sleep', t: 'Sleep', opts: [['low', 'Poor'], ['ok', 'OK'], ['high', 'Great']] },
];

export default function CheckInScreen() {
  const { plan, profile, checkIns, addCheckIn, adjustPlan } = useStore();
  const last = checkIns[checkIns.length - 1];
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(last ? String(last.weightKg) : '');
  const [waist, setWaist] = useState(last?.waistCm ? String(last.waistCm) : '');
  const [answers, setAnswers] = useState<Record<'energy' | 'hunger' | 'sleep', Feeling>>({ energy: 'ok', hunger: 'ok', sleep: 'ok' });

  const current: CheckIn = useMemo(
    () => ({
      at: Date.now(),
      weightKg: Number(weight.replace(',', '.')) || last?.weightKg || 0,
      waistCm: waist ? Number(waist.replace(',', '.')) : undefined,
      ...answers,
    }),
    [weight, waist, answers, last],
  );
  // The review is frozen at the moment you finish, so it always compares with the previous check-in.
  const [result, setResult] = useState<{ review: Review; cal: [number, number]; steps: [number, number] } | null>(null);

  const finish = () => {
    if (plan && profile && last) {
      const review = weeklyReview(last, current, plan, profile.goal);
      const floor = profile.sex === 'male' ? 1500 : 1200;
      setResult({
        review,
        cal: [plan.calories, Math.max(floor, plan.calories + review.calDelta)],
        steps: [plan.steps, plan.steps + review.stepsDelta],
      });
      adjustPlan(review.calDelta, review.stepsDelta);
    }
    addCheckIn(current);
    setStep(4);
  };
  const review = result?.review;

  return (
    <SafeAreaView style={shared.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.page}>
          <View style={styles.top}>
            <Tap onPress={() => router.back()} accessibilityLabel="Close" style={shared.iconBtn}>
              <CloseIcon />
            </Tap>
            <Label>{step < 4 ? `CHECK-IN · STEP ${step} OF 3` : 'WEEKLY REVIEW'}</Label>
            <View style={{ width: 44 }} />
          </View>
          {step < 4 && (
            <View style={shared.segments}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[shared.segment, { backgroundColor: i <= step ? colors.slate : '#DDD8CC' }]} />
              ))}
            </View>
          )}

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View key={step} entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(150)} style={{ gap: 18, paddingTop: 4 }}>
              {step === 1 && (
                <>
                  <View style={{ gap: 6 }}>
                    <Text style={shared.h1}>Weigh in</Text>
                    <Text style={shared.lead}>Morning, after the bathroom, before eating.</Text>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Text style={styles.fieldLabel}>Weight (kg)</Text>
                    <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={styles.bigInput} accessibilityLabel="Weight in kilograms" />
                  </View>
                  {last && (
                    <View style={styles.lastRow}>
                      <Text style={styles.lastText}>Last check-in</Text>
                      <Num style={{ fontSize: 14 }}>{last.weightKg} kg</Num>
                    </View>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  <View style={{ gap: 6 }}>
                    <Text style={shared.h1}>Measure your waist</Text>
                    <Text style={shared.lead}>At the belly button, relaxed. It shows fat loss the scale can miss.</Text>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Text style={styles.fieldLabel}>Waist (cm) · optional</Text>
                    <TextInput value={waist} onChangeText={setWaist} keyboardType="decimal-pad" style={styles.bigInput} accessibilityLabel="Waist in centimetres" />
                  </View>
                </>
              )}
              {step === 3 && (
                <>
                  <View style={{ gap: 6 }}>
                    <Text style={shared.h1}>How was the week?</Text>
                    <Text style={shared.lead}>Honest answers make next week's plan better.</Text>
                  </View>
                  {QUESTIONS.map((q) => (
                    <View key={q.key} style={{ gap: 8 }}>
                      <Text style={styles.qTitle}>{q.t}</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {q.opts.map(([id, label]) => (
                          <Option key={id} label={label} selected={answers[q.key] === id} onPress={() => setAnswers({ ...answers, [q.key]: id })} style={styles.flexCenter} />
                        ))}
                      </View>
                    </View>
                  ))}
                </>
              )}
              {step === 4 && review && result && plan && (
                <>
                  <Text style={shared.h1}>{review.calDelta === 0 && review.stepsDelta === 0 ? 'On track.' : 'One small change for next week.'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Delta k="Weight" v={signed(review.weightDelta)} unit="kg" />
                    <Delta k="Waist" v={review.waistDelta !== undefined ? signed(review.waistDelta) : '—'} unit={review.waistDelta !== undefined ? 'cm' : ''} />
                  </View>
                  <Card dark style={{ borderRadius: 22, gap: 12, paddingHorizontal: 18 }}>
                    <Label style={{ color: colors.onSlateMuted }}>WHAT CHANGES NEXT WEEK</Label>
                    <Line k="Calories" v={result.cal[0] === result.cal[1] ? `${fmt(result.cal[0])} · no change` : `${fmt(result.cal[0])} → ${fmt(result.cal[1])}`} />
                    <Line k="Protein" v={`${plan.proteinG} g · no change`} />
                    <Line k="Steps" v={result.steps[0] === result.steps[1] ? `${fmt(result.steps[0])} · no change` : `${fmt(result.steps[0])} → ${fmt(result.steps[1])}`} />
                    <Text style={styles.reviewText}>{review.message}</Text>
                  </Card>
                </>
              )}
            </Animated.View>
          </ScrollView>

          {step < 3 && <Button label="Continue" onPress={() => setStep(step + 1)} disabled={step === 1 && !Number(weight.replace(',', '.'))} />}
          {step === 3 && <Button label="See my review" onPress={finish} haptic="success" />}
          {step === 4 && <Button label="Done" onPress={() => router.back()} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Real minus sign (−), matching the designs. */
function signed(n: number) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
}

function Delta({ k, v, unit }: { k: string; v: string; unit: string }) {
  return (
    <Card style={{ flex: 1, padding: 12, gap: 4, borderRadius: radius.md }}>
      <Text style={styles.fieldLabel}>{k}</Text>
      <Num style={{ fontSize: 18 }}>
        {v}
        <Text style={{ fontSize: 12 }}> {unit}</Text>
      </Num>
    </Card>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.onSlate }}>{k}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.onSlate }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 18 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  bigInput: { height: 72, borderRadius: 18, borderWidth: 1, borderColor: colors.slate, backgroundColor: colors.card, paddingHorizontal: 18, fontFamily: fonts.mono, fontSize: 32, color: colors.slate },
  lastRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.sunken },
  lastText: { fontFamily: fonts.regular, fontSize: 14, color: colors.slateMid },
  qTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate },
  flexCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  reviewText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: '#D9DDE1' },
});
