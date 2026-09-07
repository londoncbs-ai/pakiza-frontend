import re

with open('src/app/(app)/create-request.tsx', 'r') as f:
    content = f.read()

# Replace the broken string literals
content = content.replace('{"\\n\\n"}', '{"\\\\n\\\\n"}') # If it were literal
content = re.sub(r'\{"\n\n"\}', r'{"\\n\\n"}', content)

with open('src/app/(app)/create-request.tsx', 'w') as f:
    f.write(content)
