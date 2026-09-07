import re

with open('src/app/(app)/create-request.tsx', 'r') as f:
    content = f.read()

# Add agreedToTerms state
content = content.replace("const [privateMode, setPrivateMode] = useState(true);", 
"""const [privateMode, setPrivateMode] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);""")

# Add agreedToTerms check in submit
submit_check = """  const submit = async () => {
    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'You must read and agree to the Match Advisor terms before proceeding.');
      return;
    }"""
content = content.replace("  const submit = async () => {", submit_check)

# Add ToggleRow to UI
ui_patch = """          <View style={{ marginTop: spacing.lg }}>
            <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: c.surfaceAlt, borderRadius: radii.md, borderWidth: 1, borderColor: c.border }}>
              <Text variant="subhead" style={{ fontWeight: '700', marginBottom: spacing.sm }}>Matchmaking Agreement Terms:</Text>
              <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.xs }}>1. The service is a strict flat fee of £500 total.</Text>
              <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.xs }}>2. You are paying a £250 non-refundable deposit today to begin the search.</Text>
              <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.xs }}>3. The final £250 success fee is ONLY payable once the advisor finds a partner you approve of and the case is marked as completed by both parties.</Text>
              <Text variant="footnote" tone="muted">4. You agree not to exchange payments outside of the Pakiza platform.</Text>
              
              <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.md }}>
                <ToggleRow
                  label="I have read and agree to the above terms"
                  value={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  onDark={false}
                />
              </View>
            </View>

            <Button"""
content = content.replace("          <View style={{ marginTop: spacing.lg }}>\n            <Button", ui_patch)

with open('src/app/(app)/create-request.tsx', 'w') as f:
    f.write(content)
