import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckIcon } from '@/components/icons';
import { enter, Bar, Card, Label, Num, Tap, shared } from '@/components/ui';
import { macros, type LoggedItem } from '@/lib/foods';
import { fmt } from '@/lib/plan';
import { TODAY_WORKOUT } from '@/lib/workouts';
import { programDay, todayTotals, useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

// Suggestions in order; the first one not yet eaten today is shown.
const SUGGESTIONS: { name: string; desc: string; items: LoggedItem[] }[] = [
  {
    name: 'Salmon dinner',
    desc: 'Salmon, baby potatoes, green beans',
    items: [
      { foodId: 'salmon', grams: 180 },
      { foodId: 'potatoes', grams: 200 },
      { foodId: 'beans', grams: 150 },
      { foodId: 'oliveOil', grams: 5 },
    ],
  },
  { name: 'Skyr snack', desc: 'Skyr and a banana', items: [{ foodId: 'skyr', grams: 170 }, { foodId: 'banana', grams: 100 }] },
];

export default function Today() {
  const plan = useStore((s) => s.plan)!;
  const meals = useStore((s) => s.meals);
  const logMeal = useStore((s) => s.logMeal);
  const { protein, kcal, mealsToday } = todayTotals(meals);
  const left = Math.max(0, plan.proteinG - protein);
  const eaten = new Set(mealsToday.map((m) => m.name));
  const next = left > 0 ? SUGGESTIONS.find((x) => !eaten.has(x.name)) : undefined;
  const nextMacros = next ? macros(next.items) : undefined;
  const { week, day: dayNum } = programDay(useStore((s) => s.startedAt));
  const w = TODAY_WORKOUT;
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <SafeAreaView style={shared.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ gap: 2 }}>
            <Label>
              WEEK {week} OF 12 · DAY {dayNum}
            </Label>
            <Text style={shared.h1}>{day}</Text>
          </View>
        </View>

        <Animated.View entering={enter()}>
          <Card dark style={styles.hero}>
            <View style={styles.between}>
              <Text style={styles.heroMuted}>Protein</Text>
              <Text style={styles.heroMono}>{left > 0 ? `${left} g to go` : 'Done ✓'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Num style={styles.big}>{protein}</Num>
              <Num style={styles.bigUnit}>/ {plan.proteinG} g</Num>
            </View>
            <Bar value={protein / plan.proteinG} />
            <View style={styles.triple}>
              <Stat k="Calories" v={fmt(kcal)} of={fmt(plan.calories)} grow={1.5} />
              <Stat k="Steps" v="—" of={`${plan.steps / 1000}k`} />
              <Stat k="Water" v="—" of={`${plan.waterL} L`} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(60)}>
          <Tap onPress={() => router.push('/workout')} style={styles.workout}>
            <View style={styles.between}>
              <View style={{ gap: 3 }}>
                <Label style={{ fontSize: 11 }}>TODAY · {w.minutes} MIN</Label>
                <Text style={styles.cardTitle}>{w.name}</Text>
              </View>
              <View style={styles.startPill}>
                <Text style={styles.startText}>Start</Text>
              </View>
            </View>
            <Text style={styles.rowMono}>{w.exercises.length} moves · {w.exercises.reduce((n, e) => n + e.sets, 0)} sets</Text>
          </Tap>
        </Animated.View>

        <View style={[styles.between, { paddingTop: 2, alignItems: 'baseline' }]}>
          <Text style={styles.h2}>Meals</Text>
          <Text style={styles.small}>{mealsToday.length} logged</Text>
        </View>

        <Animated.View entering={enter(120)} style={styles.meals}>
          {mealsToday.length > 0 && (
            <View style={[styles.mealRow, { borderBottomWidth: 1, borderBottomColor: colors.lineSoft }]}>
              <View style={styles.check}>
                <CheckIcon />
              </View>
              <Text style={[styles.rowText, { flex: 1, color: colors.slate, fontSize: 14 }]} numberOfLines={1}>
                {mealsToday.map((m) => m.name).join(' · ')}
              </Text>
              <Text style={styles.rowMono}>
                {protein} g · {fmt(kcal)} kcal
              </Text>
            </View>
          )}
          {next && nextMacros ? (
            <View style={{ padding: 14, gap: 8 }}>
              <View style={[styles.between, { alignItems: 'baseline' }]}>
                <Text style={styles.mealTitle}>Up next</Text>
                <Text style={[styles.rowMono, { color: colors.slate }]}>
                  {nextMacros.protein} g · {fmt(nextMacros.kcal)} kcal
                </Text>
              </View>
              <Text style={styles.mealDesc}>{next.desc}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Tap onPress={() => logMeal(next.name, next.items)} haptic="success" style={[styles.pill, { borderColor: colors.slate }]}>
                  <Text style={styles.pillText}>Ate it</Text>
                </Tap>
                <Tap onPress={() => router.push('/log')} haptic="select" style={[styles.pill, { borderColor: colors.line }]}>
                  <Text style={[styles.pillText, { fontFamily: fonts.regular, color: colors.slateMid }]}>Something else</Text>
                </Tap>
              </View>
            </View>
          ) : (
            <View style={{ padding: 14 }}>
              <Text style={styles.mealDesc}>{left > 0 ? 'Tap + to log a meal.' : 'Protein done. Crushed it.'}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ k, v, of, grow = 1 }: { k: string; v: string; of: string; grow?: number }) {
  return (
    <View style={{ flex: grow, gap: 3 }}>
      <Text style={styles.heroMuted}>{k}</Text>
      <Text numberOfLines={1} style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.onSlate }}>
        {v}
        <Text style={{ color: '#8E979F' }}> / {of}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 },
  h2: { fontFamily: fonts.semibold, fontSize: 16, color: colors.slate },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hero: { borderRadius: radius.xl, padding: 18, gap: 14 },
  heroMuted: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSlateMuted },
  heroMono: { fontFamily: fonts.mono, fontSize: 13, color: colors.onSlateMuted },
  big: { fontSize: 44, letterSpacing: -1.76, lineHeight: 46, color: colors.onSlate, fontFamily: fonts.monoMedium },
  bigUnit: { fontSize: 18, color: colors.onSlateMuted },
  triple: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  workout: { padding: 16, gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 18, letterSpacing: -0.36, color: colors.slate },
  startPill: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.slate, justifyContent: 'center' },
  startText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.onSlate },
  rowText: { fontFamily: fonts.regular, fontSize: 13, color: colors.slateMid },
  rowMono: { fontFamily: fonts.mono, fontSize: 13, color: colors.muted },
  small: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  meals: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.slate, alignItems: 'center', justifyContent: 'center' },
  mealTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.slate },
  mealDesc: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.slateMid },
  pill: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  pillText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.slate },
});
