import json
import sys
import unittest
from pathlib import Path
import yaml
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from lib.category_overlay import apply_category_overlay
ROOT=Path(__file__).resolve().parents[2]
OVERLAY=yaml.safe_load((ROOT/'data/overlays/categories.yaml').read_text(encoding='utf8'))
DEFS=yaml.safe_load((ROOT/'data/sources/lsl_definitions.yaml').read_text(encoding='utf8'))

class OverlayUnitTests(unittest.TestCase):
    def catalog(self):
        e=lambda n,c: {'name':n,'categories':c}
        return {'functions':[e('llGetGameControlMode',['avatar','input'])],'events':[e('game_control',['avatar','input'])],
                'constants':[e('GAME_CONTROL_AXIS_LEFTX',[]),e('PERMISSION_GAME_CONTROL',[]),e('CONTROL_FWD',['input'])]}
    def test_applies_and_preserves_yaml_categories(self):
        cat=self.catalog(); defn=cat['functions'][0]['categories']
        labels,report=apply_category_overlay(cat,OVERLAY)
        self.assertEqual(labels['game_control'],'Game Control')
        self.assertEqual(cat['functions'][0]['categories'],['avatar','input','game_control'])
        self.assertEqual(defn,['avatar','input'],'the definition list must not be mutated')
        self.assertEqual(cat['constants'][1]['categories'],['game_control'])
        self.assertEqual(cat['constants'][2]['categories'],['input'])
        self.assertEqual(report['categories']['game_control'],4)
    def test_non_public_include_is_reported(self):
        cat=self.catalog(); cat['constants']=[c for c in cat['constants'] if c['name']!='PERMISSION_GAME_CONTROL']
        _,report=apply_category_overlay(cat,OVERLAY)
        self.assertEqual([s['name'] for s in report['skipped']],['PERMISSION_GAME_CONTROL'])

class OverlayCatalogTests(unittest.TestCase):
    """The checked-in catalog, as written by scripts/import-datasets.py."""
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads((ROOT/'src/data/catalog.json').read_text(encoding='utf8'))
        cls.g=next(x for x in cls.c['categories'] if x['id']=='game_control')
        cls.members=set(cls.g['functions']+cls.g['events']+cls.g['constants'])
    def test_game_control_category(self):
        self.assertEqual(self.g['label'],'Game Control')
        want={n for k in ('functions','events','constants') for n,d in DEFS[k].items()
              if (n.startswith('llGetGameControl') or n=='game_control' or n.startswith('GAME_CONTROL_') or n=='PERMISSION_GAME_CONTROL')
              and not d.get('deprecated') and not d.get('private')}
        self.assertEqual(self.members,want)
        self.assertEqual(len(self.members),75)
    def test_deprecated_excluded(self):
        for n in ('GAME_CONTROL_BUTTON_A','GAME_CONTROL_BUTTON_B','GAME_CONTROL_BUTTON_X','GAME_CONTROL_BUTTON_Y',
                  'GAME_CONTROL_BUTTON_BACK','GAME_CONTROL_BUTTON_GUIDE','GAME_CONTROL_AXIS_TRIGGERLEFT','GAME_CONTROL_AXIS_TRIGGERRIGHT'):
            self.assertTrue(DEFS['constants'][n].get('deprecated'))
            self.assertNotIn(n,self.members)
            self.assertNotIn(n,{e['name'] for e in self.c['constants']})
    def test_yaml_categories_preserved(self):
        for k in ('functions','events','constants'):
            for e in self.c[k]:
                yaml_cats=DEFS[k][e['name']].get('categories',[])
                self.assertEqual(e['categories'][:len(yaml_cats)],yaml_cats,e['name'])
                self.assertEqual(e['definition'].get('categories',[]),yaml_cats,e['name'])
                extra=e['categories'][len(yaml_cats):]
                self.assertEqual(extra,['game_control'] if e['name'] in self.members else [],e['name'])
    def test_overlay_recorded_as_local(self):
        o=[x for x in self.c['meta']['sources']['overlays'] if 'categories' in x]
        self.assertEqual([(x['file'],x['local'],x['categories']) for x in o],[('data/overlays/categories.yaml',True,{'game_control':75})])

if __name__=='__main__': unittest.main()
