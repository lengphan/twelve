import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, UpIcon } from '@/components/icons';
import { Button, Tap, shared } from '@/components/ui';
import { TODAY_WORKOUT } from '@/lib/workouts';
import { useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

export default function WorkoutScreen() {
  const w = TODAY_WORKOUT;
  const [index, setIndex] = useState(0);
  const completed = useStore((s) => s.completedSets);
  const toggleSet = useStore((s) => s.toggleSet);
  const finishWorkout = useStore((s) => s.finishWorkout);
  const ex = w.exercises[index];
  const key = `${new Date().toDateString()}:${ex.id}`; // sets reset each day
  const done = completed[key] ?? Array(ex.sets).fill(false);
  const count = done.filter(Boolean).length;
  const allDone = count === ex.sets;
  const isLast = index === w.exercises.length - 1;

  return (
    <SafeAreaView style={shared.safe} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.top}>
          <Tap onPress={() => router.back()} accessibilityLabel="End workout" style={shared.iconBtn}>
            <CloseIcon />
          </Tap>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={styles.title}>{w.name}</Text>
            <Text style={styles.mono12}>
              EXERCISE {index + 1} OF {w.exercises.length}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={shared.segments}>
          {w.exercises.map((e, i) => (
            <View key={e.id} style={[shared.segment, { backgroundColor: i <= index ? colors.slate : '#DDD8CC' }]} />
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
          <Animated.View key={ex.id} entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(150)} style={{ gap: 14 }}>
            <View style={styles.video}>
              <Text style={styles.videoText}>Form demo video</Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text style={styles.exTitle}>{ex.name}</Text>
              <Text style={styles.sub}>
                {ex.sets} sets × {ex.reps} · <Text style={{ fontFamily: fonts.mono }}>{ex.load}</Text> · rest {ex.restSec} s
              </Text>
            </View>
            {ex.note && (
              <View style={shared.note}>
                <UpIcon />
                <Text style={shared.noteText}>{ex.note}</Text>
              </View>
            )}
            <View style={{ gap: 8 }}>
              {done.map((d, i) => (
                <Tap
                  key={i}
                  onPress={() => toggleSet(key, i, ex.sets)}
                  haptic={d ? 'select' : 'success'}
                  accessibilityLabel={`Set ${i + 1}`}
                  style={[styles.set, d ? styles.setOn : styles.setOff]}
                >
                  <Text style={[styles.setNum, { color: d ? colors.onSlateMuted : colors.muted }]}>SET {i + 1}</Text>
                  <Text style={[styles.setLoad, { color: d ? colors.onSlate : colors.slate }]}>
                    {ex.reps} × {ex.load}
                  </Text>
                  <Text style={[styles.setLabel, { color: d ? colors.onSlate : colors.slate }]}>{d ? 'Done' : 'Tap when done'}</Text>
                </Tap>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {allDone ? (
          <Button
            label={isLast ? 'Finish workout' : `Next: ${w.exercises[index + 1].name}`}
            haptic="success"
            onPress={() => {
              if (isLast) {
                finishWorkout();
                router.back();
              } else setIndex(index + 1);
            }}
          />
        ) : (
          <View style={styles.rest}>
            <Text style={styles.restText}>{count > 0 ? `Rest ${ex.restSec} s · then set ${count + 1}` : 'Start set 1 when ready'}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.slate },
  mono12: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  video: { height: 190, borderRadius: radius.xl, backgroundColor: '#262D34', alignItems: 'center', justifyContent: 'center' },
  videoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSlateMuted },
  exTitle: { fontFamily: fonts.semibold, fontSize: 26, letterSpacing: -0.78, color: colors.slate },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.slateMid },
  set: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 58, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1 },
  setOn: { backgroundColor: colors.slate, borderColor: colors.slate },
  setOff: { backgroundColor: colors.card, borderColor: colors.line },
  setNum: { width: 48, fontFamily: fonts.mono, fontSize: 13 },
  setLoad: { flex: 1, fontFamily: fonts.mono, fontSize: 17 },
  setLabel: { fontFamily: fonts.semibold, fontSize: 13 },
  rest: { height: 56, borderRadius: 28, backgroundColor: colors.sunken, alignItems: 'center', justifyContent: 'center' },
  restText: { fontFamily: fonts.mono, fontSize: 15, color: colors.slateMid },
});
