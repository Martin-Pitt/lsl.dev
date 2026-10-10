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
WIKI_REF=('id','slug','title','namespace','source','rawPath','sharedWith')
def wiki_ref(w): return {k:w[k] for k in WIKI_REF if k in w} if w else None
def write_split(catalog):
    """Write the catalog in three parts, so the site never loads rendered wiki HTML it does not need.

    src/data/catalog.json        index data: definitions, categories, enums and slim wiki references
    src/data/wiki-html/<slug>.html  rendered archive pages, loaded one at a time by /wiki/[slug]/
    data/derived/api-wiki.json   per-API wiki sections: input for scripts/generate-mdx.py only
    """
    htmldir=ROOT/'src/data/wiki-html'; htmldir.mkdir(parents=True,exist_ok=True)
    wanted=set()
    for w in catalog['wiki']:
        wanted.add(w['slug']+'.html')
        path=htmldir/(w['slug']+'.html'); body=w['html']+'\n'
        if not path.exists() or path.read_bytes()!=body.encode('utf8'): path.write_bytes(body.encode('utf8'))
    for stale in htmldir.glob('*.html'):
        if stale.name not in wanted: stale.unlink()
    api={}
    for plural in ('functions','events','constants'):
        for e in catalog[plural]:
            if e['wiki']: api[e['name']]={'kind':e['kind'],'title':e['wiki']['title'],'sections':e['wiki']['sections']}
    write_json(ROOT/'data/derived/api-wiki.json',api)
    slim=dict(catalog)
    for plural in ('functions','events','constants','types','controls'):
        slim[plural]=[{**e,'wiki':wiki_ref(e['wiki'])} for e in catalog[plural]]
    slim['wiki']=[{**wiki_ref(w),'headings':[{'id':x['id'],'title':x['title']} for x in w['sections']],**({'redirectTo':w['redirectTo']} if 'redirectTo' in w else {})} for w in catalog['wiki']]
    write_json(ROOT/'src/data/catalog.json',slim)
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--wiki',type=Path,default=ROOT/'data/sources/wiki-English.xml')
    parser.add_argument('--supplement',type=Path,action='append',help='extra MediaWiki export merged by title; the newest revision wins (default: data/sources/wiki-supplement-*.xml, sorted)')
    parser.add_argument('--definitions',type=Path,default=ROOT/'data/sources/lsl_definitions.yaml')
    args=parser.parse_args()
    defs=yaml.safe_load(args.definitions.read_text(encoding='utf8'))
    supplements=args.supplement if args.supplement is not None else sorted((ROOT/'data/sources').glob('wiki-supplement-*.xml'))
    pages={}  # exact title (MediaWiki titles are case-sensitive) -> (timestamp, page element, namespaces); insertion order is deterministic
    for source in [args.wiki,*supplements]:
        root=ET.parse(source).getroot(); ns={'m':root.tag.split('}')[0][1:]}
        for p in root.findall('m:page',ns):
            k=p.findtext('m:title',namespaces=ns).replace('_',' ').strip(); ts=p.find('m:revision',ns).findtext('m:timestamp',default='',namespaces=ns)
            # Same rule as the original merge: the newest revision wins; ties keep the earlier source.
            if k not in pages or ts>pages[k][0]: pages[k]=(ts,p,ns)
    records=[]; routes={}; by_title={}
    for _,p,ns in pages.values():
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
    # Deprecated entries that name a replacement: the modern page lists them (search aliases and a
    # note, indexed by search). They get no page or redirect of their own. SLua names
    # (ll.Foo) map to LSL names (llFoo); the YAML values are otherwise used as they are.
    by_name={e['name']:e for plural in ('functions','events','constants') for e in catalog[plural]}
    # A deprecated constant is only an alias of its `use` target when both are used in the same
    # context: a shared member-of group, or groups taken by the same function argument list.
    # (PRIM_MATERIAL_FRICTION is a PRIM_* rule; FRICTION is an llSetPhysicsMaterial mask.)
    def arg_groups(fd): return {v.get(k) for a in fd.get('arguments',[]) for v in a.values() for k in ('enum-semantics','param-semantics','param-get-semantics') if v.get(k)}
    function_groups=[arg_groups(fd) for fd in defs.get('functions',{}).values() if not fd.get('deprecated') and not fd.get('private')]
    def family(name): return '_'.join(name.split('_')[:3])
    def context_problem(oldname,old,newname,new):
        if old.get('private'): return f"{oldname} is private in the YAML (PRIM_MATERIAL_* are PRIM_* rule options; {newname} belongs to another calling context)"
        a=set(old.get('member-of',[])); b=set(new.get('member-of',[]))
        if a&b or any(a&g and b&g for g in function_groups): return None
        if not a and not b and family(oldname)==family(newname): return None  # ungrouped siblings, e.g. GAME_CONTROL_AXIS_*
        return f"different context: {oldname} is in {', '.join(sorted(a)) or 'no group'}, {newname} in {', '.join(sorted(b)) or 'no group'}, and no function takes both"
    catalog['deprecated']=[]; skipped=[]
    for plural,kind in (('functions','function'),('events','event'),('constants','constant')):
        for name,d in defs.get(plural,{}).items():
            dep=d.get('deprecated')
            if not isinstance(dep,dict) or not dep.get('use'): continue
            use=re.sub(r'^ll\.','ll',dep['use'])
            if kind=='constant':
                target=defs.get('constants',{}).get(use,{})
                problem=context_problem(name,d,use,target)
                if problem:
                    skipped.append({'name':name,'use':use,'reason':problem})
                    continue
            found=wiki_for(name)
            catalog['deprecated'].append({'name':name,'kind':kind,'use':use,'wiki':found[0]['slug'] if found else None})
            if use in by_name: by_name[use].setdefault('replaces',[]).append(name)
    for e in by_name.values():
        if 'replaces' in e: e['replaces'].sort(key=str.lower)
    catalog['deprecated'].sort(key=lambda x:x['name'].lower())
    labels=json.loads((ROOT/'data/sources/categories.en.json').read_text(encoding='utf8'))
    cats={}
    for plural in ('functions','events','constants'):
        for entry in catalog[plural]:
            for cat in entry['categories']:
                cats.setdefault(cat,{'id':cat,'label':labels.get(cat,cat.replace('_',' ').title()),'functions':[],'events':[],'constants':[]})[plural].append(entry['name'])
    catalog['categories']=sorted(cats.values(),key=lambda x:x['label'])
    for plural in ('functions','events','constants','types','controls'): catalog[plural].sort(key=lambda x:x['name'].lower())
    catalog['wiki'].sort(key=lambda x:x['title'].lower())
    catalog['meta']={'schemaVersion':1,'sourcePolicy':'Definitions are authoritative for signatures, parameter names and categories. Wiki text remains a historical community source; templates are partially rendered and original wikitext is always available.','sources':{'wiki':{'file':args.wiki.name,'sha256':digest(args.wiki)},'supplements':[{'file':x.name,'sha256':digest(x)} for x in supplements],'definitions':{'file':args.definitions.name,'sha256':digest(args.definitions)}},'counts':{k:len(catalog[k]) for k in ('functions','events','constants','categories','wiki','types','controls')},'wikiLicense':'Creative Commons Attribution-ShareAlike 3.0','wikiLicenseUrl':'https://creativecommons.org/licenses/by-sa/3.0/','definitionsLicense':'MIT','latestWikiRevision':max(w['source']['timestamp'] for w in catalog['wiki'])}
    write_split(catalog)
    report={'counts':catalog['meta']['counts'],'excluded':excluded,'apiWithoutWiki':{k:[e['name'] for e in catalog[k] if not e['wiki']] for k in ('functions','events','constants')},'unexpandedTemplates':sorted(renderer.unknown),'referencedTitlesWithoutLocalRoute':sorted(renderer.missing),'deprecatedAliasesSkipped':skipped}
    write_json(ROOT/'data/reports/import-report.json',report)
    print(json.dumps(report['counts']))
if __name__=='__main__': main()
