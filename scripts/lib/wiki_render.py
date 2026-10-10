"""Conservative offline wikitext renderer. Unknown templates remain inspectable."""
import re, html
from urllib.parse import quote
from .wiki_fields import templates

# Templates that only contribute table attributes (colours, borders); they produce no visible text.
ATTRIBUTE_TEMPLATES={'prettytable','hl1','hl2','hl3'}
PARAM=re.compile(r'\{\{\{([^{}|]*)(?:\|([^{}]*))?\}\}\}')
HEADING_LINE=re.compile(r'^(=+)([^\n]*?)\1[ \t]*$',re.M)

def template_body(text):
    """The text MediaWiki transcludes from a page: <noinclude> removed, <onlyinclude> honoured."""
    text=re.sub(r'<!--.*?-->','',text,flags=re.S)
    only=re.findall(r'<onlyinclude>(.*?)</onlyinclude>',text,flags=re.S|re.I)
    if only: text=''.join(only)
    text=re.sub(r'<noinclude>.*?(?:</noinclude>|$)','',text,flags=re.S|re.I)
    return re.sub(r'</?includeonly>','',text,flags=re.I)

def substitute(body,params):
    """Replace {{{name|default}}} parameter references; unresolved ones without a default stay literal."""
    while True:
        new=PARAM.sub(lambda m:params[m[1].strip()] if m[1].strip() in params else (m[2] if m[2] is not None else m[0]),body)
        if new==body: return new
        body=new

def conditionals(text):
    """Evaluate {{#if:}} and {{#ifeq:}} whose operands are already plain text, innermost first."""
    for _ in range(50):
        nodes=templates(text)
        # Only the condition operands must be plain text; branches may hold further templates.
        plain=lambda n:'{{' not in n['parts'][0][2] and (not n['name'].lower().startswith('#ifeq:') or (len(n['parts'])>1 and '{{' not in n['parts'][1][2]))
        candidates=[n for n in nodes if n['name'].lower().startswith(('#if:','#ifeq:')) and plain(n)]
        leaves=[n for n in candidates if not any(c is not n and c['start']<=n['start'] and n['end']<=c['end'] for c in candidates)]
        if not leaves: return text
        for n in sorted(leaves,key=lambda n:n['start'],reverse=True):
            head=n['name'].split(':',1)[1].strip(); args=[x[2] for x in n['parts'][1:]]
            if n['name'].lower().startswith('#ifeq:'):
                other=args[0].strip() if args else ''
                branches=args[1:]; truth=head==other
            else:
                branches=args; truth=bool(head)
            pick=(branches[0] if truth else branches[1]) if len(branches)>(0 if truth else 1) else ''
            text=text[:n['start']]+pick.strip()+text[n['end']:]
    return text

def view_body(text):
    """The wikitext MediaWiki shows when the page itself is viewed: <includeonly> blocks removed,
    <onlyinclude>/<noinclude> tags unwrapped (their content is shown on the page)."""
    text=re.sub(r'<includeonly>.*?(?:</includeonly>|$)','',text,flags=re.S|re.I)
    return re.sub(r'</?(?:onlyinclude|noinclude)\s*>','',text,flags=re.I)

def top_level_split(s,sep='='):
    """Split at the first `sep` outside nested {{ }} / [[ ]]; (left, right) or None."""
    depth=0; i=0
    while i<len(s):
        two=s[i:i+2]
        if two in ('{{','[['): depth+=1; i+=2; continue
        if two in ('}}',']]') and depth: depth-=1; i+=2; continue
        if s[i]==sep and not depth: return s[:i],s[i+1:]
        i+=1
    return None

def outside_code(text,fn):
    """Apply fn to the parts of text that are not comments or nowiki/source/pre/lsl code."""
    out=[]; last=0
    for m in re.finditer(r'<!--.*?-->|<(nowiki|source|syntaxhighlight|pre|lsl)\b[^>]*>.*?</\1\s*>',text,flags=re.I|re.S):
        out.append(fn(text[last:m.start()])); out.append(m[0]); last=m.end()
    out.append(fn(text[last:]))
    return ''.join(out)

# Parser functions the evaluator cannot compute offline. They are removed (with a log entry), as
# their output is page logic (counters, string surgery), not prose.
UNEVALUATED_FUNCTIONS={'#ifexpr','#expr','#pos','#rpos','#sub','#len','#replace','#titleparts','#explode','#time','#language','#ln','#widget','#ifexist'}

# Variables the wiki's LSL page templates print as part of a section. Pages and helper templates
# append to them with {{#vardefine:caveats|{{#var:caveats}} ...}}; the template shows the result.
SECTION_VARIABLES=(('caveats','Caveats'),('caveats_set','Caveats'),('caveats_get','Caveats'),('notes','Notes'),('deepnotes','Deep notes'))

# Variables that pages append to ({{#vardefine:caveats|{{#var:caveats}} ...}}); undefined means empty.
ACCUMULATOR=re.compile(r'^(?:caveats|notes|deepnotes|issues|examples|helpers|also_\w+|constants(?:_nb)?|footnotes\w*|hidden[\w-]*|header\w*|spec|caveats-get|caveats-set)(?:[_-](?:get|set))?$')
# Marker of a value the offline renderer cannot know (see Renderer.call); removed or acted on later.
UNRESOLVED=re.compile('\x07[^\x07]*\x07')

# Local templates that hold page content (tables, cheat sheets) rather than template logic; they
# are expanded in place like {{:Page}} transclusions.
CONTENT_TEMPLATES={'lsl animation states','lsl regular expressions','llsitonlinkconstants'}

def anchor(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'section'

# Wiki pages that lsl.dev replaces with a hand-edited page. Links to them (including
# [[Page#Section]]) go to the local page; section anchors use anchor(), so the local
# page's heading ids must match. Value: (route, route used when a fragment is given).
LOCAL_PAGES = {
    'limits': ('/reference/limits/', '/reference/limits/'),
    'viewer uri name space': ('/features/viewer-uris/', '/features/viewer-uris/reference/'),
}

class Renderer:
    def __init__(self, routes, sources=None):
        self.routes = routes
        self.sources = sources or {}
        self.unknown = set()
        self.public = set()
        self.api = False  # API pages reference large shared tables instead of inlining them
        self.missing = set()
        self.transcluded = set()  # titles of local pages expanded in place
        self.vars = {}  # {{#vardefine}} values of the page being rendered
        self.dropped = []  # template logic removed without output on the page being rendered
        self.used = {}  # per-page provenance: casefolded title -> source record of every local page pulled in

    def use(self, record):
        """Note that content from a local wiki page (article or template) went into the current page."""
        self.transcluded.add(record['title'])
        self.used.setdefault(record['title'].replace('_',' ').casefold(), record)

    vars: dict = {}
    dropped: list = []  # (kind, snippet) of template logic removed without output, per page

    def drop(self, kind, snippet):
        snippet=re.sub(r'\s+',' ',snippet).strip()
        if snippet and (kind,snippet[:300]) not in self.dropped: self.dropped.append((kind,snippet[:300]))

    def evaluate(self, text, depth=0):
        """Evaluate MediaWiki parser functions as the page view would, left to right.

        {{#vardefine}}/{{#var}} share one variable table per page (self.vars), so values defined
        in one part of the page (e.g. inside <onlyinclude>) resolve in another. {{#if}}, {{#ifeq}}
        and {{#switch}} pick their branch; unresolved parameters {{{n|default}}} take the default
        (empty without one, as on the page itself). Ordinary templates are kept, with their
        arguments evaluated, for render(). Functions in UNEVALUATED_FUNCTIONS are dropped and logged."""
        if depth>40 or '{{' not in text: return text
        if depth==0:
            text=view_body(text)
            def params(s):
                while True:
                    new=PARAM.sub(lambda m:m[2] if m[2] is not None else '',s)
                    if new==s: return s
                    s=new
            text=outside_code(text,params)
        nodes=templates(text)
        outer=[n for n in nodes if not any(p['start']<n['start'] and p['end']>=n['end'] for p in nodes)]
        out=[]; last=0
        for n in sorted(outer,key=lambda n:n['start']):
            out.append(text[last:n['start']]); out.append(self.call(n,text[n['start']:n['end']],depth)); last=n['end']
        out.append(text[last:])
        return ''.join(out)

    def call(self, n, raw, depth):
        ev=lambda s:self.evaluate(s,depth+1)
        cond=lambda s:UNRESOLVED.sub('',ev(s)).strip()  # an unknown value is empty in a condition
        head=n['parts'][0][2]; args=[p[2] for p in n['parts'][1:]]
        name,colon,first=head.partition(':')
        fn=name.strip().lower()
        if not fn.startswith('#'):
            name=ev(head)
            evaluated=[ev(a) for a in args]
            if name.strip().replace('_',' ').lower()=='lsl const': self.const_vars(evaluated)
            return '{{'+name+''.join('|'+a for a in evaluated)+'}}'
        arg=lambda i:args[i] if len(args)>i else ''
        if fn in ('#vardefine','#vardefineecho'):
            value=ev(arg(0)).strip(); self.vars[ev(first).strip()]=value
            return value if fn=='#vardefineecho' else ''
        if fn=='#var':
            var=cond(first)
            value=self.vars.get(var,'')
            if value: return value
            if len(args): return ev(arg(0)).strip()
            shared=self.global_value(var)
            if shared is not None:
                # Defined once on another local page that the wiki article transcludes (e.g. the
                # PRIM_* pages define the names that llSetPrimitiveParams uses).
                self.vars[var]=ev(shared).strip()
                if self.vars[var]: return self.vars[var]
            # Defined on another wiki page: accumulators start empty, as on the wiki; a missing
            # value (a constant's name or description) is marked, so the sentence it would leave
            # incomplete can be dropped later rather than shown with a hole.
            return '' if ACCUMULATOR.match(var) else '\x07var:'+var+'\x07'
        if fn=='#if':
            return ev(arg(0)).strip() if cond(first) else ev(arg(1)).strip()
        if fn=='#ifeq':
            return ev(arg(1)).strip() if cond(first)==cond(arg(0)) else ev(arg(2)).strip()
        if fn=='#iferror':
            return ev(first).strip()
        if fn=='#switch':
            key=cond(first); fallthrough=False; default=None
            for i,a in enumerate(args):
                split=top_level_split(a)
                if split is None:
                    if i==len(args)-1: default=a; break
                    if cond(a)==key: fallthrough=True
                    continue
                case,value=split
                case=cond(case)
                if fallthrough or case==key: return ev(value).strip()
                if case=='#default': default=value
            return ev(default).strip() if default is not None else ''
        if fn=='#tag' and first.strip().lower()=='ref':
            return '<ref>'+ev(arg(0))+'</ref>'
        self.drop('parser function '+fn,raw)
        return ''

    _global_vars=None

    def global_value(self, var):
        """Raw value of a {{#vardefine}} that exactly one local page defines with one value
        (parameter defaults applied); None when unknown or ambiguous. Accumulators are excluded."""
        if self._global_vars is None:
            table={}
            for _,text in self.sources.values():
                if '#vardefine' not in text: continue
                for n in templates(text):
                    name,_,var_name=n['parts'][0][2].partition(':')  # raw: 'name' turns _ into spaces
                    if name.strip().lower()!='#vardefine' or len(n['parts'])<2: continue
                    key=var_name.strip(); raw=n['parts'][1][2].strip()
                    if not key or ACCUMULATOR.match(key) or '#var:'+key in raw.replace(' ',''): continue
                    while True:
                        new=PARAM.sub(lambda m:m[2] if m[2] is not None else '',raw)
                        if new==raw: break
                        raw=new
                    table[key]=raw if table.get(key,raw)==raw else None
            self._global_vars=table
        return self._global_vars.get(var)

    def const_vars(self, args):
        """{{LSL Const|NAME|type|value|cname|c=comment|hex=..}} also defines variables the
        constant tables read back with {{#var:value}}, {{#var:comment}} and so on."""
        named={}; pos=[]
        for a in args:
            m=re.match(r'\s*([A-Za-z]+)\s*=',a)
            if m: named[m[1]]=a[m.end():].strip()
            else: pos.append(a.strip())
        pos+=['']*(4-len(pos))
        hexv=named.get('hex',''); cvalue=named.get('ihex','') or pos[2]
        for var,value in (('hvalue',hexv),('cvalue',cvalue),('value',hexv or cvalue),('comment',named.get('c','')),('type',pos[1]),('cname',pos[3] or pos[0])):
            self.vars[var]=value
        if pos[0]: self.vars[pos[0]]=hexv or cvalue

    def take_used(self):
        """Return the pages used since the last call, in first-use order, and start a new page."""
        used, self.used = list(self.used.values()), {}
        return used

    def link(self, target, label=None):
        target, _, fragment = target.strip().partition('#')
        key = target.replace('_', ' ').strip().casefold()
        sibling = fragment.replace('_', ' ').strip().casefold()
        if self.api and not target and sibling in self.routes and self.routes[sibling].startswith(('/functions/','/events/','/constants/')):
            # On single-entry pages a sibling's section (a variant function, a constant documented
            # on a shared article) lives on that entry's own page.
            target, fragment, key = fragment, '', sibling
        local = LOCAL_PAGES.get(key)
        route = '#' if not target and fragment else (local[1 if fragment else 0] if local else self.routes.get(key))
        if not route:
            self.missing.add(target)
            route = 'https://wiki.secondlife.com/wiki/' + quote(target.replace(' ', '_'), safe='/:')
        if fragment: route = ('' if route=='#' else route) + '#' + anchor(fragment)
        text = html.escape(label or target)
        text = re.sub(r"'''(.*?)'''", r'<strong>\1</strong>', text); text = re.sub(r"''(.*?)''", r'<em>\1</em>', text)
        return '<a href="' + html.escape(route, quote=True) + '">' + text + '</a>'

    def inline(self, text, depth):
        # Template arguments are inline; drop the block wrapper of a single rendered line.
        r=self.render(text,depth+1); w='<div class="wiki-line">'
        if r.startswith(w) and r.endswith('</div>') and r.count(w)==1 and '\n' not in r: return r[len(w):-6]
        return r

    def transclusion_source(self, name):
        """Local page transcluded by {{:Page}} or a {{LSL Constants ...}} template, following redirects."""
        name=name.strip()
        if name.startswith(':'): key=name[1:].replace('_',' ').strip().casefold()
        elif name.replace('_',' ').casefold().startswith(('lsl constants','lsl constant/','issues/')) or name.replace('_',' ').strip().casefold() in CONTENT_TEMPLATES: key='template:'+name.replace('_',' ').strip().casefold()
        else: return None
        if key=='template:lsl constants/primitiveparams': return None  # shared set/get table, handled separately
        for _ in range(3):
            source=self.sources.get(key)
            if not source: return None
            redirect=re.match(r'\s*#redirect\s*\[\[:?([^\]#|]+)',source[1],re.I)
            if not redirect: return source
            key=redirect[1].replace('_',' ').strip().casefold()
        return None

    def expand(self, text, depth=0):
        """Expand transclusions of local pages, as MediaWiki would, before rendering."""
        if depth > 4: return text
        nodes = templates(text)
        outer = [n for n in nodes if not any(p['start'] < n['start'] and p['end'] >= n['end'] for p in nodes)]
        changed=False
        for n in sorted(outer, key=lambda n:n['start'], reverse=True):
            source=self.transclusion_source(n['name'])
            if not source: continue
            params={}; position=0
            for _,_,value in n['parts'][1:]:
                named=re.match(r'\s*([^=|{}\[\]<>]+?)\s*=',value)
                if named: params[named[1]]=value[named.end():].strip()
                else: position+=1; params[str(position)]=value.strip()
            body=self.expand(substitute(template_body(source[1]),params),depth+1)
            self.use(source[0])
            body=body.strip('\n')
            # A one-line body (a name, a phrase) stays inline; block content starts on its own line.
            inline='\n' not in body.strip() and not re.match(r'\s*(?:\{\||[*#:;=]|\{\{\{!\}\})',body)
            text=text[:n['start']]+(body.strip() if inline else '\n'+body+'\n')+text[n['end']:]; changed=True
        if changed and depth==0:
            # Transcluded pages sit inside a section of the including page; keep their headings below it.
            text=HEADING_LINE.sub(lambda m:'='+m[1]+m[2]+m[1]+'=' if len(m[1])<6 else m[0],text)
        return text

    def variables(self, text):
        """Resolve {{#var:x}} from preceding {{LSL Const}} rows and literal {{#vardefine:x|value}}s."""
        if '#var:' not in text: return text
        defs=[]
        for n in templates(text):
            name=n['name'].strip(); lower=name.lower()
            if lower=='lsl const':
                pos=[p[2].strip() for p in n['parts'][1:] if not re.match(r'\s*[A-Za-z]+\s*=',p[2])]
                pos+=['']*(4-len(pos))
                hexv=n['fields'].get('hex',{}).get('value',''); ihex=n['fields'].get('ihex',{}).get('value','')
                cvalue=ihex or pos[2]
                for var,value in (('hvalue',hexv),('cvalue',cvalue),('value',hexv or cvalue),('comment',n['fields'].get('c',{}).get('value','')),('type',pos[1]),('cname',pos[3] or pos[0])):
                    defs.append((n['start'],var,value))
            elif lower.startswith('#vardefine:') and len(n['parts'])>1 and '{{#' not in n['parts'][1][2]:
                defs.append((n['start'],name.split(':',1)[1].strip(),n['parts'][1][2].strip()))
        def value(m):
            found=[v for start,var,v in defs if var==m[1].strip() and start<m.start()]
            return found[-1] if found else m[0]
        return re.sub(r'\{\{\s*#var:\s*([^{}|]+?)\s*\}\}',value,text)

    def render(self, text, depth=0):
        if depth > 8: return html.escape(text)
        text = self.evaluate(self.expand(text))
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
        # <ref>note</ref> and {{Footnote|note}} become footnotes; the reference list is the converter's job.
        text = re.sub(r'<ref\b[^>/]*>(.*?)</ref\s*>', lambda m: token('<sup class="wiki-footnote">'+self.inline(m[1].strip(),depth)+'</sup>'), text, flags=re.I|re.S)
        text = re.sub(r'<ref\b[^>]*/>|<references\s*/?>', '', text, flags=re.I)
        # Image galleries: the images are not part of this site.
        text = re.sub(r'<gallery\b[^>]*>(.*?)</gallery\s*>', lambda m: self.drop('image gallery', m[0]) or '', text, flags=re.I|re.S)
        nodes = templates(text)
        outer = [n for n in nodes if not any(p['start'] < n['start'] and p['end'] >= n['end'] for p in nodes)]
        for n in sorted(outer, key=lambda n:n['start'], reverse=True):
            name=n['name']; args=[p[2].strip() for p in n['parts'][1:]]
            positional=[a for a in args if not re.match(r'[A-Za-z0-9_ -]+=',a)]
            arg=lambda i:n['fields'][str(i)]['value'] if str(i) in n['fields'] else (positional[i-1] if len(positional)>=i else '')
            lname=name.lower().strip()
            if lname in ('lslp','lslpt','lsl param') and args:
                # A parameter name: the converter writes it in bold.
                label=args[1] if lname in ('lslpt','lsl param') and len(args)>1 and args[1] else args[0]
                rendered='<span class="wiki-param"><code>'+html.escape(label)+'</code></span>'
            elif lname in ('mono','code','lslc code') and args:
                rendered='<code>'+html.escape(args[0])+'</code>'
            elif lname in ('hovertext','hovertextstyle','hoverlink text','nowrap','abbr') and args:
                rendered=self.inline(arg(3) if lname=='hovertext' and arg(3) else arg(1),depth)
            elif lname=='lslc' or lname.startswith('lslc/'):
                rendered=''  # only puts the page into a category
            elif lname=='svn' and arg(1):
                # The SVN browser is gone; the template's own link is struck out as broken.
                f=lambda k:n['fields'].get(k,{}).get('value','')
                rendered=html.escape('SVN:'+arg(1)+(' r'+f('rev') if f('rev') else '')+(' Trunk' if f('trunk') else ' Branch:'+f('branch') if f('branch') else '')+(' '+f('date') if f('date') else ''))
            elif lname=='lsl added' and arg(1):
                remote=n['fields'].get('remote',{}).get('value','')
                where=('<a href="'+html.escape(remote,quote=True)+'" rel="noreferrer">SL '+html.escape(arg(1))+'</a>') if remote else self.link('Release Notes/Second Life Server/'+arg(1)+arg(2),'SL '+arg(1))
                name=n['fields'].get('name',{}).get('value','')
                rendered=(self.inline(name,depth)+' ' if name else '')+'Added in '+where
            elif lname=='footnote' and arg(1):
                rendered='<sup class="wiki-footnote">'+self.inline(arg(1),depth)+'</sup>'
            elif lname=='string':
                rendered='<code>'+html.escape(arg(2)+'"'+arg(1)+'"'+arg(3))+'</code>'
            elif lname in ('keypress','k','keycombo') and args:
                rendered='+'.join('<kbd>'+html.escape(a)+'</kbd>' for a in positional if a) if lname=='keycombo' else '<kbd>'+html.escape(arg(1))+'</kbd>'
            elif lname in ('yes','no'):
                rendered=self.inline(arg(1),depth) if arg(1) else lname.capitalize()
            elif lname in ('em','strong') and arg(1):
                rendered='<'+lname+'>'+self.inline(arg(1),depth)+'</'+lname+'>'
            elif lname in ('u','user','user link') and arg(1):
                rendered=html.escape(n['fields'].get('alt',{}).get('value') or arg(2) or arg(1))
            elif lname=='lsl vr' and args:
                # Code shows plain names: {{LSLPT|s}} inside a vector literal is just s.
                plain=lambda a:re.sub(r'\{\{[^{}|]*\|([^{}|]*)[^{}]*\}\}',r'\1',a)
                rendered='<code>'+html.escape('<'+', '.join(plain(a) for a in positional if a)+'>')+'</code>'
            elif lname in ('kbwarning','kbcaution','kbtip','kbnote','kbimportant') and arg(1):
                rendered='<aside class="wiki-note">'+self.render(arg(1),depth+1)+'</aside>'
            elif lname=='byteshover' and arg(1):
                rendered=html.escape(arg(1)+' '+(arg(2) or 'bytes'))
            elif lname=='historyrow' and (arg(1) or arg(2)):
                rendered=self.inline(' – '.join(x for x in (arg(1),arg(2)) if x)+(': '+' '.join(x for x in (arg(3),arg(4)) if x) if arg(3) or arg(4) else ''),depth)
            elif lname=='quote' and arg(1):
                rendered='<blockquote>'+self.render(arg(1),depth+1)+('<p>— '+self.inline(arg(2),depth)+'</p>' if arg(2) else '')+'</blockquote>'
            elif lname in ('issues','issue/v1','issue/version 1') and arg(1):
                rendered='<a href="https://jira.secondlife.com/browse/'+quote(arg(1),safe='-')+'" rel="noreferrer">'+html.escape(arg(1))+'</a>'+(': '+self.inline(arg(2),depth) if arg(2) else '')
            elif name.lower()=='lsl constants/primitiveparams' and args and args[0] in ('set','get'):
                source=self.sources.get('template:lsl constants/primitiveparams')
                branches=[b for b in templates(source[1]) if b['name'].startswith('#ifeq:{{{1|') and len(b['parts'])>2 and b['parts'][1][2].strip()==args[0]] if source else []
                if branches and self.api:
                    rendered='<p>The '+html.escape(args[0])+' rules table is shared by several functions and is not repeated here. See '+self.link(source[0]['title'])+' in the wiki archive.</p>'
                elif branches:
                    branch=max(branches,key=lambda b:b['end']-b['start'])
                    body=branch['parts'][2][2]
                    body=body.replace('{{{1|}}}',args[0])
                    self.use(source[0])
                    rendered='<p>Archived '+html.escape(args[0])+' parameter table from '+self.link(source[0]['title'])+'. Variable-based or conditional cells retain their original syntax.</p>'+self.render(body,depth+1)
                else:
                    rendered=self.link('Template:'+name)+': <code>'+html.escape(text[n['start']:n['end']])+'</code>'
            elif name.lower() in ATTRIBUTE_TEMPLATES or name.lower()=='pbr':
                rendered=''
            elif name.lower()=='lsl pl' and args:
                label=n['fields'].get('disp',{}).get('value') or next((a for a in args if '=' not in a),'')
                rendered='<code>'+html.escape(label)+'</code>'
            elif name.lower()=='interval':
                # Interval/Text: [gte or (gt, then lte] or lt).
                f=lambda k:n['fields'].get(k,{}).get('value','')
                left='['+f('gte') if f('gte') else '('+f('gt'); right=f('lte')+']' if f('lte') else f('lt')+')'
                rendered=self.inline(left,depth)+',&nbsp;'+self.inline(right,depth)
            elif name.lower()=='interval/footnote':
                rendered=''  # explains interval notation only
            elif name.lower()=='unicode':
                rendered='U+'+html.escape((args[0] if args and args[0] else '0').rjust(4,'0'))
            elif name.lower()=='getset' and len(args)>2:
                mode=args[0]
                pick=args[1] if mode=='get' else args[2] if mode=='set' else args[1]+(args[3] if len(args)>3 else ' / ')+args[2]
                rendered=self.inline(pick,depth)
            elif name.lower()=='lsl hex' and args and (args[0] or len(args)>1):
                rendered='<code>'+html.escape(args[0] or args[1])+'</code>'
            elif name.lower() in ('lsl tip','lsl warning','lsl note') and args:
                rendered='<aside class="wiki-note">'+self.render(args[0],depth+1)+'</aside>'
            elif name.lower() in ('lsl constrow','lsl consttb') and args:
                rendered='<div class="wiki-constant-row">'+self.link(args[0])+''.join('<span> '+self.inline(a,depth)+'</span>' for a in args[1:] if a)+'</div>'
            elif name.lower() in ('lslg','lslgc') and args:
                rendered=self.link(('Category:LSL ' if name.lower()=='lslgc' else '')+args[0],args[1] if len(args)>1 and args[1] else args[0])
            elif name.lower() in ('wikipedia','w') and args:
                rendered='<a href="https://en.wikipedia.org/wiki/'+quote(args[0].replace(' ','_'),safe='')+'" rel="noreferrer">'+(self.inline(args[1],depth) if len(args)>1 and '=' not in args[1] else html.escape(args[0]))+'</a>'
            elif name.lower()=='lsl const' and args:
                rendered=self.link(args[0],args[3] if len(args)>3 and '=' not in args[3] else args[0])
            elif name.lower()=='hoverlink' and args:
                rendered=self.link(args[0],args[2] if len(args)>2 else args[0])
            elif name.lower() in ('lsl definerow','lsl define row'):
                # Cells may be given as 1=/2=/3=; an unknown value leaves its cell out.
                cells=[UNRESOLVED.sub('',arg(i)).strip() for i in range(1,max(4,len(positional)+1))]
                rendered='<div class="wiki-related-row">'+ ' — '.join(self.inline(a,depth) for a in cells if a)+'</div>'
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
        text=re.sub(r'\[\[\s*Category:[^\]\n]*\]\]','',text,flags=re.I)  # page categories: not visible text
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
        text=re.sub(r'(</?)(code|b|strong|i|em|sup|sub|br|hr|s|del|small|u|kbd)(?:\s[^<>]*?)?\s*(/?)>',lambda m:token((m[1]+m[2]+m[3]+'>').lower()),text,flags=re.I)
        # Layout wrappers carry no meaning in our pages; their content stays.
        text=re.sub(r'</?(?:div|span|center|font|big)\b[^>]*>','',text,flags=re.I)
        text=re.sub(r'<br\b[^>]*>',lambda m:token('<br>'),text,flags=re.I)
        text=html.escape(text,quote=False)
        # Character references in wikitext are content, not markup; keep them as references.
        text=re.sub(r'&amp;(#\d{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,30});',lambda m:'&'+m[1]+';' if m[1].startswith('#') or html.unescape('&'+m[1]+';')!='&'+m[1]+';' else m[0],text)
        text=re.sub(r"'''(.*?)'''",r'<strong>\1</strong>',text)
        text=re.sub(r"''(.*?)''",r'<em>\1</em>',text)
        lines=[]; listing=[]; frames=[]  # listing: one entry per open (nested) list
        def close_lists(depth):
            while len(listing)>depth: listing.pop(); lines.append('</li></ul>')
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
            item=re.match(r'^([*#]+)\s*(.*)',line)
            if item: item=(len(item[1]),item[2])
            if frames and frames[-1]['cells'] and (heading or item):
                # Block content transcluded into a table cell stays in that cell.
                cell=frames[-1]['cells'][-1]
                if heading:
                    level=min(6,max(2,len(heading[1])))
                    plain=re.sub(r'<[^>]+>','',resolve(heading[2]))
                    cell[2]+=f'<h{level} id="{anchor(html.unescape(plain))}">{heading[2]}</h{level}>'
                elif cell[2].endswith('</ul>'): cell[2]=cell[2][:-5]+'<li>'+item[1]+'</li></ul>'
                else: cell[2]+='<ul><li>'+item[1]+'</li></ul>'
                continue
            if listing and not item: close_lists(0)
            if heading:
                level=min(6,max(2,len(heading[1])))
                plain=re.sub(r'<[^>]+>','',resolve(heading[2]))
                lines.append(f'<h{level} id="{anchor(html.unescape(plain))}">{heading[2]}</h{level}>')
            elif item:
                # ** and *** nest inside the previous item, as on the wiki.
                if len(listing)>=item[0]:
                    close_lists(item[0]); lines.append('</li><li>'+item[1])
                else:
                    while len(listing)<item[0]: listing.append(1); lines.append('<ul><li>')
                    lines[-1]+=item[1]
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
        close_lists(0)
        while frames: close_table()
        result=resolve('\n'.join(lines))
        # Archive pages show the gap; API pages keep the marker for the generator (lib/wiki_cleanup).
        return result if self.api else UNRESOLVED.sub('',result)

SECTION_FIELDS = {'summary':'Overview','head':'Function variants','func_desc':'Wiki description','func_footnote':'Function notes','func_footer':'Function guidance','event_footnote':'Event notes','const_footnote':'Constant notes','event_desc':'Wiki description','const_desc':'Wiki description','return_text':'Return value notes','spec':'Specification','constants':'Specification','caveats':'Caveats','examples':'Examples','helpers':'Helper functions','notes':'Notes','also_functions':'See also: functions','also_events':'See also: events','also_articles':'See also: articles','also_tests':'Tests','comments':'Comments','history':'History','issues':'Known issues'}

# Descriptive fields that read as the entry's lead prose; API pages show them without a heading.
PROSE_IDS = {'overview','wiki-description','return-value-notes','function-notes','event-notes','constant-notes','function-guidance','function-details'}

# {{LSL Constant}} pages use their own field names; there constants/functions/events are related-entry lists.
CONSTANT_FIELDS = {'desc':'Wiki description','caveats':'Caveats','examples':'Examples','helpers':'Helper functions','notes':'Notes','constants':'See also: constants','functions':'See also: functions','events':'See also: events','articles':'See also: articles','history':'History','issues':'Known issues','deepnotes':'Deep notes'}

def tname(name):
    return name.replace('_',' ').strip()

def head_funcs(text):
    # Function names documented by LSL Function/Head blocks of a wiki page.
    return [h['fields'].get('func',{}).get('value','').strip() for h in templates(text) if tname(h['name'])=='LSL Function/Head' and h['fields'].get('func',{}).get('value','').strip()]

def page_sections(text, renderer, depth=0, variant=None):
    if depth==0:
        # One variable table per page: values defined anywhere (often inside <onlyinclude>) are
        # visible to every field, as on the wiki.
        renderer.vars={}; renderer.dropped=[]
        text=renderer.evaluate(text)
        sections=page_sections(text,renderer,1,variant)
        if not sections: return sections
        for var,title in SECTION_VARIABLES:
            value=renderer.vars.get(var,'').strip()
            if not value: continue
            rendered=renderer.render(value)
            if rendered.strip():
                # Text the wiki's templates print in that section. The generator merges it into the
                # section of the same title, skipping anything the page already says.
                sections.append({'id':'wiki-var-'+var.replace('_','-'),'title':title,'html':rendered,'extracted':True})
        if renderer.dropped: sections[0]['dropped']=list(renderer.dropped)
        return sections
    candidates=[n for n in templates(text) if tname(n['name']) in ('LSL Function','LSL Function/Head','LSL Function/Headless','LSL Event','LSL Constant')]
    if not candidates:
        # Some wiki API pages explicitly transclude the common variants article.
        if depth<3:  # depth 0 is the evaluating wrapper
            for node in templates(text):
                if node['name'].startswith(':'):
                    target=node['name'][1:].replace('_',' ').casefold()
                    source=renderer.sources.get(target)
                    if source and source[0]['namespace']==0:
                        sections=page_sections(renderer.evaluate(source[1]),renderer,depth+1,variant)
                        if sections:
                            renderer.use(source[0])
                            note={'id':'shared-article','title':'Shared wiki article','html':'<p>This page transcludes '+renderer.link(source[0]['title'])+'. The following text is from that archived revision.</p>'}
                            return [note]+sections
        return []
    node=max(candidates,key=lambda n:n['end']-n['start'])
    sections=[]; siblings=[]
    for field,title in (CONSTANT_FIELDS if tname(node['name'])=='LSL Constant' else SECTION_FIELDS).items():
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
                        sub.append(''.join(('' if x['id'] in PROSE_IDS else '<h3 id="'+x['id']+'">'+x['title']+'</h3>')+x['html'] for x in parts))
                    else:
                        sub.append('<h3 id="'+anchor(name)+'">'+html.escape(name)+'</h3>'+''.join('<h4>'+x['title']+'</h4>'+x['html'] for x in parts))
                rendered=''.join(sub) or renderer.render(value)
                if own: title='Function details'
            else: rendered=renderer.render(value)
            if field=='return_text':
                # The wiki template prefixes the return text with "Returns a <type>".
                rtype=node['fields'].get('return_type',{}).get('value','').strip()
                if rtype:
                    lead='Returns '+('an' if rtype[0].lower() in 'aeiou' else 'a')+' '+renderer.link(rtype)+' '
                    w='<div class="wiki-line">'
                    rendered=rendered.replace(w,w+lead,1) if rendered.startswith(w) else '<p>'+lead+'</p>'+rendered
            if field=='constants':
                # The wiki prints the constants field directly after the specification, without its own heading.
                rendered='<span id="constants"></span>'+rendered
                if sections and sections[-1]['title']==title:
                    sections[-1]['html']+=rendered; continue
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
                    renderer.use(source[0])
                    content+='<details><summary>Original shared helper source (conditional wiki logic is not evaluated)</summary><pre class="wiki-source"><code>'+html.escape(source[1])+'</code></pre></details>'
                helpers.append(content)
        sections.append({'id':'shared-wiki-helpers','title':'Shared wiki helpers','html':'<p>The original page also injects shared parameter notes, caveats or issue information through these helpers. Their conditional MediaWiki logic is not reproduced here; inspect the preserved helper source for additional material.</p>'+''.join(helpers)})
    remainder=text[:node['start']]+text[node['end']:]
    # Issue templates outside the page template list known issues; the generator merges them.
    issues=[n for n in templates(remainder) if tname(n['name']).casefold().startswith('issues/')]
    if issues:
        rendered=renderer.render('\n'.join('* '+remainder[n['start']:n['end']] for n in issues))
        sections.append({'id':'wiki-issues','title':'Known issues','html':rendered,'extracted':True})
        for n in sorted(issues,key=lambda n:n['start'],reverse=True): remainder=remainder[:n['start']]+remainder[n['end']:]
    if remainder.strip():
        # Text outside the page template. The generator keeps only readable text the page does not
        # already contain; the archive page shows it as is.
        rendered=renderer.render(remainder)
        if re.sub(r'<[^>]+>|\s','',rendered): sections.append({'id':'additional','title':'Additional wiki content','html':rendered})
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
