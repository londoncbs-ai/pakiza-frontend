import re

with open('src/app/advisor-chat/[offerId].tsx', 'r') as f:
    content = f.read()

new_ui = """
    if (item.content?.startsWith('PROFILE_RECOMMENDATION|')) {
      const parts = item.content.split('|');
      const profileId = parts[1];
      const profileName = parts[2] || 'a member';
      return (
        <View style={{ marginVertical: spacing.md, padding: spacing.md, backgroundColor: palette.gold + '20', borderRadius: radii.card, borderWidth: 1, borderColor: palette.gold }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
            <Ionicons name="person-circle" size={24} color={palette.gold} />
            <Text variant="subhead" style={{ color: palette.gold, fontWeight: '700' }}>Profile Recommendation</Text>
          </View>
          <Text variant="footnote" style={{ color: c.text, marginBottom: spacing.md, lineHeight: 18 }}>
            Your Match Advisor has hand-picked a potential match for you: <Text style={{ fontWeight: '700' }}>{profileName}</Text>. 
            Review their profile and let your advisor know what you think in the chat!
          </Text>
          <Button label={`View ${profileName}'s Profile`} variant="secondary" onPress={() => router.push({ pathname: '/(app)/profile', params: { id: profileId } } as any)} />
        </View>
      );
    }

    if (item.content?.startsWith('ADVISOR_CREATED_MATCH|')) {
      const parts = item.content.split('|');
      const profileName = parts[2] || 'your match';
      return (
        <View style={{ marginVertical: spacing.md, padding: spacing.md, backgroundColor: c.success + '20', borderRadius: radii.card, alignItems: 'center', borderWidth: 1, borderColor: c.success }}>
          <Ionicons name="heart" size={32} color={c.success} style={{ marginBottom: spacing.xs }} />
          <Text variant="subhead" style={{ color: c.success, fontWeight: '700' }}>It's a Match!</Text>
          <Text variant="footnote" style={{ color: c.text, textAlign: 'center', marginTop: 4, marginBottom: spacing.md }}>
            Your advisor has officially connected you with <Text style={{ fontWeight: '700' }}>{profileName}</Text>. A new private chat channel has been opened in your Messages tab.
          </Text>
          <Button label="Go to Messages" variant="primary" style={{ backgroundColor: c.success }} onPress={() => router.push('/(app)/messages')} />
        </View>
      );
    }

    if (item.content === 'ADVISOR_DECLINED_REQUEST') {
"""

content = content.replace("if (item.content === 'ADVISOR_DECLINED_REQUEST') {", new_ui)

with open('src/app/advisor-chat/[offerId].tsx', 'w') as f:
    f.write(content)
