"""Compare an API's definitions description with the wiki's lead prose (and parameter texts).

The LSL definitions are maintained and can be newer than the wiki snapshot, so neither side wins
by default. Classes:

  a  equivalent: nothing in the definitions text is missing from the wiki page
  b  the definitions add something: a number or an API name the wiki page never mentions
  c  conflict: the wiki lead calls the entry deprecated/unimplemented/broken and the definitions
     do not, or both give numbers and none of the definitions' numbers appears on the wiki page
  d  only one side has text

This is a heuristic triage; data/reports/description-review.md lists every b and c case with
both texts for a person to check.
"""
from __future__ import annotations
import difflib, re

NUM = re.compile(r'(?<![\w.])\d+(?:\.\d+)?(?![\w])')
IDENT = re.compile(r'\b(?:ll[A-Z]\w+|[A-Z][A-Z0-9]*_[A-Z0-9_]+)\b')
STATUS = re.compile(r'\b(deprecated|unimplemented|not implemented|not yet implemented|obsolete|no longer (?:works|supported|functions)|does not work|(?:is|are) (?:currently )?broken)\b', re.I)
WORD = re.compile(r'[a-z0-9]+')


def plain(md: str) -> str:
    """Markdown/MDX to plain text for comparison."""
    s = re.sub(r'```.*?```', ' ', md, flags=re.S)
    s = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = re.sub(r':::\w*(\[[^\]]*\])?|[*`]', '', s)
    s = re.sub(r'\\(.)', r'\1', s)  # MDX escapes; underscores in names are kept
    return re.sub(r'\s+', ' ', s).strip()


def numbers(s): return {n.rstrip('0').rstrip('.') if '.' in n else n for n in NUM.findall(s)}


def similarity(a: str, b: str) -> float:
    return round(difflib.SequenceMatcher(None, WORD.findall(a.lower()), WORD.findall(b.lower())).ratio(), 2)


def sentences(s: str) -> list[str]:
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z(])', s.strip()) if x.strip()]


def classify(defn: str, lead: str, page: str):
    """Returns (class, reason, extra) where extra is the definitions' sentences carrying new facts."""
    defn, lead, page = defn.strip(), plain(lead), plain(page)
    if not defn or not lead: return 'd', 'only one side has a description', []
    status = STATUS.search(lead)
    if status and not STATUS.search(defn):
        return 'c', f'wiki lead says "{status[0]}", the definitions do not', []
    dn, ln, pn = numbers(defn), numbers(lead), numbers(page)
    if dn and ln and not (dn & pn):
        return 'c', f"numbers differ: definitions {sorted(dn)}, wiki lead {sorted(ln)}", []
    new_nums = sorted(dn - pn)
    new_ids = sorted(set(IDENT.findall(defn)) - set(IDENT.findall(page)))
    if new_nums or new_ids:
        tokens = new_nums + new_ids
        extra = [s for s in sentences(defn) if any(re.search(r'(?<![\w.])' + re.escape(t) + r'(?![\w])', s) for t in tokens)]
        return 'b', 'definitions add ' + ', '.join(tokens), extra
    return 'a', 'equivalent', []


def compare_param(yaml_desc: str, wiki_desc: str):
    y, w = yaml_desc.strip(), plain(wiki_desc)
    if not y or not w: return 'd', ''
    yn, wn = numbers(y), numbers(w)
    if yn and wn and not (yn & wn): return 'c', f'numbers differ: definitions {sorted(yn)}, wiki {sorted(wn)}'
    if wn - yn: return 'w', 'wiki adds ' + ', '.join(sorted(wn - yn))
    return 'a', ''
