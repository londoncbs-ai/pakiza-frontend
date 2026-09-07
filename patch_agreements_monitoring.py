import re

# 1. Update iOS UI Agreement
with open('src/app/(app)/create-request.tsx', 'r') as f:
    ios_content = f.read()

ios_new = """5. DISPUTE RESOLUTION & MONITORING: In the event of misconduct, ghosting, or disagreement, you may escalate the case to Pakiza Trust & Safety. Pakiza reserves the right to make the final determination on escrow disbursements. For your protection, all chat messages, profile recommendations, and events between you and the Match Advisor are permanently logged, monitored, and may be reviewed by Pakiza Administrators."""
ios_content = re.sub(
    r'5\. DISPUTE RESOLUTION: In the event of misconduct, ghosting, or disagreement, you may escalate the case to Pakiza Trust & Safety\. Pakiza reserves the right to make the final determination on escrow disbursements\.',
    ios_new,
    ios_content
)

with open('src/app/(app)/create-request.tsx', 'w') as f:
    f.write(ios_content)
