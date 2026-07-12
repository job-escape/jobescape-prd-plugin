#!/usr/bin/env python3
"""prd-lint: mechanical structure checks for jobescape PRDs.

Usage: python3 prd-lint.py path/to/prd.md

Errors (exit 1) — must be fixed before delivery:
  E1  [TBD -> Qn] marker references a Q that has no live entry in Open questions
  E2  duplicate R-/NG-/S-/Q-ID
  E3  ID gap (R-1..R-max must all exist; struck-through rows still count —
      document position is free: revised rows may sit in any logical group)
  E4  Open-question entry missing "Owner:" or "Needed by:"
  E5  missing "Version:" line in the header
  E6  S-table row with an empty Status cell

Warnings — resolve or consciously accept:
  W1  S-table status claims "designed" but the row has no node link (node-id URL)
  W2  no requirement row mentions back/return/finish/complete (loop-walk likely missing)
  W3  bare [TBD - ...] in Requirements without a -> Qn reference
"""
import re
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__.strip())
        return 2
    try:
        text = open(sys.argv[1], encoding="utf-8").read()
    except OSError as e:
        print(f"cannot read {sys.argv[1]}: {e}")
        return 2

    errors: list[str] = []
    warnings: list[str] = []
    lines = text.splitlines()

    # ---- E5: Version line -------------------------------------------------
    if not re.search(r"^\*\*Version:\*\*", text, re.M):
        errors.append("E5: no '**Version:**' line found in the header")

    # ---- collect IDs in order of first appearance -------------------------
    def first_appearances(prefix: str) -> list[int]:
        seen: list[int] = []
        dupes: set[int] = set()
        for m in re.finditer(rf"\*\*~?~?{prefix}-(\d+)", text):
            n = int(m.group(1))
            if n in seen:
                dupes.add(n)
            else:
                seen.append(n)
        for n in sorted(dupes):
            # duplicate definition rows only: references like "per R-85" are
            # not bolded, so **{prefix}-n** appearing twice means two rows.
            errors.append(f"E2: {prefix}-{n} is defined more than once")
        return seen

    for prefix in ("R", "NG", "S", "Q"):
        seq = first_appearances(prefix)
        if seq:
            missing = sorted(set(range(1, max(seq) + 1)) - set(seq))
            if missing:
                gaps = ", ".join(f"{prefix}-{n}" for n in missing[:5])
                more = f" (+{len(missing) - 5} more)" if len(missing) > 5 else ""
                errors.append(f"E3: missing from ID sequence: {gaps}{more}")

    # ---- Open questions section -------------------------------------------
    oq_match = re.search(r"^##+\s*(?:7\.\s*)?Open questions.*$", text, re.M | re.I)
    oq_text = text[oq_match.end():] if oq_match else ""
    live_qs = set(int(m.group(1)) for m in re.finditer(r"\*\*Q(\d+):", oq_text))
    struck_qs = set(int(m.group(1)) for m in re.finditer(r"~~Q(\d+):", oq_text))

    # E4: each live Q entry needs Owner and Needed by
    for m in re.finditer(r"^- \*\*Q(\d+):.*$", oq_text, re.M):
        entry = m.group(0)
        if "Owner:" not in entry:
            errors.append(f"E4: Q{m.group(1)} has no 'Owner:'")
        if "Needed by:" not in entry:
            errors.append(f"E4: Q{m.group(1)} has no 'Needed by:'")

    # ---- E1: TBD -> Qn markers point at live entries -----------------------
    for m in re.finditer(r"\[TBD\s*(?:→|->)\s*Q(\d+)\]", text):
        q = int(m.group(1))
        if q not in live_qs:
            where = "struck through" if q in struck_qs else "not found"
            errors.append(f"E1: [TBD → Q{q}] but Q{q} is {where} in Open questions")

    # ---- E6 / W1: S-table rows ---------------------------------------------
    for line in lines:
        if not re.match(r"^\|\s*S-\d+\s*\|", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        sid = cells[0]
        status = cells[-1] if cells else ""
        if not status or status == "—":
            errors.append(f"E6: {sid} has an empty Status cell")
            continue
        if re.search(r"\bdesigned\b", status, re.I) and not re.search(
            r"\bnot\s+designed\b", status, re.I
        ):
            if "node-id" not in line and not re.search(r"\b\d{2,}-\d{2,}\b", line):
                warnings.append(
                    f"W1: {sid} status says 'designed' but the row has no node link"
                )

    # ---- W2: loop-walk heuristic -------------------------------------------
    req_match = re.search(r"^##+\s*(?:4\.\s*)?Requirements.*$", text, re.M | re.I)
    if req_match:
        end = re.search(r"^##\s", text[req_match.end():], re.M)
        req_text = text[req_match.end(): req_match.end() + end.start() if end else len(text)]
        rows = re.findall(r"^- \*\*R-\d+.*$", req_text, re.M)
        loopy = [r for r in rows if re.search(r"\b(back|return|finish|complet)", r, re.I)]
        if rows and not loopy:
            warnings.append(
                "W2: no requirement row mentions back/return/finish — "
                "loop-walk rows (back + completion landings) may be missing"
            )
        # W3: bare TBD without a Q reference inside Requirements
        for r in rows:
            if re.search(r"\[TBD\b", r) and not re.search(r"\[TBD\s*(?:→|->)\s*Q\d+\]", r):
                rid = re.search(r"R-\d+", r).group(0)
                warnings.append(f"W3: {rid} carries a bare [TBD — …] with no → Qn reference")

    # ---- report --------------------------------------------------------------
    for e in errors:
        print(f"ERROR   {e}")
    for w in warnings:
        print(f"warning {w}")
    print(f"\nprd-lint: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
