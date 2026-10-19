#!/usr/bin/env python3
"""Track Second Life simulator and viewer release notes (releasenotes.secondlife.com).

Usage:
  python scripts/release-notes.py fetch [--refetch]   # download new pages (network)
  python scripts/release-notes.py index               # rebuild index + LSL report (offline)
  python scripts/release-notes.py review [--channel simulator|viewer|all]
  python scripts/release-notes.py mark-reviewed [--channel ...] [--through <slug>]

Unlike the catalog importer this script uses the network, but only in `fetch`. Pages come
from the site's sitemap.xml, which lists every release page, including ones the index pages
and RSS feeds leave out. Pages that are not on releasenotes.secondlife.com at all (some
project viewers, such as the game control test viewer) go in
data/sources/release-notes/extra-urls.txt, one "<channel> <url>" per line.

Outputs (all checked in):
  data/sources/release-notes/<channel>/<slug>.md   text snapshot of each page
  data/sources/release-notes/index.json            page list with dates and LSL names found
  data/sources/release-notes/review.json           review markers (the last page checked)
  data/reports/release-notes-lsl.json              per LSL name: pages that mention it

LSL names are matched against the public functions, events and constants of
data/sources/lsl_definitions.yaml, plus anything that looks like ll*/PERMISSION_* etc. but is
not defined there (listed as `unknown`, often a typo or an unreleased name). The first
simulator mention of a name is a good hint for when it reached the main grid; check the page,
because a mention can be a fix or a known issue rather than the release.
"""
import argparse, hashlib, html, json, re, sys, urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://releasenotes.secondlife.com/'
DIR = ROOT / 'data/sources/release-notes'
INDEX = DIR / 'index.json'
REVIEW = DIR / 'review.json'
EXTRA = DIR / 'extra-urls.txt'
REPORT = ROOT / 'data/reports/release-notes-lsl.json'
CHANNELS = ('simulator', 'viewer')
UA = {'User-Agent': 'lsl.dev release-notes tracker (+https://lsl.dev)'}
# Names that look like LSL even when the definitions do not have them.
LSL_LIKE = re.compile(r'\b(ll[A-Z]\w+|[A-Z][A-Z0-9]*_[A-Z0-9_]{2,})\b')
NOT_LSL = {'LL_DEBUGS', 'LL_INFOS', 'LL_WARNS'}  # viewer code names; extend when noise appears


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read().decode('utf8', 'replace')


class Text(HTMLParser):
    """Markdown-ish text of <div class="content container">."""
    BLOCK = {'p', 'div', 'ul', 'ol', 'table', 'tr', 'pre'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0; self.out = []; self.href = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if not self.depth:
            if tag == 'div' and a.get('class') == 'content container': self.depth = 1
            return
        if tag == 'div': self.depth += 1
        if tag in self.BLOCK: self.out.append('\n')
        elif re.fullmatch(r'h[1-6]', tag): self.out.append('\n\n' + '#' * int(tag[1]) + ' ')
        elif tag == 'li': self.out.append('\n- ')
        elif tag == 'br': self.out.append('\n')
        elif tag == 'time': self.out.append('\n')
        elif tag == 'a': self.href = a.get('href'); self.out.append('[')
        elif tag == 'code': self.out.append('`')

    def handle_endtag(self, tag):
        if not self.depth: return
        if tag == 'div':
            self.depth -= 1
            return
        if tag == 'a' and self.href is not None:
            self.out.append(f']({self.href})'); self.href = None
        elif tag == 'code': self.out.append('`')
        elif re.fullmatch(r'h[1-6]', tag) or tag in self.BLOCK: self.out.append('\n')

    def handle_data(self, data):
        if self.depth: self.out.append(re.sub(r'\s+', ' ', data))

    def text(self):
        t = re.sub(r'[ \t]+\n', '\n', ''.join(self.out))
        return re.sub(r'\n{3,}', '\n\n', t).strip() + '\n'


def page_date(raw, slug):
    m = re.search(r'class=["\']?post-date["\']?>([^<]+)<', raw)
    if m:
        try: return datetime.strptime(html.unescape(m.group(1)).strip(), '%A, %B %d, %Y').date().isoformat()
        except ValueError: pass
    m = re.match(r'(\d{4}-\d{2}-\d{2})', slug)
    return m.group(1) if m else None


def slug_of(url):
    return re.sub(r'\.html?$', '', url.rstrip('/').rsplit('/', 1)[-1]) or 'index'


def targets():
    sitemap = get(BASE + 'sitemap.xml')
    out = []
    for url in re.findall(r'<loc>([^<]+)</loc>', sitemap):
        m = re.match(re.escape(BASE) + r'(simulator|viewer)/([^/]+)\.html$', url)
        if m and m.group(2) != 'default': out.append((m.group(1), url))
    if EXTRA.exists():
        for line in EXTRA.read_text(encoding='utf8').splitlines():
            line = line.split('#', 1)[0].strip()
            if line:
                ch, url = line.split(None, 1)
                if ch not in CHANNELS: sys.exit(f'extra-urls.txt: unknown channel {ch!r}')
                out.append((ch, url.strip()))
    return out


def fetch(args):
    meta = load_json(DIR / 'pages.json', {})
    new = 0
    for ch, url in targets():
        slug = slug_of(url)
        path = DIR / ch / f'{slug}.md'
        if path.exists() and not args.refetch: continue
        raw = get(url)
        p = Text(); p.feed(raw)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(p.text(), encoding='utf8', newline='\n')
        meta[f'{ch}/{slug}'] = {'url': url, 'date': page_date(raw, slug)}
        new += 1
        print(f'fetched {ch}/{slug}')
    save_json(DIR / 'pages.json', dict(sorted(meta.items())))
    print(f'{new} page(s) fetched')
    index(args)


def lsl_names():
    defs = yaml.safe_load((ROOT / 'data/sources/lsl_definitions.yaml').read_text(encoding='utf8'))
    names = {}
    for section in ('functions', 'events', 'constants'):
        for name, entry in (defs.get(section) or {}).items():
            if not (entry or {}).get('private'): names[name] = section
    return names


def index(args=None):
    meta = load_json(DIR / 'pages.json', {})
    known = lsl_names()
    # Events named by an ordinary word (control, timer, sensor) only count as `name(` or `name event`.
    plain = {n for n, k in known.items() if k == 'events' and re.fullmatch(r'[a-z]+', n)}
    alts = sorted(map(re.escape, set(known) - plain), key=len, reverse=True)
    alts += [re.escape(n) + r'(?=\s*\(|\s+events?\b)' for n in sorted(plain)]
    word = re.compile(r'\b(' + '|'.join(alts) + r')\b')
    # Unknown names count only as ll* or with the first word of a defined constant (PRIM_, OBJECT_).
    prefixes = {n.split('_')[0] for n, k in known.items() if k == 'constants' and '_' in n}
    looks_lsl = lambda n: n.startswith('ll') or n.split('_')[0] in prefixes
    pages = []
    for key, m in meta.items():
        ch, slug = key.split('/', 1)
        text = (DIR / ch / f'{slug}.md').read_text(encoding='utf8')
        found = sorted(set(word.findall(text)))
        unknown = sorted({n for n in LSL_LIKE.findall(text) if n not in known and n not in NOT_LSL and looks_lsl(n)})
        pages.append({'channel': ch, 'slug': slug, 'date': m['date'], 'url': m['url'],
                      'sha256': hashlib.sha256(text.encode()).hexdigest(), 'lsl': found, 'unknown': unknown})
    pages.sort(key=lambda p: (p['channel'], p['date'] or '', p['slug']))
    save_json(INDEX, pages)
    report = {}
    for p in pages:
        for n in p['lsl']:
            r = report.setdefault(n, {'kind': known[n], 'first': {}, 'pages': []})
            r['first'].setdefault(p['channel'], {'date': p['date'], 'page': f"{p['channel']}/{p['slug']}"})
            r['pages'].append(f"{p['channel']}/{p['slug']}")
    save_json(REPORT, {'note': 'First release-notes mention per LSL name. A mention may be a fix or a known issue, not the release; check the page.',
                       'names': dict(sorted(report.items()))})
    print(f'indexed {len(pages)} page(s); {len(report)} LSL name(s) mentioned')


def channels(arg):
    return CHANNELS if arg == 'all' else (arg,)


def review(args):
    pages, marks = load_json(INDEX, []), load_json(REVIEW, {})
    for ch in channels(args.channel):
        mark = marks.get(ch, {})
        since = [p for p in pages if p['channel'] == ch and (p['date'] or '', p['slug']) > (mark.get('date') or '', mark.get('slug') or '')]
        print(f"== {ch}: last reviewed {mark.get('slug', 'never')} ({mark.get('reviewedOn', '-')}); {len(since)} newer page(s)")
        for p in since:
            hits = ', '.join(p['lsl'] + [f'?{n}' for n in p['unknown']])
            scripting = hits or ('scripting keywords' if re.search(r'\b(LSL|script|SLua|Luau)', (DIR / ch / f"{p['slug']}.md").read_text(encoding='utf8'), re.I) else '')
            print(f"  {p['date']}  {p['slug']:<28} {scripting}")
            if args.verbose and scripting:
                for line in (DIR / ch / f"{p['slug']}.md").read_text(encoding='utf8').splitlines():
                    if re.search(r'\b(LSL|script|SLua|Luau|ll[A-Z]\w+|[A-Z]+_[A-Z_]{2,})', line): print('      ' + line.strip())


def mark_reviewed(args):
    pages, marks = load_json(INDEX, []), load_json(REVIEW, {})
    for ch in channels(args.channel):
        mine = [p for p in pages if p['channel'] == ch]
        if args.through: mine = [p for p in mine if p['slug'] == args.through]
        if not mine: sys.exit(f'no {ch} page {args.through or ""}')
        p = mine[-1]
        marks[ch] = {'slug': p['slug'], 'date': p['date'], 'reviewedOn': datetime.now().date().isoformat()}
        print(f"{ch}: reviewed through {p['slug']}")
    save_json(REVIEW, marks)


def load_json(path, default):
    return json.loads(path.read_text(encoding='utf8')) if path.exists() else default


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n', encoding='utf8', newline='\n')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    f = sub.add_parser('fetch'); f.add_argument('--refetch', action='store_true'); f.set_defaults(fn=fetch)
    sub.add_parser('index').set_defaults(fn=index)
    r = sub.add_parser('review'); r.add_argument('--channel', default='simulator', choices=CHANNELS + ('all',))
    r.add_argument('-v', '--verbose', action='store_true'); r.set_defaults(fn=review)
    m = sub.add_parser('mark-reviewed'); m.add_argument('--channel', default='simulator', choices=CHANNELS + ('all',))
    m.add_argument('--through'); m.set_defaults(fn=mark_reviewed)
    args = ap.parse_args(); args.fn(args)


if __name__ == '__main__':
    main()
