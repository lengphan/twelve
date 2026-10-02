import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraIcon, CloseIcon } from '@/components/icons';
import { Button, Tap, shared } from '@/components/ui';
import { analyzeMeal } from '@/lib/ai';
import { FOODS, QUICK_ADDS, macros, type LoggedItem } from '@/lib/foods';
import { fmt } from '@/lib/plan';
import { todayTotals, useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

type Mode = 'photo' | 'voice' | 'text';

export default function LogMeal() {
  const plan = useStore((s) => s.plan);
  const meals = useStore((s) => s.meals);
  const logMeal = useStore((s) => s.logMeal);
  const [mode, setMode] = useState<Mode>('photo');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<LoggedItem[] | null>(null);

  const before = todayTotals(meals).protein;
  const total = items ? macros(items) : { protein: 0, kcal: 0 };
  const left = plan ? plan.proteinG - before - total.protein : 0;

  const analyze = async () => {
    setBusy(true);
    const found = await analyzeMeal({ kind: mode, text });
    setItems(found);
    setBusy(false);
  };

  const adjust = (i: number, dir: 1 | -1) => {
    if (!items) return;
    const next = items.slice();
    const step = FOODS[next[i].foodId]?.step ?? 10;
    next[i] = { ...next[i], grams: Math.max(0, next[i].grams + dir * step) };
    setItems(next);
  };

  const quickAdd = (label: string, list: LoggedItem[]) => {
    logMeal(label, list);
    router.back();
  };

  return (
    <SafeAreaView style={shared.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Tap onPress={() => router.back()} accessibilityLabel="Close" style={shared.iconBtn}>
          <CloseIcon />
        </Tap>
        <Text style={styles.title}>Log a meal</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text style={styles.small}>Quick add · one tap</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {QUICK_ADDS.map((q) => (
              <Tap key={q.label} onPress={() => quickAdd(q.label, q.items)} haptic="success" style={styles.chip}>
                <Text style={styles.chipText}>{q.label}</Text>
              </Tap>
            ))}
          </ScrollView>
        </View>

        <View style={shared.segmented}>
          {(['photo', 'voice', 'text'] as Mode[]).map((m) => (
            <Tap key={m} onPress={() => setMode(m)} haptic="select" style={[shared.segBtn, mode === m && shared.segOn]}>
              <Text style={[shared.segText, { color: mode === m ? colors.slate : colors.muted }]}>{m === 'photo' ? 'Photo' : m === 'voice' ? 'Voice' : 'Type'}</Text>
            </Tap>
          ))}
        </View>

        {!items && (
          <Animated.View key={mode} entering={FadeIn.duration(180)} style={{ gap: 12 }}>
            {mode === 'text' ? (
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="e.g. salmon, potatoes and green beans"
                placeholderTextColor="#9AA1A8"
                style={styles.input}
                accessibilityLabel="What did you eat?"
                multiline
              />
            ) : (
              <Tap onPress={analyze} style={styles.capture} accessibilityLabel={mode === 'photo' ? 'Take a photo of your meal' : 'Hold to describe your meal'}>
                <CameraIcon />
                <Text style={styles.captureText}>{mode === 'photo' ? 'Tap to take a photo' : 'Tap and say what you ate'}</Text>
              </Tap>
            )}
            {mode === 'text' && <Button label="Find my meal" onPress={analyze} disabled={!text.trim()} />}
            {busy && (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={colors.slate} />
                <Text style={styles.small}>Reading your meal…</Text>
              </View>
            )}
          </Animated.View>
        )}

        {items && (
          <Animated.View entering={FadeInDown.springify().damping(20)} layout={LinearTransition} style={{ gap: 12 }}>
            <View style={styles.between}>
              <Text style={styles.h2}>We found {items.length} items</Text>
              <Text style={styles.small}>Protein · calories · tap ± to adjust</Text>
            </View>
            <View style={styles.list}>
              {items.map((it, i) => {
                const f = FOODS[it.foodId];
                const m = macros([it]);
                return (
                  <View key={it.foodId} style={[styles.item, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.lineSoft }]}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.itemName}>{f?.name ?? it.foodId}</Text>
                      <Text style={styles.itemMono}>
                        {m.protein} g · {m.kcal} kcal
                      </Text>
                    </View>
                    <Tap onPress={() => adjust(i, -1)} haptic="select" accessibilityLabel={`Less ${f?.name}`} style={styles.stepBtn}>
                      <Text style={styles.stepText}>−</Text>
                    </Tap>
                    <Text style={styles.grams}>{it.grams} g</Text>
                    <Tap onPress={() => adjust(i, 1)} haptic="select" accessibilityLabel={`More ${f?.name}`} style={styles.stepBtn}>
                      <Text style={styles.stepText}>+</Text>
                    </Tap>
                  </View>
                );
              })}
            </View>
            <View style={styles.summary}>
              <View style={styles.between}>
                <Text style={styles.sumMuted}>This meal</Text>
                <Text style={styles.sumMono}>
                  {total.protein} g · {fmt(total.kcal)} kcal
                </Text>
              </View>
              {plan && (
                <Text style={styles.sumText}>
                  {left > 0
                    ? `After this: ${before + total.protein} of ${plan.proteinG} g protein today. ${left} g to go.`
                    : 'After this you hit your protein target for today.'}
                </Text>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {items && (
        <View style={styles.footer}>
          <Button
            label="Looks right — log it"
            haptic="success"
            onPress={() => {
              logMeal(mode === 'photo' ? 'Photo meal' : 'Meal', items);
              router.back();
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.slate },
  page: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, justifyContent: 'center' },
  chipText: { fontFamily: fonts.regular, fontSize: 13, color: colors.slate },
  capture: { height: 140, borderRadius: radius.lg, backgroundColor: '#262D34', alignItems: 'center', justifyContent: 'center', gap: 8 },
  captureText: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSlateMuted },
  input: { minHeight: 100, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 14, fontFamily: fonts.regular, fontSize: 16, color: colors.slate, textAlignVertical: 'top' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  h2: { fontFamily: fonts.semibold, fontSize: 14, color: colors.slate },
  list: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingLeft: 14, paddingRight: 12 },
  itemName: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate },
  itemMono: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  stepBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.regular, fontSize: 18, color: colors.slate },
  grams: { width: 58, textAlign: 'center', fontFamily: fonts.mono, fontSize: 15, color: colors.slate },
  summary: { backgroundColor: colors.slate, borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 16, gap: 8 },
  sumMuted: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSlateMuted },
  sumMono: { fontFamily: fonts.mono, fontSize: 16, color: colors.onSlate },
  sumText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: '#D9DDE1' },
  footer: { paddingHorizontal: 20, paddingBottom: 8, paddingTop: 4 },
});
