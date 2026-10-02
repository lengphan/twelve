import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Label, Num, Option, Tap, shared } from '@/components/ui';
import { BackIcon } from '@/components/icons';
import { buildPlan, fmt, type Activity, type Diet, type Goal, type Place, type Profile, type Sex } from '@/lib/plan';
import { useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

const GOALS: { id: Goal; t: string; d: string }[] = [
  { id: 'recomp', t: 'Lose fat, keep muscle', d: 'The classic transformation' },
  { id: 'muscle', t: 'Build muscle', d: 'Get stronger and bigger' },
  { id: 'fit', t: 'Get fitter overall', d: 'Energy, stamina, better habits' },
];

export default function Onboarding() {
  const finish = useStore((s) => s.finishOnboarding);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>('recomp');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('79.6');
  const [age, setAge] = useState('31');
  const [sex, setSex] = useState<Sex>('male');
  const [waist, setWaist] = useState('');
  const [activity, setActivity] = useState<Activity>('desk');
  const [days, setDays] = useState(3);
  const [place, setPlace] = useState<Place>('home');
  const [diet, setDiet] = useState<Diet>('any');
  const [avoid, setAvoid] = useState('');
  const [meals, setMeals] = useState(4);

  const profile: Profile = useMemo(
    () => ({
      goal,
      sex,
      age: Number(age) || 30,
      heightCm: Number(height) || 170,
      weightKg: Number(weight.replace(',', '.')) || 70,
      waistCm: waist ? Number(waist.replace(',', '.')) : undefined,
      activity,
      daysPerWeek: days,
      place,
      diet,
      avoid,
      mealsPerDay: meals,
    }),
    [goal, sex, age, height, weight, waist, activity, days, place, diet, avoid, meals],
  );
  const plan = useMemo(() => buildPlan(profile), [profile]);

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => (step > 1 ? setStep(step - 1) : undefined);

  return (
    <SafeAreaView style={shared.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.page}>
          {step < 5 && (
            <View style={{ gap: 14 }}>
              <View style={styles.topRow}>
                <Tap onPress={back} accessibilityLabel="Back" style={shared.iconBtn} disabled={step === 1}>
                  <BackIcon />
                </Tap>
                <Label>STEP {step} OF 4</Label>
                <View style={{ width: 44 }} />
              </View>
              <View style={shared.segments}>
                {[1, 2, 3, 4].map((i) => (
                  <Animated.View key={i} layout={LinearTransition} style={[shared.segment, { backgroundColor: i <= step ? colors.slate : '#DDD8CC' }]} />
                ))}
              </View>
            </View>
          )}

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View key={step} entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(150)} style={styles.body}>
              {step === 1 && (
                <>
                  <Title title="What do you want in 12 weeks?" lead="Pick one. Your meals and workouts are built around it." />
                  <View style={{ gap: 10 }}>
                    {GOALS.map((g) => (
                      <Option key={g.id} label={g.t} detail={g.d} selected={goal === g.id} onPress={() => setGoal(g.id)} />
                    ))}
                  </View>
                </>
              )}

              {step === 2 && (
                <>
                  <Title title="About you" lead="Used to calculate exact calories and protein." />
                  <View style={styles.grid2}>
                    <Field label="Height (cm)" value={height} onChange={setHeight} numeric />
                    <Field label="Weight (kg)" value={weight} onChange={setWeight} numeric />
                    <Field label="Age" value={age} onChange={setAge} numeric />
                    <View style={{ flex: 1, minWidth: '45%', gap: 6 }}>
                      <Text style={styles.fieldLabel}>Sex</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Option label="M" selected={sex === 'male'} onPress={() => setSex('male')} style={styles.flex1Center} />
                        <Option label="F" selected={sex === 'female'} onPress={() => setSex('female')} style={styles.flex1Center} />
                      </View>
                    </View>
                  </View>
                  <Field label="Waist at belly button (cm) · optional" value={waist} onChange={setWaist} numeric placeholder="e.g. 89" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Daily activity outside workouts</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['desk', 'feet', 'physical'] as Activity[]).map((a) => (
                        <Option key={a} label={a === 'desk' ? 'Desk' : a === 'feet' ? 'On feet' : 'Physical'} selected={activity === a} onPress={() => setActivity(a)} style={styles.flex1Center} />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <Title title="How will you train?" lead="Workouts adapt to your equipment and schedule." />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Days per week</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[2, 3, 4, 5].map((d) => (
                        <Option key={d} label={String(d)} mono selected={days === d} onPress={() => setDays(d)} style={styles.flex1Center} />
                      ))}
                    </View>
                  </View>
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Where</Text>
                    {(
                      [
                        ['home', 'Home', 'Dumbbells'],
                        ['gym', 'Gym', 'Full equipment'],
                        ['none', 'No equipment', 'Bodyweight'],
                      ] as [Place, string, string][]
                    ).map(([id, t, d]) => (
                      <Option key={id} label={t} detail={d} selected={place === id} onPress={() => setPlace(id)} />
                    ))}
                  </View>
                </>
              )}

              {step === 4 && (
                <>
                  <Title title="How do you eat?" lead="Meal plans use foods you actually like." />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Diet</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {(
                        [
                          ['any', 'No preference'],
                          ['vegetarian', 'Vegetarian'],
                          ['pescatarian', 'Pescatarian'],
                          ['vegan', 'Vegan'],
                        ] as [Diet, string][]
                      ).map(([id, t]) => (
                        <Option key={id} label={t} selected={diet === id} onPress={() => setDiet(id)} style={{ borderRadius: radius.pill, paddingVertical: 10 }} />
                      ))}
                    </View>
                  </View>
                  <Field label="Foods to avoid" value={avoid} onChange={setAvoid} placeholder="e.g. mushrooms, tofu" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Meals per day</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[3, 4, 5].map((m) => (
                        <Option key={m} label={String(m)} mono selected={meals === m} onPress={() => setMeals(m)} style={styles.flex1Center} />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {step === 5 && (
                <View style={{ gap: 14, paddingTop: 8 }}>
                  <Label>YOUR PLAN IS READY</Label>
                  <Text style={shared.h1}>12 weeks to {goal === 'muscle' ? 'build muscle.' : goal === 'fit' ? 'get fitter.' : 'lose fat and keep your muscle.'}</Text>
                  <Card dark style={{ paddingVertical: 6, paddingHorizontal: 18, borderRadius: radius.xl }}>
                    <Row k="Calories / day" v={`${fmt(plan.calories)} kcal`} />
                    <Row k="Protein / day" v={`${plan.proteinG} g`} />
                    <Row k="Workouts" v={`${days} × ${plan.workoutMinutes} min`} />
                    <Row k="Expected pace" v={goal === 'recomp' ? `−${plan.paceKgPerWeek[0]} to −${plan.paceKgPerWeek[1]} kg / wk` : `+${plan.paceKgPerWeek[0]} to +${plan.paceKgPerWeek[1]} kg / wk`} last />
                  </Card>
                  <Card style={{ gap: 10 }}>
                    <Label style={{ fontSize: 11 }}>YOUR STARTING POINT</Label>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.small}>Waist-to-height</Text>
                        <Num style={{ fontSize: 20 }}>{plan.waistToHeight ?? '—'}</Num>
                        <Text style={styles.smallDark}>{plan.waistToHeight ? 'Aim: under 0.50' : 'Add waist to see'}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.small}>BMI</Text>
                        <Num style={{ fontSize: 20 }}>{plan.bmi.toFixed(1)}</Num>
                        <Text style={styles.smallDark}>Rough guide only</Text>
                      </View>
                    </View>
                    <Text style={[styles.small, { lineHeight: 17 }]}>BMI can't tell muscle from fat, so we track waist and strength to show real progress.</Text>
                  </Card>
                  <Text style={[styles.small, { lineHeight: 18 }]}>Targets update every Sunday from your check-in. General fitness guidance, not medical advice.</Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          {step < 5 ? (
            <Button label={step === 4 ? 'Build my plan' : 'Continue'} onPress={next} />
          ) : (
            <Button
              label="Continue"
              haptic="success"
              onPress={() => {
                finish(profile);
                router.replace('/paywall');
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Title({ title, lead }: { title: string; lead: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={shared.h1}>{title}</Text>
      <Text style={shared.lead}>{lead}</Text>
    </View>
  );
}

function Field({ label, value, onChange, numeric, placeholder }: { label: string; value: string; onChange: (v: string) => void; numeric?: boolean; placeholder?: string }) {
  return (
    <View style={{ flex: 1, minWidth: '45%', gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        placeholder={placeholder}
        placeholderTextColor="#9AA1A8"
        style={[styles.input, numeric && { fontFamily: fonts.mono, fontSize: 18 }]}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.slateLine }]}>
      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.onSlateMuted }}>{k}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.onSlate }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { gap: 18, paddingTop: 6, paddingBottom: 12 },
  fieldLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 16, color: colors.slate },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flex1Center: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  smallDark: { fontFamily: fonts.regular, fontSize: 12, color: colors.slateMid },
});
