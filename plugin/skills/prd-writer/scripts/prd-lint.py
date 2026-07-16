#!/usr/bin/env python3
"""prd-lint: mechanical structure checks for jobescape PRDs.

Usage: python3 prd-lint.py path/to/prd.yaml   (canonical deliverable)
       python3 prd-lint.py path/to/draft.md   (interview drafts / the render)

Dispatches on extension. Stdlib only; YAML checks are line-based against the
schema in references/template.md, not a full YAML parse.

YAML errors (exit 1):
  Y1  status "TBD → Qn" references a Q absent from open_items
  Y2  duplicate R-/NG-/S-/Q-/F-ID
  Y3  ID gap (1..max must all exist; withdrawn rows still count)
  Y4  open_items entry missing owner or needed_by
  Y5  meta has no version
  Y6  screens entry with no status
  Y7  affected_r_ids references a nonexistent R-ID
YAML warnings:
  YW1 screens status says "designed" but every node cell is "—"
  YW2 flow_map has forward edges into a node with no return edge out of it
  YW3 open_items entry with a null/missing Q-id
  YW4 row with "TBD → Qn" not listed in that Q's affected_r_ids
  YW5 no screens section

Markdown errors (drafts/render):
  E1 dangling [TBD → Qn]   E2 duplicate IDs   E3 ID gaps
  E4 open question missing Owner/Needed by    E5 missing Version line
  E6 S-table row with empty Status
Markdown warnings:
  W1 "designed" row without a node link
  W2 no back/return/finish rows (loop-walk heuristic)
  W3 bare [TBD — …] without a → Qn reference
"""
import re
import sys


# --------------------------------------------------------------------------- #
# shared helpers
# --------------------------------------------------------------------------- #
def check_id_sets(errors, found, gap_exempt=()):
    """found: dict prefix -> ordered list of ints (first appearances).

    Prefixes in gap_exempt get the uniqueness check only — Q ids retire when
    questions resolve (see id_bookkeeping), so Q gaps are legitimate."""
    for prefix, seq in found.items():
        seen = set()
        sep = "" if prefix == "Q" else "-"
        for n in seq:
            if n in seen:
                errors.append(f"Y2: {prefix}{sep}{n} is defined more than once")
            seen.add(n)
        if seen and prefix not in gap_exempt:
            missing = sorted(set(range(1, max(seen) + 1)) - seen)
            if missing:
                gaps = ", ".join(f"{prefix}{sep}{n}" for n in missing[:5])
                more = f" (+{len(missing) - 5} more)" if len(missing) > 5 else ""
                errors.append(f"Y3: missing from ID sequence: {gaps}{more}")


# --------------------------------------------------------------------------- #
# YAML mode
# --------------------------------------------------------------------------- #
def lint_yaml(text):
    errors, warnings = [], []
    lines = text.splitlines()

    # Y5: meta.version
    if not re.search(r'^\s+version:\s*"?[\w.]+"?\s*$', text, re.M):
        errors.append("Y5: meta has no version field")

    # collect defined IDs: hyphenated R-/NG-/S-/F- (letter-suffixed sub-steps
    # like F-2a are variants of their parent, not separate definitions) and
    # unhyphenated Q ids.
    found = {p: [] for p in ("R", "NG", "S", "Q", "F")}
    for m in re.finditer(r'\bid:\s*"(R|NG|S|F)-(\d+)"', text):
        found[m.group(1)].append(int(m.group(2)))
    for m in re.finditer(r'\bid:\s*"Q(\d+)"', text):
        found["Q"].append(int(m.group(1)))
    check_id_sets(errors, {p: v for p, v in found.items() if v}, gap_exempt=("Q",))

    # open_items block: entries, owners, needed_by, affected_r_ids
    oi_match = re.search(r"^open_items:\s*$", text, re.M)
    oi_text = ""
    if oi_match:
        rest = text[oi_match.end():]
        stop = re.search(r"^\S", rest, re.M)
        oi_text = rest[: stop.start()] if stop else rest
    live_qs = set(int(m.group(1)) for m in re.finditer(r'id:\s*"Q(\d+)"', oi_text))
    entries = re.split(r"^\s*-\s", oi_text, flags=re.M)[1:]
    for i, e in enumerate(entries, 1):
        label = None
        qm = re.search(r'id:\s*"Q(\d+)"', e)
        if qm:
            label = f"Q{qm.group(1)}"
        elif re.search(r"id:\s*null", e) or not re.search(r"\bid:", e):
            warnings.append(f"YW3: open_items entry #{i} has a null/missing Q-id")
            label = f"open_items #{i}"
        if "owner:" not in e:
            errors.append(f"Y4: {label} has no owner")
        if "needed_by:" not in e:
            errors.append(f"Y4: {label} has no needed_by")

    # affected_r_ids exist, and reverse mapping
    r_ids = set(found["R"])
    q_affected = {}  # qnum -> set of R ints
    for qm in re.finditer(r'id:\s*"Q(\d+)"(.*?)(?=^\s*-\s|\Z)', oi_text, re.S | re.M):
        qn = int(qm.group(1))
        refs = set(int(x) for x in re.findall(r'"R-(\d+)"', qm.group(2)))
        q_affected[qn] = refs
        for r in refs:
            if r not in r_ids:
                errors.append(f"Y7: Q{qn} affected_r_ids references nonexistent R-{r}")

    # rows with TBD → Qn: Q must be live; row should be in Q's affected list
    for m in re.finditer(r'id:\s*"R-(\d+)"(.*?)(?=^\s*-\s+id:|\Z)', text, re.S | re.M):
        rn, body = int(m.group(1)), m.group(2)
        for qref in re.findall(r"TBD\s*(?:→|->)\s*Q(\d+)", body):
            qn = int(qref)
            if qn not in live_qs:
                errors.append(f"Y1: R-{rn} status points at Q{qn}, absent from open_items")
            elif rn not in q_affected.get(qn, set()):
                warnings.append(f"YW4: R-{rn} points at Q{qn} but is not in Q{qn}'s affected_r_ids")

    # screens section
    sc_match = re.search(r"^screens:\s*$", text, re.M)
    if not sc_match:
        warnings.append("YW5: no screens section (per-screen design status missing)")
    else:
        rest = text[sc_match.end():]
        stop = re.search(r"^\S", rest, re.M)
        sc_text = rest[: stop.start()] if stop else rest
        for sm in re.finditer(r'id:\s*"S-(\d+)"(.*?)(?=^\s*-\s+id:|\Z)', sc_text, re.S | re.M):
            sn, body = sm.group(1), sm.group(2)
            stat = re.search(r"status:\s*(.+)", body)
            if not stat or not stat.group(1).strip().strip('"'):
                errors.append(f"Y6: S-{sn} has no status")
            elif re.search(r"\bdesigned\b", stat.group(1), re.I):
                nodes = re.search(r"nodes:\s*\{([^}]*)\}", body)
                if nodes and not re.search(r"\d{2,}-\d{2,}", nodes.group(1)):
                    warnings.append(f'YW1: S-{sn} status says "designed" but every node cell is "—"')

    # flow_map: forward destinations without any return edge out
    edges = re.findall(r'\{from:\s*"([^"]+)",\s*to:\s*"([^"]+)".*?kind:\s*(\w+)\}', text)
    if edges:
        fwd_dests = set(t for _f, t, k in edges if k == "forward")
        ret_sources = set(f for f, _t, k in edges if k == "return")
        for d in sorted(fwd_dests - ret_sources):
            warnings.append(f"YW2: flow_map: forward edge into \"{d}\" but no return edge out of it")

    return errors, warnings


# --------------------------------------------------------------------------- #
# Markdown mode (drafts and the render) — unchanged checks
# --------------------------------------------------------------------------- #
def lint_md(text):
    errors, warnings = [], []
    lines = text.splitlines()

    if not re.search(r"^\*\*Version:\*\*", text, re.M) and "prd.yaml" not in text:
        errors.append("E5: no '**Version:**' line (or canonical-YAML notice) in the header")

    for prefix in ("R", "NG", "S", "Q"):
        seen = []
        dupes = set()
        for m in re.finditer(rf"\*\*~?~?{prefix}-(\d+)", text):
            n = int(m.group(1))
            if n in seen:
                dupes.add(n)
            else:
                seen.append(n)
        for n in sorted(dupes):
            errors.append(f"E2: {prefix}-{n} is defined more than once")
        if seen:
            missing = sorted(set(range(1, max(seen) + 1)) - set(seen))
            if missing:
                gaps = ", ".join(f"{prefix}-{n}" for n in missing[:5])
                more = f" (+{len(missing) - 5} more)" if len(missing) > 5 else ""
                errors.append(f"E3: missing from ID sequence: {gaps}{more}")

    oq = re.search(r"^##+\s*(?:7\.\s*)?Open (?:questions|items).*$", text, re.M | re.I)
    oq_text = text[oq.end():] if oq else ""
    live_qs = set(int(m.group(1)) for m in re.finditer(r"\*\*Q(\d+):", oq_text))
    for m in re.finditer(r"^- \*\*Q(\d+):.*$", oq_text, re.M):
        if "Owner:" not in m.group(0):
            errors.append(f"E4: Q{m.group(1)} has no 'Owner:'")
        if "Needed by:" not in m.group(0):
            errors.append(f"E4: Q{m.group(1)} has no 'Needed by:'")
    for m in re.finditer(r"\[TBD\s*(?:→|->)\s*Q(\d+)\]", text):
        if int(m.group(1)) not in live_qs:
            errors.append(f"E1: [TBD → Q{m.group(1)}] but Q{m.group(1)} not live in Open questions")

    for line in lines:
        if not re.match(r"^\|\s*S-\d+\s*\|", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        sid, status = cells[0], (cells[-1] if cells else "")
        if not status or status == "—":
            errors.append(f"E6: {sid} has an empty Status cell")
        elif re.search(r"\bdesigned\b", status, re.I) and not re.search(
            r"\bnot\s+designed\b", status, re.I
        ):
            if "node-id" not in line and not re.search(r"\b\d{2,}-\d{2,}\b", line):
                warnings.append(f"W1: {sid} status says 'designed' but the row has no node link")

    req = re.search(r"^##+\s*(?:4\.\s*)?Requirements.*$", text, re.M | re.I)
    if req:
        end = re.search(r"^##\s", text[req.end():], re.M)
        req_text = text[req.end(): req.end() + end.start() if end else len(text)]
        rows = re.findall(r"^- \*\*R-\d+.*$", req_text, re.M)
        if rows and not [r for r in rows if re.search(r"\b(back|return|finish|complet)", r, re.I)]:
            warnings.append("W2: no requirement row mentions back/return/finish — loop-walk rows may be missing")
        for r in rows:
            if re.search(r"\[TBD\b", r) and not re.search(r"\[TBD\s*(?:→|->)\s*Q\d+\]", r):
                rid = re.search(r"R-\d+", r).group(0)
                warnings.append(f"W3: {rid} carries a bare [TBD — …] with no → Qn reference")

    return errors, warnings


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__.strip())
        return 2
    path = sys.argv[1]
    try:
        text = open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"cannot read {path}: {e}")
        return 2

    if path.endswith((".yaml", ".yml")):
        errors, warnings = lint_yaml(text)
    else:
        errors, warnings = lint_md(text)

    for e in errors:
        print(f"ERROR   {e}")
    for w in warnings:
        print(f"warning {w}")
    print(f"\nprd-lint: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
