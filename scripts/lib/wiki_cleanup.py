"""Keep raw wiki markup out of MDX pages, and add extracted wiki text only when it is new.

Shared by scripts/generate-mdx.py (new pages) and scripts/repair-wiki-markup.py (existing pages).

- spans()/blocks(): top-level Markdown blocks (paragraph, list item with its sub-items, table,
  fenced code, aside, details, footnote definition), so a block can be kept or dropped whole.
- strip_leaks(): drop blocks that still contain wiki markup (lib/wiki_leaks.py) and log them.
- novel(): the blocks whose text is not already on the page (normalised, near-matches allowed).
- merge_section(): add blocks to the page's section of a title, creating it in the usual order.
- DroppedLog: data/reports/dropped-wiki-markup.md, one entry per page and snippet.
"""
from __future__ import annotations
import difflib
import re
from pathlib import Path

from .wiki_leaks import leaks, prose

UNRESOLVED_MARK = re.compile('\x07[^\x07]*\x07')

# --------------------------------------------------------------- normalised text and duplicates

def norm(md: str) -> str:
    """Plain words of a Markdown fragment: no markup, links reduced to their text, lower case,
    punctuation and whitespace collapsed."""
    s = re.sub(r'^\[\^[^\]]+\]:.*$', ' ', md, flags=re.M)      # footnote definitions
    s = re.sub(r'\[\^[^\]]+\]', ' ', s)                          # footnote references
    s = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', s)            # links -> text
    s = re.sub(r'<[^>]+>', ' ', s)                               # html / components
    s = s.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    s = re.sub(r'\\(.)', r'\1', s)                               # MDX escapes
    s = re.sub(r'[\W_]+', ' ', s.lower())
    return re.sub(r'\s+', ' ', s).strip()


def sentences(md: str) -> list[str]:
    return [p for p in re.split(r'(?<=[.!?;:])\s+|\n', md)]


def units(md: str) -> list[str]:
    """Normalised sentences/lines of a page, for near-match comparison."""
    return [n for part in sentences(prose(md)) for n in [norm(part)] if len(n) > 3]


def is_duplicate(candidate: str, page: str, page_units=None, ratio=0.85) -> bool:
    """True when the candidate's text is already on the page: contained in it after
    normalisation, or every sentence of it closely matches a sentence of the page."""
    c = norm(candidate)
    if not c: return True
    whole = ' ' + norm(page) + ' '
    if ' ' + c + ' ' in whole: return True
    page_units = page_units if page_units is not None else units(page)
    parts = [n for n in (norm(p) for p in sentences(candidate)) if len(n) > 3]
    if not parts: return True

    def seen(p):
        if ' ' + p + ' ' in whole: return True
        return any(difflib.SequenceMatcher(None, p, u).ratio() >= ratio for u in page_units
                   if abs(len(u) - len(p)) <= max(len(u), len(p)) * (1 - ratio) + 5)
    return all(seen(p) for p in parts)


# --------------------------------------------------------------- blocks

LIST_ITEM = re.compile(r'^([-*+]|\d+[.)])\s')


def spans(md: str) -> list[tuple[int, int]]:
    """Line ranges [start, end) of the top-level Markdown blocks. A list item carries its indented
    sub-items; fenced code, tables, :::asides and <details>/<table> elements stay whole."""
    lines = md.split('\n'); out = []; i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip(): i += 1; continue
        m = re.match(r'^(\s*)(`{3,}|~{3,})', line)
        if m:
            j = i + 1
            while j < len(lines) and not re.match(r'^' + re.escape(m[1]) + re.escape(m[2]) + r'\s*$', lines[j]): j += 1
            out.append((i, min(j + 1, len(lines)))); i = j + 1; continue
        if line.startswith(':::'):
            j = i + 1
            while j < len(lines) and lines[j].strip() != ':::': j += 1
            out.append((i, min(j + 1, len(lines)))); i = j + 1; continue
        if re.match(r'^<(details|table)\b', line):
            tag = re.match(r'^<(\w+)', line)[1]; depth = 0; j = i
            while j < len(lines):
                depth += len(re.findall(r'<' + tag + r'\b', lines[j])) - len(re.findall(r'</' + tag + r'>', lines[j]))
                if depth <= 0: break
                j += 1
            out.append((i, min(j + 1, len(lines)))); i = j + 1; continue
        if LIST_ITEM.match(line):
            j = i + 1
            while j < len(lines) and (lines[j].startswith((' ', '\t')) or (not lines[j].strip() and j + 1 < len(lines) and lines[j + 1].startswith((' ', '\t')))): j += 1
            while j > i + 1 and not lines[j - 1].strip(): j -= 1
            out.append((i, j)); i = j; continue
        if line.startswith('|'):
            j = i
            while j < len(lines) and lines[j].startswith('|'): j += 1
            out.append((i, j)); i = j; continue
        j = i + 1
        while j < len(lines) and lines[j].strip() and not re.match(r'^(([-*+]|\d+[.)])\s|#|:::|\||`{3}|<(details|table)\b|\[\^)', lines[j]): j += 1
        out.append((i, j)); i = j
    return out


def blocks(md: str) -> list[str]:
    """Top-level Markdown blocks (see spans)."""
    lines = md.split('\n')
    return ['\n'.join(lines[a:b]) for a, b in spans(md)]


def footnote_defs(md: str) -> dict[str, str]:
    return {m[1]: m[0] for m in re.finditer(r'^\[\^([^\]]+)\]:.*$', md, re.M)}


def scrub(md: str) -> str:
    """Repair leftovers that have an exact Markdown meaning: wiki bold/italic quotes, escaped
    layout tags (<div>, <span>, <center>, <font>), <br> and {{=}}. Fenced code is untouched."""
    def fix(part):
        part = re.sub(r'&lt;/?(?:div|span|center|font|big)\b[^>\n]*>', '', part, flags=re.I)
        part = re.sub(r'&lt;br\b[^>\n]*>', ' ', part, flags=re.I)
        part = re.sub(r"'''(?=\S)(.+?)(?<=\S)'''", r'**\1**', part)
        part = re.sub(r"(?<!')''(?=[^\s'])(.+?)(?<=[^\s'])''(?!')", r'*\1*', part)
        return part.replace('\\{\\{=\\}\\}', '=').replace('{{=}}', '=')
    out = []; last = 0
    for m in re.finditer(r'^([ \t]*)(`{3,}|~{3,})[^\n]*\n.*?^\1\2[ \t]*$', md, re.S | re.M):
        out.append(fix(md[last:m.start()])); out.append(m[0]); last = m.end()
    out.append(fix(md[last:]))
    return ''.join(out)


def strip_leaks(md: str, log=None, page='', where='') -> str:
    """md without the blocks (or table rows) that still contain wiki markup; each is logged.
    Leftovers with an exact Markdown meaning are repaired first (scrub). Everything else,
    including its blank-line layout, is kept exactly."""
    if not leaks(md): return md
    md = scrub(md)
    if '\x07' in md:
        # An unknown value in a table cell leaves the cell empty; in prose it would leave a hole in
        # a sentence, so that block is dropped below.
        lines = md.split('\n')
        for a, b in spans(md):
            if lines[a].startswith(('|', '<table')):
                for k in range(a, b):
                    if '\x07' in lines[k]:
                        if log is not None: log.add(page, where, 'unknown wiki value left empty in a table cell', UNRESOLVED_MARK.sub('[?]', lines[k]))
                        lines[k] = UNRESOLVED_MARK.sub('', lines[k])
        md = '\n'.join(lines)
    if not leaks(md): return md
    lines = md.split('\n'); drop = set()
    for a, b in spans(md):
        block = '\n'.join(lines[a:b])
        if not leaks(block): continue
        if lines[a].startswith('|'):
            bad = [k for k in range(a, b) if leaks(lines[k])]
            for k in bad:
                if log is not None: log.add(page, where, 'table row with wiki markup', lines[k])
            drop.update(bad)
            if b - a - len(bad) <= 2: drop.update(range(a, b))  # only the header and separator left
            continue
        if log is not None:
            reason = 'block with an unknown wiki value (would read as an incomplete sentence)' if '\x07' in block and not any(n != 'unresolved wiki value' for n, _, _ in leaks(block)) else 'block with wiki markup'
            log.add(page, where, reason, UNRESOLVED_MARK.sub('[?]', block))
        drop.update(range(a, b))
    out = '\n'.join(l for k, l in enumerate(lines) if k not in drop)
    return re.sub(r'\n{3,}', '\n\n', out).strip('\n')


def novel(candidates: list[str], page: str, log=None, page_name='', where='') -> list[str]:
    """The candidate blocks (with the footnote definitions they reference) that the page does not
    already say. Skipped duplicates are logged."""
    defs = {}
    for c in candidates: defs.update(footnote_defs(c))
    pu = units(page); out = []
    for c in candidates:
        if re.match(r'^\[\^[^\]]+\]:', c): continue
        if is_duplicate(c, page, pu):
            if log is not None: log.skip(page_name, where, c)
            continue
        out.append(c)
        for ref in dict.fromkeys(re.findall(r'\[\^([^\]]+)\](?!:)', c)):
            if ref in defs and defs[ref] not in out and defs[ref] not in page: out.append(defs[ref])
        pu += units(c); page += '\n\n' + c
    return out


def join_blocks(new: list[str]) -> str:
    """Blocks as Markdown: consecutive list items stay one tight list; footnote definitions last."""
    items = [b for b in new if not re.match(r'^\[\^[^\]]+\]:', b)]
    defs = [b for b in new if re.match(r'^\[\^[^\]]+\]:', b)]
    out = ''
    for k, b in enumerate(items):
        if k: out += '\n' if LIST_ITEM.match(b) and LIST_ITEM.match(items[k - 1]) else '\n\n'
        out += b
    if defs: out += ('\n\n' if out else '') + '\n'.join(defs)
    return out


# --------------------------------------------------------------- sections

# Usual order of body sections on API pages, for placing a section a page does not have yet.
ORDER = ['Specification', 'Caveats', 'Examples', 'Notes', 'Deep notes', 'Known issues', 'Helper functions', 'See also']


def merge_section(body: str, title: str, new: list[str]) -> str:
    """Append blocks to the `## title` section of an MDX body, creating the section if needed."""
    if not new: return body
    text = join_blocks(new)
    m = re.search(r'^## ' + re.escape(title) + r'[ \t]*\n', body, re.M)
    if m:
        nxt = re.search(r'^## |^<WikiSource', body[m.end():], re.M)
        end = m.end() + (nxt.start() if nxt else len(body) - m.end())
        section = body[m.end():end].rstrip()
        # Footnote definitions (the section's and the new ones) go after all of the text.
        is_def = lambda b: re.match(r'^\[\^[^\]]+\]:', b)
        old_blocks = blocks(section); new_blocks = blocks(text)
        kept = [b for b in old_blocks if not is_def(b)]
        old_text = section
        for d in [b for b in old_blocks if is_def(b)]: old_text = old_text.replace(d, '')
        old_text = re.sub(r'\n{3,}', '\n\n', old_text).rstrip()
        new_text = join_blocks([b for b in new_blocks if not is_def(b)])
        defs = [b for b in old_blocks + new_blocks if is_def(b)]
        sep = '\n' if kept and LIST_ITEM.match(kept[-1]) and LIST_ITEM.match(new_text) else '\n\n'
        merged = old_text + sep + new_text + ('\n\n' + '\n'.join(defs) if defs else '')
        rest = body[end:].lstrip('\n')
        return body[:m.start()] + f'## {title}\n' + merged + ('\n\n' + rest if rest else '\n')
    later = ORDER[ORDER.index(title) + 1:] if title in ORDER else []
    positions = [mm.start() for t in later for mm in [re.search(r'^## ' + re.escape(t) + r'[ \t]*$', body, re.M)] if mm]
    if not positions:
        ws = re.search(r'^<WikiSource', body, re.M)
        positions = [ws.start()] if ws else [len(body)]
    at = min(positions)
    rest = body[at:].lstrip('\n')
    return body[:at].rstrip('\n') + f'\n\n## {title}\n\n{text}' + ('\n\n' + rest if rest else '\n')


# --------------------------------------------------------------- report

def code(s: str) -> str:
    fence = '`' * (max((len(m) for m in re.findall(r'`+', s)), default=0) + 1)
    return f'{fence} {s} {fence}'


class DroppedLog:
    """data/reports/dropped-wiki-markup.md: per page, what was dropped (wiki markup that could not
    be converted) and what was extracted. Entries of pages not touched by this run are kept."""

    def __init__(self):
        self.entries: dict[str, list[tuple[str, str, str]]] = {}

    def add(self, page, where, reason, snippet):
        snippet = re.sub(r'\s+', ' ', snippet).strip()
        if len(snippet) > 400: snippet = snippet[:400] + ' …'
        item = (where or '-', reason, snippet)
        if item not in self.entries.setdefault(page, []): self.entries[page].append(item)

    def skip(self, page, where, snippet):
        self.add(page, where, 'extracted text already on the page (not added)', snippet)

    def write(self, path: Path, header: str):
        old = {}
        if path.exists():
            for m in re.finditer(r'^## (\S+)\n(.*?)(?=^## |\Z)', path.read_text(encoding='utf8'), re.M | re.S):
                old[m[1]] = m[2].rstrip()
        for page, items in self.entries.items():
            old[page] = '\n'.join(f'- {where} | {reason}: {code(snippet)}' for where, reason, snippet in items)
        lines = ['# Dropped wiki markup', '', header, '']
        for page in sorted(old):
            if old[page]: lines += [f'## {page}', old[page], '']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf8'))
