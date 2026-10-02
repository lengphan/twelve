import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, enter, Card, Label, Num, Option, Tap, shared } from '@/components/ui';
import { BackIcon } from '@/components/icons';
import { buildPlan, fmt, type Activity, type Diet, type Goal, type Place, type Profile, type Sex } from '@/lib/plan';
import { useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

const GOALS: { id: Goal; t: string; d: string }[] = [
  { id: 'recomp', t: 'Get lean', d: 'Lose fat, keep muscle' },
  { id: 'muscle', t: 'Get strong', d: 'Build real muscle' },
  { id: 'fit', t: 'Get fit', d: 'More energy, every day' },
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
                  <View key={i} style={[shared.segment, { backgroundColor: i <= step ? colors.slate : '#DDD8CC' }]} />
                ))}
              </View>
            </View>
          )}

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View key={step} entering={enter()} style={styles.body}>
              {step === 1 && (
                <>
                  <Title title="What's your 12-week win?" />
                  <View style={{ gap: 10 }}>
                    {GOALS.map((g) => (
                      <Option key={g.id} label={g.t} detail={g.d} selected={goal === g.id} onPress={() => setGoal(g.id)} />
                    ))}
                  </View>
                </>
              )}

              {step === 2 && (
                <>
                  <Title title="The basics" lead="For your exact numbers." />
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
                  <Field label="Waist (cm) · optional" value={waist} onChange={setWaist} numeric placeholder="e.g. 89" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Your day</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['desk', 'feet', 'physical'] as Activity[]).map((a) => (
                        <Option key={a} label={a === 'desk' ? 'Desk' : a === 'feet' ? 'On feet' : 'Active'} selected={activity === a} onPress={() => setActivity(a)} style={styles.flex1Center} />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <Title title="How will you train?" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Days a week</Text>
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
                  <Title title="How do you eat?" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Diet</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {(
                        [
                          ['any', 'Anything'],
                          ['vegetarian', 'Vegetarian'],
                          ['pescatarian', 'Pescatarian'],
                          ['vegan', 'Vegan'],
                        ] as [Diet, string][]
                      ).map(([id, t]) => (
                        <Option key={id} label={t} selected={diet === id} onPress={() => setDiet(id)} style={{ borderRadius: radius.pill, paddingVertical: 10 }} />
                      ))}
                    </View>
                  </View>
                  <Field label="Skip these" value={avoid} onChange={setAvoid} placeholder="e.g. mushrooms, tofu" />
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Meals a day</Text>
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
                  <Label>YOUR PLAN</Label>
                  <Text style={shared.h1}>{goal === 'muscle' ? 'Stronger in 12 weeks.' : goal === 'fit' ? 'Fitter in 12 weeks.' : 'Leaner in 12 weeks.'}</Text>
                  <Card dark style={{ paddingVertical: 6, paddingHorizontal: 18, borderRadius: radius.xl }}>
                    <Row k="Calories a day" v={`${fmt(plan.calories)} kcal`} />
                    <Row k="Protein a day" v={`${plan.proteinG} g`} />
                    <Row k="Workouts" v={`${days} × ${plan.workoutMinutes} min`} />
                    <Row k="Pace" v={goal === 'recomp' ? `−${plan.paceKgPerWeek[0]} to −${plan.paceKgPerWeek[1]} kg / wk` : `+${plan.paceKgPerWeek[0]} to +${plan.paceKgPerWeek[1]} kg / wk`} last />
                  </Card>
                  <Card style={{ gap: 10 }}>
                    <Label style={{ fontSize: 11 }}>DAY 1</Label>
                    <View style={{ flexDirection: 'row' }}>
                      {plan.waistToHeight ? (
                        <View style={{ flex: 1, gap: 3 }}>
                          <Text style={styles.small}>Waist-to-height</Text>
                          <Num style={{ fontSize: 20 }}>{plan.waistToHeight.toFixed(2)}</Num>
                          <Text style={styles.smallDark}>Goal: under 0.50</Text>
                        </View>
                      ) : null}
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.small}>BMI</Text>
                        <Num style={{ fontSize: 20 }}>{plan.bmi.toFixed(1)}</Num>
                        <Text style={styles.smallDark}>Rough guide</Text>
                      </View>
                    </View>
                  </Card>
                  <Text style={[styles.small, { lineHeight: 18 }]}>Adjusts every Sunday. Not medical advice.</Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          {step < 5 ? (
            <Button label={step === 4 ? 'Build my plan' : 'Next'} onPress={next} />
          ) : (
            <Button
              label="Let's go"
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

function Title({ title, lead }: { title: string; lead?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={shared.h1}>{title}</Text>
      {lead ? <Text style={shared.lead}>{lead}</Text> : null}
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
