"""Check the built sidebar: nested groups with an overview link render as split controls, top-level
groups keep Starlight's markup (docs/sidebar.md). Run after `npm run build`."""
from pathlib import Path
import re,sys
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'dist'
errors=[]
def check(cond,msg):
 if not cond:errors.append(msg)
def sidebar(page):
 html=(root/page.strip('/')/'index.html').read_text(encoding='utf-8')
 m=re.search(r'<sl-sidebar-state-persist.*?</sl-sidebar-state-persist>',html,re.S)
 assert m,f'{page}: no sidebar';return m.group(0)
def split(html,label):
 m=re.search(r'<li class="split-group[^"]*">\s*<div class="split-row[^"]*">\s*(<a [^>]*>)\s*<span[^>]*>'+re.escape(label)+r'</span>.*?</a>\s*(<button [^>]*>).*?</button>\s*</div>\s*(<details [^>]*>)',html,re.S)
 return m and m.groups()
def attr(tag,name):
 m=re.search(r'\s'+name+r'="([^"]*)"',tag);return m and m.group(1)
s=sidebar('/features/combat/')
# Top level: Starlight's large summary labels, no split rows.
for label in ['Fundamentals','Reference','Features']:
 check(re.search(r'<summary[^>]*>\s*<span class="group-label[^"]*">\s*<span class="large[^"]*">'+label+'</span>',s),f'top-level group {label} lost its heading markup')
check(not re.search(r'<li class="split-group[^"]*">\s*<div class="split-row[^"]*">\s*<a [^>]*class="large',s),'a top-level entry rendered as split')
# Split groups.
for label,href in [('Combat','/features/combat/'),('Categories','/categories/'),('Constants','/constants/'),('Types','/types/'),('Flow control','/controls/')]:
 g=split(s,label)
 check(g,f'{label} is not a split group')
 if not g:continue
 a,b,d=g
 check(attr(a,'href')==href,f'{label} label links to {attr(a,"href")}, expected {href}')
 check(attr(b,'type')=='button' and attr(b,'aria-controls')==attr(d,'id') and attr(b,'aria-controls'),f'{label} toggle aria-controls does not match its details')
 check(attr(b,'aria-expanded') in ('true','false') and re.match(r'(Expand|Collapse) '+re.escape(label)+'$',attr(b,'aria-label') or ''),f'{label} toggle lacks aria-expanded or name')
# Current overview page: label current, group open, no Overview child.
a,b,d=split(s,'Combat')
check(attr(a,'aria-current')=='page' and attr(b,'aria-expanded')=='true' and re.search(r'\sopen[\s>]',d),'Combat is not current and open on its overview page')
ref=s[s.index('>Reference</span>'):s.index('>Features</span>')]
for href in ['/features/combat/','/categories/','/constants/','/types/','/controls/']:
 check((s if href.startswith('/features/') else ref).count(f'href="{href}"')==1,f'{href} is listed again besides the split label (Overview child not removed)')
# A nested group without an overview link stays a single toggle, not large.
check(re.search(r'<details class="nested-group[^"]*"[^>]*>\s*<summary[^>]*>\s*<span class="group-label[^"]*">\s*<span[^>]*>Animesh</span>',s),'category group Animesh is not a plain nested toggle')
# Deep page: the closest entry (Combat's overview) is current through src/routeData.ts or a sub-page link.
sub=sidebar('/features/combat/combat-log/')
a,b,d=split(sub,'Combat')
check(attr(b,'aria-expanded')=='true' and attr(a,'aria-current') is None,'Combat is not open (or wrongly current) on a sub-page')
if errors:
 print('\n'.join(errors));sys.exit(1)
print('Sidebar OK: top-level groups unchanged, nested overview groups are split controls.')
