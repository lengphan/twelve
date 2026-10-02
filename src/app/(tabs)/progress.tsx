import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { ChevronIcon } from '@/components/icons';
import { Card, Label, Num, Tap, shared } from '@/components/ui';
import { linearTrend } from '@/lib/review';
import { programDay, useStore } from '@/store';
import { colors, fonts } from '@/theme';

// Shown only until the person has two real check-ins, and clearly labelled as a sample.
const SAMPLE = [79.6, 79.9, 79.2, 79.0, 79.3, 78.6, 78.4, 78.7, 77.9, 77.6, 77.9, 77.1, 76.8, 76.4];

export default function Progress() {
  const profile = useStore((s) => s.profile);
  const checkIns = useStore((s) => s.checkIns);
  const finished = useStore((s) => s.finishedWorkouts);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const doneThisWeek = finished.filter((t) => t >= weekAgo).length;
  const { week } = programDay(useStore((s) => s.startedAt));

  const real = checkIns.length >= 2;
  const weights = real ? checkIns.map((c) => c.weightKg) : SAMPLE;
  const { line, slope } = linearTrend(weights);
  const latest = line[line.length - 1];
  const spanWeeks = real ? Math.max(1, (checkIns[checkIns.length - 1].at - checkIns[0].at) / (7 * 86_400_000)) : 26 / 7;
  const perWeek = ((slope * (weights.length - 1)) / spanWeeks).toFixed(1);

  const W = 324;
  const H = 142;
  const lo = Math.floor(Math.min(...weights) - 0.4);
  const hi = Math.ceil(Math.max(...weights) + 0.4);
  const x = (i: number) => 10 + (i * (W - 20)) / Math.max(1, weights.length - 1);
  const y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - 26);
  const grid = Array.from({ length: hi - lo - 1 }, (_, i) => hi - 1 - i).filter((_, i, a) => a.length <= 4 || i % 2 === 0);

  const firstWaist = checkIns.find((c) => c.waistCm)?.waistCm;
  const lastWaist = [...checkIns].reverse().find((c) => c.waistCm)?.waistCm;
  const whtr = lastWaist && profile ? lastWaist / profile.heightCm : undefined;

  return (
    <SafeAreaView style={shared.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 2, paddingBottom: 4 }}>
          <Label>WEEK {week} / 12</Label>
          <Text style={shared.h1}>Progress</Text>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(20)}>
          <Card style={{ borderRadius: 22, gap: 10 }}>
            {!real && <Label style={{ fontSize: 11 }}>SAMPLE · YOUR DATA APPEARS AFTER YOUR FIRST CHECK-IN</Label>}
            <View style={{ gap: 2 }}>
              <Text style={styles.muted13}>Weight trend</Text>
              <Num style={{ fontSize: 30, letterSpacing: -0.9 }}>
                {latest.toFixed(1)}
                <Text style={{ fontSize: 15, color: colors.muted }}> kg</Text>
              </Num>
              <Text style={styles.body13}>
                {Number(perWeek) <= 0 ? '−' : '+'}
                {Math.abs(Number(perWeek)).toFixed(1)} kg a week
              </Text>
            </View>
            <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} accessibilityLabel="Weigh-ins with a straight trend line">
              {grid.map((g) => (
                <Line key={g} x1={10} x2={W - 10} y1={y(g)} y2={y(g)} stroke={colors.sunken} strokeWidth={1} />
              ))}
              {grid.map((g) => (
                <SvgText key={`l${g}`} x={W - 10} y={y(g) - 4} fontSize={9} fill={colors.muted} textAnchor="end" fontFamily={fonts.mono}>
                  {g}
                </SvgText>
              ))}
              {weights.map((v, i) => (
                <Circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#B6B0A3" />
              ))}
              <Path d={`M${x(0)} ${y(line[0])} L${x(line.length - 1)} ${y(latest)}`} stroke={colors.slate} strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
            <Text style={styles.caption}>Dots are weigh-ins. The line shows the real direction, so one heavy day never ruins your week.</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(20)} style={{ flexDirection: 'row', gap: 10 }}>
          <Card dark style={{ flex: 1, gap: 10, padding: 14 }}>
            <Text style={styles.onSlateMuted}>Workouts this week</Text>
            <Text style={styles.onSlateNum}>{profile ? `${doneThisWeek} / ${profile.daysPerWeek}` : '—'}</Text>
            <View style={styles.bars}>
              {Array.from({ length: profile?.daysPerWeek ?? 3 }).map((_, i) => (
                <View key={i} style={{ flex: 1, height: 56, borderRadius: 4, backgroundColor: i < doneThisWeek ? colors.onSlate : colors.slateLine }} />
              ))}
            </View>
            <Text style={styles.onSlateMuted}>Strength trends appear after 2 weeks</Text>
          </Card>
          <Card style={{ flex: 1, gap: 8, padding: 14 }}>
            <Text style={styles.muted12}>Waist</Text>
            <Num style={{ fontSize: 22 }}>{lastWaist ? `${lastWaist} cm` : '—'}</Num>
            <Text style={styles.body13}>
              {firstWaist && lastWaist && firstWaist !== lastWaist ? `${lastWaist - firstWaist > 0 ? '+' : '−'}${Math.abs(lastWaist - firstWaist)} cm since start` : lastWaist ? 'Starting point' : 'Add at check-in'}
            </Text>
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Text style={styles.muted12}>Waist-to-height</Text>
            <Num style={{ fontSize: 16 }}>
              {whtr !== undefined ? whtr.toFixed(2) : '—'}
              {whtr !== undefined && whtr < 0.5 ? <Text style={{ fontSize: 12, color: colors.win }}> under 0.50</Text> : null}
            </Num>
          </Card>
        </Animated.View>

        <Tap onPress={() => router.push('/checkin')} haptic="select" style={styles.row} accessibilityLabel="Weekly check-in">
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.rowTitle}>Weekly check-in</Text>
            <Text style={styles.body13}>Weigh in, measure, 3 quick questions · 2 minutes</Text>
          </View>
          <ChevronIcon />
        </Tap>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
  muted13: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  muted12: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  body13: { fontFamily: fonts.regular, fontSize: 13, color: colors.slateMid },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  onSlateMuted: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSlateMuted },
  onSlateNum: { fontFamily: fonts.mono, fontSize: 22, color: colors.onSlate },
  bars: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 56 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.card },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.slate },
});
