"""Check that the MDX feature pages kept everything the old src/data/feature-clusters.json had.

Compares each page in src/content/docs/features/ with the snapshot of the JSON taken before the
conversion (scripts/lib/fixtures/feature-clusters-pre-mdx.json). Nothing may be lost; adding is fine:
- every API the old page listed is still linked (by a component or a prose link),
- every constant group, see-also target (as a <SeeAlso> item or a prose link) and Planned entry is kept,
- the title, related features and home categories are unchanged, and nothing links a retired slug,
- no feature page links the local /wiki/ archive; every wiki page the old JSON linked is replaced by
  content on the page (LOCAL_REPLACEMENTS) or a link to the live Second Life Wiki page.
Section prose was rewritten into linked concept text, so paragraphs are not compared word for word.
Exit status 1 on any loss. Local files only.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
from feature_mdx import ROOT, load_features  # noqa: E402


# Wiki pages whose content is now on the feature or one of its sub-pages: (feature, wiki title) -> text that must appear.
LOCAL_REPLACEMENTS = {
    ('combat', 'Combat Log'): '/features/combat/combat-log/',  # sub-page rendered from the local wiki source
    ('combat', 'Damage Types'): '/features/combat/damage-types/',  # sub-page rendered from the two local templates
    ('combat', 'Category:LSL Combat2'): 'page="Category:LSL_Combat2"',  # <Attribution> of the adapted page
}


# Feature pages added after the conversion (lsl.dev additions beyond slua.dev's set).
ADDED_FEATURES = {'inventory'}
# Home categories moved to an added feature: category -> (old home, new home).
MOVED_CATEGORIES = {
    'prim_inventory': ('prims', 'inventory'),
    'avatar_inventory': ('avatar', 'inventory'),
}


def href_for(item, wiki_slugs):
    ref = item.split('|', 1)[0]
    if ref.startswith('/'):
        return ref
    kind, _, target = ref.partition(':')
    return {'feature': f'/features/{target}/', 'category': f'/categories/{target}/',
            'wiki': f"/wiki/{wiki_slugs.get(target, '?' + target)}/"}[kind]


def old_link(link):
    for kind in ('feature', 'category', 'wiki'):
        if kind in link:
            return f'{kind}:{link[kind]}'
    return link['href']


def main():
    before = json.loads((ROOT / 'scripts/lib/fixtures/feature-clusters-pre-mdx.json').read_text(encoding='utf-8'))
    catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf-8'))
    wiki_slugs = {w['title']: w['slug'] for w in catalog['wiki']}
    wiki_urls = {w['title']: w['source']['url'] for w in catalog['wiki']}
    after = {f['id']: f for f in load_features()}
    problems, rows = [], []
    if sorted([f['id'] for f in before['features']] + sorted(ADDED_FEATURES)) != sorted(after):
        problems.append('feature ids differ')
    for old in before['features']:
        new = after.get(old['id'])
        if new is None:
            problems.append(f"{old['id']}: page missing")
            continue

        def lost(what, olds, news):
            gone = [x for x in olds if x not in news]
            if gone:
                problems.append(f"{old['id']}: lost {what}: {gone}")

        def same(what, a, b):
            if a != b:
                problems.append(f"{old['id']}: {what} differs: {a} vs {b}")

        same('title', old['title'], new['title'])
        same('related', old.get('related', []), new['related'])
        expected_cats = [c for c in old['categories'] if MOVED_CATEGORIES.get(c, (None,))[0] != old['id']]
        same('categories', expected_cats, new['categories'])
        links = [l for s in old['sections'] for l in s.get('links', [])]
        new_hrefs = {href_for(i, wiki_slugs) for i in new['links']} | {h.split('#')[0] for h in new['hrefs']}
        if '](/wiki/' in new['body'] or '"/wiki/' in new['body']:
            problems.append(f"{old['id']}: links the local /wiki/ archive")
        def wiki_kept(title):
            url = wiki_urls.get(title, '?')
            local = LOCAL_REPLACEMENTS.get((old['id'], title))
            return (f'wiki:{title}' in [i.split('|')[0] for i in new['links']] or title in new['archive']
                    or url in new['body'] or (local is not None and local in new['body']))
        old_items = [old_link(l) for l in links if 'planned' not in l]
        lost('see-also links', [href_for(i, wiki_slugs) for i in old_items if not i.startswith('wiki:')], new_hrefs)
        lost('wiki links (need a live link or local replacement)',
             [i[5:] for i in old_items if i.startswith('wiki:')] + old.get('wiki', []),
             {t for t in wiki_urls if wiki_kept(t)})
        lost('planned entries', [l['planned'] for l in links if 'planned' in l], new['planned'])
        apis_before = {i for s in old['sections'] for i in s.get('items', [])}
        groups_before = {g for s in old['sections'] for g in s.get('groups', [])}
        lost('APIs', sorted(apis_before), set(new['items']))
        lost('constant groups', sorted(groups_before), set(new['groups']))
        rows.append((old['id'], len(apis_before), len(set(new['items'])), apis_before <= set(new['items'])))
    # Retired slugs are no longer redirected (the site was never deployed); nothing may link to them.
    retired = sorted(set(before['redirects']) - ADDED_FEATURES)  # an added feature may reuse a retired slug
    for c, (_, home) in MOVED_CATEGORIES.items():
        if c not in after[home]['categories']:
            problems.append(f"{home}: missing moved category {c}")
    for f in after.values():
        for old in retired:
            if f'/features/{old}/' in f['body'] or f'feature:{old}"' in f['body']:
                problems.append(f"{f['id']}: links retired slug {old}")
    for fid, a, b, ok in rows:
        print(f"{fid:20} APIs before {a:4}  after {b:4}  {'all kept' if ok else 'LOST SOME'}")
    print(f"{len(rows)} features; API links before {sum(r[1] for r in rows)}, after {sum(r[2] for r in rows)}; "
          f"retired slugs (no redirects, unlinked): {len(retired)}")
    for p in problems:
        print('PROBLEM', p)
    print('OK: nothing lost' if not problems else f'{len(problems)} problem(s)')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
