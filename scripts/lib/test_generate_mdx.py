"""Tests for scripts/generate-mdx.py (page ownership, drift report) and lib/mdx_convert.py."""
import importlib.util, io, json, shutil, tempfile, unittest
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('generate_mdx', ROOT / 'scripts/generate-mdx.py')
gen = importlib.util.module_from_spec(spec); spec.loader.exec_module(gen)
from lib.mdx_convert import Converter  # noqa: E402


def entry(name, kind='function', params=(('integer', 'a'),), ret='void'):
    ps = [{'name': n, 'type': t, 'description': ''} for t, n in params]
    sig = (ret + ' ' if ret != 'void' else '') + f"{name}({', '.join(t + ' ' + n for t, n in params)})"
    return {'name': name, 'kind': kind, 'description': f'Does {name} things.', 'signature': sig, 'returnType': ret, 'parameters': ps, 'categories': [], 'definition': {},
            'wiki': {'slug': name.lower(), 'title': name, 'rawPath': f'/wiki-source/{name.lower()}.txt',
                     'source': {'title': name, 'url': f'https://wiki.secondlife.com/wiki/{name}', 'revisionId': '1', 'timestamp': '2024-01-01T00:00:00Z', 'contributor': 'X'}}}


class GeneratorTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.catalog = {'functions': [entry('llFoo'), entry('llBar')], 'events': [], 'constants': [], 'categories': [], 'wiki': []}
        self.wiki = {'llFoo': {'kind': 'function', 'title': 'LlFoo', 'sections': [
            {'id': 'wiki-description', 'title': 'Wiki description', 'html': '<div class="wiki-line">Does <code>foo</code> {things}.</div>'},
            {'id': 'caveats', 'title': 'Caveats', 'html': '<ul><li>One</li><li>Two</li></ul>'}]}}
        self.write()

    def write(self):
        (self.root / 'src/data').mkdir(parents=True, exist_ok=True)
        (self.root / 'data/derived').mkdir(parents=True, exist_ok=True)
        (self.root / 'src/data/catalog.json').write_text(json.dumps(self.catalog), encoding='utf8')
        (self.root / 'data/derived/api-wiki.json').write_text(json.dumps(self.wiki), encoding='utf8')

    def run_gen(self, *args):
        out = io.StringIO()
        with redirect_stdout(out): code = gen.main(['--root', str(self.root), *args])
        report = json.loads((self.root / 'data/reports/mdx-drift.json').read_text(encoding='utf8')) if (self.root / 'data/reports/mdx-drift.json').exists() else None
        return code, out.getvalue(), report

    def page(self, name, plural='functions'): return self.root / 'src/content/docs' / plural / f'{name}.mdx'

    def test_creates_missing_pages_with_frontmatter_component_and_markdown(self):
        code, out, _ = self.run_gen()
        self.assertEqual(code, 0)
        text = self.page('llFoo').read_text(encoding='utf8')
        self.assertIn('slug: "functions/llFoo"', text)
        self.assertIn('revision: 1', text)
        self.assertIn('<LSLFunction name="llFoo" />', text)
        self.assertIn('Does `foo` \\{things\\}.', text)
        self.assertIn('## Caveats\n\n- One\n- Two', text)
        self.assertIn('<WikiSource />', text)
        self.assertTrue(self.page('llBar').exists())

    def test_never_overwrites_an_existing_page(self):
        self.run_gen()
        self.page('llFoo').write_text('hand edited', encoding='utf8')
        self.run_gen()
        self.assertEqual(self.page('llFoo').read_text(encoding='utf8'), 'hand edited')

    def test_force_replaces_only_the_named_page(self):
        self.run_gen()
        for n in ('llFoo', 'llBar'): self.page(n).write_text('hand edited', encoding='utf8')
        self.run_gen('--force', 'llFoo')
        self.assertIn('<LSLFunction', self.page('llFoo').read_text(encoding='utf8'))
        self.assertEqual(self.page('llBar').read_text(encoding='utf8'), 'hand edited')

    def test_force_rejects_unknown_names(self):
        with self.assertRaises(SystemExit), redirect_stdout(io.StringIO()), unittest.mock.patch('sys.stderr', io.StringIO()):
            gen.main(['--root', str(self.root), '--force', 'llNope'])

    def test_reports_signature_drift_until_accepted_without_touching_the_page(self):
        self.run_gen()
        self.page('llFoo').write_text('hand edited', encoding='utf8')
        self.catalog['functions'][0] = entry('llFoo', params=(('integer', 'a'), ('string', 'b')))
        self.write()
        code, out, report = self.run_gen()
        self.assertEqual(code, 0)
        self.assertEqual([d['page'] for d in report['drift']], ['functions/llFoo'])
        self.assertIn('string b', report['drift'][0]['signature'])
        self.assertIn('drift since generation', out)
        self.assertEqual(self.page('llFoo').read_text(encoding='utf8'), 'hand edited')
        self.run_gen('--accept', 'llFoo')
        _, _, report = self.run_gen()
        self.assertEqual(report['drift'], [])

    def test_check_reports_new_and_removed_apis_and_fails(self):
        self.run_gen()
        self.catalog['functions'] = [entry('llFoo'), entry('llNew')]  # llBar removed, llNew added
        self.write()
        code, out, _ = self.run_gen('--check')
        self.assertEqual(code, 1)
        self.assertIn('functions/llNew', out)
        self.assertIn('functions/llBar', out)
        self.assertFalse(self.page('llNew').exists())
        self.assertTrue(self.page('llBar').exists(), 'orphaned pages are reported, never deleted')

    def test_check_passes_when_pages_match(self):
        self.run_gen()
        self.assertEqual(self.run_gen('--check')[0], 0)


import unittest.mock  # noqa: E402


class ConverterTests(unittest.TestCase):
    def test_simple_table_becomes_markdown(self):
        md = Converter().convert('<table><tr><th>A</th><th>B</th></tr><tr><td><a href="/constants/X/">X</a></td><td>a|b</td></tr></table>')
        self.assertEqual(md, '| A | B |\n| --- | --- |\n| [X](/constants/X/) | a\\|b |')

    def test_nested_table_falls_back_to_html_with_markdown_inside(self):
        md = Converter().convert('<table><tr><th>A</th><th>B</th></tr><tr><td><strong>x</strong></td><td>y<table><tr><th>C</th></tr><tr><td>z</td></tr></table></td></tr></table>')
        self.assertIn('<td>**x**</td>', md)
        self.assertIn('| C |', md)

    def test_mdx_specials_are_escaped(self):
        md = Converter().convert('<div class="wiki-line">a <b> {c} * [d] </font></div>')
        self.assertNotIn('<b>', md)
        self.assertIn('\\{c\\}', md)

    def test_examples_become_collapsibles_summarised_by_their_intro(self):
        md = Converter('llFoo').examples('<div class="wiki-line">Say hi.</div><div class="wiki-line"><pre><code>llFoo(1);</code></pre></div>')
        self.assertTrue(md.startswith('<details open>\n<summary>Say hi.</summary>\n\n```lsl\nllFoo(1);\n```'))

    def test_parameter_references_are_bold_only_in_clear_cases(self):
        c = Converter('llTakeControls').set_params(['controls', 'accept', 'pass_on'], frozenset({'controls', 'accept'}))
        md = c.convert('<div class="wiki-line">Keys specified by controls. If <code>accept</code> is FALSE and pass_on is TRUE, the controls stay. '
                       'See <a href="/x/">controls</a>.</div><h3>controls</h3>')
        self.assertIn('specified by **controls**.', md)      # common word, clear context
        self.assertIn('If **accept** is', md)                # wiki marker normalised
        self.assertIn('**pass_on** is TRUE', md)           # distinctive name
        self.assertIn('the controls stay', md)               # common word, no context: left alone
        self.assertIn('[controls](/x/)', md)                 # never inside links
        self.assertIn('### controls', md)                    # or headings
        self.assertEqual([(k, n) for k, n, _ in c.refs], [('marked', 'controls'), ('normalised', 'accept'), ('marked', 'pass_on'), ('ambiguous', 'controls')])

    def test_wiki_note_becomes_aside(self):
        self.assertEqual(Converter().convert('<aside class="wiki-note"><div class="wiki-line">Careful.</div></aside>'), ':::note\nCareful.\n:::')


class RepositoryPageTests(unittest.TestCase):
    """The committed pages and data agree."""
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf8'))
        cls.public = {e['name']: e for p in ('functions', 'events', 'constants') for e in cls.catalog[p]}

    def test_every_public_api_has_exactly_one_page(self):
        out = io.StringIO()
        with redirect_stdout(out): self.assertEqual(gen.main(['--check']), 0, out.getvalue())

    def test_deprecated_replacements_resolve_to_public_pages(self):
        self.assertTrue(self.catalog['deprecated'])
        for d in self.catalog['deprecated']:
            self.assertIn(d['use'], self.public, d)
            self.assertNotIn(d['name'], self.public, d)
            self.assertIn(d['name'], self.public[d['use']].get('replaces', []))
            self.assertTrue((ROOT / 'src/content/docs' / gen.PLURAL[self.public[d['use']]['kind']] / f"{d['use']}.mdx").exists())

    def test_constant_aliases_need_a_shared_context(self):
        names = {d['name']: d['use'] for d in self.catalog['deprecated']}
        self.assertEqual(names.get('llSetPrimitiveParams'), 'llSetLinkPrimitiveParamsFast')
        self.assertEqual(names.get('ATTACH_LPEC'), 'ATTACH_RIGHT_PEC')  # YAML value, kept as is
        self.assertEqual(names.get('LAND_LARGE_BRUSH'), 'LAND_BRUSH_LARGE')
        self.assertEqual(names.get('GAME_CONTROL_BUTTON_A'), 'GAME_CONTROL_BUTTON_SOUTH')
        for skipped in ('PRIM_MATERIAL_FRICTION', 'PRIM_MATERIAL_DENSITY', 'PRIM_MATERIAL_GRAVITY_MULTIPLIER', 'PRIM_MATERIAL_RESTITUTION', 'PRIM_MATERIAL_LIGHT'):
            self.assertNotIn(skipped, names)
        for target in ('FRICTION', 'DENSITY', 'GRAVITY_MULTIPLIER', 'RESTITUTION', 'PRIM_FULLBRIGHT'):
            self.assertNotIn('replaces', self.public[target])
        report = json.loads((ROOT / 'data/reports/import-report.json').read_text(encoding='utf8'))
        self.assertIn('PRIM_MATERIAL_FRICTION', {s['name'] for s in report['deprecatedAliasesSkipped']})

    def test_api_pages_do_not_link_to_the_wiki_archive(self):
        import re
        hits = [f'{p.relative_to(ROOT)}: {m}' for d in gen.PLURAL.values() for p in (ROOT / 'src/content/docs' / d).glob('*.mdx')
                for m in re.findall(r'\]\((/wiki/[^)]*)\)|href="(/wiki/[^"]*)"', p.read_text(encoding='utf8'))]
        self.assertEqual(hits, [])

    def test_deprecated_without_replacement_get_no_alias(self):
        names = {d['name'] for d in self.catalog['deprecated']}
        self.assertNotIn('llCloud', names)
        self.assertNotIn('PRIM_CAST_SHADOWS', names)


if __name__ == '__main__':
    unittest.main()
