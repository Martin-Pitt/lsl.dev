"""Read feature pages (src/content/docs/features/*.mdx) the same way src/lib/feature-mdx.mjs does.

Component props hold JSON arrays of names: <ApiLinks names={[...]} />, <ConstantGroups names={[...]} />,
<SeeAlso items={[...]}>, <Planned>text</Planned> and <FeatureFooter related categories archive />.
"""
import json
import re
from pathlib import Path
from urllib.parse import unquote

import yaml

ROOT = Path(__file__).resolve().parents[2]
FEATURE_DIR = ROOT / 'src/content/docs/features'


def _array_props(body, tag, prop):
    out = []
    for m in re.finditer(rf'<{tag}\b([\s\S]*?)>', body):
        p = re.search(rf'\b{prop}=\{{(\[[\s\S]*?\])\}}', m.group(1))
        if p:
            out.extend(json.loads(p.group(1)))
    return out


def _planned(body):
    return [re.sub(r'\s+', ' ', m.group(1).replace('\\*', '*')).strip()
            for m in re.finditer(r'<Planned>([\s\S]*?)</Planned>', body)]


def _uniq(xs):
    return list(dict.fromkeys(xs))


def parse_feature(path):
    text = Path(path).read_text(encoding='utf-8').replace('\r\n', '\n')
    fm = re.match(r'^---\n([\s\S]*?)\n---\n', text)
    if not fm:
        raise ValueError(f'{path}: missing frontmatter')
    data = yaml.safe_load(fm.group(1)) or {}
    body = text[fm.end():]
    hrefs = re.findall(r'\]\((/[^)\s]*)\)', body)
    api_links = [unquote(m.group(1)) for h in hrefs
                 if (m := re.match(r'^/(?:functions|events|constants)/([^/#?]+)/?(?:#.*)?$', h)) and m.group(1) != 'groups']
    group_links = [unquote(m.group(1)) for h in hrefs if (m := re.match(r'^/constants/groups/([^/#?]+)', h))]
    rows = re.findall(r'<Signature\s+name="([^"]+)"', body)
    return {
        'id': Path(path).stem, 'title': str(data.get('title', '')), 'description': str(data.get('description', '')),
        'categories': _array_props(body, 'FeatureFooter', 'categories'),
        'related': _array_props(body, 'FeatureFooter', 'related'),
        'archive': _array_props(body, 'FeatureFooter', 'archive'),
        'items': _uniq(_array_props(body, 'ApiLinks', 'names') + _array_props(body, 'Signatures', 'names') + rows + api_links),
        'groups': _uniq(_array_props(body, 'ConstantGroups', 'names') + group_links),
        'links': _array_props(body, 'SeeAlso', 'items'),
        'hrefs': hrefs,
        'planned': _planned(body),
        'body': body,
    }


def load_features():
    """Feature pages in slug order. Sub-pages (features/<id>/<topic>.mdx) are merged into their feature:
    their names count as the feature's, `body` is the combined source, and `pages` lists each page
    separately as (route, body) for per-page checks."""
    out = []
    for p in sorted(FEATURE_DIR.glob('*.mdx')):
        f = parse_feature(p)
        subs = [parse_feature(s) for s in sorted((FEATURE_DIR / p.stem).glob('*.mdx'))]
        f['pages'] = [(f'/features/{f["id"]}/', f['body'])] + [(f'/features/{f["id"]}/{s["id"]}/', s['body']) for s in subs]
        f['subpages'] = [{'id': s['id'], 'title': s['title'], 'description': s['description'], 'href': f'/features/{f["id"]}/{s["id"]}/'} for s in subs]
        for s in subs:
            f['items'] = _uniq(f['items'] + s['items'])
            f['groups'] = _uniq(f['groups'] + s['groups'])
            for k in ('links', 'hrefs', 'planned'):
                f[k] = f[k] + s[k]
            f['body'] += '\n' + s['body']
        out.append(f)
    return out


def compat_index(features):
    """What scripts/feature-index.mjs writes to src/data/feature-clusters.json."""
    return {
        'features': [{'id': f['id'], 'title': f['title'], 'description': f['description'],
                      'categories': f['categories'], 'related': f['related'],
                      'sections': [{'title': f['title'], 'items': f['items'], 'groups': f['groups']}]}
                     for f in features],
        'redirects': {},
    }
