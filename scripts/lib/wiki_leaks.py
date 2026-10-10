"""Detect raw MediaWiki markup that leaked into generated MDX pages.

Used by the audit (`python -m lib.wiki_leaks`, run from scripts/), by the MDX repair script and by
test_wiki_leaks.py. Fenced code blocks and the frontmatter are ignored: code can legitimately
contain braces, and the frontmatter names wiki templates as sources.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

# Pattern name -> regex. Escaped forms (`\{\{`, `\[\[`) count too: MDX escaping only hides them.
PATTERNS = {
    'template {{…}}': re.compile(r'\\?\{\\?\{'),
    'parameter {{{…}}}': re.compile(r'(?:\\?\{){3}'),
    # `\[` followed by a Markdown link is a literal bracket, not a wiki link.
    'wiki link [[…]]': re.compile(r'\\\[\\\[|(?<!\\)\[\[(?!\s*\]|[^\]\n]*\]\()'),
    'parser function #if/#ifeq': re.compile(r'#if(?:eq)?\s*:', re.I),
    '#vardefine': re.compile(r'#vardefine', re.I),
    '#var:': re.compile(r'#var\s*:', re.I),
    '#switch': re.compile(r'#switch', re.I),
    'onlyinclude/includeonly/noinclude': re.compile(r'(?:only|no)include\b|includeonly\b', re.I),
    'magic word __X__': re.compile(r'__(?:NOTOC|TOC|FORCETOC|NOEDITSECTION|NOINDEX|NEWSECTIONLINK)__'),
    "bold/italic quotes '''": re.compile(r"'''|(?<!\w)''(?=\w)"),
    # Wiki table syntax; a Markdown separator row (|---|---|) is not.
    'table row |- / {| / |}': re.compile(r'^\s*(?:\|-(?!-*\s*:?\s*\|)|\{\||\|\})', re.M),
    'escaped html tag &lt;…': re.compile(r'&lt;/?(?:div|span|ref|nowiki|lsl|source|pre|br|small|center|font|table|tr|td|th)\b', re.I),
    'Additional wiki content': re.compile(r'^#+\s*Additional wiki content', re.M),
    # Marker of a wiki value or template the renderer could not resolve (generator internals).
    'unresolved wiki value': re.compile('\x07'),
}

FENCE = re.compile(r'^([ \t]*)(`{3,}|~{3,})[^\n]*\n.*?^\1\2[ \t]*$', re.S | re.M)
FRONT = re.compile(r'\A---\n.*?\n---\n', re.S)


def prose(text: str) -> str:
    """The text with frontmatter and fenced code blanked (newlines kept, so line numbers hold)."""
    blank = lambda m: re.sub(r'[^\n]', '', m[0])
    return FENCE.sub(blank, FRONT.sub(blank, text))


def leaks(text: str):
    """[(pattern, line number, snippet)] for every leaked-markup match outside code and frontmatter."""
    body = prose(text); out = []
    for name, rx in PATTERNS.items():
        for m in rx.finditer(body):
            line = body.count('\n', 0, m.start()) + 1
            out.append((name, line, re.sub(r'\s+', ' ', body[max(0, m.start() - 40):m.end() + 60]).strip()))
    return out


def scan(root: Path):
    """{relative path: leaks} for MDX under src/content/docs."""
    base = root / 'src/content/docs'
    return {p.relative_to(base).as_posix(): l for p in sorted(base.rglob('*.mdx'))
            if (l := leaks(p.read_text(encoding='utf8')))}


def summary(found) -> str:
    by_pattern = {}
    for page, items in found.items():
        for name, _, _ in items:
            n, pages = by_pattern.get(name, (0, set())); pages.add(page); by_pattern[name] = (n + 1, pages)
    lines = [f'{sum(len(v) for v in found.values())} matches on {len(found)} pages', '', 'By pattern (matches / pages):']
    lines += [f'  {k}: {n} / {len(p)}' for k, (n, p) in sorted(by_pattern.items(), key=lambda kv: -kv[1][0])]
    lines += ['', 'By page (matches):'] + [f'  {p}: {len(v)}' for p, v in sorted(found.items(), key=lambda kv: -len(kv[1]))]
    return '\n'.join(lines)


if __name__ == '__main__':
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2]
    print(summary(scan(root)))
