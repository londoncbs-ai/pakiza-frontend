import { useCallback, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { errorMessage } from '@/api/client';
import { matchAdvisorsApi } from '@/api/matchAdvisors';
import type { MatchAdvisorProfile, MatchAdvisorRequest } from '@/api/types';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { PressableScale } from '@/components/PressableScale';
import { SkeletonList } from '@/components/Skeleton';
import { Text } from '@/components/Text';
import { palette, radii, shadow, spacing, useTheme } from '@/theme';

export default function MatchAdvisorsDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c, isDark } = useTheme();

  const [advisors, setAdvisors] = useState<MatchAdvisorProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MatchAdvisorRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'case' | 'browse'>('browse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected advisor for dedicated profile viewing
  const [viewingAdvisor, setViewingAdvisor] = useState<MatchAdvisorProfile | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [advList, reqList] = await Promise.all([
        matchAdvisorsApi.listVerifiedAdvisors(),
        matchAdvisorsApi.getMyRequests().catch(() => []),
      ]);
      setAdvisors(advList);
      setMyRequests(reqList);
      if (reqList.some((r) => r.status === 'open' || r.status === 'accepted' || r.status === 'active')) {
        setActiveTab('case');
      }
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBookAdvisor = (advisor: MatchAdvisorProfile) => {
    setViewingAdvisor(null);
    router.push({
      pathname: '/(app)/create-request',
      params: {
        advisorId: advisor.user_id,
        name: advisor.display_name,
      },
    } as any);
  };

  const activeReq =
    myRequests.find((r) => r.status === 'open' || r.status === 'accepted' || r.status === 'active') ||
    myRequests[0] ||
    null;

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + spacing.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="title" tone="accent">Match Advisors</Text>
        <Text variant="footnote" tone="muted">Personal, confidential matchmaking assistance</Text>
      </View>

      {/* Segmented Controller (Visible if user has any requests) */}
      {myRequests.length > 0 && (
        <View style={styles.segmentBar}>
          <Pressable
            onPress={() => setActiveTab('case')}
            style={[
              styles.segmentBtn,
              {
                backgroundColor: activeTab === 'case' ? palette.burgundy : c.surface,
                borderColor: activeTab === 'case' ? palette.burgundy : c.border,
              },
              !isDark && shadow.soft,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {activeReq && activeReq.status !== 'cancelled' && (
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.success }} />
              )}
              <Text
                variant="subhead"
                style={{
                  fontWeight: '700',
                  color: activeTab === 'case' ? palette.cream : c.text,
                }}
              >
                My Active Case
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('browse')}
            style={[
              styles.segmentBtn,
              {
                backgroundColor: activeTab === 'browse' ? palette.burgundy : c.surface,
                borderColor: activeTab === 'browse' ? palette.burgundy : c.border,
              },
              !isDark && shadow.soft,
            ]}
          >
            <Text
              variant="subhead"
              style={{
                fontWeight: '700',
                color: activeTab === 'browse' ? palette.cream : c.text,
              }}
            >
              Browse Advisors ({advisors.length})
            </Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : activeTab === 'case' && activeReq ? (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Active Case Card */}
          <View
            style={[
              styles.caseCard,
              { backgroundColor: c.surface, borderColor: c.border },
              !isDark ? shadow.card : undefined,
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: activeReq.status === 'cancelled' ? palette.sienna : c.success,
                  }}
                />
                <Text
                  variant="label"
                  style={{
                    fontWeight: '800',
                    color: activeReq.status === 'cancelled' ? palette.sienna : c.success,
                    letterSpacing: 0.5,
                  }}
                >
                  {activeReq.status === 'cancelled' ? 'CANCELLED SEARCH' : 'ACTIVE PRIVATE SEARCH'}
                </Text>
              </View>
              <Text variant="footnote" tone="muted">
                #{String(activeReq.id).slice(0, 8).toUpperCase()}
              </Text>
            </View>

            <Text variant="heading" style={{ fontWeight: '800', marginTop: 4, marginBottom: 2 }}>
              {activeReq.request_title || 'Private Matchmaking Search'}
            </Text>
            <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.md }}>
              Confidential search handled by dedicated Match Advisor
            </Text>

            {/* Advisor Strip */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.sm,
                backgroundColor: c.surfaceAlt,
                borderRadius: radii.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              {activeReq.advisor_photo_url ? (
                <Image
                  source={{ uri: activeReq.advisor_photo_url }}
                  style={{ width: 50, height: 50, borderRadius: 25, marginRight: spacing.sm }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: palette.burgundy,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={24} color={palette.cream} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="subhead" style={{ fontWeight: '700' }}>
                    {activeReq.advisor_name || 'Assigned Match Advisor'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color={c.success} />
                </View>
                <Text variant="footnote" tone="accent" style={{ marginTop: 2 }}>
                  Private Matchmaker • £250 Deposit Secured
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {activeReq.selected_offer_id ? (
                <Button
                  label="Message Advisor"
                  variant="primary"
                  style={{ flex: 1 }}
                  onPress={() =>
                    router.push({
                      pathname: '/advisor-chat/[offerId]',
                      params: {
                        offerId: String(activeReq.selected_offer_id),
                        name: activeReq.advisor_name || '',
                        photo: activeReq.advisor_photo_url || '',
                      },
                    } as any)
                  }
                />
              ) : null}
              <Button
                label="Case Details"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/requests/[id]',
                    params: { id: activeReq.id },
                  } as any)
                }
              />
            </View>
          </View>

          {/* Stepper Card */}
          <View
            style={[
              styles.caseCard,
              { backgroundColor: c.surface, borderColor: c.border },
              !isDark ? shadow.soft : undefined,
            ]}
          >
            <Text variant="subhead" style={{ fontWeight: '800', marginBottom: spacing.md }}>
              Search Progress
            </Text>
            <View style={styles.stepperWrap}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: c.success }]}>
                  <Ionicons name="checkmark" size={13} color="#FFF" />
                </View>
                <Text variant="label" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>Deposit</Text>
                <Text variant="footnote" tone="muted" style={{ fontSize: 10 }}>£250 Paid</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: c.success }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: palette.burgundy }]}>
                  <Text variant="label" style={{ color: '#FFF', fontWeight: '800', fontSize: 11 }}>2</Text>
                </View>
                <Text variant="label" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>Consultation</Text>
                <Text variant="footnote" tone="muted" style={{ fontSize: 10 }}>In Progress</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: c.border }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: c.border }]}>
                  <Text variant="label" style={{ color: c.textMuted, fontWeight: '800', fontSize: 11 }}>3</Text>
                </View>
                <Text variant="label" tone="muted" style={{ fontSize: 10, textAlign: 'center' }}>Sourcing</Text>
                <Text variant="footnote" tone="muted" style={{ fontSize: 10 }}>Vetting</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: c.border }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: c.border }]}>
                  <Text variant="label" style={{ color: c.textMuted, fontWeight: '800', fontSize: 11 }}>4</Text>
                </View>
                <Text variant="label" tone="muted" style={{ fontSize: 10, textAlign: 'center' }}>Spouse</Text>
                <Text variant="footnote" tone="muted" style={{ fontSize: 10 }}>£250 Due</Text>
              </View>
            </View>
          </View>

          {/* Criteria & Confidentiality Card */}
          <View
            style={[
              styles.caseCard,
              { backgroundColor: c.surface, borderColor: c.border },
              !isDark ? shadow.soft : undefined,
            ]}
          >
            <Text variant="subhead" style={{ fontWeight: '800', marginBottom: spacing.xs }}>
              Preferences & Criteria
            </Text>
            <Text variant="footnote" tone="muted" style={{ lineHeight: 20, marginBottom: spacing.sm }}>
              {activeReq.partner_preferences || 'Your preferences are active and handled with 100% discretion.'}
            </Text>
            {activeReq.preferred_location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Ionicons name="location-outline" size={15} color={c.accent} />
                <Text variant="footnote" tone="default" style={{ fontWeight: '600' }}>
                  Target Location: {activeReq.preferred_location}
                </Text>
              </View>
            )}
          </View>

          {/* Other Searches if user has more than 1 */}
          {myRequests.length > 1 && (
            <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
              <Text variant="subhead" tone="muted" style={{ fontWeight: '800', fontSize: 11, letterSpacing: 0.8, marginBottom: spacing.xs }}>
                SEARCH HISTORY
              </Text>
              {myRequests
                .filter((r) => r.id !== activeReq.id)
                .map((req) => (
                  <PressableScale
                    key={req.id}
                    onPress={() => router.push({ pathname: '/(app)/requests/[id]', params: { id: req.id } } as any)}
                    style={[styles.activeCard, { backgroundColor: c.surface, borderColor: c.border, marginBottom: 8 }, !isDark && shadow.soft] as any}
                  >
                    <View style={{ flex: 1, marginRight: spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: req.status === 'cancelled' ? palette.sienna : c.success }} />
                        <Text variant="label" tone="accent" style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: 10 }}>
                          {req.status}
                        </Text>
                      </View>
                      <Text variant="subhead" tone="default" numberOfLines={1}>
                        {req.request_title || 'Private Search'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                  </PressableScale>
                ))}
            </View>
          )}

          {/* Browse Directory CTA */}
          <Button
            label="Browse All Advisors Directory"
            variant="ghost"
            style={{ marginTop: spacing.xs }}
            onPress={() => setActiveTab('browse')}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={advisors}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.lg }}>
              {/* Flat Fee Transparency Banner */}
              <View style={[styles.pricingCard, { backgroundColor: palette.burgundy }]}>
                <View style={styles.badgeRow}>
                  <View style={styles.pill}>
                    <Text variant="label" style={styles.pillText}>STANDARD PRICING</Text>
                  </View>
                  <Text variant="callout" style={styles.pricingFigure}>£500 Flat Fee</Text>
                </View>
                <Text variant="heading" style={styles.pricingTitle}>£250 deposit upfront • £250 on success</Text>
                <Text variant="footnote" style={styles.pricingBody}>
                  Select a verified Match Advisor to lead your search. Your profile stays 100% private. The remaining £250 balance is only paid once we find your spouse.
                </Text>
              </View>

              <View style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                <Text variant="heading" tone="default">Verified Match Advisors</Text>
                <Text variant="footnote" tone="muted">Tap an advisor to view their full credentials, bio, and ratings</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => setViewingAdvisor(item)}
              style={[styles.advisorCard, { backgroundColor: c.surface, borderColor: c.border }, !isDark ? shadow.soft : null] as any}
            >
              <View style={styles.advisorTopRow}>
                <View style={styles.avatarWrap}>
                  {item.profile_photo_url ? (
                    <Image source={{ uri: item.profile_photo_url }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: palette.burgundy }]}>
                      <Text variant="heading" style={{ color: palette.cream }}>
                        {item.display_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text variant="subhead" tone="default" style={{ fontWeight: '700' }}>{item.display_name}</Text>
                    <Ionicons name="checkmark-circle" size={16} color={c.success} />
                  </View>
                  <Text variant="footnote" tone="accent" numberOfLines={1} style={{ marginTop: 2 }}>
                    {item.headline || 'Private Matchmaking Specialist'}
                  </Text>
                  
                  {/* Rating + Experience Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {item.reviews_count > 0 ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="star" size={13} color={palette.gold} />
                        <Text variant="label" tone="default" style={{ fontWeight: '700' }}>
                          {item.rating.toFixed(1)}
                        </Text>
                        <Text variant="label" tone="muted">
                          ({item.reviews_count})
                        </Text>
                      </View>
                    ) : (
                      <Text variant="label" tone="accent" style={{ fontWeight: '700' }}>
                        New Advisor
                      </Text>
                    )}
                    <Text variant="label" tone="muted">•</Text>
                    <Text variant="label" tone="muted">
                      {item.city || 'London, UK'}
                    </Text>
                    <Text variant="label" tone="muted">•</Text>
                    <Text variant="label" tone="muted">
                      {item.years_experience || 5}y exp
                    </Text>
                  </View>
                </View>
              </View>

              {item.bio && (
                <Text variant="body" tone="default" numberOfLines={2} style={{ marginTop: spacing.sm, lineHeight: 20 }}>
                  {item.bio}
                </Text>
              )}

              {item.expertise_tags && (
                <View style={styles.tagsRow}>
                  {item.expertise_tags.split(',').slice(0, 3).map((tag) => (
                    <View key={tag.trim()} style={[styles.tag, { backgroundColor: c.surfaceAlt }]}>
                      <Text variant="label" tone="muted">{tag.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.cardFoot, { borderTopColor: c.border }]}>
                <View>
                  <Text variant="label" tone="muted">FLAT FEE</Text>
                  <Text variant="callout" tone="accent" style={{ fontWeight: '700' }}>£500 (£250 dep)</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    label="View Profile"
                    variant="ghost"
                    onPress={() => setViewingAdvisor(item)}
                  />
                  <Button
                    label="Select"
                    variant="primary"
                    onPress={() => handleBookAdvisor(item)}
                  />
                </View>
              </View>
            </PressableScale>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people"
              title="No Advisors Found"
              message="Verified advisors will appear here shortly."
            />
          }
        />
      )}

      {/* ── Detailed Advisor Profile Modal ── */}
      <Modal
        visible={Boolean(viewingAdvisor)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingAdvisor(null)}
      >
        {viewingAdvisor && (
          <View style={[styles.modalRoot, { backgroundColor: c.bg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text variant="subhead" tone="default" style={{ fontWeight: '700' }}>Advisor Profile</Text>
              <PressableScale onPress={() => setViewingAdvisor(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={c.text} />
              </PressableScale>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
              {/* Profile Top Hero */}
              <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                <View style={styles.modalAvatarWrap}>
                  {viewingAdvisor.profile_photo_url ? (
                    <Image source={{ uri: viewingAdvisor.profile_photo_url }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: palette.burgundy }]}>
                      <Text variant="display" style={{ color: palette.cream }}>
                        {viewingAdvisor.display_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm }}>
                  <Text variant="heading" tone="default" style={{ fontWeight: '800' }}>{viewingAdvisor.display_name}</Text>
                  <Ionicons name="checkmark-circle" size={20} color={c.success} />
                </View>

                <Text variant="subhead" tone="accent" style={{ marginTop: 2, textAlign: 'center' }}>
                  {viewingAdvisor.headline || 'Private Matchmaking Specialist'}
                </Text>

                {/* Rating Badge */}
                <View style={[styles.ratingBadge, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                  {viewingAdvisor.reviews_count > 0 ? (
                    <>
                      <Ionicons name="star" size={16} color={palette.gold} />
                      <Text variant="subhead" tone="default" style={{ fontWeight: '800' }}>
                        {viewingAdvisor.rating.toFixed(1)}
                      </Text>
                      <Text variant="footnote" tone="muted">
                        ({viewingAdvisor.reviews_count} verified {viewingAdvisor.reviews_count === 1 ? 'review' : 'reviews'})
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark" size={16} color={palette.burgundy} />
                      <Text variant="subhead" tone="accent" style={{ fontWeight: '800' }}>
                        New Advisor
                      </Text>
                      <Text variant="footnote" tone="muted">
                        (0 verified reviews)
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Key Credentials Strip */}
              <View style={[styles.statsStrip, { backgroundColor: c.surface, borderColor: c.border }, !isDark ? shadow.soft : undefined]}>
                <View style={styles.statCol}>
                  <Text variant="label" tone="muted">LOCATION</Text>
                  <Text variant="subhead" tone="default" style={{ fontWeight: '700', marginTop: 2 }}>
                    {viewingAdvisor.city || 'London, UK'}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text variant="label" tone="muted">EXPERIENCE</Text>
                  <Text variant="subhead" tone="default" style={{ fontWeight: '700', marginTop: 2 }}>
                    {viewingAdvisor.years_experience || 5} Years
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text variant="label" tone="muted">RESPONSE</Text>
                  <Text variant="subhead" tone="default" style={{ fontWeight: '700', marginTop: 2 }}>
                    {viewingAdvisor.response_time_hours || 24} Hours
                  </Text>
                </View>
              </View>

              {/* About & Bio */}
              <View style={{ marginTop: spacing.lg }}>
                <Text variant="heading" tone="default" style={{ marginBottom: spacing.xs }}>About Advisor</Text>
                <Text variant="body" tone="default" style={{ lineHeight: 24 }}>
                  {viewingAdvisor.bio || 'Dedicated Match Advisor committed to facilitating values-aligned, respectful, and confidential introductions.'}
                </Text>
              </View>

              {/* Service Areas & Specialisms */}
              {(viewingAdvisor.service_areas || viewingAdvisor.expertise_tags) && (
                <View style={{ marginTop: spacing.lg }}>
                  <Text variant="heading" tone="default" style={{ marginBottom: spacing.xs }}>Specialisms & Coverage</Text>
                  {viewingAdvisor.service_areas && (
                    <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.xs }}>
                      Coverage Areas: {viewingAdvisor.service_areas}
                    </Text>
                  )}
                  {viewingAdvisor.expertise_tags && (
                    <View style={styles.tagsRow}>
                      {viewingAdvisor.expertise_tags.split(',').map((tag) => (
                        <View key={tag.trim()} style={[styles.tag, { backgroundColor: c.surfaceAlt }]}>
                          <Text variant="label" tone="default">{tag.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Transparent Pricing Card */}
              <View style={[styles.pricingCard, { backgroundColor: palette.burgundy, marginTop: spacing.xl }]}>
                <View style={styles.badgeRow}>
                  <Text variant="label" style={styles.pillText}>MATCHMAKING PRICING</Text>
                  <Text variant="callout" style={styles.pricingFigure}>£500 Flat Fee</Text>
                </View>
                <Text variant="heading" style={styles.pricingTitle}>Guaranteed Flat Pricing</Text>
                <Text variant="footnote" style={styles.pricingBody}>
                  • £250 upfront deposit secures your advisor and initiates search.

                  • Remaining £250 is only charged once your spouse / partner is found.

                  • Your profile is 100% private and hidden from public search.
                </Text>
              </View>
            </ScrollView>

            {/* Sticky Bottom CTA */}
            <View style={[styles.modalFoot, { backgroundColor: c.surface, borderTopColor: c.border }]}>
              <View>
                <Text variant="label" tone="muted">DUE TODAY</Text>
                <Text variant="subhead" tone="accent" style={{ fontWeight: '800' }}>£250 Deposit</Text>
              </View>
              <Button
                label={`Book ${viewingAdvisor.display_name.split(' ')[0]}`}
                variant="primary"
                style={{ flex: 1, marginLeft: spacing.md }}
                onPress={() => handleBookAdvisor(viewingAdvisor)}
              />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  pricingCard: {
    padding: spacing.lg,
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  pillText: {
    color: palette.gold,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pricingFigure: {
    color: palette.gold,
    fontWeight: '700',
  },
  pricingTitle: {
    color: palette.cream,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  pricingBody: {
    color: 'rgba(245, 240, 230, 0.88)',
    lineHeight: 20,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  advisorCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  advisorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    padding: 4,
  },
  modalAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalFoot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  caseCard: {
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  stepItem: {
    alignItems: 'center',
    width: 68,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginBottom: 16,
    marginHorizontal: 2,
  },
});
