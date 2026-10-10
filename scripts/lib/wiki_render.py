"""Conservative offline wikitext renderer. Unknown templates remain inspectable."""
import re, html
from urllib.parse import quote
from .wiki_fields import templates

def anchor(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'section'

class Renderer:
    def __init__(self, routes, sources=None):
        self.routes = routes
        self.sources = sources or {}
        self.unknown = set()
        self.public = set()
        self.api = False  # API pages reference large shared tables instead of inlining them
        self.missing = set()

    def link(self, target, label=None):
        target, _, fragment = target.strip().partition('#')
        key = target.replace('_', ' ').strip().casefold()
        sibling = fragment.replace('_', ' ').strip().casefold()
        if self.api and not target and sibling.startswith('ll') and sibling in self.routes:
            # On single-function pages a sibling variant's section lives on that function's own page.
            target, fragment, key = fragment, '', sibling
        route = '#' if not target and fragment else self.routes.get(key)
        if not route:
            self.missing.add(target)
            route = 'https://wiki.secondlife.com/wiki/' + quote(target.replace(' ', '_'), safe='/:')
        if fragment: route = ('' if route=='#' else route) + '#' + anchor(fragment)
        return '<a href="' + html.escape(route, quote=True) + '">' + html.escape(label or target) + '</a>'

    def inline(self, text, depth):
        # Template arguments are inline; drop the block wrapper of a single rendered line.
        r=self.render(text,depth+1); w='<div class="wiki-line">'
        if r.startswith(w) and r.endswith('</div>') and r.count(w)==1 and '\n' not in r: return r[len(w):-6]
        return r

    def render(self, text, depth=0):
        if depth > 8: return html.escape(text)
        tokens = []
        def token(s):
            tokens.append(s)
            return '\x01' + str(len(tokens)-1) + '\x02'
        def block(s):
            # Block-level HTML must not be wrapped in a wiki-line container.
            tokens.append(s)
            return '\x03' + str(len(tokens)-1) + '\x04'
        def resolve(s):
            for i,value in reversed(list(enumerate(tokens))):
                s=s.replace('\x01'+str(i)+'\x02',value).replace('\x03'+str(i)+'\x04',value)
            return s
        text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
        text = re.sub(r'<(syntaxhighlight|source|pre|nowiki|lsl)\b[^>]*>(.*?)</\1\s*>', lambda m: token('<pre><code>'+html.escape(m[2].strip('\n'))+'</code></pre>') if m[1].lower() != 'nowiki' else token(html.escape(m[2])), text, flags=re.I|re.S)
        nodes = templates(text)
        outer = [n for n in nodes if not any(p['start'] < n['start'] and p['end'] >= n['end'] for p in nodes)]
        for n in sorted(outer, key=lambda n:n['start'], reverse=True):
            name=n['name']; args=[p[2].strip() for p in n['parts'][1:]]
            if name.lower() in ('lslp','lslpt','lsl param','mono','code','hovertext') and args:
                label=args[1] if name.lower() in ('lslpt','lsl param') and len(args)>1 and args[1] else args[0]
                rendered='<code>'+html.escape(label)+'</code>'
            elif name.lower()=='lsl constants/primitiveparams' and args and args[0] in ('set','get'):
                source=self.sources.get('template:lsl constants/primitiveparams')
                branches=[b for b in templates(source[1]) if b['name'].startswith('#ifeq:{{{1|') and len(b['parts'])>2 and b['parts'][1][2].strip()==args[0]] if source else []
                if branches and self.api:
                    rendered='<p>The '+html.escape(args[0])+' rules table is shared by several functions and is not repeated here. See '+self.link(source[0]['title'])+' in the wiki archive.</p>'
                elif branches:
                    branch=max(branches,key=lambda b:b['end']-b['start'])
                    body=branch['parts'][2][2]
                    body=body.replace('{{{1|}}}',args[0])
                    rendered='<p>Archived '+html.escape(args[0])+' parameter table from '+self.link(source[0]['title'])+'. Variable-based or conditional cells retain their original syntax.</p>'+self.render(body,depth+1)
                else:
                    rendered=self.link('Template:'+name)+': <code>'+html.escape(text[n['start']:n['end']])+'</code>'
            elif name.lower() in ('lsl tip','lsl warning','lsl note') and args:
                rendered='<aside class="wiki-note">'+self.render(args[0],depth+1)+'</aside>'
            elif name.lower() in ('lsl constrow','lsl consttb') and args:
                rendered='<div class="wiki-constant-row">'+self.link(args[0])+''.join('<span> '+self.inline(a,depth)+'</span>' for a in args[1:] if a)+'</div>'
            elif name.lower() in ('lslg','lslgc') and args:
                rendered=self.link(('Category:LSL ' if name.lower()=='lslgc' else '')+args[0],args[1] if len(args)>1 and args[1] else args[0])
            elif name.lower()=='wikipedia' and args:
                rendered='<a href="https://en.wikipedia.org/wiki/'+quote(args[0].replace(' ','_'),safe='')+'" rel="noreferrer">'+html.escape(args[1] if len(args)>1 and '=' not in args[1] else args[0])+'</a>'
            elif name.lower()=='lsl const' and args:
                rendered=self.link(args[0],args[3] if len(args)>3 and '=' not in args[3] else args[0])
            elif name.lower()=='hoverlink' and args:
                rendered=self.link(args[0],args[2] if len(args)>2 else args[0])
            elif name.lower() in ('lsl definerow','lsl define row'):
                rendered='<div class="wiki-related-row">'+ ' — '.join(self.inline(a,depth) for a in args if a)+'</div>'
            elif name.lower().startswith('#vardefine:'):
                rendered=''  # defines a wiki variable; produces no output in MediaWiki either
            elif name.startswith('#'):
                self.unknown.add(name.split(':')[0])
                rendered='<span class="wiki-template"><code>'+html.escape(text[n['start']:n['end']])+'</code></span>'
            elif name.lower()=='jira' and args:
                rendered='<a href="https://jira.secondlife.com/browse/'+quote(args[0],safe='-')+'" rel="noreferrer">'+html.escape(args[0])+'</a>'
            elif name.lower()=='anchor' and args:
                rendered=''.join('<span id="'+anchor(a)+'"></span>' for a in args if a and '=' not in a)
            elif name.lower() in ('!','!!','='):
                rendered=html.escape('|' if name=='!' else '||' if name=='!!' else name)
            else:
                self.unknown.add(name)
                rendered='<span class="wiki-template">'+self.link('Template:'+name, name)+': <code>'+html.escape(text[n['start']:n['end']])+'</code></span>'
            text=text[:n['start']]+(rendered if name in ('!','!!') or not rendered else token(rendered))+text[n['end']:]
        text=text.replace('{{{!}}','{|')
        text=re.sub(r'\[\[([^\]\n]+)\]\]',lambda m:token(self.link(m[1].split('|')[0].lstrip(':'),m[1].split('|')[-1] if '|' in m[1] else None)),text)
        text=re.sub(r'\[(https?://[^\s\]]+)(?:\s+([^\]]+))?\]',lambda m:token('<a href="'+html.escape(m[1],quote=True)+'" rel="noreferrer">'+html.escape(m[2] or m[1])+'</a>'),text)
        def table_tag(m):
            name=m[1].lower(); attrs=m[2] or ''
            if m[0].startswith('</'): return block('</'+name+'>')
            out=''
            ident=re.search(r'\bid\s*=\s*["\']?([^"\'\s>]+)',attrs,re.I)
            if ident: out+=' id="'+anchor(html.unescape(ident[1]))+'"'
            for key in ('colspan','rowspan'):
                span=re.search(r'\b'+key+r'\s*=\s*["\']?(\d{1,3})',attrs,re.I)
                if span: out+=' '+key+'="'+span[1]+'"'
            return block('<'+name+out+'>')
        text=re.sub(r'</?(table|caption|thead|tbody|tr|th|td)\b([^>]*)>',table_tag,text,flags=re.I)
        text=re.sub(r'<tt>(.*?)</tt>',lambda m:token('<code>')+m[1]+token('</code>'),text,flags=re.I|re.S)
        # Allow only explicitly named formatting tags, and never their attributes.
        text=re.sub(r'</?(?:code|b|strong|i|em|sup|sub|br|hr)\s*/?>',lambda m:token(m[0].lower()),text,flags=re.I)
        text=html.escape(text,quote=False)
        # Character references in wikitext are content, not markup; keep them as references.
        text=re.sub(r'&amp;(#\d{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,30});',lambda m:'&'+m[1]+';' if m[1].startswith('#') or html.unescape('&'+m[1]+';')!='&'+m[1]+';' else m[0],text)
        text=re.sub(r"'''(.*?)'''",r'<strong>\1</strong>',text)
        text=re.sub(r"''(.*?)''",r'<em>\1</em>',text)
        lines=[]; listing=False; frames=[]
        def flush_row(frame):
            if frame['cells']:
                frame['rows'].append('<tr>'+''.join('<'+tag+attrs+'>'+value+'</'+tag+'>' for tag,attrs,value in frame['cells'])+'</tr>')
                frame['cells'].clear()
        def close_table():
            frame=frames.pop(); flush_row(frame)
            result='<table>'+''.join(frame['rows'])+'</table>'
            if frames:
                # A nested wiki table belongs inside the enclosing table's current cell.
                parent=frames[-1]['cells']
                if not parent: parent.append(['td','',''])
                parent[-1][2]+=result
            else: lines.append(result)
        def cell_attrs(spec):
            return ''.join(' '+k+'="'+m[1]+'"' for k in ('colspan','rowspan') for m in [re.search(r'\b'+k+r'\s*=\s*"?(\d{1,3})',spec,re.I)] if m)
        for line in text.splitlines():
            heading=re.match(r'^(={1,6})\s*(.*?)\s*\1\s*$',line)
            item=re.match(r'^[*#]+\s*(.*)',line)
            if listing and not item: lines.append('</ul>'); listing=False
            if heading:
                level=min(6,max(2,len(heading[1])))
                plain=re.sub(r'<[^>]+>','',resolve(heading[2]))
                lines.append(f'<h{level} id="{anchor(html.unescape(plain))}">{heading[2]}</h{level}>')
            elif item:
                if not listing: lines.append('<ul>'); listing=True
                lines.append('<li>'+item[1]+'</li>')
            elif line.startswith('{|'):
                frames.append({'rows':[],'cells':[]})
            elif frames and line.startswith('|}'): close_table()
            elif frames and line.startswith('|-'): flush_row(frames[-1])
            elif frames and line.startswith('|+'): frames[-1]['rows'].append('<caption>'+line[2:]+'</caption>')
            elif frames and line.startswith(('|','!')):
                tag='th' if line[0]=='!' else 'td'
                for cell in re.split(r'\|\||!!',line[1:]):
                    spec,sep,value=cell.partition('|')
                    frames[-1]['cells'].append([tag,cell_attrs(spec),value] if sep else [tag,'',cell])
            elif frames and line.strip() and frames[-1]['cells']: frames[-1]['cells'][-1][2]+=' '+line
            elif '\x03' in line: lines.append(line)
            elif line.strip(): lines.append('<div class="wiki-line">'+line+'</div>')
        if listing: lines.append('</ul>')
        while frames: close_table()
        result='\n'.join(lines)
        return resolve(result)

SECTION_FIELDS = {'summary':'Overview','head':'Function variants','func_desc':'Wiki description','func_footnote':'Function notes','func_footer':'Function guidance','event_footnote':'Event notes','const_footnote':'Constant notes','event_desc':'Wiki description','const_desc':'Wiki description','return_text':'Return value notes','spec':'Specification','constants':'Related constants','caveats':'Caveats','examples':'Examples','helpers':'Helper functions','notes':'Notes','also_functions':'See also: functions','also_events':'See also: events','also_articles':'See also: articles','also_tests':'Tests','comments':'Comments','history':'History','issues':'Known issues'}

def tname(name):
    return name.replace('_',' ').strip()

def head_funcs(text):
    # Function names documented by LSL Function/Head blocks of a wiki page.
    return [h['fields'].get('func',{}).get('value','').strip() for h in templates(text) if tname(h['name'])=='LSL Function/Head' and h['fields'].get('func',{}).get('value','').strip()]

def page_sections(text, renderer, depth=0, variant=None):
    candidates=[n for n in templates(text) if tname(n['name']) in ('LSL Function','LSL Function/Head','LSL Function/Headless','LSL Event','LSL Constant')]
    if not candidates:
        # Some wiki API pages explicitly transclude the common variants article.
        if depth<2:
            for node in templates(text):
                if node['name'].startswith(':'):
                    target=node['name'][1:].replace('_',' ').casefold()
                    source=renderer.sources.get(target)
                    if source and source[0]['namespace']==0:
                        sections=page_sections(source[1],renderer,depth+1,variant)
                        if sections:
                            note={'id':'shared-article','title':'Shared wiki article','html':'<p>This page transcludes '+renderer.link(source[0]['title'])+'. The following text is from that archived revision.</p>'}
                            return [note]+sections
        return []
    node=max(candidates,key=lambda n:n['end']-n['start'])
    sections=[]; siblings=[]
    for field,title in SECTION_FIELDS.items():
        value=node['fields'].get(field,{}).get('value','').strip()
        if value:
            if field=='head':
                sub=[]
                heads=[h for h in templates(value) if tname(h['name'])=='LSL Function/Head']
                own=[h for h in heads if variant and h['fields'].get('func',{}).get('value','').strip().casefold()==variant.casefold()]
                for head in heads:
                    name=head['fields'].get('func',{}).get('value','Function variant').strip()
                    if own and head not in own:
                        siblings.append(name); continue
                    parts=page_sections(value[head['start']:head['end']],renderer,depth+1)
                    if own:
                        # Single-function page: the function's own block, without a variant heading.
                        sub.append(''.join('<h3 id="'+x['id']+'">'+x['title']+'</h3>'+x['html'] for x in parts))
                    else:
                        sub.append('<h3 id="'+anchor(name)+'">'+html.escape(name)+'</h3>'+''.join('<h4>'+x['title']+'</h4>'+x['html'] for x in parts))
                rendered=''.join(sub) or renderer.render(value)
                if own: title='Function details'
            else: rendered=renderer.render(value)
            sections.append({'id':anchor(title),'title':title,'html':rendered})
    injections=[v['value'] for k,v in node['fields'].items() if k.startswith('inject') and v.get('value')]
    if injections:
        helpers=[]; seen=set()
        for injection in injections:
            for helper in templates(injection):
                target=('Template:'+helper['name']).replace('_',' ').casefold()
                if target in seen: continue
                seen.add(target)
                source=renderer.sources.get(target)
                label=source[0]['title'] if source else 'Template:'+helper['name']
                issue=re.match(r'Issues/([A-Za-z]+-\d+)$',tname(helper['name']))
                content='<p'+(' id="'+anchor(issue[1])+'"' if issue else '')+'>'+renderer.link(label)+'</p>'
                if source:
                    content+='<details><summary>Original shared helper source (conditional wiki logic is not evaluated)</summary><pre><code>'+html.escape(source[1])+'</code></pre></details>'
                helpers.append(content)
        sections.append({'id':'shared-wiki-helpers','title':'Shared wiki helpers','html':'<p>The original page also injects shared parameter notes, caveats or issue information through these helpers. Their conditional MediaWiki logic is not reproduced here; inspect the preserved helper source for additional material.</p>'+''.join(helpers)})
    remainder=text[:node['start']]+text[node['end']:]
    if remainder.strip(): sections.append({'id':'additional','title':'Additional wiki content','html':renderer.render(remainder)})
    if siblings:
        public=[n for n in dict.fromkeys(siblings) if n.casefold() in renderer.public]
        if public:
            sections.append({'id':'related-variants','title':'Related functions','html':'<p>The original wiki page documents these functions together with this one:</p><ul>'+''.join('<li>'+renderer.link(n)+'</li>' for n in public)+'</ul>'})
    # Standard anchors generated by the wiki's LSL templates, so archived #fragment links still land.
    aliases={'helper-functions':'useful-snippets','see-also-functions':'see-also','see-also-events':'see-also','see-also-articles':'see-also','related-constants':'constants'}
    ids=set(re.findall(r'\sid="([^"]+)"',''.join(x['html'] for x in sections)))|{x['id'] for x in sections}
    for x in sections:
        alias=aliases.get(x['id'])
        if alias and alias not in ids:
            x['html']='<span id="'+alias+'"></span>'+x['html']; ids.add(alias)
    return sections
