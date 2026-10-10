"""Primary feature of each API page (breadcrumb middle crumb and current sidebar entry).

Runs the same code as the site (src/lib/primary-feature-rules.mjs) through
scripts/primary-features.mjs, so it needs `node` on PATH.
"""
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from feature_mdx import ROOT, load_features

SCRIPT = ROOT / 'scripts/primary-features.mjs'
REPORT = ROOT / 'data/reports/primary-features.md'


def run_json(overrides=None):
    args = ['node', str(SCRIPT), '--json'] + ([str(overrides)] if overrides else [])
    out = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(out.stdout)


class PrimaryFeatureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf-8'))
        cls.ids = {f['id'] for f in load_features()}
        cls.choices = run_json()

    def test_deterministic_across_runs(self):
        self.assertEqual(run_json(), self.choices)

    def test_independent_of_feature_order(self):
        # choosePrimary sorts candidates with a total order (tier, category, size, id), so the
        # order the features are supplied in must not matter.
        probe = """
import { loadFeatures } from './scripts/feature-index.mjs';
import { featureScore, choosePrimary } from './src/lib/primary-feature-rules.mjs';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const cat = JSON.parse(readFileSync('src/data/catalog.json', 'utf-8'));
const dir = 'src/content/docs/features/';
const scores = loadFeatures().map(f => featureScore(f, readFileSync(dir + f.id + '.mdx', 'utf-8'),
  existsSync(dir + f.id) ? readdirSync(dir + f.id).filter(s => s.endsWith('.mdx')).sort().map(s => readFileSync(dir + f.id + '/' + s, 'utf-8')) : []));
const rev = [...scores].reverse();
const bad = [...cat.functions, ...cat.events, ...cat.constants].filter(e => choosePrimary(e, scores).feature !== choosePrimary(e, rev).feature).map(e => e.name);
process.stdout.write(JSON.stringify(bad));
"""
        out = subprocess.run(['node', '--input-type=module', '-e', probe], cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True)
        self.assertEqual(json.loads(out.stdout), [])

    def test_overrides_take_precedence(self):
        self.assertEqual(self.choices['llDamage']['feature'], 'combat')
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'overrides.json'
            path.write_text(json.dumps({'overrides': {'llDamage': 'linkset', 'llListen': 'no-such-feature'}}), encoding='utf-8')
            got = run_json(path)
        self.assertEqual(got['llDamage']['feature'], 'linkset')
        self.assertEqual(got['llDamage']['reason'], 'override')
        # An override naming a feature that does not exist is ignored, not a broken link.
        self.assertEqual(got['llListen']['feature'], self.choices['llListen']['feature'])

    def test_site_overrides_name_real_features(self):
        data = json.loads((ROOT / 'src/data/primary-feature-overrides.json').read_text(encoding='utf-8'))
        for name, fid in data['overrides'].items():
            self.assertIn(name, self.choices, f'override for unknown API {name}')
            self.assertIn(fid, self.ids, f'override {name} -> unknown feature {fid}')

    def test_every_public_api_has_a_feature_or_documented_fallback(self):
        names = [e['name'] for k in ('functions', 'events', 'constants') for e in self.catalog[k]]
        self.assertEqual(sorted(self.choices), sorted(names))
        report = REPORT.read_text(encoding='utf-8')
        no_feature = report.split('## No primary feature', 1)[1].split('\n## ', 1)[0]
        for name, c in self.choices.items():
            if c['feature']:
                self.assertIn(c['feature'], self.ids, name)
            else:
                self.assertIn(f'| {name} |', no_feature, f'{name} has no primary feature and is not listed in the report')

    def test_report_is_up_to_date(self):
        out = subprocess.run(['node', str(SCRIPT), '--check'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(out.returncode, 0, out.stderr)

    def test_known_choices(self):
        expected = {'llDamage': 'combat', 'DAMAGE_TYPE_FIRE': 'combat', 'llListen': 'communications', 'llSay': 'communications'}
        self.assertEqual({n: self.choices[n]['feature'] for n in expected}, expected)


if __name__ == '__main__':
    unittest.main()
