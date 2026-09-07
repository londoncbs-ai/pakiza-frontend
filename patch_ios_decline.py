import re

with open('src/app/advisor-chat/[offerId].tsx', 'r') as f:
    content = f.read()

decline_render = """
    if (item.content === 'ADVISOR_DECLINED_REQUEST') {
      return (
        <View style={{ marginVertical: spacing.md, padding: spacing.md, backgroundColor: palette.sienna + '20', borderRadius: radii.card, alignItems: 'center' }}>
          <Ionicons name="close-circle" size={32} color={palette.sienna} style={{ marginBottom: spacing.xs }} />
          <Text variant="subhead" style={{ color: palette.sienna, fontWeight: '700' }}>Request Declined</Text>
          <Text variant="footnote" style={{ color: c.textMuted, textAlign: 'center', marginTop: 4 }}>
            The advisor is currently unable to take on this case. Your deposit has been flagged for a full refund.
          </Text>
        </View>
      );
    }
"""

content = content.replace("if (item.content === 'USER_CONFIRMED_COMPLETION') {", decline_render + "\n    if (item.content === 'USER_CONFIRMED_COMPLETION') {")

with open('src/app/advisor-chat/[offerId].tsx', 'w') as f:
    f.write(content)
