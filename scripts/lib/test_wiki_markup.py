"""Raw MediaWiki markup must never reach the MDX pages.

- RepoTests: no MDX page under src/content/docs contains leaked wiki markup outside fenced code.
- Evaluator/renderer/converter/cleanup tests: the pieces that keep it out of generated pages.
"""
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lib.mdx_convert import Converter
from lib.wiki_cleanup import blocks, is_duplicate, merge_section, novel, strip_leaks
from lib.wiki_leaks import leaks, scan
from lib.wiki_render import Renderer, page_sections

ROOT = Path(__file__).resolve().parents[2]

# Leaks that may stay, as (page, pattern, text in the snippet). Keep this empty unless a page cannot
# be changed here.
ALLOWED: set = set()


class RepoTests(unittest.TestCase):
    def test_no_leaked_wiki_markup_in_docs(self):
        found = []
        for page, items in scan(ROOT).items():
            for name, line, snippet in items:
                if any(page == p and name == n and s in snippet for p, n, s in ALLOWED): continue
                found.append(f'{page}:{line}: {name}: {snippet}')
        self.assertEqual(found, [], 'raw wiki markup in MDX (fix the page, or the generator):\n' + '\n'.join(found[:40]))

    def test_allow_list_entries_are_still_needed(self):
        live = {(p, n, s) for p, n, s in ALLOWED for page, items in scan(ROOT).items() if page == p
                for name, _, snippet in items if name == n and s in snippet}
        self.assertEqual(live, ALLOWED, 'remove allow-list entries that no longer match')


class DetectorTests(unittest.TestCase):
    def test_code_frontmatter_and_markdown_tables_are_not_leaks(self):
        text = '---\nlicense: "Template:LSL Const {{x}}"\n---\n\n| a | b |\n|---|---|\n\n```lsl\nif (x) {{ y(); }}\n```\n\n\\[[float](/fundamentals/types/float/) x\\]\n'
        self.assertEqual(leaks(text), [])

    def test_escaped_and_raw_markup_are_leaks(self):
        names = {n for n, _, _ in leaks('a `{{#var:x}}` b \\[\\[llSay\\]\\] c &lt;onlyinclude> d \'\'\'e\'\'\'\n|- valign="top"\n## Additional wiki content')}
        for expected in ('template {{…}}', '#var:', 'wiki link [[…]]', 'onlyinclude/includeonly/noinclude',
                         "bold/italic quotes '''", 'table row |- / {| / |}', 'Additional wiki content'):
            self.assertIn(expected, names)


PRIM_TEXT = """<onlyinclude>{{#if:
{{LSL Function/alpha|alpha}}
{{#vardefine:text_const|{{LSL Const|PRIM_TEXT|integer|26|c=Used to {{GetSet|{{{1|}}}|get|set|/}} the object's floating text}}}}
{{#vardefine:caveats|{{#var:caveats}}
* Do not rely on [[:Category:LSL Floating Text|Floating Text]] as a storage medium; it is neither secure nor finalized.
** Even "invisible"{{Footnote|1=Floating text with an {{LSLP|alpha}} set to 0.0 is rendered "invisible"|2=hover}} floating text is transmitted to the client.
*** The network packets that contain the text can be sniffed and the text read.}}
}}</onlyinclude>{{#if:

}}{{LSL Constant
|name=PRIM_TEXT
|desc=Used to get or set the object's [[:Category:LSL Floating Text|floating text]].
|pa=[[llSetPrimitiveParams]]([ {{#var:text_const}} ]);
}}
[[Category:LSL Floating Text]]"""


class EvaluatorTests(unittest.TestCase):
    def setUp(self):
        self.r = Renderer({'llsetprimitiveparams': '/functions/llSetPrimitiveParams/', 'prim text': '/constants/PRIM_TEXT/'})
        self.r.api = True

    def test_template_logic_is_evaluated_and_caveats_variable_becomes_a_section(self):
        sections = {s['id']: s for s in page_sections(PRIM_TEXT, self.r)}
        self.assertNotIn('additional', sections)
        html = ''.join(s['html'] for s in sections.values())
        for raw in ('{{', '#vardefine', '#var', 'onlyinclude', '[[Category', '{{{'):
            self.assertNotIn(raw, html)
        caveats = sections['wiki-var-caveats']
        self.assertTrue(caveats['extracted']); self.assertEqual(caveats['title'], 'Caveats')
        self.assertIn('Do not rely on', caveats['html'])
        # ** and *** nest; the footnote and the bold parameter are rendered.
        self.assertRegex(caveats['html'], r'(?s)<ul><li>Do not rely.*<ul><li>Even "invisible"<sup class="wiki-footnote">.*<span class="wiki-param"><code>alpha</code></span>.*<ul><li>The network', )

    def test_switch_ifeq_params_and_unknown_functions(self):
        r = self.r
        self.assertEqual(r.evaluate('{{#switch:{{{1|}}}|get=G|set=S|D}}').strip(), 'D')
        self.assertEqual(r.evaluate('{{#switch:b|a|b=AB|c=C}}').strip(), 'AB')
        self.assertEqual(r.evaluate('{{#ifeq:{{{1|set}}}|set|yes|no}}').strip(), 'yes')
        self.assertEqual(r.evaluate('{{#vardefine:x|1}}{{#if:{{#var:x}}|on|off}}').strip(), 'on')
        self.assertEqual(r.evaluate('a{{#expr:1+1}}b'), 'ab')
        self.assertTrue(any('#expr' in k for k, _ in r.dropped))

    def test_variable_defined_once_on_another_page_is_used(self):
        r = Renderer({}, {'prim type sculpt': ({'title': 'PRIM TYPE SCULPT', 'namespace': 0}, '{{#vardefine:type_sculpt_const|[[PRIM_TYPE]]}}')})
        r.api = True
        self.assertIn('PRIM_TYPE', r.render('With {{#var:type_sculpt_const}} a sculpty.'))
        # Unknown values are marked for the generator; archive pages simply lose them.
        self.assertIn('\x07', r.render('With {{#var:unknown_const}}.'))
        r.api = False
        self.assertNotIn('\x07', r.render('With {{#var:unknown_const}}.'))

    def test_simple_templates(self):
        out = self.r.render('{{String|invisible}} {{Keypress|Ctrl}} {{Yes|[[llSetPrimitiveParams]]}} {{LSL VR|{{LSLPT|s}}|1|0}} <s style="x">old</s> <span class="plainlinks">a</span>')
        for want in ('<code>&quot;invisible&quot;</code>', '<kbd>Ctrl</kbd>', 'href="/functions/llSetPrimitiveParams/"', '<code>&lt;s, 1, 0&gt;</code>', '<s>old</s>'):
            self.assertIn(want, out)
        self.assertNotIn('span', out); self.assertNotIn('style', out)


class ConverterTests(unittest.TestCase):
    def test_footnotes_parameters_and_unknown_templates(self):
        c = Converter()
        md = c.convert('<ul><li>Even "invisible"<sup class="wiki-footnote">With <span class="wiki-param"><code>alpha</code></span> 0.0</sup> text.</li></ul>'
                       '<div class="wiki-line"><span class="wiki-template"><a href="x">Template:Odd</a>: <code>{{Odd|1}}</code></span></div>')
        self.assertRegex(md, r'^- Even "invisible"\[\^wiki-[0-9a-f]{6}\] text\.\n\n\[\^wiki-[0-9a-f]{6}\]: With \*\*alpha\*\* 0\.0$')
        self.assertEqual(c.dropped, [('unexpanded template', '{{Odd|1}}')])


class CleanupTests(unittest.TestCase):
    def test_duplicates_are_found_after_normalising(self):
        page = 'Intro.\n\n- You **must not** rely on [floating text](/x/) as a storage medium; it is neither secure nor finalized!'
        self.assertTrue(is_duplicate('- Do not rely on Floating Text as a storage medium; it is neither secure nor finalized.', page))
        self.assertFalse(is_duplicate('- Floating text has been altered in past server updates.', page))
        self.assertEqual(novel(['- new one', '- You must not rely on floating text as a storage medium; it is neither secure nor finalized.'], page), ['- new one'])

    def test_strip_leaks_keeps_layout_and_repairs_simple_leftovers(self):
        md = "- a\n- b `{{x}}`\n  - c\n- d '''bold'''\n\n| h | i |\n| --- | --- |\n| 1 | \x07var:v\x07 |"
        self.assertEqual(strip_leaks(md), '- a\n- d **bold**\n\n| h | i |\n| --- | --- |\n| 1 |  |')
        self.assertEqual(strip_leaks('Once \x07var:x\x07 is set.\n\nKept.'), 'Kept.')

    def test_merge_section_creates_or_extends_in_order(self):
        body = 'Lead.\n\n## Examples\n\nx\n\n<WikiSource />\n'
        out = merge_section(body, 'Caveats', ['- one[^wiki-aaaaaa]', '[^wiki-aaaaaa]: note'])
        self.assertEqual(out, 'Lead.\n\n## Caveats\n\n- one[^wiki-aaaaaa]\n\n[^wiki-aaaaaa]: note\n\n## Examples\n\nx\n\n<WikiSource />\n')
        self.assertIn('- one[^wiki-aaaaaa]\n- two\n\n[^wiki-aaaaaa]: note', merge_section(out, 'Caveats', ['- two']))
        self.assertEqual(blocks('- a\n  - b\n- c\n\npara'), ['- a\n  - b', '- c', 'para'])


if __name__ == '__main__':
    unittest.main()
