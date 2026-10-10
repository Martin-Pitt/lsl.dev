#!/usr/bin/env python3
"""Build the complete local catalog without network access. Requires PyYAML."""
import argparse, hashlib, json, re, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote
import yaml
from lib.wiki_render import Renderer, page_sections, anchor, head_funcs

ROOT=Path(__file__).resolve().parents[1]
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def write_json(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def slug(title):
    stem=re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')[:100] or 'page'
    return stem+'-'+hashlib.sha256(title.encode()).hexdigest()[:8]
def key(title): return title.replace('_',' ').strip().casefold()
def section_html(sections): return '\n'.join('<section><h2 id="'+s['id']+'">'+s['title']+'</h2>'+s['html']+'</section>' for s in sections)
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--wiki',type=Path,default=ROOT/'data/sources/wiki-English.xml')
    parser.add_argument('--definitions',type=Path,default=ROOT/'data/sources/lsl_definitions.yaml')
    args=parser.parse_args()
    defs=yaml.safe_load(args.definitions.read_text(encoding='utf8'))
    root=ET.parse(args.wiki).getroot(); ns={'m':root.tag.split('}')[0][1:]}
    records=[]; routes={}; by_title={}
    for p in root.findall('m:page',ns):
        title=p.findtext('m:title',namespaces=ns); rev=p.find('m:revision',ns)
        get=lambda name:rev.findtext('m:'+name,default='',namespaces=ns)
        s=slug(title)
        record={'id':p.findtext('m:id',namespaces=ns),'slug':s,'title':title,'namespace':int(p.findtext('m:ns',default='0',namespaces=ns)), 'html':'','sections':[], 'source':{'title':title,'url':'https://wiki.secondlife.com/wiki/'+quote(title.replace(' ','_'),safe='/:'),'revisionId':get('id'),'timestamp':get('timestamp'),'contributor':rev.findtext('m:contributor/m:username',default=rev.findtext('m:contributor/m:ip',default='',namespaces=ns),namespaces=ns)},'rawPath':'/wiki-source/'+s+'.txt'}
        record['source']['revisionUrl']=record['source']['url']+'?oldid='+get('id')
        record['source']['historyUrl']=record['source']['url']+'?action=history'
        text=get('text'); records.append((record,text)); by_title[key(title)]=(record,text)
        routes[title.replace('_',' ').casefold()]='/wiki/'+s+'/'
    catalog={'meta':{},'functions':[],'events':[],'constants':[],'categories':[],'wiki':[],'types':[],'controls':[],'enums':defs.get('enums',{})}
    excluded={}
    for plural,kind in [('functions','function'),('events','event'),('constants','constant'),('types','type'),('controls','control')]:
        excluded[plural]=[]
        for name,d in defs.get(plural,{}).items():
            if d.get('deprecated') or d.get('private'):
                excluded[plural].append(name); continue
            params=[dict(name=n,type=v.get('type',''),description=v.get('tooltip',''),**{k:x for k,x in v.items() if k not in ('type','tooltip')}) for arg in d.get('arguments',[]) for n,v in arg.items()]
            ret=d.get('return','void'); typ=d.get('type','')
            signature=(ret+' ' if kind=='function' and ret!='void' else '')+name+'('+', '.join(p['type']+' '+p['name'] for p in params)+')' if kind in ('function','event') else (typ+' '+name+' = '+str(d.get('value','')) if kind=='constant' else name)
            entry={'name':name,'kind':kind,'slug':name,'description':d.get('tooltip','').replace('\\n','\n'),'signature':signature,'returnType':ret,'parameters':params,'categories':d.get('categories',[]),'definition':d,'wiki':None}
            if kind=='constant': entry.update(type=typ,value=d.get('value'),groups=d.get('member-of',[]))
            catalog[plural].append(entry)
            if kind in ('function','event','constant'): routes[name.replace('_',' ').casefold()]='/'+plural+'/'+name+'/'
    renderer=Renderer(routes,{r['title'].replace('_',' ').casefold():(r,t) for r,t in records})
    renderer.public={e['name'].casefold() for k in ('functions','events','constants') for e in catalog[k]}
    # Pages that document a function only as an LSL Function/Head variant of another article.
    hosts={}
    for record,text in records:
        if record['namespace']==0:
            for func in head_funcs(text): hosts.setdefault(key(func),(record,text))
    def wiki_for(name):
        found=by_title.get(key(name))
        if found:
            redirect=re.match(r'\s*#redirect\s*\[\[([^\]#|]+)',found[1],re.I)
            # A bare redirect carries no content; use the article it points to.
            if redirect and not re.sub(r'\s*#redirect\s*\[\[[^\]]*\]\]','',found[1],count=1,flags=re.I).strip():
                found=by_title.get(key(redirect[1]),found)
        return found or hosts.get(key(name))
    rawdir=ROOT/'public/wiki-source'; rawdir.mkdir(parents=True,exist_ok=True)
    for record,text in records:
        record['sections']=page_sections(text,renderer)
        record['html']=section_html(record['sections']) if record['sections'] else renderer.render(text)
        redirect=re.match(r'\s*#redirect\s*\[\[([^\]]+)\]\]',text,re.I)
        if redirect:
            target,_,fragment=redirect[1].partition('#')
            route=routes.get(target.replace('_',' ').casefold())
            if route: record['redirectTo']=route+('#'+anchor(fragment) if fragment else '')
        (rawdir/(record['slug']+'.txt')).write_text(text,encoding='utf8')
        catalog['wiki'].append(record)
    def family(record,text):
        # Entries share a family when they use the same host article, directly or by transclusion.
        shared=re.search(r'\{\{:([^|}]+)',re.sub(r'\s*#redirect\s*\[\[[^\]]*\]\]','',text,count=1,flags=re.I))
        if shared and not re.sub(r'\{\{:[^}]*\}\}','',re.sub(r'\s*#redirect\s*\[\[[^\]]*\]\]','',text,count=1,flags=re.I)).strip(): return key(shared[1])
        return key(record['title'])
    families={}
    for plural in ('functions','events'):
        for entry in catalog[plural]:
            found=wiki_for(entry['name'])
            if found: families.setdefault(family(*found),[]).append(entry['name'])
    renderer.api=True
    deprecated_hrefs={routes[key(n)] for n,d in defs.get('functions',{}).items() if d.get('deprecated') and key(n) in routes}
    def drop_deprecated(fragment):
        # See-also rows whose only links point at deprecated functions are omitted from API pages.
        def keep(m):
            hrefs=set(re.findall(r'href="([^"#]+)',m[0]))
            return '' if hrefs and hrefs<=deprecated_hrefs else m[0]
        return re.sub(r'<div class="wiki-related-row">.*?</div>|<li>.*?</li>',keep,fragment,flags=re.S)
    for plural in ('functions','events','constants'):
        for entry in catalog[plural]:
            found=wiki_for(entry['name'])
            if not found: continue
            record,text=found
            sections=page_sections(text,renderer,variant=entry['name'])
            for x in sections:
                if x['id'].startswith('see-also'): x['html']=drop_deprecated(x['html'])
            listed={m.casefold() for x in sections if x['id']=='related-variants' for m in re.findall(r'>([^<>]+)</a></li>',x['html'])}
            extra=[n for n in families.get(family(record,text),[]) if n!=entry['name'] and n.casefold() not in listed] if plural!='constants' else []
            if extra:
                items=''.join('<li>'+renderer.link(n)+'</li>' for n in extra)
                current=next((x for x in sections if x['id']=='related-variants'),None)
                if current: current['html']=current['html'].replace('</ul>',items+'</ul>')
                else: sections.append({'id':'related-variants','title':'Related functions','html':'<p>These functions are documented by the same wiki article as this one:</p><ul>'+items+'</ul>'})
            wiki={k:v for k,v in record.items() if k!='redirectTo'}; wiki['sections']=sections
            wiki['html']=section_html(sections) if sections else renderer.render(text)
            if key(record['title'])!=key(entry['name']): wiki['sharedWith']=record['title']
            entry['wiki']=wiki
    for plural in ('types','controls'):
        for entry in catalog[plural]:
            found=by_title.get(key(entry['name']))
            entry['wiki']=found[0] if found else None
    labels=json.loads((ROOT/'data/sources/categories.en.json').read_text(encoding='utf8'))
    cats={}
    for plural in ('functions','events','constants'):
        for entry in catalog[plural]:
            for cat in entry['categories']:
                cats.setdefault(cat,{'id':cat,'label':labels.get(cat,cat.replace('_',' ').title()),'functions':[],'events':[],'constants':[]})[plural].append(entry['name'])
    catalog['categories']=sorted(cats.values(),key=lambda x:x['label'])
    for plural in ('functions','events','constants','types','controls'): catalog[plural].sort(key=lambda x:x['name'].lower())
    catalog['wiki'].sort(key=lambda x:x['title'].lower())
    catalog['meta']={'schemaVersion':1,'sourcePolicy':'Definitions are authoritative for signatures, parameter names and categories. Wiki text remains a historical community source; templates are partially rendered and original wikitext is always available.','sources':{'wiki':{'file':args.wiki.name,'sha256':digest(args.wiki)},'definitions':{'file':args.definitions.name,'sha256':digest(args.definitions)}},'counts':{k:len(catalog[k]) for k in ('functions','events','constants','categories','wiki','types','controls')},'wikiLicense':'Creative Commons Attribution-ShareAlike 3.0','wikiLicenseUrl':'https://creativecommons.org/licenses/by-sa/3.0/','definitionsLicense':'MIT','latestWikiRevision':max(w['source']['timestamp'] for w in catalog['wiki'])}
    write_json(ROOT/'src/data/catalog.json',catalog)
    report={'counts':catalog['meta']['counts'],'excluded':excluded,'apiWithoutWiki':{k:[e['name'] for e in catalog[k] if not e['wiki']] for k in ('functions','events','constants')},'unexpandedTemplates':sorted(renderer.unknown),'referencedTitlesWithoutLocalRoute':sorted(renderer.missing)}
    write_json(ROOT/'data/reports/import-report.json',report)
    print(json.dumps(report['counts']))
if __name__=='__main__': main()
