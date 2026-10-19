"""Apply data/overlays/groups.yaml: lsl.dev-local constant groups layered on the upstream YAML.

Runs on the raw definitions, before the catalog is built, so `member-of` reads the same everywhere
(catalog `groups`, `definition['member-of']`, group pages). A group the YAML lacks is added to its
`enums`; an existing one only gains members. Membership is additive and keeps the YAML's groups first.
Like upstream, non-deprecated members of one group must have distinct values.
"""
import re

def apply_group_overlay(defs,overlay):
    """Mutates defs (`enums`, constants' `member-of`). Returns a report."""
    report={'groups':{},'skipped':[]}
    enums=defs.setdefault('enums',{}); consts=defs.get('constants',{})
    public=[n for n,d in consts.items() if not d.get('private')]
    for gid,spec in ((overlay or {}).get('groups') or {}).items():
        if gid not in enums:
            enums[gid]={k:v for k,v in spec.items() if k!='members'}|{'local':True}
        members=spec.get('members') or {}
        pats=[re.compile(p) for p in members.get('match',[])]
        names={n for n in public if any(p.fullmatch(n) for p in pats)}
        for n in members.get('include',[]):
            if n in public: names.add(n)
            else: report['skipped'].append({'group':gid,'name':n,'reason':'not a public constant'})
        for n in sorted(names):
            groups=consts[n]['member-of']=list(consts[n].get('member-of') or [])
            if gid not in groups: groups.append(gid)
        seen={}
        for n,d in consts.items():
            if gid not in (d.get('member-of') or []) or d.get('deprecated'): continue
            v=d.get('value')
            try: v=int(str(v),0)
            except ValueError: pass
            if v in seen: raise ValueError(f'{gid}: {n} duplicates value {v} of {seen[v]}')
            seen[v]=n
        report['groups'][gid]=len(names)
    return report
