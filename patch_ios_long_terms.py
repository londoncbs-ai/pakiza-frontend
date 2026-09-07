import re

with open('src/app/(app)/create-request.tsx', 'r') as f:
    content = f.read()

# Replace the short terms with long-form text in a ScrollView
long_terms_ui = """            <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: c.surfaceAlt, borderRadius: radii.md, borderWidth: 1, borderColor: c.border }}>
              <Text variant="subhead" style={{ fontWeight: '700', marginBottom: spacing.sm, color: c.ink }}>Matchmaking Agreement Terms</Text>
              
              <View style={{ height: 150, backgroundColor: c.surface, borderRadius: radii.sm, padding: spacing.sm, borderWidth: 1, borderColor: c.border, marginBottom: spacing.md }}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  <Text variant="footnote" tone="muted" style={{ lineHeight: 18 }}>
                    By engaging a Match Advisor on the Pakiza platform, you agree to the following legally binding terms:{"\n\n"}
                    1. FEE STRUCTURE: You agree to a total flat fee of £500 for matchmaking services. A non-refundable deposit of £250 is required immediately to initiate the search.{"\n\n"}
                    2. SUCCESS FEE: The remaining balance of £250 (the "Success Fee") is securely held in escrow. It will only be released to the Advisor if and when a mutually agreed partner is found, and BOTH you and the Advisor confirm completion of the case within the application.{"\n\n"}
                    3. PLATFORM EXCLUSIVITY: All payments must be processed exclusively through the Pakiza platform. You agree not to solicit, offer, or accept off-platform payments or side-agreements with any Match Advisor. Violating this clause will result in an immediate and permanent ban from the Pakiza network and forfeiture of all escrowed funds.{"\n\n"}
                    4. TIMELINES: The Advisor commits to a standard 30-day active search period. If no suitable match is found, you reserve the right to cancel the search without paying the final £250 Success Fee, though the initial deposit remains non-refundable for time spent.{"\n\n"}
                    5. DISPUTE RESOLUTION: In the event of misconduct, ghosting, or disagreement, you may escalate the case to Pakiza Trust & Safety. Pakiza reserves the right to make the final determination on escrow disbursements.
                  </Text>
                </ScrollView>
              </View>
              
              <View style={{ borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.md }}>
                <ToggleRow
                  label="I have read and agree to the above terms"
                  value={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  onDark={false}
                />
              </View>
            </View>"""

pattern = r'<View style=\{\{ marginBottom: spacing\.md, padding: spacing\.md, backgroundColor: c\.surfaceAlt, borderRadius: radii\.md, borderWidth: 1, borderColor: c\.border \}\}>\n\s*<Text variant="subhead" style=\{\{ fontWeight: \'700\', marginBottom: spacing\.sm \}\}>Matchmaking Agreement Terms:</Text>.*?<ToggleRow\n\s*label="I have read and agree to the above terms"\n\s*value=\{agreedToTerms\}\n\s*onValueChange=\{setAgreedToTerms\}\n\s*onDark=\{false\}\n\s*/>\n\s*</View>\n\s*</View>'

content = re.sub(pattern, long_terms_ui, content, flags=re.DOTALL)

with open('src/app/(app)/create-request.tsx', 'w') as f:
    f.write(content)
