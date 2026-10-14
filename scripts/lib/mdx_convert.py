"""Convert the importer's rendered wiki HTML into readable, hand-editable MDX.

The input is the safe HTML produced by wiki_render.py (a small, known tag set). The output is
Markdown wherever Markdown can say the same thing: paragraphs, lists, headings, fenced code,
Starlight asides and simple tables. Only structures Markdown cannot express (nested tables,
cells with block content, spans) fall back to HTML elements, laid out one element per line and
with Markdown kept inside them, so a sentence can still be fixed in a text editor.

Nothing here invents or rewrites prose; text is escaped for MDX and whitespace is normalised.
"""
from __future__ import annotations
import hashlib
import re
from html.parser import HTMLParser

VOID = {'br', 'img', 'hr', 'wbr'}
BLOCK = {'p', 'div', 'ul', 'ol', 'pre', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'aside', 'details',
         'blockquote', 'dl', 'section', 'hr', 'center', 'caption'}


class Node:
    __slots__ = ('tag', 'attrs', 'children')

    def __init__(self, tag, attrs=None):
        self.tag = tag; self.attrs = dict(attrs or {}); self.children = []

    @property
    def cls(self): return self.attrs.get('class', '') or ''

    def elements(self): return [c for c in self.children if isinstance(c, Node)]

    def text(self):
        return ''.join(c if isinstance(c, str) else ('\n' if c.tag == 'br' else c.text()) for c in self.children)

    def find(self, tag):
        for c in self.elements():
            if c.tag == tag: return c
            hit = c.find(tag)
            if hit: return hit
        return None


class _Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root'); self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)

    def handle_startendtag(self, tag, attrs): self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]; return

    def handle_data(self, data): self.stack[-1].children.append(data)


def parse(html: str) -> Node:
    p = _Parser(); p.feed(html); p.close(); return p.root


# ---------------------------------------------------------------- text escaping

def clean(s: str) -> str:
    # U+FFFD stands for a dash lost to an encoding error in the wiki's see-also rows.
    return s.replace('\ufffd', '–').replace('\xa0', ' ')


def esc(s: str, table=False) -> str:
    s = clean(s).replace('\\', '\\\\')
    s = re.sub(r'([`*\[\]{}])', r'\\\1', s).replace('<', '&lt;')
    s = re.sub(r'(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])', r'\\_', s)
    s = s.replace('~~', '\\~\\~')
    s = re.sub(r'&(?=#?[A-Za-z0-9]+;)(?!lt;)', '&amp;', s)
    if table: s = s.replace('|', '\\|')
    return s


def code_span(s: str, table=False) -> str:
    s = re.sub(r'\s+', ' ', clean(s)).strip()
    if not s: return ''
    longest = max((len(m) for m in re.findall(r'`+', s)), default=0)
    fence = '`' * (longest + 1)
    pad = ' ' if s.startswith('`') or s.endswith('`') else ''
    if table: s = s.replace('|', '\\|')
    return f'{fence}{pad}{s}{pad}{fence}'


def fence(code: str, lang='lsl', meta='') -> str:
    code = '\n'.join(l.rstrip() for l in clean(code).split('\n')).strip('\n')
    if not code.strip(): return ''
    ticks = '`' * max(3, max((len(m) for m in re.findall(r'`{3,}', code)), default=0) + 1)
    return f"{ticks}{lang}{' ' + meta if meta else ''}\n{code}\n{ticks}"


LINE_START = re.compile(r'^(\s*)([#>+=-]|\d+[.)](?=\s|$))')


def guard_line_start(text: str) -> str:
    return '\n'.join(LINE_START.sub(lambda m: m[1] + '\\' + m[2], line) for line in text.split('\n'))


# ---------------------------------------------------------------- collapse ranges (port of inline-lsl.ts)

def collapse_meta(code: str, focus: str | None) -> str:
    lines = code.split('\n')
    if not focus or len(lines) < 16: return ''
    keep = set(); rx = re.compile(r'\b' + re.escape(re.sub(r'[^A-Za-z0-9_]', '', focus)) + r'\b')
    for i, line in enumerate(lines):
        if not rx.search(line): continue
        end, depth = i, 0
        for j in range(i, len(lines)):
            for ch in re.sub(r'"(?:\\.|[^"\\])*"|//.*$', '', lines[j]):
                depth += 1 if ch in '([{' else -1 if ch in ')]}' else 0
            end = j
            nxt = lines[j + 1].strip() if j + 1 < len(lines) else ''
            if depth <= 0 and not (depth == 0 and nxt.startswith('{')): break
        keep.update(range(i - 2, end + 3))
    if not keep: return ''
    ranges, i = [], 0
    while i < len(lines):
        if i in keep: i += 1; continue
        j = i
        while j + 1 < len(lines) and j + 1 not in keep: j += 1
        if j - i + 1 >= 5: ranges.append(f'{i + 1}-{j + 1}')
        i = j + 1
    return f"collapse={{{', '.join(ranges)}}}" if ranges else ''


# ---------------------------------------------------------------- converter

def is_block(n) -> bool:
    return isinstance(n, Node) and (n.tag in BLOCK or n.tag == 'li')


def has_block(n: Node) -> bool:
    return any(is_block(c) or (isinstance(c, Node) and has_block(c)) for c in n.children if isinstance(c, Node))


class Converter:
    def __init__(self, focus: str | None = None, link=None):
        self.focus = focus
        # Optional href rewriter, e.g. archive links (/wiki/...) to a local page or the live wiki.
        self.link = link or (lambda href: href)
        self.stats = {'htmlTables': 0, 'markdownTables': 0}
        self.notes = {}  # footnote label -> Markdown text
        self.dropped = []  # (reason, snippet) of wiki markup left out of the page

    # ---- parameter references
    # Parameter names of the page's own signature are written in bold, as on the hand-written
    # pages. The wiki's own markers (code, bold or italic around exactly the name) are normalised to
    # bold. A bare word is marked only when it clearly means the parameter: names that are not
    # common words (see `common`), or wording such as "the X parameter" / "specified by X".
    # Never inside code, links or headings. Everything marked or skipped is logged in `refs`.
    def set_params(self, names, common=frozenset()):
        self.params = set(names); self.common = common; self.refs = []; self.no_mark = 0
        return self

    params: set = set()
    no_mark = 0
    refs: list = []

    def _snippet(self, text, start, end):
        return re.sub(r'\s+', ' ', text[max(0, start - 50):end + 50]).strip()

    # ---- inline LSL in plain prose
    # Code-like fragments the wiki left as plain text become inline code (highlighted as LSL at build
    # time): vector/rotation literals, ll* calls, rule-list fragments. Bare names of API entries
    # become links (shown as highlighted code). Wording is unchanged.
    apis: dict = {}
    shapes: dict = {}
    CODE_LIKE = re.compile(
        r'\bll[A-Z]\w*\([^()]*(?:\([^()]*\)[^()]*)*\)'            # llSetTimerEvent(0.0)
        r'|\[\s*[A-Z][A-Z0-9_]+\s*,[^\[\]]*\]'                     # [PRIM_POSITION, <0,0,1>]
        r'|<\s*-?[\d.]+\s*(?:,\s*-?[\d.]+\s*){2,3}>'              # <1.0, 1.0, 0.0>
    )

    def set_apis(self, apis: dict, shapes: dict | None = None):
        self.apis = apis; self.shapes = shapes or {}
        return self

    def text_md(self, text: str, table=False) -> str:
        if self.no_mark or not (self.apis or self.params): return esc(text, table)
        out, last = [], 0
        for m in self.CODE_LIKE.finditer(text) if self.apis else ():
            out.append(self.words_md(text[last:m.start()], table)); out.append(code_span(m[0], table)); last = m.end()
            self.inline_code += 1
        out.append(self.words_md(text[last:], table))
        return ''.join(out)

    inline_code = 0

    def words_md(self, text: str, table=False) -> str:
        if not self.apis: return self.param_text(text, table)
        out, last = [], 0
        for m in re.finditer(r'(?<![\w$-])(ll[A-Z]\w*|[A-Z][A-Z0-9]*_[A-Z0-9_]+|TRUE|FALSE|NULL_KEY|PI|TWO_PI)(?![\w(-])', text):
            href = self.apis.get(m[1])
            if not href: continue
            out.append(self.param_text(text[last:m.start()], table))
            out.append(code_span(m[1], table) if m[1] == self.focus else f'[{esc(m[1], table)}]({href})'); last = m.end()
            self.inline_code += 1
        out.append(self.param_text(text[last:], table))
        return ''.join(out)

    def param_text(self, text: str, table=False) -> str:
        if not self.params or self.no_mark: return esc(text, table)
        names = sorted(self.params, key=len, reverse=True)
        rx = re.compile(r'(?<![\w.$-])(' + '|'.join(map(re.escape, names)) + r')(?![\w(-]|\.\w)')
        out, last = [], 0
        for m in rx.finditer(text):
            name = m[1]
            before, after = text[max(0, m.start() - 30):m.start()], text[m.end():m.end() + 20]
            # "specified by X", "parameter X", "X parameter" / "X argument"
            contextual = re.search(r'(?:specified (?:by|in)|parameter|argument)\s+$', before, re.I) \
                or re.match(r'\s+(?:parameter|argument)\b', after, re.I)
            if name in self.common and not contextual:
                self.refs.append(('ambiguous', name, self._snippet(text, m.start(), m.end()))); continue
            self.refs.append(('marked', name, self._snippet(text, m.start(), m.end())))
            out.append(esc(text[last:m.start()], table) + f'**{esc(name, table)}**'); last = m.end()
        out.append(esc(text[last:], table))
        return ''.join(out)

    def param_marker(self, text: str):
        """Code, bold or italic around exactly a parameter name: the wiki marking a parameter."""
        name = text.strip()
        if self.params and not self.no_mark and name in self.params:
            self.refs.append(('normalised', name, name))
            return f'**{name}**'
        return None

    # ---- inline
    def inline(self, nodes, table=False) -> str:
        out = []
        for n in nodes:
            if isinstance(n, str):
                out.append(self.text_md(re.sub(r'\s+', ' ', n), table)); continue
            t = n.tag
            if t == 'br': out.append('<br />')
            elif t == 'code': out.append(self.param_marker(n.text()) or code_span(n.text(), table))
            elif t in ('strong', 'b', 'em', 'i') and not n.elements() and self.param_marker(n.text()):
                inner = n.text()
                lead = ' ' if inner[:1].isspace() else ''; trail = ' ' if inner[-1:].isspace() else ''
                out.append(lead + self.param_marker(inner) + trail); self.refs.pop()
            elif t == 'a':
                href = self.link(n.attrs.get('href', ''))
                self.no_mark += 1
                label = self.inline(n.children, table).strip()
                self.no_mark -= 1
                if not label and href.startswith('#'): label = esc(href[1:].replace('-', ' '))
                if not href: out.append(label)
                elif label: out.append(f'[{label}]({href.replace(" ", "%20").replace(")", "%29")})')
            elif t in ('strong', 'b', 'em', 'i', 'del', 's'):
                inner = self.inline(n.children, table)
                mark = {'strong': '**', 'b': '**', 'em': '*', 'i': '*', 'del': '~~', 's': '~~'}[t]
                core = inner.strip()
                if core:
                    lead = ' ' if inner[:1].isspace() else ''; trail = ' ' if inner[-1:].isspace() else ''
                    out.append(f'{lead}{mark}{core}{mark}{trail}')
                else: out.append(inner)
            elif t in ('sup', 'sub', 'kbd', 'small', 'u') and 'wiki-footnote' not in n.cls:
                out.append(f'<{t}>{self.inline(n.children, table).strip()}</{t}>')
            elif t == 'span' and 'wiki-template' in n.cls:
                # A wiki template the renderer could not expand: never shown as raw markup.
                code = n.find('code')
                self.dropped.append(('unexpanded template', code.text() if code else n.text()))
            elif t == 'span' and 'wiki-param' in n.cls:
                out.append(f'**{esc(n.text().strip(), table)}**')
            elif t == 'sup' and 'wiki-footnote' in n.cls:
                note = self.inline(n.children).strip()
                if note:
                    label = 'wiki-' + hashlib.sha1(note.encode('utf8')).hexdigest()[:6]
                    self.notes.setdefault(label, note)
                    out.append(f'[^{label}]')
            elif t == 'span' and n.attrs.get('id') and not n.text().strip(): pass
            elif t == 'img': pass
            else: out.append(self.inline(n.children, table))
        s = ''.join(out)
        return re.sub(r' {2,}', ' ', s)

    # ---- blocks: returns a list of (kind, text)
    def blocks(self, nodes) -> list[tuple[str, str]]:
        out: list[tuple[str, str]] = []; buf: list = []

        def flush():
            if not buf: return
            text = self.inline(buf).strip(); buf.clear()
            # A line break at paragraph level separates paragraphs.
            for part in re.split(r'\s*<br />\s*', text):
                if re.fullmatch(r'-{4,}', part.strip()): out.append(('p', '---'))
                elif part.strip(): out.append(('p', guard_line_start(part.strip())))

        for n in nodes:
            if not isinstance(n, Node) or not (is_block(n) or (n.tag not in ('a', 'code') and has_block(n))):
                buf.append(n); continue
            flush(); out.extend(self.block(n))
        flush()
        return out

    def block(self, n: Node) -> list[tuple[str, str]]:
        t, cls = n.tag, n.cls
        if t == 'div' and 'wiki-related-row' in cls:
            return [('li', '- ' + self.inline(n.children).strip())]
        if t == 'div' and 'wiki-constant-row' in cls:
            cells = [c for c in n.elements()]
            name = self.inline([cells[0]], True).strip() if cells else ''
            vals = [c.text().strip() for c in cells[1:]]
            typ = vals[0] if vals else ''
            val = vals[1] if len(vals) > 1 else ''
            desc = next((v[2:] for v in vals if v.startswith('c=')), '')
            return [('crow', f'| {name} | {esc(typ, True)} | {code_span(val) if val else ""} | {esc(desc, True)} |')]
        if t in ('div', 'section', 'center', 'span'): return self.blocks(n.children)
        if t == 'p': return self.blocks(n.children)
        if t in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            level = max(3, int(t[1]))
            self.no_mark += 1
            text = self.inline(n.children).strip()
            self.no_mark -= 1
            return [('h', '#' * level + ' ' + text)] if text else []
        if t == 'pre':
            code = n.text()
            if 'wiki-source' in cls: f = fence(code, 'txt')
            else: f = fence(code, 'lsl', collapse_meta(code.strip('\n'), self.focus))
            return [('code', f)] if f else []
        if t in ('ul', 'ol'): return [('list', self.list(n))]
        if t == 'table': return [('table', self.table(n))]
        if t == 'aside':
            body = self.render(self.blocks(n.children))
            return [('aside', f':::note\n{body}\n:::')] if body.strip() else []
        if t == 'details':
            summary = n.find('summary')
            rest = [c for c in n.children if c is not summary]
            body = self.render(self.blocks(rest))
            head = self.inline(summary.children).strip() if summary else ''
            return [('details', f'<details>\n<summary>{head}</summary>\n\n{body}\n\n</details>')]
        if t == 'blockquote':
            body = self.render(self.blocks(n.children))
            return [('quote', '\n'.join('> ' + l if l else '>' for l in body.split('\n')))]
        if t == 'dl':
            out = []
            for c in n.elements():
                text = self.inline(c.children).strip()
                if text: out.append(('p', f'**{text}**' if c.tag == 'dt' else text))
            return out
        if t == 'caption':
            text = self.inline(n.children).strip()
            return [('p', f'**{text}**')] if text else []
        if t == 'hr': return [('p', '---')]
        return self.blocks(n.children)

    def list(self, n: Node, depth=0) -> str:
        ordered = n.tag == 'ol'
        lines = []
        for i, li in enumerate([c for c in n.elements() if c.tag == 'li']):
            marker = f'{i + 1}. ' if ordered else '- '
            pad = ' ' * len(marker)
            parts = self.blocks(li.children)
            if not parts: continue
            text = ''
            for k, (kind, body) in enumerate(parts):
                if k == 0: text = body; continue
                sep = '\n' if kind == 'list' and parts[k - 1][0] == 'p' else '\n\n'
                text += sep + body
            first, *rest = text.split('\n')
            lines.append(marker + first + ''.join('\n' + (pad + l if l else '') for l in rest))
        return '\n'.join(lines)

    # ---- tables
    def rows(self, table: Node):
        rows = []
        def walk(node):
            for c in node.elements():
                if c.tag == 'tr': rows.append([x for x in c.elements() if x.tag in ('td', 'th')])
                elif c.tag in ('thead', 'tbody', 'tfoot'): walk(c)
        walk(table)
        return rows

    def simple(self, table: Node) -> bool:
        rows = self.rows(table)
        if len(rows) < 2 or not rows[0] or any(c.tag != 'th' for c in rows[0]): return False
        width = len(rows[0])
        for row in rows:
            if len(row) != width: return False
            for c in row:
                if 'rowspan' in c.attrs or 'colspan' in c.attrs or has_block(c): return False
        return True

    def table(self, n: Node) -> str:
        # A one-row layout table that only wraps another table: keep the inner table.
        rows = self.rows(n)
        if len(rows) == 1:
            inner = [c for cell in rows[0] for c in cell.elements()]
            texts = ''.join(cell.text() for cell in rows[0] if not cell.find('table')).strip()
            if len(inner) == 1 and inner[0].tag == 'table' and not texts: return self.table(inner[0])
        caption = n.find('caption')
        cap = f'**{self.inline(caption.children).strip()}**\n\n' if caption and caption in n.children else ''
        if self.simple(n):
            self.stats['markdownTables'] += 1
            rows = self.rows(n)
            cell = lambda c: self.inline(c.children, table=True).strip()
            head = '| ' + ' | '.join(cell(c) for c in rows[0]) + ' |'
            sep = '|' + '|'.join(' --- ' for _ in rows[0]) + '|'
            body = ['| ' + ' | '.join(self.rule_cell(c, True) if i == 0 else cell(c) for i, c in enumerate(r)) + ' |' for r in rows[1:]]
            return cap + '\n'.join([head, sep, *body])
        self.stats['htmlTables'] += 1
        return self.html_table(n, 0)

    def rule_cell(self, cell: Node, table=False) -> str:
        """First cell of a rules table: the linked constant followed by its argument shape from the
        definitions, e.g. [REZ_POS](/constants/REZ_POS/)`, vector pos, integer relative, integer at_root`."""
        text = self.inline(cell.children, table).strip()
        name = cell.text().strip()
        shape = self.shapes.get(name)
        if shape and re.fullmatch(r'\[' + re.escape(name) + r'\]\([^)]*\)|`?' + re.escape(name) + '`?', text):
            if not text.startswith('['): text = f'[{name}]({self.apis[name]})' if name in self.apis else text
            self.inline_code += 1
            return text + code_span(', ' + shape, table)
        return text

    def html_table(self, n: Node, depth: int) -> str:
        ind = '\t' * depth
        lines = [f'{ind}<table>']
        for c in n.elements():
            if c.tag == 'caption': lines.append(f'{ind}\t<caption>{self.inline(c.children).strip()}</caption>')
        for row in self.rows(n):
            lines.append(f'{ind}\t<tr>')
            for cell in row:
                attrs = ''.join(f' {k}="{v}"' for k, v in cell.attrs.items() if k in ('colspan', 'rowspan') and re.fullmatch(r'\d+', v or ''))
                if has_block(cell):
                    inner = []
                    for kind, body in self.blocks(cell.children):
                        if kind == 'table': inner.append(body if body.startswith('\t') else self.indent(body, depth + 3))
                        # Markdown stays at column 0: a fence (or list) indented four or more columns
                        # is no longer Markdown to MDX, so code loses highlighting and its newlines.
                        else: inner.append(body)
                    lines.append(f'{ind}\t\t<{cell.tag}{attrs}>\n\n' + '\n\n'.join(inner) + f'\n\n{ind}\t\t</{cell.tag}>')
                else:
                    text = self.rule_cell(cell) if cell is row[0] and cell.tag == 'td' else self.inline(cell.children).strip()
                    lines.append(f'{ind}\t\t<{cell.tag}{attrs}>{text}</{cell.tag}>')
            lines.append(f'{ind}\t</tr>')
        lines.append(f'{ind}</table>')
        return '\n'.join(lines)

    @staticmethod
    def indent(text: str, depth: int) -> str:
        ind = '\t' * depth
        return '\n'.join(ind + l if l else l for l in text.split('\n'))

    # ---- output
    @staticmethod
    def render(blocks: list[tuple[str, str]]) -> str:
        out = []
        for i, (kind, text) in enumerate(blocks):
            if i and kind in ('li', 'crow') and blocks[i - 1][0] == kind: out.append('\n' + text); continue
            if kind == 'crow' and (not i or blocks[i - 1][0] != 'crow'):
                text = '| Constant | Type | Value | Description |\n| --- | --- | --- | --- |\n' + text
            out.append(('\n\n' if out else '') + text)
        return ''.join(out)

    def convert(self, html: str) -> str:
        text = self.render(self.blocks(parse(html).children)).strip()
        return self.with_notes(text)

    def with_notes(self, text: str) -> str:
        """Footnote definitions for the references in text, appended after it."""
        used = [l for l in dict.fromkeys(re.findall(r'\[\^(wiki-[0-9a-f]{6})\]', text)) if l in self.notes]
        if not used: return text
        return text + '\n\n' + '\n'.join(f'[^{l}]: {self.notes[l]}' for l in used)

    # ---- examples: one collapsible per code block, summarised by the sentence before it
    def examples(self, html: str) -> str:
        root = parse(html)
        items, pending = [], []

        def code_of(n):
            if isinstance(n, Node) and n.tag == 'pre': return n
            if isinstance(n, Node) and n.tag == 'div' and len(n.elements()) == 1 and n.elements()[0].tag == 'pre' \
                    and not ''.join(c for c in n.children if isinstance(c, str)).strip():
                return n.elements()[0]
            return None

        for n in root.children:
            if isinstance(n, str) and not n.strip(): continue
            pre = code_of(n)
            if pre is None: pending.append(n); continue
            code = pre.text().strip('\n')
            if not code.strip(): continue
            summary, intro = '', pending
            first = next((p for p in pending if isinstance(p, Node)), None)
            if first is not None and first.tag in ('div', 'p') and not has_block(first) and pending[0] is first:
                summary = self.inline(first.children).strip(); intro = pending[1:]
            items.append((summary, self.render(self.blocks(intro)), code)); pending = []
        out = []
        for i, (summary, intro, code) in enumerate(items):
            meta = collapse_meta(code, self.focus)
            body = (intro + '\n\n' if intro else '') + fence(code, 'lsl', meta)
            open_attr = ' open' if i == 0 else ''
            out.append(f'<details{open_attr}>\n<summary>{summary or f"Example {i + 1}"}</summary>\n\n{body}\n\n</details>')
        trailing = self.render(self.blocks(pending))
        if trailing: out.append(trailing)
        return self.with_notes('\n\n'.join(out))
