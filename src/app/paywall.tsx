import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '@/components/icons';
import { Button, Tap, shared } from '@/components/ui';
import { useStore, type Tier } from '@/store';
import { colors, fonts, radius } from '@/theme';

export default function Paywall() {
  const setTier = useStore((s) => s.setTier);
  const [tier, pick] = useState<Tier>('plus');
  const [yearly, setYearly] = useState(true);
  const plusPrice = yearly ? '$79.99/yr' : '$14.99/mo';

  const tiers: { id: Tier; name: string; price: string; desc: string; tag?: string }[] = [
    { id: 'free', name: 'Free', price: '$0', desc: 'Log meals. See your targets.' },
    { id: 'plus', name: 'Plus', price: plusPrice, desc: 'Exact meals, workouts and weekly tweaks.', tag: yearly ? '7 DAYS FREE · SAVE 55%' : '7 DAYS FREE' },
    { id: 'transformation', name: '12-week Transformation', price: '$149 once', desc: 'All of Plus, a phased program and your before/after.', tag: 'PAY ONCE' },
  ];

  let cta = 'Start free';
  let fine = 'Upgrade anytime.';
  if (tier === 'plus') {
    cta = 'Try 7 days free';
    fine = `Then ${plusPrice}. Cancel anytime, we remind you first.`;
  } else if (tier === 'transformation') {
    cta = 'Start my 12 weeks';
    fine = '$149 once. Never renews.';
  }

  const go = () => {
    // Purchases: connect RevenueCat or StoreKit/Play Billing here before release.
    setTier(tier);
    router.replace('/');
  };

  return (
    <SafeAreaView style={shared.safe} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.topRow}>
          <Tap onPress={() => router.replace('/onboarding')} accessibilityLabel="Back" style={shared.iconBtn}>
            <BackIcon />
          </Tap>
          <Tap onPress={() => router.replace('/')} haptic="select" style={{ padding: 12 }}>
            <Text style={styles.notNow}>Not now</Text>
          </Tap>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={shared.h1}>Go all in.</Text>
          <Text style={shared.lead}>Logging stays free. No ads, ever.</Text>
        </View>

        <View style={shared.segmented}>
          {[true, false].map((y) => (
            <Tap key={String(y)} onPress={() => setYearly(y)} haptic="select" style={[shared.segBtn, yearly === y && shared.segOn]}>
              <Text style={[shared.segText, { color: yearly === y ? colors.slate : colors.muted }]}>{y ? 'Yearly' : 'Monthly'}</Text>
            </Tap>
          ))}
        </View>

        <View style={{ gap: 10 }}>
          {tiers.map((t) => {
            const on = tier === t.id;
            return (
              <Tap key={t.id} onPress={() => pick(t.id)} haptic="select" style={[styles.tier, on ? styles.tierOn : styles.tierOff]}>
                <View style={{ gap: 8 }}>
                  <View style={styles.tierHead}>
                    <Text style={[styles.tierName, { color: on ? colors.onSlate : colors.slate }]}>{t.name}</Text>
                    <Text style={[styles.tierPrice, { color: on ? colors.onSlate : colors.slate }]}>{t.price}</Text>
                  </View>
                  <Text style={[styles.tierDesc, { color: on ? '#C9CED3' : colors.muted }]}>{t.desc}</Text>
                  {t.tag ? (
                    <Text style={[styles.tag, { backgroundColor: on ? colors.slateLine : colors.sunken, color: on ? colors.onSlate : colors.slateMid }]}>{t.tag}</Text>
                  ) : null}
                </View>
              </Tap>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ gap: 10 }}>
          <Button label={cta} onPress={go} haptic="success" />
          <Text style={styles.fine}>{fine}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notNow: { fontFamily: fonts.regular, fontSize: 14, color: colors.slateMid },
  tier: { borderRadius: radius.lg, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 16 },
  tierOn: { backgroundColor: colors.slate, borderColor: colors.slate },
  tierOff: { backgroundColor: colors.card, borderColor: colors.line },
  tierHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  tierName: { fontFamily: fonts.semibold, fontSize: 16 },
  tierPrice: { fontFamily: fonts.mono, fontSize: 15 },
  tierDesc: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  tag: { alignSelf: 'flex-start', fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  fine: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center' },
});
