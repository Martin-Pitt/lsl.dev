import json
import sys
import unittest
from pathlib import Path
import yaml
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from lib.group_overlay import apply_group_overlay
ROOT=Path(__file__).resolve().parents[2]
OVERLAY=yaml.safe_load((ROOT/'data/overlays/groups.yaml').read_text(encoding='utf8'))

class GroupOverlayUnitTests(unittest.TestCase):
    def defs(self):
        return {'enums':{'Axis':{'type':'enum','prefix':'A_'}},
                'constants':{'A_X':{'value':0,'member-of':['Axis']},'A_Y':{'value':1},'A_Z':{'value':1},'A_OLD':{'value':1,'deprecated':{'use':'A_Y'}},'A_P':{'value':2,'private':True}}}
    def test_adds_members_and_new_groups(self):
        d=self.defs()
        report=apply_group_overlay(d,{'groups':{'Axis':{'members':{'include':['A_Y','A_OLD']}},'Other':{'type':'enum','prefix':'A_','members':{'match':['A_[XZ]']}}}})
        self.assertEqual(d['constants']['A_Y']['member-of'],['Axis'])
        self.assertEqual(d['constants']['A_X']['member-of'],['Axis','Other'])
        self.assertEqual(d['enums']['Axis'],{'type':'enum','prefix':'A_'},'an upstream group keeps its definition')
        self.assertEqual(d['enums']['Other'],{'type':'enum','prefix':'A_','local':True})
        self.assertEqual(report['groups'],{'Axis':2,'Other':2})
    def test_duplicate_values_fail(self):
        with self.assertRaisesRegex(ValueError,'duplicates value 1'):
            apply_group_overlay(self.defs(),{'groups':{'Axis':{'members':{'include':['A_Y','A_Z']}}}})
    def test_private_include_is_reported(self):
        report=apply_group_overlay(self.defs(),{'groups':{'Axis':{'members':{'include':['A_P','A_NONE']}}}})
        self.assertEqual([s['name'] for s in report['skipped']],['A_P','A_NONE'])

class GroupOverlayCatalogTests(unittest.TestCase):
    """The checked-in catalog, as written by scripts/import-datasets.py."""
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads((ROOT/'src/data/catalog.json').read_text(encoding='utf8'))
    def test_every_game_control_constant_is_grouped(self):
        loose=[c['name'] for c in self.c['constants'] if c['name'].startswith(('GAME_CONTROL_AXIS_','GAME_CONTROL_BUTTON_')) and not c['groups']]
        self.assertEqual(loose,[])
    def test_overlay_recorded_as_local(self):
        o=[x for x in self.c['meta']['sources']['overlays'] if x['file']=='data/overlays/groups.yaml']
        self.assertEqual([(x['local'],set(x['groups'])) for x in o],[(True,set(OVERLAY['groups']))])
    def test_overlay_groups_are_in_the_catalog(self):
        for gid in OVERLAY['groups']:
            self.assertIn(gid,self.c['enums'])
            self.assertTrue(any(gid in c['groups'] for c in self.c['constants']),gid)
