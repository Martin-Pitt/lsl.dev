"""Apply data/overlays/categories.yaml: lsl.dev-local categories layered on the upstream YAML.

Membership is additive (YAML categories are kept and stay first) and only public entries,
i.e. those the importer kept after dropping deprecated/private definitions, can match.
"""
import re

KINDS=('functions','events','constants')

def apply_category_overlay(catalog,overlay):
    """Mutates catalog entries' `categories`. Returns ({id: label}, report)."""
    labels={}; report={'categories':{},'skipped':[]}
    by_name={e['name']:e for k in KINDS for e in catalog[k]}
    for cid,spec in ((overlay or {}).get('categories') or {}).items():
        labels[cid]=spec.get('label',cid)
        members=spec.get('members') or {}
        pats=[re.compile(p) for p in members.get('match',[])]
        names={n for n in by_name if any(p.fullmatch(n) for p in pats)}
        for n in members.get('include',[]):
            if n in by_name: names.add(n)
            else: report['skipped'].append({'category':cid,'name':n,'reason':'not a public API'})
        for n in sorted(names):
            cats=by_name[n]['categories']=list(by_name[n]['categories'])
            if cid not in cats: cats.append(cid)
        report['categories'][cid]=len(names)
    return labels,report
