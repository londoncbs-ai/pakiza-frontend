import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { errorMessage } from '@/api/client';
import { matchAdvisorsApi } from '@/api/matchAdvisors';
import type { MatchAdvisorOffer, MatchAdvisorRequest } from '@/api/types';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { SkeletonList } from '@/components/Skeleton';
import { Text } from '@/components/Text';
import { palette, radii, shadow, spacing, useTheme } from '@/theme';
import { PressableScale } from '@/components/PressableScale';

export default function RequestDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c, isDark } = useTheme();

  const [req, setReq] = useState<MatchAdvisorRequest | null>(null);
  const [offers, setOffers] = useState<MatchAdvisorOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      setError(null);
      const [r, o] = await Promise.all([
        matchAdvisorsApi.getRequest(params.id),
        matchAdvisorsApi.listOffers(params.id)
      ]);
      setReq(r);
      setOffers(o);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleCancel = () => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          await matchAdvisorsApi.updateRequest(params.id!, { status: 'cancelled' });
          loadData();
        } catch (err) {
          Alert.alert('Error', errorMessage(err));
        }
      }}
    ]);
  };

  if (loading) return <Screen><SkeletonList /></Screen>;
  if (error || !req) return <Screen><ErrorState message={error || 'Not found'} onRetry={loadData} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 80 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
            <Ionicons name="chevron-back" size={28} color={c.text} style={{ marginLeft: -8 }} />
          </Pressable>
          <Text variant="title" style={{ marginTop: spacing.xs }}>{req.request_title || 'Request Details'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: req.status === 'cancelled' ? palette.sienna : c.success }} />
            <Text variant="label" tone="accent" style={{ textTransform: 'uppercase', fontWeight: '700' }}>{req.status}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, !isDark ? shadow.soft : undefined] as any}>
          <Text variant="heading" style={{ marginBottom: spacing.sm }}>Request Info</Text>
          <Text variant="footnote" tone="muted">Budget: £{(req.max_budget_pence / 100).toFixed(2)}</Text>
          <Text variant="footnote" tone="muted">Timeline: {req.timeline_days} days</Text>
          <Text variant="footnote" tone="muted">Location: {req.preferred_location || 'Any'}</Text>
          <Text variant="footnote" tone="muted" style={{ marginTop: spacing.sm }}>{req.summary}</Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Text variant="heading" style={{ marginBottom: spacing.md }}>Assigned Match Advisor</Text>
          {offers.length === 0 ? (
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text variant="subhead" style={{ fontWeight: '700', color: palette.burgundy }}>
                Search Initialized • £250 Deposit Secured
              </Text>
              <Text variant="footnote" tone="muted" style={{ marginTop: 4 }}>
                Your Match Advisor is being assigned. Flat fee of £500 total (£250 paid now, £250 payable after spouse is found).
              </Text>
            </View>
          ) : (
            offers.map(offer => (
              <View
                key={offer.id}
                style={[styles.offerCard, { backgroundColor: c.surface, borderColor: c.border }, !isDark ? shadow.card : undefined] as any}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: palette.burgundy,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text variant="subhead" style={{ color: palette.cream, fontWeight: '800', fontSize: 18 }}>
                      {(offer.advisor_name || 'M').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="subhead" style={{ fontWeight: '700', fontSize: 16 }}>
                      {offer.advisor_name || 'Your Match Advisor'}
                    </Text>
                    <Text variant="footnote" style={{ color: c.success, fontWeight: '600', marginTop: 2 }}>
                      ✓ £250 Deposit Secured • Active Search
                    </Text>
                  </View>
                </View>

                {/* Flat Fee Representation Breakdown */}
                <View style={{
                  marginTop: spacing.md,
                  padding: spacing.sm,
                  backgroundColor: c.surfaceAlt,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: c.border,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="footnote" tone="muted">Total Flat Fee</Text>
                    <Text variant="footnote" style={{ fontWeight: '700', color: palette.burgundy }}>£500.00</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="footnote" tone="muted">Upfront Deposit</Text>
                    <Text variant="footnote" style={{ fontWeight: '700', color: c.success }}>£250.00 (Paid)</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="footnote" tone="muted">Success Fee</Text>
                    <Text variant="footnote" style={{ fontWeight: '700', color: c.text }}>£250.00 (Due on Partner Found)</Text>
                  </View>
                </View>

                <Button
                  label="Open Advisor Chat"
                  variant="primary"
                  style={{ marginTop: spacing.md }}
                  onPress={() => router.push({
                    pathname: '/advisor-chat/[offerId]',
                    params: {
                      offerId: offer.id,
                      name: offer.advisor_name || 'Match Advisor',
                      photo: offer.advisor_photo_url,
                    },
                  } as any)}
                />
              </View>
            ))
          )}
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {req.status === 'open' && (
             <Button label="Cancel Request" variant="secondary" onPress={handleCancel} />
          )}

        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  card: { padding: spacing.md, borderRadius: radii.card, borderWidth: 1 },
  offerCard: { padding: spacing.md, borderRadius: radii.card, borderWidth: 1, marginBottom: spacing.sm }
});
