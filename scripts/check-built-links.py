"""Check generated local routes and raw-source downloads without network access."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,sys
# Optional argument: the build directory to check (default dist/).
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'dist'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.assets=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ['img','script','iframe'] and a.get('src'):self.assets.append(a['src'])
missing={};remote=[];count=0;ids={};fragments=[];archive=[]
# API pages must not send readers to the /wiki/ archive (its templates are only partly rendered).
api_page=lambda page:page.startswith(('/functions/','/events/','/constants/'))
for file in sorted(root.rglob('*.html')):
 count+=1;p=Links();p.feed(file.read_text(encoding='utf-8'))
 page='/'+file.relative_to(root).as_posix();ids[page]=p.ids
 for href in p.links:
  u=urlsplit(href)
  if u.fragment and not u.scheme and not u.netloc and (u.path.startswith('/') or not u.path):
   path=u.path or page
   fragments.append((page,path if path.endswith('.html') else path.rstrip('/')+'/index.html',unquote(u.fragment)))
  if u.scheme or u.netloc or not u.path.startswith('/'):continue
  if api_page(page) and u.path.startswith('/wiki/') and u.path.strip('/')!='wiki':archive.append({'page':page,'href':href})
  target=root/unquote(u.path).lstrip('/')
  if not target.is_file() and not (target/'index.html').is_file():missing.setdefault(href,[]).append(str(file.relative_to(root)))
 for src in p.assets:
  if urlsplit(src).netloc:remote.append({'page':str(file.relative_to(root)),'asset':src})
# Fragment integrity is reported, not enforced: some archived wiki pages link to anchors that never existed.
unresolved={}
for page,path,frag in fragments:
 if path in ids and frag not in ids[path]:unresolved.setdefault(path+'#'+frag,[]).append(page)
api_unresolved={k:v for k,v in unresolved.items() if k.startswith(('/functions/','/events/','/constants/'))}
report={'pages':count,'api_archive_links':archive,'missing_routes':missing,'remote_assets':remote,'fragment_links':len(fragments),'unresolved_fragments':dict(sorted(unresolved.items()))}
path=Path(__file__).resolve().parents[1]/'data/reports/built-links.json';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f'Checked {count} HTML pages: {len(missing)} broken local destinations, {len(remote)} remote assets.')
print(f'Fragment links: {len(fragments)} checked, {sum(map(len,unresolved.values()))} unresolved ({len(unresolved)} distinct, {len(api_unresolved)} on API pages); see data/reports/built-links.json.')
print(f'API pages linking to the /wiki/ archive: {len(archive)}.')
# Deep pages have no sidebar link of their own; src/routeData.ts marks the closest entry current.
import re
samples=['functions/llRezObjectWithParams','functions/llDialog','events/touch_start','constants/REZ_POS','constants/groups/RezParam','categories/chat','wiki']
sidebar_bad=[]
for s_ in samples:
 f=root/s_/'index.html'
 if s_=='wiki':f=next((root/'wiki').glob('*/index.html'),f)
 if not f.is_file():sidebar_bad.append(f'{s_}: not built');continue
 n=len(re.findall(r'<a[^>]*aria-current="(?:page|location)"',f.read_text(encoding='utf-8')))
 if n!=1:sidebar_bad.append(f'{s_}: {n} current sidebar entries')
print(f'Sidebar: {len(samples)-len(sidebar_bad)} of {len(samples)} sample deep pages have exactly one current entry.')
for b in sidebar_bad:print('sidebar',b)
for k,v in list(missing.items())[:30]:print(k,'from',v[0])
for a in archive[:30]:print('archive link',a['href'],'from',a['page'])
if missing or remote or archive or sidebar_bad:sys.exit(1)
