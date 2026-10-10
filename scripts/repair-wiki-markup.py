#!/usr/bin/env python3
"""Remove leaked MediaWiki markup from existing API pages, rewriting only the affected sections.

Pages under src/content/docs/{functions,events,constants} are hand-editable, so they are not
regenerated. Instead, for each page this script compares the page with a freshly generated copy
(scripts/generate-mdx.py run into a scratch --fresh root, with the current renderer):

- "## Additional wiki content" is deleted. Its readable text, if any, reaches the page only through
  the fresh copy's extracted items below, and only when the page does not already say it.
- Another section (or the lead) that contains wiki markup is replaced by the fresh section of the
  same title when every clean block of the old section is also in the fresh one (so no edit is
  lost). Otherwise only the blocks with wiki markup are removed.
- Wiki text the generator extracted (caveats/notes trapped in {{#vardefine}}, known issues from
  {{Issues/...}}; listed as EXTRACTED in the fresh run's report) is merged into the page's section
  of that title when the page does not already contain it (normalised near-match).

Frontmatter, imports and every unaffected section stay byte-for-byte. Everything dropped, skipped
or extracted is logged in data/reports/dropped-wiki-markup.md.

Usage: python scripts/repair-wiki-markup.py --fresh SCRATCH_ROOT [--dry-run] [--skip NAME ...]
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.wiki_cleanup import DroppedLog, blocks, is_duplicate, merge_section, norm, novel, strip_leaks, units  # noqa: E402
from lib.wiki_leaks import leaks  # noqa: E402

PLURALS = ('functions', 'events', 'constants')
HEAD = re.compile(r'\A(---\n.*?\n---\n(?:import [^\n]*\n)*)', re.S)


def split(body: str):
    """[(title or None for the lead, text including its heading line)] by `## ` headings."""
    parts = re.split(r'(?m)^(?=## )', body)
    out = []
    for p in parts:
        m = re.match(r'## ([^\n]*)', p)
        out.append((m[1].strip() if m else None, p))
    return out


def extracted_items(report: Path) -> dict[str, list[tuple[str, str]]]:
    """page -> [(section title, collapsed snippet)] of the EXTRACTED entries in a generator report."""
    out = {}
    if not report.exists(): return out
    page = None
    for line in report.read_text(encoding='utf8').split('\n'):
        if line.startswith('## '): page = line[3:].strip(); continue
        m = re.match(r'- (.*?) \| EXTRACTED and added to the page: (`+) (.*) \2$', line)
        if m and page: out.setdefault(page, []).append((m[1], m[3]))
    return out


def report_entries(report: Path) -> dict[str, list[tuple[str, str, str]]]:
    """page -> [(where, reason, snippet)] of every entry in a dropped-wiki-markup report."""
    out = {}
    if not report.exists(): return out
    page = None
    for line in report.read_text(encoding='utf8').split('\n'):
        if line.startswith('## '): page = line[3:].strip(); continue
        m = re.match(r'- (.*?) \| (.*?): (`+) (.*) \3$', line)
        if m and page: out.setdefault(page, []).append((m[1], m[2], m[4]))
    return out


def fresh_block(fresh_body: str, title: str, snippet: str) -> str | None:
    """The block of the fresh page's `title` section whose collapsed text matches the snippet."""
    want = snippet.removesuffix(' …')
    for t, text in split(fresh_body):
        if t != title: continue
        for b in blocks(text):
            if re.sub(r'\s+', ' ', b).strip().startswith(want): return b
    return None


LEAKY_FRAGMENT = re.compile(r'&lt;ref\b[^>\n]*>.*?&lt;/ref>|`+[^`]*(?:\{\{|\[\[|#var|#if)[^`]*`+|\\?\{\\?\{.*?\\?\}\\?\}|&lt;[^>\n]*>|\'\'+')


def patch(section: str, fresh_body: str, log: DroppedLog, page: str, where: str, summary) -> str:
    """Replace each block with wiki markup by the most similar clean block of the fresh page
    (the same text rendered by the current converter); blocks without a counterpart are dropped."""
    candidates = [b for b in blocks(fresh_body) if not leaks(b) and not b.startswith('## ')]
    # Content inside HTML table cells is indented, not a top-level block: offer its lines too.
    candidates += [l.strip() for l in fresh_body.split('\n') if l.startswith(('\t', ' ')) and l.strip() and not l.strip().startswith('<')]
    fresh_defs = {m[1]: m[0] for m in re.finditer(r'^\[\^([^\]]+)\]:.*$', fresh_body, re.M)}
    lines = section.split('\n'); out = []; last = 0; defs = []
    from lib.wiki_cleanup import spans
    import difflib
    for a, b in spans(section):
        block = '\n'.join(lines[a:b])
        if not leaks(block) or block.startswith('## '): continue
        # Compare without the leaked fragments, and also with their words (a block that is only a
        # leaked template call, e.g. `{{KBtip|text}}`, still matches its rendered aside).
        targets = [t for t in (norm(LEAKY_FRAGMENT.sub(' ', block)), norm(block)) if len(t) > 15]
        best, score = None, 0.0
        for c in candidates:
            nc = norm(c)
            for target in targets:
                if not nc or abs(len(nc) - len(target)) > max(len(nc), len(target)) * 0.6 + 20: continue
                r = difflib.SequenceMatcher(None, target, nc).ratio()
                if r > score: best, score = c, r
        if best is not None and score >= 0.75:
            indent = re.match(r'[ \t]*', lines[a])[0]
            best_in_place = '\n'.join(indent + l if l else l for l in best.split('\n')) if indent and not best.startswith((' ', '\t')) else best
            out.append('\n'.join(lines[last:a])); out.append(best_in_place); last = b
            summary['patched'].append((where, re.sub(r'\s+', ' ', block)[:160], re.sub(r'\s+', ' ', best)[:160]))
            defs += [fresh_defs[r] for r in re.findall(r'\[\^([^\]]+)\](?!:)', best) if r in fresh_defs and fresh_defs[r] not in section]
    out.append('\n'.join(lines[last:]))
    patched = '\n'.join(out).rstrip('\n')
    if defs: patched += '\n\n' + '\n'.join(dict.fromkeys(defs))
    return strip_leaks(patched, log, page, where)


def components(text: str) -> set[str]:
    return set(re.findall(r'<([A-Z][A-Za-z]+)\b', text))


def body_of(text: str | None) -> str:
    m = HEAD.match(text) if text else None
    return text[m.end():] if m else (text or '')


def repair(page: str, text: str, fresh: str | None, extracted, log: DroppedLog, baseline: str | None = None):
    """New text of the page and a summary dict, or (None, summary) when nothing changes.

    `baseline` is the page as the previous generator produced it: a section identical to its
    baseline section has no human edits, so it may be replaced by the fresh section outright."""
    head_m = HEAD.match(text)
    head, body = (head_m[1], text[head_m.end():]) if head_m else ('', text)
    fbody = body_of(fresh)
    fresh_sections = {t: s for t, s in split(fbody)}
    base_sections = {t: s for t, s in split(body_of(baseline))} if baseline else {}
    imported = {n.strip() for m in re.finditer(r'^import \{([^}]*)\}', head, re.M) for n in m[1].split(',')}
    summary = {'deleted': [], 'replaced': [], 'patched': [], 'stripped': [], 'extracted': [], 'skipped_duplicates': 0}
    out = []
    for title, section in split(body):
        if not leaks(section): out.append(section); continue
        where = f'## {title}' if title else 'lead'
        if title == 'Additional wiki content':
            log.add(page, where, 'section deleted (raw wiki template logic)', section.split('\n', 2)[-1])
            summary['deleted'].append(title); continue
        new = fresh_sections.get(title)
        if new is not None and not leaks(new):
            untouched = base_sections.get(title, '').rstrip() == section.rstrip()
            clean_old = [b for b in blocks(strip_leaks(section)) if not b.startswith('## ')]
            fresh_units = units(new)
            # Otherwise exact (normalised) match only: a small human wording fix must not be reverted.
            lost = [] if untouched else [b for b in clean_old if not is_duplicate(b, new, fresh_units, ratio=1.0)]
            # The page's imports stay as they are: component lines it does not import are left out.
            new = re.sub(r'(?m)^<([A-Z][A-Za-z]+)\b[^\n]*/>\n*', lambda m: m[0] if m[1] in imported else '', new)
            if not lost and components(new) <= imported:
                trail = re.search(r'\n*\Z', section)[0]
                out.append(new.rstrip('\n') + (trail if trail else '\n\n'))
                summary['replaced'].append(where); continue
        stripped = patch(section, fbody, log, page, where, summary)
        if title and not stripped.startswith('## '): stripped = f'## {title}\n\n' + stripped
        if re.fullmatch(r'## [^\n]*\s*', stripped):
            log.add(page, where, 'section removed: nothing left after dropping wiki markup', section.split('\n', 1)[-1]); continue
        out.append(stripped.rstrip('\n') + '\n\n')
        summary['stripped'].append(where)
    new_body = ''.join(out)
    # Extracted wiki text, where the page does not already say it.
    for title, snippet in extracted:
        block = fresh_block(fbody, title, snippet)
        if block is None: continue
        footnotes = re.findall(r'\[\^([^\]]+)\]', block)
        defs = [d for t, s in split(fbody) if t == title for d in blocks(s) if re.match(r'^\[\^(' + '|'.join(map(re.escape, footnotes)) + r')\]:', d)] if footnotes else []
        add = novel([block] + defs, new_body, log, page, title)
        if add:
            new_body = merge_section(new_body.rstrip('\n') + '\n', title, add)
            summary['extracted'].append((title, re.sub(r'\s+', ' ', block).strip()))
            log.add(page, title, 'EXTRACTED and added to the page', block)
        else:
            summary['skipped_duplicates'] += 1
    new_body = re.sub(r'\n{3,}', '\n\n', new_body)
    if not new_body.endswith('\n'): new_body += '\n'
    result = head + new_body
    return (None if result == text else result), summary


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--fresh', type=Path, required=True, help='root of a scratch generate-mdx.py run')
    ap.add_argument('--baseline', type=Path, help='root of a scratch run of the previous generator (git archive of the last commit): '
                    'sections identical to it have no human edits and are replaced whole')
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument('--skip', action='append', default=[], metavar='NAME')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--summary', type=Path, help='write the per-page summary as JSON here')
    args = ap.parse_args(argv)
    extracted = extracted_items(args.fresh / 'data/reports/dropped-wiki-markup.md')
    fresh_log = report_entries(args.fresh / 'data/reports/dropped-wiki-markup.md')
    log = DroppedLog(); summaries = {}; skipped_leaky = []
    for plural in PLURALS:
        for path in sorted((args.root / 'src/content/docs' / plural).glob('*.mdx')):
            page = f'{plural}/{path.stem}'
            text = path.read_bytes().decode('utf8')
            if '\r\n' in text: print(f'  {page}: CRLF line endings, skipped'); continue
            if not leaks(text) and page not in extracted: continue
            if path.stem in args.skip:
                if leaks(text): skipped_leaky.append(page)
                continue
            fpath = args.fresh / 'src/content/docs' / plural / path.name
            fresh = fpath.read_text(encoding='utf8') if fpath.exists() else None
            bpath = args.baseline / 'src/content/docs' / plural / path.name if args.baseline else None
            baseline = bpath.read_text(encoding='utf8') if bpath and bpath.exists() else None
            new, summary = repair(page, text, fresh, extracted.get(page, []), log, baseline)
            if new is None: continue
            assert HEAD.match(new)[1] == HEAD.match(text)[1], page  # frontmatter and imports untouched
            summaries[page] = summary
            # What the generator left out of the sections that were replaced by its fresh version.
            rewritten = set(summary['replaced']) | {w for w, _, _ in summary['patched']}
            for where, reason, snippet in fresh_log.get(page, []):
                if where in rewritten and not reason.lower().startswith(('extracted', 'too short')):
                    log.add(page, where, reason + ' (regenerated section)', snippet)
            if not args.dry_run: path.write_bytes(new.encode('utf8'))
    if not args.dry_run:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import importlib.util
        spec = importlib.util.spec_from_file_location('generate_mdx', Path(__file__).resolve().parent / 'generate-mdx.py')
        gen = importlib.util.module_from_spec(spec); spec.loader.exec_module(gen)
        log.write(args.root / 'data/reports/dropped-wiki-markup.md', gen.DROPPED_HEADER)
    if args.summary: args.summary.write_text(json.dumps(summaries, indent=1, ensure_ascii=False), encoding='utf8')
    count = lambda k: sum(1 for s in summaries.values() if s[k])
    print(f'pages changed: {len(summaries)}; Additional sections deleted: {count("deleted")}; sections replaced by the fresh version on '
          f'{count("replaced")} pages; wiki markup blocks removed on {count("stripped")} pages; extracted text added on {count("extracted")} pages')
    if skipped_leaky: print('  skipped (asked), still containing wiki markup: ' + ', '.join(skipped_leaky))
    return 0


if __name__ == '__main__':
    sys.exit(main())
