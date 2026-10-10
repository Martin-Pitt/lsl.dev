#!/usr/bin/env python3
"""Create the hand-editable MDX page of every public function, event and constant.

Pages live in src/content/docs/{functions,events,constants}/<name>.mdx and belong to humans
once they exist. This script:

  * creates pages that are missing (new APIs), converted from the local wiki export;
  * NEVER overwrites an existing page, unless it is named with --force NAME;
  * reports drift between the pages and the data: APIs with no page, pages whose API is no
    longer public (removed or deprecated), and APIs whose YAML signature or wiki revision
    changed since their page was generated. Signatures, parameters, return types, sleep,
    energy and permissions are rendered from the data by <LSLFunction> and friends, so a
    YAML sync updates them on every page without touching the prose.

State: src/data/mdx-pages.json records, per page, the signature and wiki revision it was
generated from. The drift report is printed and written to data/reports/mdx-drift.json.

Options:
  --check         create nothing; exit 1 if any API lacks a page or any page has no public API
  --force NAME    regenerate one page (repeatable), replacing its file
  --accept NAME   mark a drifted page as reviewed: record the current signature/revision (repeatable;
                  --accept all accepts every drifted page)
  --only NAME     generate only the named missing page(s) (repeatable)
  --refresh-sources  rewrite only the `source:` frontmatter block of existing pages from the catalog
                  (provenance: live URL, every wiki source with its revision, license line); the rest
                  of the frontmatter and the body stay byte-for-byte as they are
  --skip NAME     with --refresh-sources: leave the named page(s) alone (repeatable)
  --root PATH     project root (tests)
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.mdx_convert import Converter, fence, esc  # noqa: E402
from lib.desc_review import classify, compare_param, plain  # noqa: E402
from lib.wiki_fields import templates  # noqa: E402

PLURAL = {'function': 'functions', 'event': 'events', 'constant': 'constants'}
COMPONENT = {'function': 'LSLFunction', 'event': 'LSLEvent', 'constant': 'LSLConstant'}
PROSE_IDS = {'overview', 'wiki-description', 'return-value-notes', 'function-notes', 'event-notes', 'constant-notes', 'function-guidance', 'function-details'}
SEE_ALSO = {'see-also-functions': 'Functions', 'see-also-events': 'Events', 'see-also-constants': 'Constants', 'see-also-articles': 'Articles'}
PLACEHOLDER = {'integer': '0', 'float': '0.0', 'string': '""', 'key': 'NULL_KEY', 'vector': 'ZERO_VECTOR', 'rotation': 'ZERO_ROTATION', 'quaternion': 'ZERO_ROTATION', 'list': '[]'}
IMPORT = "import { %s } from '~/components/lsl';"


def page_path(root: Path, entry) -> Path:
    return root / 'src/content/docs' / PLURAL[entry['kind']] / f"{entry['name']}.mdx"


def fingerprint(entry) -> str:
    """What the page was written against: the signature and parameter names."""
    return entry['signature'] + ' | ' + ', '.join(p['name'] for p in entry['parameters'])


def usage(entry) -> str | None:
    params = entry['parameters']
    if entry['kind'] == 'function':
        call = f"{entry['name']}({', '.join(PLACEHOLDER.get(p['type'], p['name']) for p in params)});"
        return f"{entry['returnType']} result = {call}" if entry['returnType'] not in ('', 'void') else call
    if entry['kind'] == 'event':
        return f"{entry['name']}({', '.join(p['type'] + ' ' + p['name'] for p in params)})\n{{\n\t\n}}"
    return None


def yaml_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def license_line(sources) -> str:
    """'Content from the Second Life Wiki articles A (revision 1, 2024-01-31), B (...) and C (...), CC BY-SA 3.0.'"""
    parts = [f"{s['title']} (revision {s['revisionId']}, {s['timestamp'][:10]})" for s in sources]
    names = parts[0] if len(parts) == 1 else ', '.join(parts[:-1]) + ' and ' + parts[-1]
    return f"Content from the Second Life Wiki article{'s' if len(parts) > 1 else ''} {names}, CC BY-SA 3.0."


SOURCE_KEYS = ('wiki', 'url', 'revision', 'date', 'contributor', 'license', 'sources', 'redirectFrom', 'raw')


def source_lines(src) -> list[str]:
    """The generated `source:` frontmatter block. `url` is the live article (with the anchor of a
    wrapper page's target); `revision` is that article's revision; `date` is the newest of all
    `sources` (the article plus every transcluded page and template the importer used)."""
    sources = src.get('sources') or [{'title': src['title'], 'revisionId': src['revisionId'], 'timestamp': src.get('timestamp') or ''}]
    lines = ['source:',
             f"  wiki: {yaml_str(src['title'])}",
             f"  url: {src['url']}",
             f"  revision: {src['revisionId']}",
             f"  date: {(src.get('updated') or src.get('timestamp') or '')[:10]}",
             f"  contributor: {yaml_str(src.get('contributor') or '')}",
             f"  license: {yaml_str(license_line(sources))}",
             '  sources:']
    lines += [f"    - {{ wiki: {yaml_str(s['title'])}, revision: {s['revisionId']}, date: {s['timestamp'][:10]} }}" for s in sources]
    via = src.get('redirectFrom')
    if via:
        lines.append(f"  redirectFrom: {{ wiki: {yaml_str(via['title'])}, revision: {via['revisionId']}, date: {via['timestamp'][:10]} }}")
    return lines


def frontmatter(entry) -> str:
    lines = ['---', f"title: {yaml_str(entry['name'])}", f"slug: {yaml_str(PLURAL[entry['kind']] + '/' + entry['name'])}", f"category: {PLURAL[entry['kind']]}"]
    w = entry.get('wiki')
    if w: lines += source_lines(w['source'])
    lines.append('---')
    return '\n'.join(lines)


def refresh_source(text: str, entry) -> str | None:
    """`text` with its frontmatter `source:` block regenerated, or None when there is nothing to do.

    Only the lines of the `source:` block change. Other frontmatter keys, keys inside `source:`
    that the generator does not own, and the whole body are kept exactly as they are."""
    w = entry.get('wiki')
    m = re.match(r'---\n(.*?\n)---(\n|$)', text, re.S)
    if not w or not m: return None
    fm = m[1].split('\n')[:-1]
    start = next((i for i, l in enumerate(fm) if l.rstrip() == 'source:'), None)
    if start is None: return None
    end = start + 1
    while end < len(fm) and (fm[end].startswith(' ') or not fm[end].strip()): end += 1
    kept, own = [], False
    for line in fm[start + 1:end]:
        k = re.match(r'  (\w+):', line)
        if k: own = k[1] in SOURCE_KEYS
        if not own: kept.append(line)
    new = fm[:start] + source_lines(w['source']) + kept + fm[end:]
    out = '---\n' + '\n'.join(new) + '\n' + text[m.end(1):]
    return None if out == text else out


GROUPS_WITH_MEMBERS: set = set()


def param_groups(entry) -> list[str]:
    """Rule-list groups taken by the entry's arguments that have public members to show."""
    return [p['param-semantics'] for p in entry['parameters'] if p.get('param-semantics') in GROUPS_WITH_MEMBERS]


HELPER = re.compile(r'<p id="[^"]*"><a href="([^"]+)">([^<]+)</a></p>(?:<details>.*?<code>(.*?)</code></pre></details>)?', re.S)


def shared_helpers(html: str) -> str:
    """The wiki injects caveats and issue notes through shared templates whose logic is not evaluated.
    Issue templates become a list of issues; other helpers are linked, not dumped as source."""
    from html import unescape
    issues, others = [], []
    for href, title, src in HELPER.findall(html):
        src = unescape(src or '')
        m = re.fullmatch(r'\{\{Issues\|([^|}]+)\|(.*?)((?:\|[a-z]+=[^|}]*)*)\}\}', src.strip(), re.S)
        if m:
            text = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', lambda w: w[1], m[2])
            fixed = '<del>' in text or 'status=vfix' in m[3] or 'status=fixed' in m[3]
            text = re.sub(r'</?del>', '', text).strip()
            kind = re.search(r'type=([a-z]+)', m[3])
            line = f"- {m[1]}{' (' + kind[1] + ')' if kind else ''}: {esc(text)}"
            issues.append(line + (' *(fixed)*' if fixed else ''))
        else:
            others.append(f'[{esc(title)}]({LINKER(href) if LINKER else href})')
    parts = []
    if issues: parts.append('## Known issues\n\nFrom the issue templates included by the wiki article:\n\n' + '\n'.join(issues))
    if others: parts.append(('' if issues else '## Shared wiki templates\n\n') + 'The wiki article also includes shared templates whose conditional content is not reproduced here: ' + ', '.join(others) + '.')
    return '\n\n'.join(parts)


def archive_linker(catalog):
    """API pages never send readers to the /wiki/ archive (its templates are only partly rendered):
    an archive link goes to our own page for the same subject, else to the live wiki article."""
    apis = {e['name'].casefold(): f"/{PLURAL[e['kind']]}/{e['name']}/" for p in PLURAL.values() for e in catalog[p]}
    cats = {c['label'].casefold(): f"/categories/{c['id']}/" for c in catalog['categories']}
    cats.update({c['id'].replace('_', ' ').casefold(): f"/categories/{c['id']}/" for c in catalog['categories']})
    by_slug = {}
    for w in catalog['wiki']:
        title = w['title']
        local = apis.get(title.casefold())
        m = re.match(r'Category:LSL (.+)$', title)
        if not local and m: local = cats.get(m[1].casefold())
        by_slug[w['slug']] = local or w['source']['url']

    def link(href: str) -> str:
        m = re.match(r'^/wiki/([^/#]+)/?(#.*)?$', href)
        if not m or m[1] not in by_slug: return href
        target = by_slug[m[1]]
        return target + (m[2] or '') if target.startswith('/') else target
    return link


LINKER = None


COMMON: frozenset = frozenset()
DESCRIPTION_STATS = {'a': 0, 'b': 0, 'c': 0, 'd': 0}
REVIEW: list = []
APIS: dict = {}
SHAPES: dict = {}
ROOT_DIR = Path('.')


def param_review(entry):
    """Compare each YAML parameter description with the wiki's p<n>_desc of the same position."""
    w = entry.get('wiki')
    if not w or w.get('sharedWith') or not entry['parameters']: return []
    raw = ROOT_DIR / 'data/derived/wiki-source' / (w['slug'] + '.txt')
    if not raw.exists(): return []
    text = raw.read_text(encoding='utf8')
    head = next((t for t in templates(text) if t['name'] in ('LSL Function', 'LSL Event')), None)
    if not head: return []
    out = []
    for i, p in enumerate(entry['parameters'], 1):
        wiki = head['fields'].get(f'p{i}_desc', {}).get('value', '')
        if '{{' in wiki: continue  # templated text is not comparable
        cls, reason = compare_param(p.get('description', ''), re.sub(r"'''?|\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", lambda m: m[1] or '', wiki))
        out.append({'name': p['name'], 'class': cls, 'reason': reason, 'yaml': p.get('description', ''), 'wiki': plain(wiki)})
    return out


def tag_outdated(lead: list[str], defn: str):
    """Mark the wiki sentence that disagrees with the definitions (status word, or a number the
    definitions do not use) with "(per the wiki; see note)". Returns the lead and the tagged sentence."""
    from lib.desc_review import STATUS, NUM, numbers
    dn = numbers(defn)
    for i, para in enumerate(lead):
        m = STATUS.search(para)
        if not m:
            m = next((x for x in NUM.finditer(para) if x[0] not in dn and not para[max(0, x.start() - 2):x.start()].endswith('](')), None)
        if not m: continue
        end = re.search(r'[.!?](?=\s|$)', para[m.end():])
        cut = m.end() + end.start() if end else len(para)
        start = max(para.rfind('. ', 0, m.start()) + 2, 0) if para.rfind('. ', 0, m.start()) >= 0 else 0
        lead = lead[:i] + [para[:cut] + ' (per the wiki; see note)' + para[cut:]] + lead[i + 1:]
        return lead, plain(para[start:cut + 1])
    return lead, ''


def write_description_review(root: Path):
    c = DESCRIPTION_STATS
    L = ['# Description review', '',
         "Written by `scripts/generate-mdx.py` for the pages it created in its last run. Each page's definitions",
         'description was compared with the wiki lead prose (heuristic: numbers, API names, status words; see',
         '`scripts/lib/desc_review.py`).', '',
         f"- (a) equivalent, wiki prose shown: {c['a']}",
         f"- (b) definitions add a fact, wiki prose plus an \"Updated\" note: {c['b']}",
         f"- (c) conflict, full wiki prose kept, the outdated sentence tagged \"(per the wiki; see note)\" and the definitions text quoted in an \"Updated\" note: {c['c']}",
         f"- thin wiki lead (shorter than the definitions text), definitions text shown first as the base: {c.get('thin', 0)}",
         f"- (d) one side only: {c['d']}", '']
    def cell(s): return s.replace('|', '\\|').replace('\n', ' ')
    for k, title in (('c', 'Conflicts (c)'), ('b', 'Definitions add something (b)')):
        rows = [r for r in REVIEW if r['class'] == k]
        L += [f'## {title}: {len(rows)}', '', '| Page | Reason | Definitions | Wiki lead | Shown |', '| --- | --- | --- | --- | --- |']
        for r in rows:
            shown = ('wiki prose, ' + (f"tagged: {r['tagged']}" if r.get('tagged') else 'no sentence tagged') + '; Updated note quotes the definitions') if k == 'c' else 'wiki prose + Updated: ' + ' '.join(r['extra'])
            L.append(f"| {r['page']} | {cell(r['reason'])} | {cell(r['definitions'])} | {cell(r['wiki'][:400])} | {cell(shown)} |")
        L.append('')
    prow = [(r['page'], p) for r in REVIEW for p in r['params']]
    L += [f'## Parameter descriptions that differ: {len(prow)}', '',
          'c: numbers differ (shown in a "Wiki differs" aside on the page). w: the wiki text has numbers the definitions lack (not shown; review).', '',
          '| Page | Parameter | Class | Definitions | Wiki |', '| --- | --- | --- | --- | --- |']
    for page, p in prow: L.append(f"| {page} | {p['name']} | {p['class']} | {cell(p['yaml'])} | {cell(p['wiki'])} |")
    path = root / 'data/reports/description-review.md'
    path.write_bytes(('\n'.join(L) + '\n').encode('utf8'))
PARAM_LOG: dict = {}


def common_words(catalog, wiki, threshold=8):
    """Parameter names that are ordinary words: they occur as plain prose on at least `threshold`
    API pages where they are not a parameter of that page. Those are only marked in clear context."""
    import html as H
    names = {p['name'] for plural in PLURAL.values() for e in catalog[plural] for p in e['parameters']}
    own = {e['name']: {p['name'] for p in e['parameters']} for plural in PLURAL.values() for e in catalog[plural]}
    pages = {}
    for api, w in wiki.items():
        text = ' '.join(re.sub(r'<pre.*?</pre>|<code>.*?</code>|<[^>]+>', ' ', s['html'], flags=re.S) for s in w['sections'])
        for word in set(re.findall(r'[A-Za-z_][A-Za-z0-9_]*', H.unescape(text))) & names:
            if word not in own.get(api, ()): pages[word] = pages.get(word, 0) + 1
    return frozenset(w for w, n in pages.items() if n >= threshold)


def render_page(entry, sections) -> str:
    conv = Converter(focus=entry['name'], link=LINKER).set_apis(APIS, SHAPES)
    # Shared articles describe another function's signature: no parameter marking there.
    if not (entry.get('wiki') or {}).get('sharedWith'):
        conv.set_params([p['name'] for p in entry['parameters']], COMMON)
    used = {COMPONENT[entry['kind']], 'WikiSource'}
    prose = [s for s in sections if s['id'] in PROSE_IDS]
    rest = [s for s in sections if s['id'] not in PROSE_IDS]
    lead = [t for t in (conv.convert(s['html']) for s in prose) if t]
    # One description in the body. The definitions may be newer than the wiki, so the two are
    # compared first (lib/desc_review.py): (a) equivalent -> wiki prose only; (b) the definitions
    # add a fact -> wiki prose plus the definitions' sentence(s) in an "Updated" note; (c) conflict
    # -> the definitions' text leads and the wiki prose is kept, marked, in a caution aside;
    # (d) only one side -> that side.
    page_text = ' '.join(re.sub(r'<[^>]+>', ' ', s['html']) for s in sections)
    cls, reason, extra = classify(entry['description'], '\n'.join(lead), page_text)
    params = param_review(entry)
    DESCRIPTION_STATS[cls] += 1
    REVIEW.append({'page': f"{PLURAL[entry['kind']]}/{entry['name']}", 'class': cls, 'reason': reason, 'definitions': entry['description'],
                   'wiki': plain('\n'.join(lead)), 'extra': extra, 'params': [p for p in params if p['class'] in ('c', 'w')]})
    # Never less information than either source: the wiki prose always stays. A thin wiki lead
    # (shorter than the definitions text) gets the definitions text shown first, as the base.
    thin = bool(lead) and len(plain('\n'.join(lead))) < len(entry['description'])
    if thin: DESCRIPTION_STATS['thin'] = DESCRIPTION_STATS.get('thin', 0) + 1
    flag = ' description' if (not lead or thin) else ''
    body = [f"<{COMPONENT[entry['kind']]} name=\"{entry['name']}\"{flag} />"]
    if cls == 'b' and extra and not thin:
        # The definitions' extra fact, in their exact words, as a further sentence of the lead.
        lead = [lead[0] + ' ' + esc(' '.join(extra)), *lead[1:]]
    if cls == 'c':
        lead, tagged = tag_outdated(lead, entry['description'])
        REVIEW[-1]['tagged'] = tagged
    body += lead
    if cls == 'c':
        body.append(':::note[Updated]\nThe LSL definitions say: ' + esc(entry['description'].replace('\n', ' ')) + '\n:::')
    conflicts = [p for p in params if p['class'] == 'c']
    if conflicts:
        rows = '\n'.join(f"- **{esc(p['name'])}**: {esc(p['wiki'])}" for p in conflicts)
        body.append(f':::caution[Wiki differs]\nThe wiki describes these parameters differently from the signature above:\n\n{rows}\n:::')
    snippet = usage(entry)
    if snippet: body.append(fence(snippet, 'lsl', 'title="How to use" frame="terminal"'))
    groups = param_groups(entry)
    spec = next((s for s in rest if s['id'] == 'specification'), None)
    if groups or spec:
        part = ['## Specification']
        for g in groups:
            used.add('ConstantGroup'); part.append(f'<ConstantGroup name="{g}" />')
        if spec:
            text = conv.convert(spec['html']).replace(') in the wiki archive.', ') on the wiki.')
            if text: part.append(text)
        body.append('\n\n'.join(part))
    see_also = []
    for s in rest:
        if s['id'] == 'specification': continue
        if s['id'] in SEE_ALSO:
            text = conv.convert(s['html'])
            if text: see_also.append(f"### {SEE_ALSO[s['id']]}\n\n{text}")
            continue
        if s['id'] == 'shared-wiki-helpers':
            text = shared_helpers(s['html'])
            if text: body.append(text)
            continue
        text = conv.examples(s['html']) if s['id'] in ('examples',) else conv.convert(s['html'])
        if text: body.append(f"## {esc(s['title'])}\n\n{text}")
    if see_also: body.append('## See also\n\n' + '\n\n'.join(see_also))
    if not entry.get('wiki'):
        body.append(':::note[Documentation]\nThis entry is documented in the LSL definitions. No matching wiki article is present in this local collection. Its inclusion here does not establish availability on every simulator.\n:::')
    body.append('<WikiSource />')
    imports = IMPORT % ', '.join(sorted(used, key=['LSLFunction', 'LSLEvent', 'LSLConstant', 'ConstantGroup', 'WikiSource'].index))
    DESCRIPTION_STATS['inline'] = DESCRIPTION_STATS.get('inline', 0) + conv.inline_code
    if conv.refs: PARAM_LOG[f"{PLURAL[entry['kind']]}/{entry['name']}"] = conv.refs
    return frontmatter(entry) + '\n' + imports + '\n\n' + '\n\n'.join(body) + '\n', conv.stats


def write_param_report(root: Path):
    """Review list of the parameter references marked (or left alone) in the pages just generated."""
    counts = {k: sum(1 for refs in PARAM_LOG.values() for r in refs if r[0] == k) for k in ('marked', 'normalised', 'ambiguous')}
    lines = ['# Parameter references in generated pages', '',
             'Written by `scripts/generate-mdx.py` for the pages it created in its last run. Parameter names of a',
             "page's own signature are bold. *normalised*: the wiki already marked the name (code, bold or italic).",
             '*marked*: a bare occurrence of a distinctive name, or a common word in clear context ("the X parameter").',
             '*ambiguous*: a common word left unformatted; check these by hand.', '',
             f"Totals: {counts['marked']} marked, {counts['normalised']} normalised, {counts['ambiguous']} ambiguous (left unformatted), on {len(PARAM_LOG)} pages.", '',
             'Common words (marked only in clear context): ' + ', '.join(f'`{w}`' for w in sorted(COMMON)), '']
    for page in sorted(PARAM_LOG):
        refs = [r for r in PARAM_LOG[page] if r[0] != 'normalised']
        norm = sorted({r[1] for r in PARAM_LOG[page] if r[0] == 'normalised'})
        lines.append(f'## {page}'); lines.append('')
        if norm: lines.append('- normalised: ' + ', '.join(f'`{n}`' for n in norm))
        for kind, name, snip in refs: lines.append(f'- {kind} `{name}`: {snip}')
        lines.append('')
    path = root / 'data/reports/param-refs.md'; path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes('\n'.join(lines).encode('utf8'))
    print(f"  parameter references: {counts['marked']} marked, {counts['normalised']} normalised, {counts['ambiguous']} ambiguous; see data/reports/param-refs.md")


def load(root: Path):
    catalog = json.loads((root / 'src/data/catalog.json').read_text(encoding='utf8'))
    wiki = json.loads((root / 'data/derived/api-wiki.json').read_text(encoding='utf8'))
    return catalog, wiki


def existing_pages(root: Path) -> dict[str, Path]:
    out = {}
    for plural in PLURAL.values():
        for p in sorted((root / 'src/content/docs' / plural).glob('*.mdx')):
            out[f"{plural}/{p.stem}"] = p
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--force', action='append', default=[], metavar='NAME')
    ap.add_argument('--accept', action='append', default=[], metavar='NAME')
    ap.add_argument('--only', action='append', default=[], metavar='NAME')
    ap.add_argument('--refresh-sources', action='store_true')
    ap.add_argument('--skip', action='append', default=[], metavar='NAME')
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = ap.parse_args(argv)
    root = args.root
    global ROOT_DIR
    ROOT_DIR = root
    catalog, wiki = load(root)
    global LINKER
    LINKER = archive_linker(catalog)
    global COMMON
    COMMON = common_words(catalog, wiki)
    APIS.update({e['name']: f"/{PLURAL[e['kind']]}/{e['name']}/" for p in PLURAL.values() for e in catalog[p]})
    # Argument shapes of rule constants, from the definitions' `values` (REZ_POS -> vector pos, ...).
    SHAPES.update({c['name']: ', '.join(f"{'integer' if v.get('value-type') == 'boolean' else v.get('value-type', '')} {v['name']}".strip() for v in c['definition']['values'])
                   for c in catalog['constants'] if c['definition'].get('values')})
    GROUPS_WITH_MEMBERS.update(g for c in catalog['constants'] for g in c.get('groups', []))
    entries = [e for plural in PLURAL.values() for e in catalog[plural]]
    by_name = {e['name']: e for e in entries}
    for name in args.force:
        if name not in by_name: ap.error(f'--force {name}: not a public function, event or constant')
    if args.refresh_sources:
        changed = []
        for e in entries:
            path = page_path(root, e)
            if e['name'] in args.skip or not path.exists(): continue
            text = path.read_bytes().decode('utf8')
            out = refresh_source(text, e)
            if out is not None:
                path.write_bytes(out.encode('utf8')); changed.append(f"{PLURAL[e['kind']]}/{e['name']}")
        print(f"source frontmatter refreshed on {len(changed)} pages")
        return 0
    state_path = root / 'src/data/mdx-pages.json'
    state = json.loads(state_path.read_text(encoding='utf8')) if state_path.exists() else {}
    pages = existing_pages(root)
    created, forced, stats = [], [], {'htmlTables': 0, 'markdownTables': 0}
    missing = []
    for e in entries:
        path = page_path(root, e)
        key = f"{PLURAL[e['kind']]}/{e['name']}"
        force = e['name'] in args.force
        if path.exists() and not force: continue
        if args.check or (args.only and e['name'] not in args.only and not force):
            missing.append(key); continue
        text, st = render_page(e, wiki.get(e['name'], {}).get('sections', []))
        for k in stats: stats[k] += st[k]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(text.encode('utf8'))
        (forced if force else created).append(key)
        pages[key] = path
        state[key] = {'signature': fingerprint(e), 'wikiRevision': (e.get('wiki') or {}).get('source', {}).get('revisionId')}
    public = {f"{PLURAL[e['kind']]}/{e['name']}" for e in entries}
    orphans = sorted(k for k in pages if k not in public)
    drift = []
    accept_all = 'all' in args.accept
    for e in entries:
        key = f"{PLURAL[e['kind']]}/{e['name']}"
        if key not in pages or key in missing: continue
        now = {'signature': fingerprint(e), 'wikiRevision': (e.get('wiki') or {}).get('source', {}).get('revisionId')}
        was = state.get(key)
        if was is None or was == now:
            state[key] = now if was is None else was
            continue
        if accept_all or e['name'] in args.accept:
            state[key] = now; continue
        drift.append({'page': key, **{f'{k}Was': was.get(k) for k in now if was.get(k) != now[k]}, **{k: now[k] for k in now if was.get(k) != now[k]}})
    for k in list(state):
        if k not in pages: del state[k]
    report = {'pages': len([k for k in pages if k in public]), 'created': created, 'forced': forced,
              'missing': missing, 'orphaned': orphans, 'drift': drift}
    if not args.check:
        state_path.write_bytes((json.dumps(dict(sorted(state.items())), indent=1, ensure_ascii=False) + '\n').encode('utf8'))
        rp = root / 'data/reports/mdx-drift.json'; rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_bytes((json.dumps({k: v for k, v in report.items() if k not in ('created', 'forced')}, indent=1, ensure_ascii=False) + '\n').encode('utf8'))
    print(f"MDX pages: {report['pages']} public API pages; created {len(created)}, forced {len(forced)}.")
    if created or forced:
        print(f"  tables converted: {stats['markdownTables']} Markdown, {stats['htmlTables']} HTML")
        write_param_report(root)
        write_description_review(root)
        print(f"  inline LSL added to plain prose (code fragments, API names, rule shapes): {DESCRIPTION_STATS.get('inline', 0)}")
        print(f"  descriptions: (a) {DESCRIPTION_STATS['a']} equivalent, (b) {DESCRIPTION_STATS['b']} definitions add, (c) {DESCRIPTION_STATS['c']} conflict, (d) {DESCRIPTION_STATS['d']} one side; see data/reports/description-review.md")
    for label, items in (('missing (no page yet)', missing), ('orphaned (no public API; move or delete by hand)', orphans)):
        if items: print(f"  {label}: {len(items)}\n    " + '\n    '.join(items[:50]))
    if drift:
        print(f"  drift since generation (review the prose, then --accept NAME): {len(drift)}")
        for d in drift[:50]:
            print('    ' + d['page'] + ': ' + '; '.join(f"{k}: {d.get(k + 'Was')!r} -> {d[k]!r}" for k in ('signature', 'wikiRevision') if k in d))
    if args.check and (missing or orphans): return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
