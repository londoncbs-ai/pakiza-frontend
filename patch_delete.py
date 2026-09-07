import re

with open('src/app/(app)/requests/[id].tsx', 'r') as f:
    content = f.read()

# Remove handleDelete function completely
pattern_delete_fn = r'  const handleDelete = \(\) => \{.*?\};\n\n'
content = re.sub(pattern_delete_fn, '', content, flags=re.DOTALL)

# Remove Delete Permanently button
pattern_delete_btn = r'          <PressableScale onPress=\{handleDelete\}[^>]*>\n            <Text[^>]*>Delete Permanently</Text>\n          </PressableScale>'
content = re.sub(pattern_delete_btn, '', content, flags=re.DOTALL)

with open('src/app/(app)/requests/[id].tsx', 'w') as f:
    f.write(content)

