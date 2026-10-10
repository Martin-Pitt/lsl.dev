"""Hand-edited rule-list orders (src/data/rule-groups/, see docs/editing-api-pages.md).

Every public member of a group with an order must be listed exactly once, and each page that
passes an order to <ConstantGroup> must name the matching group. Loads the TypeScript through
`bun`, so it needs bun on PATH.
"""
import json
import re
import shutil
import subprocess
import unittest
from collections import Counter

from feature_mdx import ROOT

DUMP = ("import { ruleGroupOrders, getterGroups } from './src/data/rule-groups/index.ts'; "
        "console.log(JSON.stringify({ orders: ruleGroupOrders, getters: [...getterGroups] }));")
DOCS = ROOT / 'src/content/docs'
# <ConstantGroup name="X" order={y} ...>, as written in the MDX.
USE = re.compile(r'<ConstantGroup\s+name="(\w+)"\s+order=\{(\w+)\}([^>]*)/>')
IMPORT = re.compile(r"import \{([^}]+)\} from '~/data/rule-groups/[\w-]+';")
# Pages that read the group in getter notation.
GETTER_PAGES = {
    'llGetObjectDetails', 'llGetParcelDetails', 'llGetEnvironment', 'llParcelMediaQuery',
    'llGetPrimMediaParams', 'llGetLinkMedia', 'llGetLinkPrimitiveParams', 'llGetPrimitiveParams',
}


def rules(sections):
    return [r if isinstance(r, str) else r['rule'] for s in sections for r in s['rules']]


class RuleGroupTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        out = subprocess.run([shutil.which('bun') or 'bun', '-e', DUMP], cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True)
        data = json.loads(out.stdout)
        cls.orders, cls.getters = data['orders'], set(data['getters'])
        catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf-8'))
        cls.members = {}
        for c in catalog['constants']:
            for g in c.get('groups') or []:
                cls.members.setdefault(g, []).append(c['name'])

    def test_every_public_member_exactly_once(self):
        for group, sections in self.orders.items():
            with self.subTest(group=group):
                listed = Counter(rules(sections))
                self.assertEqual({n for n, k in listed.items() if k > 1}, set(), 'listed twice')
                self.assertEqual(set(self.members.get(group, [])) - set(listed), set(), 'missing')
                self.assertEqual(set(listed) - set(self.members.get(group, [])), set(), 'not in the group')

    def test_section_ids_are_unique_slugs(self):
        for group, sections in self.orders.items():
            ids = [s['id'] for s in sections]
            self.assertEqual(len(ids), len(set(ids)), group)
            for s in sections:
                slug = re.sub(r'[^a-z0-9 -]', '', s['title'].lower()).replace(' ', '-')
                self.assertEqual(s['id'], slug, f'{group}: {s["title"]}')

    def test_converted_groups(self):
        for group in ('ParticleParam', 'GLTFOverride', 'PrimMediaParam', 'ObjectDetailsParam', 'ParcelDetailsParam',
                      'CameraParam', 'RezParam', 'CharacterParam', 'HTTPRequestParam', 'GroundTextureParam',
                      'EnvironmentParam', 'EnvironmentParamReadOnly', 'ParcelMediaCommand', 'ParcelMediaQuery'):
            self.assertIn(group, self.orders)
        self.assertTrue({'ObjectDetailsParam', 'ParcelDetailsParam', 'EnvironmentParamReadOnly', 'ParcelMediaQuery'} <= self.getters)

    def test_pages_pass_the_matching_order(self):
        exported = {}
        for f in (ROOT / 'src/data/rule-groups').glob('*.ts'):
            for name in re.findall(r'export const (\w+)', f.read_text(encoding='utf-8')):
                exported[name] = f.stem
        index = (ROOT / 'src/data/rule-groups/index.ts').read_text(encoding='utf-8')
        order_var = dict(re.findall(r'(\w+): (\w+),', index))
        seen = 0
        for page in DOCS.rglob('*.mdx'):
            text = page.read_text(encoding='utf-8')
            for group, var, rest in USE.findall(text):
                seen += 1
                with self.subTest(page=page.stem, group=group):
                    self.assertIn(var, exported)
                    self.assertTrue(any(var in m for m in IMPORT.findall(text)), 'order not imported')
                    get = 'mode="get"' in rest
                    self.assertEqual(get, page.stem in GETTER_PAGES)
                    # The page's order is the group's registered order, or the getter variant of it.
                    self.assertIn(var, {order_var.get(group), order_var.get(group + 'ReadOnly')} - {None})
        self.assertGreater(seen, 20)


if __name__ == '__main__':
    unittest.main()
