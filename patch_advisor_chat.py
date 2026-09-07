import re

with open('src/app/advisor-chat/[offerId].tsx', 'r') as f:
    content = f.read()

new_logic = """
    if (item.content === 'ADVISOR_REQUESTED_COMPLETION') {
      return (
        <View style={{ marginVertical: spacing.md, padding: spacing.md, backgroundColor: palette.cream, borderRadius: radii.card, borderWidth: 1, borderColor: palette.gold }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
            <Ionicons name="checkmark-circle" size={24} color={palette.gold} />
            <Text variant="heading" style={{ color: palette.gold }}>Partner Found!</Text>
          </View>
          <Text variant="body" style={{ color: palette.burgundy, marginBottom: spacing.md }}>
            Your Match Advisor has marked this case as successful. Please confirm that you are satisfied with the introduction to release the final £250 success fee.
          </Text>
          <Button label="Confirm & Release Funds" variant="primary" style={{ backgroundColor: palette.gold }} onPress={() => {
            Alert.alert('Rate Your Advisor', 'How would you rate your experience?', [
              { text: '5 Stars', onPress: () => handleConfirmComplete(5) },
              { text: '4 Stars', onPress: () => handleConfirmComplete(4) },
              { text: '3 Stars', onPress: () => handleConfirmComplete(3) },
              { text: 'Cancel', style: 'cancel' }
            ]);
          }} />
        </View>
      );
    }

    if (item.content === 'USER_CONFIRMED_COMPLETION') {
      return (
        <View style={{ marginVertical: spacing.md, padding: spacing.md, backgroundColor: c.success + '20', borderRadius: radii.card, alignItems: 'center' }}>
          <Ionicons name="ribbon" size={32} color={c.success} style={{ marginBottom: spacing.xs }} />
          <Text variant="subhead" style={{ color: c.success, fontWeight: '700' }}>Case Completed Successfully</Text>
          <Text variant="footnote" style={{ color: c.textMuted, textAlign: 'center', marginTop: 4 }}>
            Funds released and advisor rated. Thank you for using Pakiza!
          </Text>
        </View>
      );
    }

    if (item.type === 'PROPOSAL' || item.type === ('SYSTEM' as any)) {
"""

pattern = r"if \(item\.type === 'PROPOSAL' \|\| item\.type === \('SYSTEM' as any\)\) \{"
content = content.replace(pattern, new_logic.strip())

new_func = """
  const handleConfirmComplete = async (rating: number) => {
    try {
      if (!offer) return;
      await matchAdvisorsApi.completeOffer(offer.id, rating);
      load();
    } catch (err) {
      Alert.alert('Error', errorMessage(err));
    }
  };

  const renderMessage = ({ item }: { item: MatchAdvisorOfferMessage }) => {
"""

pattern_func = r"const renderMessage = \(\{ item \}: \{ item: MatchAdvisorOfferMessage \}\) => \{"
content = content.replace(pattern_func, new_func.strip())

with open('src/app/advisor-chat/[offerId].tsx', 'w') as f:
    f.write(content)
