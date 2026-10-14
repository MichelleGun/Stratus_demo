"""Turn the single-file Vite build into an Artifact page (no html/head/body wrapper)."""
import re, sys
src = open('dist/index.html', encoding='utf-8').read()
head = re.search(r'<head>(.*)</head>', src, re.S).group(1)
body = re.search(r'<body>(.*)</body>', src, re.S).group(1)
head = re.sub(r'<meta[^>]*>\s*', '', head)
head = re.sub(r'<title>.*?</title>\s*', '', head)
top = '''<title>Stratus</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap">
<style>.safe-t-flow{padding-top:0!important}</style>
'''
out = top + body.strip() + '\n' + head.strip() + '\n'
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print(len(out))
