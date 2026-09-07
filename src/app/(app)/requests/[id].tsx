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

  const handleDelete = () => {
    Alert.alert('Delete Request', 'Are you sure you want to permanently delete this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await matchAdvisorsApi.deleteRequest(params.id!);
          router.back();
        } catch (err) {
          Alert.alert('Error', errorMessage(err));
        }
      }}
    ]);
  };

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
          <Text variant="heading" style={{ marginBottom: spacing.md }}>Received Offers</Text>
          {offers.length === 0 ? (
            <Text variant="footnote" tone="muted">No offers yet.</Text>
          ) : (
            offers.map(offer => (
              <PressableScale
                key={offer.id}
                onPress={() => router.push({ pathname: '/advisor-chat/[offerId]', params: { offerId: offer.id, name: offer.advisor_name, photo: offer.advisor_photo_url } } as any)}
                style={[styles.offerCard, { backgroundColor: c.surface, borderColor: c.border }, !isDark ? shadow.soft : undefined] as any}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subhead" style={{ fontWeight: '600' }}>{offer.advisor_name || 'Match Advisor'}</Text>
                    <Text variant="footnote" tone="muted">Fee: £{(offer.fee_pence / 100).toFixed(2)} • {offer.timeline_days} days</Text>
                    <Text variant="label" tone="accent" style={{ marginTop: 4, fontWeight: '700' }}>STATUS: {offer.status.toUpperCase()}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
                </View>
              </PressableScale>
            ))
          )}
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {req.status === 'open' && (
             <Button label="Cancel Request" variant="secondary" onPress={handleCancel} />
          )}
          <PressableScale onPress={handleDelete} style={{ padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: palette.sienna, borderRadius: radii.pill }}>
            <Text variant="subhead" style={{ color: palette.sienna, fontWeight: '600' }}>Delete Permanently</Text>
          </PressableScale>
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
