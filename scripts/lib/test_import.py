import json
import html
import re
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from lib.wiki_render import Renderer, page_sections
from lib.wiki_fields import templates
ROOT=Path(__file__).resolve().parents[2]

class RenderTests(unittest.TestCase):
    def setUp(self): self.r=Renderer({'llsay':'/functions/llSay/','state entry':'/events/state_entry/'})
    def test_code_is_verbatim_and_inert(self):
        code='default { string x = "<script>bad()</script>"; }'
        result=self.r.render('<syntaxhighlight lang="lsl2">'+code+'</syntaxhighlight>')
        self.assertIn('&lt;script&gt;bad()&lt;/script&gt;',result)
        self.assertNotIn('<script>',result)
        self.assertIn('<pre><code>',result)
    def test_untrusted_html_and_protocols(self):
        result=self.r.render('<img src=x onerror=bad()><script>bad()</script> [[javascript:alert(1)|click]] [javascript:alert(1) click]')
        self.assertNotIn('<img',result); self.assertNotIn('<script',result)
        self.assertNotIn('href="javascript:',result)
    def test_local_links_and_escaped_label(self):
        result=self.r.render('[[llSay|<test>]] [[state_entry]]')
        self.assertIn('href="/functions/llSay/"',result)
        self.assertIn('href="/events/state_entry/"',result)
        self.assertIn('&lt;test&gt;',result)
    def test_nested_template_fields_preserve_examples(self):
        text='{{LSL_Function|func=llSay|caveats=* Use {{LSLP|msg}} literally.|examples=<source>llSay(0, "a|b");</source>}}'
        sections=page_sections(text,self.r)
        self.assertEqual([s['id'] for s in sections],['caveats','examples'])
        self.assertIn('<code>msg</code>',sections[0]['html'])
        self.assertIn('a|b',sections[1]['html'])
    def test_precise_category_label_is_preserved(self):
        result=self.r.render('Only {{LSLGC|Integer|integer values}} are accepted.')
        self.assertIn('>integer values</a> are accepted.', result)
    def test_unknown_template_arguments_remain_visible(self):
        self.assertIn('exact technical wording',self.r.render('{{Unimplemented|exact technical wording}}'))
    def test_unknown_template_is_inspectable(self):
        result=self.r.render('{{Unknown|x}}')
        self.assertIn('wiki-template',result); self.assertIn('Template:Unknown',result)
        self.assertIn('Unknown',self.r.unknown)
    def test_html_tables_anchors_and_entities(self):
        result=self.r.render('<table class="x" id="rc_data_flags" onclick="bad()"><caption>Flags</caption><tr><td colspan="2">a&nbsp;b</td></tr></table>')
        self.assertIn('<table id="rc-data-flags">',result); self.assertIn('<td colspan="2">a&nbsp;b</td>',result)
        self.assertNotIn('onclick',result); self.assertNotIn('&lt;table',result)
    def test_heading_with_link_and_anchor_template(self):
        result=self.r.render("=====[[llSay]]=====\n{{Anchor|PiC}} '''bold''' <lsl>if (a) {}</lsl>")
        self.assertIn('<h5 id="llsay">',result); self.assertIn('<span id="pic"></span>',result)
        self.assertIn('<strong>bold</strong>',result); self.assertIn('<pre><code>if (a) {}</code></pre>',result)
    def test_nested_wiki_table_and_parser_functions(self):
        result=self.r.render('{{#vardefine:x}}\n{|\n|-\n|\n{|\n! colspan="4" | Order\n|-\n|9\n|}\n|}')
        self.assertIn('<table><tr><td><table><tr><th colspan="4"> Order</th></tr><tr><td>9</td></tr></table></td></tr></table>',result)
        self.assertNotIn('vardefine',result)
    def test_variant_shows_only_its_own_head_block(self):
        self.r.public={'lla','llaprotected'}
        text='{{LSL Function/Headless|summary=Shared.|head={{LSL Function/Head|func=llA|func_desc=Plain A text.}}{{LSL_Function/Head|func=llAProtected|func_desc=Protected A text.}}|caveats=Shared caveat.}}'
        own={x['id']:x['html'] for x in page_sections(text,self.r,variant='llAProtected')}
        joined=''.join(own.values())
        self.assertIn('Protected A text.',joined); self.assertNotIn('Plain A text.',joined)
        self.assertIn('Shared caveat.',joined); self.assertIn('llA</a>',own['related-variants'])
        archive=''.join(x['html'] for x in page_sections(text,self.r))
        self.assertIn('Plain A text.',archive); self.assertIn('Protected A text.',archive)

class DatasetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.c=json.loads((ROOT/'src/data/catalog.json').read_text(encoding='utf8'))
    def test_counts_and_exclusions(self):
        self.assertEqual(len(self.c['wiki']),2266)
        self.assertEqual(len(self.c['functions']),501)
        for kind in ('functions','events','constants'):
            self.assertTrue(all(not x['definition'].get('private') and not x['definition'].get('deprecated') for x in self.c[kind]))
    def test_source_coverage_and_original_revision(self):
        for page in self.c['wiki']:
            self.assertTrue((ROOT/'public'/page['rawPath'].lstrip('/')).is_file())
            self.assertTrue(page['source']['revisionId'])
        say=next(x for x in self.c['functions'] if x['name']=='llSay')
        self.assertEqual(say['wiki']['source']['revisionId'],'1218534')
        self.assertIn('Examples',[s['title'] for s in say['wiki']['sections']])
    def test_canonical_signatures_and_categories(self):
        for kind in ('functions','events'):
            for entry in self.c[kind]:
                self.assertEqual(entry['categories'],entry['definition'].get('categories',[]))
                self.assertEqual([p['name'] for p in entry['parameters']],[n for a in entry['definition']['arguments'] for n in a])
    def test_actual_llabs_caveat_keeps_precise_label(self):
        entry=next(e for e in self.c['functions'] if e['name']=='llAbs')
        caveat=next(s['html'] for s in entry['wiki']['sections'] if s['id']=='caveats')
        self.assertIn('integer values',html.unescape(re.sub('<[^>]+>','',caveat)))
    def test_actual_llsay_example_is_verbatim(self):
        page=next(e['wiki'] for e in self.c['functions'] if e['name']=='llSay')
        raw=(ROOT/'public'/page['rawPath'].lstrip('/')).read_text(encoding='utf8')
        source=re.search(r'<syntaxhighlight[^>]*>(.*?)</syntaxhighlight>',raw,re.S)[1].strip('\n')
        rendered=next(s['html'] for s in page['sections'] if s['id']=='examples')
        code=re.search(r'<pre><code>(.*?)</code></pre>',rendered,re.S)[1]
        self.assertEqual(source,html.unescape(code))
    def test_shared_primitive_article_keeps_caveats_and_table(self):
        page=next(e for e in self.c['wiki'] if e['title']=='LlSetPrimitiveParams')
        sections={s['id']:s['html'] for s in page['sections']}
        self.assertIn('fails silently on physical prims/links',sections['caveats'])
        self.assertIn('Sets the prim',sections['related-constants'])
        self.assertGreater(sections['related-constants'].count('<tr>'),30)
        fast=next(e for e in self.c['functions'] if e['name']=='llSetLinkPrimitiveParamsFast')
        self.assertIn('shared-article',[s['id'] for s in fast['wiki']['sections']])
    def test_injected_helpers_and_footnote_not_silently_lost(self):
        page=next(e['wiki'] for e in self.c['functions'] if e['name']=='llDialog')
        sections={s['id']:s['html'] for s in page['sections']}
        self.assertIn('When a button is pressed',sections['function-notes'])
        self.assertIn('conditional wiki logic is not evaluated',sections['shared-wiki-helpers'])
        self.assertIn('Messages sent on',sections['shared-wiki-helpers'])
    def test_api_pages_document_one_entry(self):
        # No API page may carry another function's LSL Function/Head block (variant heading) or signature table.
        names={e['name'].casefold() for k in ('functions','events') for e in self.c[k]}
        names|={w['title'].casefold() for w in self.c['wiki'] if w['title'].casefold().startswith('ll')}
        mixed=[]
        for kind in ('functions','events','constants'):
            for entry in self.c[kind]:
                if not entry['wiki']: continue
                ids=set(re.findall(r'<h[2-6] id="([^"]+)"',entry['wiki']['html']))
                other=sorted(i for i in ids if i in names and i!=entry['name'].casefold())
                if other: mixed.append((entry['name'],other))
        self.assertEqual(mixed,[])
    def test_protected_linkset_data_pages_are_separate(self):
        fns={e['name']:e for e in self.c['functions']}
        for base in ('Write','Read','Delete'):
            plain,prot=fns['llLinksetData'+base],fns['llLinksetData'+base+'Protected']
            self.assertEqual(prot['wiki']['sharedWith'],'LlLinksetData'+base)
            self.assertIn('/functions/llLinksetData'+base+'/',prot['wiki']['html'])
            self.assertIn('/functions/llLinksetData'+base+'Protected/',plain['wiki']['html'])
        self.assertIn('protected',fns['llLinksetDataDeleteProtected']['wiki']['html'])
        self.assertNotIn('Removes an unprotected',fns['llLinksetDataDeleteProtected']['wiki']['html'])
        self.assertIn('Removes an unprotected',fns['llLinksetDataDelete']['wiki']['html'])
    def test_wiki_mapping_normalises_titles(self):
        report=json.loads((ROOT/'data/reports/import-report.json').read_text(encoding='utf8'))
        self.assertEqual(report['apiWithoutWiki']['functions'],['llFindNotecardTextCount'])
        self.assertEqual(report['apiWithoutWiki']['events'],[])
    def test_unique_archive_routes(self):
        self.assertEqual(len({x['slug'] for x in self.c['wiki']}),len(self.c['wiki']))
if __name__=='__main__': unittest.main()


class FeatureClusterTests(unittest.TestCase):
    """src/data/feature-clusters.json drives /features/ and the Reference sidebar."""

    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ROOT / 'src/data/catalog.json').read_text(encoding='utf-8'))
        cls.features = json.loads((ROOT / 'src/data/feature-clusters.json').read_text(encoding='utf-8'))

    def test_every_category_in_exactly_one_cluster(self):
        assigned = [c for cl in self.features['clusters'] for c in cl['categories']]
        self.assertEqual(sorted(assigned), sorted(c['id'] for c in self.catalog['categories']))

    def test_every_cluster_in_exactly_one_group(self):
        grouped = [c for g in self.features['groups'] for c in g['clusters']]
        self.assertEqual(sorted(grouped), sorted(cl['id'] for cl in self.features['clusters']))

    def test_items_are_public_api_names(self):
        names = {e['name'] for k in ('functions', 'events', 'constants') for e in self.catalog[k]}
        for cl in self.features['clusters']:
            for section in cl['sections']:
                for item in section['items']:
                    self.assertIn(item, names, f"{cl['id']}: {item}")
            for group in cl['constantGroups']:
                self.assertIn(group, self.catalog['enums'])

    def test_feature_pages_do_not_list_yaml_only_functions(self):
        items = {i for cl in self.features['clusters'] for s in cl['sections'] for i in s['items']}
        self.assertNotIn('llFindNotecardTextCount', items)

    def test_wiki_links_exist_in_archive(self):
        titles = {w['title'] for w in self.catalog['wiki']}
        for cl in self.features['clusters']:
            for title in cl['wiki']:
                self.assertIn(title, titles)
