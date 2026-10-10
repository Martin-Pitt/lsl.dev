"""Feature pages: src/content/docs/features/*.mdx drive /features/, the Features sidebar,
category homes and the feature chips on API pages."""
import json
import re
import unittest

from feature_mdx import ROOT, compat_index, load_features


class FeaturePageTests(unittest.TestCase):
    # slua.dev src/content/docs/features/: slug -> title, in sidebar (slug) order.
    SLUA_FEATURES = [
        ('animesh', 'Animesh'), ('avatar', 'Avatars'), ('camera', 'Camera'), ('combat', 'Combat'),
        ('communications', 'Communications'), ('data-storage', 'Data Storage'),
        ('data-transmission', 'Data Transmission'), ('dialog', 'Dialog'), ('effects', 'Effects'),
        ('environments', 'Environments'), ('events', 'Events'), ('experience', 'Experience'),
        ('input', 'Input'), ('land', 'Parcels & Regions'), ('linkset', 'Linksets'), ('math', 'Math'),
        ('money', 'Money'), ('movement', 'Movement'), ('pathfinding', 'Pathfinding'), ('physics', 'Physics'),
        ('prims', 'Prims'), ('sound', 'Sound'), ('textures', 'Textures & Materials'),
    ]
    # lsl.dev additions beyond slua.dev's set, slotted in alphabetically (slug order).
    LSL_DEV_FEATURES = [('inventory', 'Inventory'), ('viewer-uris', 'Viewer URIs')]
    OLD_CLUSTERS = ['combat', 'avatars', 'input', 'communication', 'experiences', 'objects', 'appearance',
                    'physics', 'pathfinding', 'land', 'data', 'http', 'inventory', 'money', 'effects', 'sound',
                    'script', 'math', 'text', 'sensing']
    # In the YAML only, not claimed as deployed (see test_wiki_mapping_normalises_titles).
    UNASSIGNED_OK = {'llFindNotecardTextCount'}

    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf-8'))
        cls.features = load_features()
        cls.ids = [f['id'] for f in cls.features]
        cls.items = {i for f in cls.features for i in f['items']}
        cls.groups = {g for f in cls.features for g in f['groups']}

    def test_slugs_titles_and_order_match_slua(self):
        expected = sorted(self.SLUA_FEATURES + self.LSL_DEV_FEATURES)
        self.assertEqual([(f['id'], f['title']) for f in self.features], expected)
        # The slua.dev features alone keep slua.dev's order.
        slua = [(f['id'], f['title']) for f in self.features if (f['id'], f['title']) in self.SLUA_FEATURES]
        self.assertEqual(slua, self.SLUA_FEATURES)

    def test_every_category_has_exactly_one_home_feature(self):
        assigned = [c for f in self.features for c in f['categories']]
        self.assertEqual(sorted(assigned), sorted(c['id'] for c in self.catalog['categories']))

    def test_items_are_public_api_names(self):
        names = {e['name'] for k in ('functions', 'events', 'constants') for e in self.catalog[k]}
        for f in self.features:
            for item in f['items']:
                self.assertIn(item, names, f"{f['id']}: {item}")

    def test_groups_have_public_constants(self):
        public = {g for c in self.catalog['constants'] for g in (c.get('groups') or [])}
        for g in self.groups:
            self.assertIn(g, public)

    def test_every_function_and_event_is_assigned(self):
        missing = sorted(e['name'] for k in ('functions', 'events') for e in self.catalog[k]
                         if e['name'] not in self.items and e['name'] not in self.UNASSIGNED_OK)
        self.assertEqual(missing, [])

    def test_every_constant_group_is_assigned(self):
        public = {g for c in self.catalog['constants'] for g in (c.get('groups') or [])}
        self.assertEqual(sorted(public - self.groups), [])

    def test_feature_pages_do_not_list_yaml_only_functions(self):
        self.assertNotIn('llFindNotecardTextCount', self.items)

    def test_links_resolve(self):
        titles = {w['title'] for w in self.catalog['wiki']}
        cats = {c['id'] for c in self.catalog['categories']}
        for f in self.features:
            for t in f['archive']:
                self.assertIn(t, titles)
            for r in f['related']:
                self.assertIn(r, self.ids)
            for p in f['planned']:
                self.assertTrue(p.strip(), f['id'])
            for item in f['links']:
                ref = item.split('|', 1)[0]
                kind, _, target = ref.partition(':')
                if kind == 'wiki': self.assertIn(target, titles, item)
                elif kind == 'category': self.assertIn(target, cats, item)
                elif kind == 'feature': self.assertIn(target, self.ids, item)
                else: self.assertTrue(ref.startswith('/'), item)

    def test_prose_links_are_local_routes(self):
        """Prose links point at real API, feature and category routes (other paths are checked by test:links)."""
        names = {e['name'] for k in ('functions', 'events', 'constants') for e in self.catalog[k]}
        cats = {c['id'] for c in self.catalog['categories']}
        for f in self.features:
            for h in f['hrefs']:
                parts = h.split('#')[0].strip('/').split('/')
                if parts[0] == 'features' and len(parts) > 1: self.assertIn(parts[1], self.ids, f"{f['id']}: {h}")
                if parts[0] == 'categories' and len(parts) > 1: self.assertIn(parts[1], cats, f"{f['id']}: {h}")
                if parts[0] in ('functions', 'events', 'constants') and len(parts) == 2 and parts[1] != 'groups':
                    self.assertIn(parts[1], names, f"{f['id']}: {h}")
                self.assertTrue(h.split('#')[0].endswith('/'), f"{f['id']}: link without trailing slash: {h}")

    def test_retired_slugs_are_gone(self):
        """Nothing is deployed yet, so retired feature slugs are not redirected; nothing may link to them."""
        for old in self.OLD_CLUSTERS:
            if old in self.ids:
                continue
            for f in self.features:
                for route, body in f['pages']:
                    self.assertNotIn(f'/features/{old}/', body, route)
                    self.assertNotIn(f'feature:{old}"', body, route)
            self.assertFalse((ROOT / f'src/content/docs/features/{old}.mdx').exists(), old)
        for f in self.features:
            self.assertNotIn('redirectFrom:', f['pages'][0][1], f['id'])

    def test_page_structure(self):
        """Framing intro, two-column top, signatures and footer (docs/style/feature-pages.md)."""
        for f in self.features:
            body = f['pages'][0][1]
            for part in ('<Columns>', '<Column>', '<Box ', '<Signatures', '<FeatureFooter'):
                self.assertIn(part, body, f"{f['id']}: missing {part}")
            intro = body.split('<Columns>')[0]
            prose = [b for b in intro.split('\n\n') if b.strip() and not b.lstrip().startswith(('import ', '<', '{/*'))]
            self.assertTrue(1 <= len(prose) <= 5, f"{f['id']}: intro has {len(prose)} paragraphs")

    def test_no_links_to_local_wiki_archive(self):
        """The archive's templates are only partly rendered, so feature pages link the live wiki or local pages."""
        for f in self.features:
            for route, body in f['pages']:
                self.assertNotRegex(body, r'''(\]\(|href=["'])/wiki/''', route)

    @staticmethod
    def heading_ids(body):
        """Ids of every heading on the page: Markdown headings (github-slugger style), <Box> h2s and footer h2s."""
        def gh(text):
            text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text).strip().lower()
            return re.sub(r'\s', '-', re.sub(r'[^\w\s-]', '', text))
        def box(text):
            return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))
        code_free = re.sub(r'```[\s\S]*?```', '', body)
        ids = [gh(m.group(1)) for m in re.finditer(r'^#{2,6} (.+)$', code_free, re.M)]
        for m in re.finditer(r'<Box\b([^>]*)>', code_free):
            explicit = re.search(r'\bid="([^"]+)"', m.group(1))
            ids.append(explicit.group(1) if explicit else box(re.search(r'\btitle="([^"]+)"', m.group(1)).group(1)))
        footer = re.search(r'<FeatureFooter\b([\s\S]*?)/>', code_free)
        if footer:
            for prop, fid in (('related', 'related-features'), ('categories', 'categories'), ('archive', 'background')):
                if re.search(rf'\b{prop}=\{{\[\s*"', footer.group(1)):
                    ids.append(fid)
        return ids

    def test_heading_ids_are_unique(self):
        for f in self.features:
            for route, body in f['pages']:
                ids = self.heading_ids(body)
                dupes = sorted({i for i in ids if ids.count(i) > 1})
                self.assertEqual(dupes, [], f"{route}: duplicate heading ids")

    def test_anchors_resolve(self):
        """#anchors within a page, and /features/<id>/[<topic>/]#anchor links between feature pages, exist."""
        pages = {route: set(self.heading_ids(body)) for f in self.features for route, body in f['pages']}
        for f in self.features:
            for route, body in f['pages']:
                for anchor in re.findall(r'''(?:\]\(|href=")#([^)"]+)''', body):
                    self.assertIn(anchor, pages[route], f"{route}: #{anchor}")
                for target, anchor in re.findall(r'''(?:\]\(|href=")(/features/[^)"#]*)(?:#([^)"]*))?''', body):
                    self.assertIn(target, pages, f"{route}: link to missing feature page {target}")
                    if anchor:
                        self.assertIn(anchor, pages[target], f"{route}: {target}#{anchor}")

    def category_members(self):
        public = {e['name'] for k in ('functions', 'events', 'constants') for e in self.catalog[k]}
        return {c['id']: [n for k in ('functions', 'events', 'constants') for n in c[k] if n in public]
                for c in self.catalog['categories']}

    def test_no_category_page_with_fewer_than_two_members(self):
        """Single-member categories link straight to the member (src/lib/category-members.mjs); with a
        build present, they have no /categories/<id>/ page and every category page lists 2+ members."""
        members = self.category_members()
        self.assertEqual([c for c, m in members.items() if not m], [], 'categories without public members')
        dist = ROOT / 'dist/categories'
        if not dist.exists():
            self.skipTest('no build in dist/')
        for cid, m in members.items():
            page = dist / cid / 'index.html'
            if len(m) < 2:
                self.assertFalse(page.exists(), f'/categories/{cid}/ should not be built; link {m} directly')
                continue
            if page.exists():
                html = page.read_text(encoding='utf-8')
                linked = {n for n in m if f'>{n}<' in html}
                self.assertGreaterEqual(len(linked), 2, f'/categories/{cid}/ lists {sorted(linked)}')

    def test_generated_index_is_current(self):
        """src/data/feature-clusters.json is generated; rerun `node scripts/feature-index.mjs` after editing pages."""
        data = json.loads((ROOT / 'src/data/feature-clusters.json').read_text(encoding='utf-8'))
        data.pop('$comment', None)
        self.assertEqual(data, compat_index(self.features))


if __name__ == '__main__':
    unittest.main()
