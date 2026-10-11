#!/usr/bin/env python3
"""Derive per-API "added" and "updated" dates from secondlife/lsl-definitions git history.

Usage: python scripts/definitions-history.py --repo <path to lsl-definitions clone>
Writes data/sources/definitions-history.json (deterministic, sorted). The clone needs full
history (fetch-depth 0). The repo is only read; nothing in it is modified.

Method
------
1. Pick the upstream commit: the newest commit touching lsl_definitions.yaml whose blob
   (git show, so line endings are as committed, not as checked out) has the same sha256 as
   data/sources/lsl_definitions.yaml. If none matches, fall back to HEAD with a warning.
2. Baseline: the commit that first added lsl_definitions.yaml (the initial import of the
   definitions). Items present in it get added = null ("existed at import", not new), and
   changes made in it never count as updates.
3. added: `git blame -w --line-porcelain <commit> -- lsl_definitions.yaml` is run once and
   the blamed commit of each item's key line ("  llFoo:") is taken. It is cross-checked
   against a key-presence scan over every historical version of the file (the first commit,
   in topological order, whose version has the key in that section while no parent does).
   When they disagree (blocks moved or rewritten, so blame points at the move) the scan
   wins and the item is listed under "blameDisagreements".
4. updated: a semantic diff, not line blame. Every version is parsed and each item gets a
   BEHAVIOUR fingerprint: argument count and types, return, sleep, energy, mono-sleep,
   requires-permission, experience, linden-experience, god-mode, deprecated (as a boolean),
   private, slua-removed; for constants type and value (numbers normalized, so '0x2' == 2)
   plus deprecated/private/slua-removed. updated is the newest commit reachable from the
   matched commit whose fingerprint differs from its parent's (for merges: from every
   parent), ignoring the baseline and the item's own "added" commit.
   Tooltips, descriptions, categories, slua-* hints, member-of enum classification and
   argument renames are deliberately ignored. A line blame filtered to behaviour keys was
   tried first and was dominated by sweeps that change no behaviour (a3c5579 added
   member-of to 901 constants; 1707867 renamed arguments of 362 functions). The semantic
   diff also sees removed fields (e.g. dropping deprecated), which blame cannot.
Dates are committer dates in UTC, YYYY-MM-DD.
"""
import argparse, hashlib, json, re, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
FILE = 'lsl_definitions.yaml'
SECTIONS = ('constants', 'events', 'functions')
BEHAVIOUR = {'return', 'sleep', 'energy', 'mono-sleep', 'requires-permission', 'experience',
             'linden-experience', 'god-mode', 'deprecated', 'private', 'slua-removed'}
CONSTANT_BEHAVIOUR = {'type', 'value', 'deprecated', 'private', 'slua-removed'}
KEY = re.compile(r'^  ([A-Za-z_][\w.]*):')
LOADER = getattr(yaml, 'CSafeLoader', yaml.SafeLoader)


def git(repo, *args):
    return subprocess.run(['git', '-C', str(repo), *args], check=True, capture_output=True).stdout


def day(ts):
    return datetime.fromtimestamp(int(ts), timezone.utc).strftime('%Y-%m-%d')


def norm(v):
    if isinstance(v, str):
        for conv in (lambda x: int(x, 0), float):
            try: return conv(v)
            except ValueError: pass
        # 199b2ec rewrote escapes (\\uFDD2 -> '\u{FDD2}', \\n -> '\n') without changing values.
        v = re.sub(r'\\+u\{?([0-9A-Fa-f]{4,6})\}?', lambda m: chr(int(m.group(1), 16)), v.strip())
        v = re.sub(r'\\+x([0-9A-Fa-f]{2})', lambda m: chr(int(m.group(1), 16)), v)
        return re.sub(r'\\+([nt])', lambda m: {'n': '\n', 't': '\t'}[m.group(1)], v)
    if isinstance(v, dict): return {str(k): norm(x) for k, x in sorted(v.items(), key=lambda kv: str(kv[0]))}
    if isinstance(v, list): return [norm(x) for x in v]
    return v


def fingerprint(section, entry):
    if not isinstance(entry, dict): return None
    entry = {str(k).replace('_', '-'): v for k, v in entry.items()}  # 6f3f050 renamed snake_case keys
    fp = {f: norm(entry[f]) for f in sorted(CONSTANT_BEHAVIOUR if section == 'constants' else BEHAVIOUR) if f in entry}
    if 'deprecated' in fp: fp['deprecated'] = bool(fp['deprecated'])
    if section != 'constants':
        fp['arguments'] = [norm((next(iter(a.values())) or {}).get('type')) if isinstance(a, dict) and a else None
                           for a in entry.get('arguments') or []]
    return json.dumps(fp, sort_keys=True, default=str)


def fingerprints(raw):
    data = yaml.load(raw, Loader=LOADER) or {}
    return {s: {str(k): fingerprint(s, v) for k, v in (data.get(s) or {}).items()} for s in SECTIONS}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True, type=Path)
    ap.add_argument('--definitions', type=Path, default=ROOT / 'data/sources/lsl_definitions.yaml')
    ap.add_argument('--out', type=Path, default=ROOT / 'data/sources/definitions-history.json')
    args = ap.parse_args()
    repo = args.repo
    want = hashlib.sha256(args.definitions.read_bytes()).hexdigest()

    history = [l.split() for l in git(repo, 'log', '--topo-order', '--format=%H %P', '--', FILE).decode().splitlines() if l.strip()]
    blobs = {c: git(repo, 'show', f'{c}:{FILE}') for c, *_ in history}
    commit = next((c for c, *_ in history if hashlib.sha256(blobs[c]).hexdigest() == want), None)
    matched = commit is not None
    if not matched:
        commit = git(repo, 'rev-parse', 'HEAD').decode().strip()
        print(f'warning: no upstream commit matches {args.definitions.name} (sha256 {want}); using HEAD {commit[:10]}', file=sys.stderr)

    dates = {}
    def date(c):
        if c not in dates: dates[c] = day(git(repo, 'show', '-s', '--format=%ct', c).decode().strip())
        return dates[c]

    baseline = history[-1][0]  # oldest commit touching the file = the import
    fps = {c: fingerprints(raw) for c, raw in blobs.items()}
    nearest = {}
    def version_of(p):
        # A parent that does not touch the file carries the version of its nearest ancestor that did.
        if p in fps: return p
        if p not in nearest:
            try: nearest[p] = git(repo, 'log', '-1', '--format=%H', p, '--', FILE).decode().strip() or None
            except subprocess.CalledProcessError: nearest[p] = None
        return nearest[p]

    reachable = set(git(repo, 'rev-list', commit, '--', FILE).decode().split())
    scan, changed = {}, {}
    for c, *parents in reversed(history):
        if c not in reachable: continue
        pv = [v for v in (version_of(p) for p in parents) if v]
        for s in SECTIONS:
            for k, fp in fps[c][s].items():
                olds = [fps[v][s][k] for v in pv if k in fps[v][s]]
                if not olds: scan.setdefault((s, k), c)
                elif all(o != fp for o in olds): changed.setdefault((s, k), []).append(c)

    # One blame over the whole file for the key lines.
    blame, cur, section = {}, None, None
    for row in git(repo, 'blame', '-w', '--line-porcelain', commit, '--', FILE).decode('utf-8', 'replace').split('\n'):
        if re.match(r'^[0-9a-f]{40} ', row): cur = row[:40]
        elif row.startswith('committer-time '): dates.setdefault(cur, day(row.split()[1]))
        elif row.startswith('\t'):
            text = row[1:]
            if text[:1].isalpha():
                name = text.split(':')[0]
                section = name if name in SECTIONS else None
            elif section and (m := KEY.match(text)):
                blame[(section, m.group(1))] = cur

    out, disagreements = {s: {} for s in SECTIONS}, []
    for s in SECTIONS:
        for name in sorted(fps[commit][s]):
            b = blame.get((s, name))
            added_c = scan.get((s, name), b)
            if b and added_c != b:
                disagreements.append({'section': s, 'name': name, 'blame': b[:10], 'blameDate': date(b),
                                      'scan': added_c[:10], 'scanDate': date(added_c)})
            upd = [c for c in changed.get((s, name), []) if c not in (baseline, added_c)]
            upd_c = max(upd, key=lambda c: (date(c), c)) if upd else None
            out[s][name] = {
                'added': None if added_c == baseline else date(added_c),
                'addedCommit': None if added_c == baseline else added_c[:10],
                'updated': date(upd_c) if upd_c else None,
                'updatedCommit': upd_c[:10] if upd_c else None,
            }
    doc = {
        'schemaVersion': 1,
        'repo': 'secondlife/lsl-definitions',
        'file': FILE,
        'commit': commit[:10],
        'commitDate': date(commit),
        'matchedSha256': matched,
        'definitionsSha256': want,
        'baseline': {'commit': baseline[:10], 'date': date(baseline)},
        'method': 'added: blame of the key line, cross-checked by a key-presence scan of every version (scan wins). '
                  'updated: newest commit whose behaviour fingerprint changed (argument count and types, return, sleep, energy, '
                  'mono-sleep, requires-permission, experience, linden-experience, god-mode, deprecated, private, slua-removed; '
                  'constants: type, value, deprecated, private, slua-removed); wording, categories, enum classification and '
                  'argument renames are ignored. Baseline items have added = null. See scripts/definitions-history.py.',
        'blameDisagreements': sorted(disagreements, key=lambda d: (d['section'], d['name'])),
        **out,
    }
    args.out.write_text(json.dumps(doc, indent=1, sort_keys=True, ensure_ascii=False) + '\n', encoding='utf-8', newline='\n')
    n = {s: {'added': sum(1 for v in out[s].values() if v['added']), 'updated': sum(1 for v in out[s].values() if v['updated'])} for s in SECTIONS}
    print(f'{args.out.name}: commit {commit[:10]}, baseline {baseline[:10]} {date(baseline)}, {n}, blame disagreements {len(disagreements)}')


if __name__ == '__main__':
    main()
