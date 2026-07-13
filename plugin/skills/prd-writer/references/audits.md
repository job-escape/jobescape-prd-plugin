# Review before returning to the PM (Step 4)

Before sending any draft, run all seven audits, the standing checks, and the linter. The audits check truth; the linter checks structure. Both must pass.

## The audits

1. **Anti-fabrication audit.** Read every line. For each statement of fact (a behavior, sort order, event name, empty state, edge case, copy string), ask: *"Did the PM say this, did a behavior-tool check confirm it, or did I make it up?"* If made up — replace with TBD or delete. A current-behavior claim counts as confirmed only if you actually ran the probe this session; proxy findings (web app standing in for mobile) count only if the PM confirmed parity. **This is the most important check.**

   On a covered service, before final handoff, re-verify the load-bearing current-behavior claims in `deep` mode (rules in `behavior-tools.md`, already loaded per the hub's table).

2. **Technical-content audit.** Read every line. Look for: file paths, framework/library names, API/service/table references, release mechanics (flags, OTA, rollout %), schema talk, low-level jargon. **Delete it** — there is nowhere in the PRD for it to move to. If deleting it loses a genuine cross-service dependency, restate that dependency as one plain-language sentence in the Summary. **Carve-out:** identifiers the PM explicitly stated (a named analytics event, a named system) stay verbatim — do not "clean" them out; see Core principle 1.

3. **Requirements audit.** Each R-row is atomic (one commitment), user-observable, and a constraint the PM actually set — not a decision you made. If you'd be embarrassed for the PM to ask *"wait, who decided this?"* — it shouldn't be a row. Split compound rows; make vague rows ("handles errors gracefully", "works well") exact or demote them to a TBD.

4. **Open questions audit.** Read every entry. Two kill conditions: *"Was this already answered?"* → remove it (the answer lives in the sections above). *"Would an engineer be the one to answer this?"* → delete it entirely.

5. **Coverage audit (design-first PRDs only).** Every inventory item from the intake is settled, `TBD → Qn`, or PM-confirmed out of scope — re-check the ledger against the draft. Every settled item's answer appears as an R-row (or S-row status); no inferred state or action became a row without being settled first. The flow pass ran. If any item is unaccounted for, the interview isn't done — go back, don't ship.

6. **Traceability audit.** Every `TBD → Qn` status points at a live open item with an owner and needed-by; every open item's `affected_r_ids` lists exactly the rows pointing at it (both directions in sync); R-/NG-/S-/Q-/F-IDs are complete, unique, and never renumbered or reused — **including across the pre-design snapshot → design-checked transition**; every screens entry has an explicit status; `meta.version` reflects this draft. Downstream engineering workflows traverse rows by ID — a blocking gap without an owned question becomes a guess on the engineering side.

7. **Render-consistency audit (final deliverable only).** `prd.md` was regenerated from the final `prd.yaml`, states the version it renders, and adds/drops nothing material. If any late correction touched the YAML, re-render before delivering.

## Standing checks

- Every section is specific to this feature, not generic boilerplate.
- **Loop-walk completeness:** every destination reachable from the feature has, per platform, a BACK row and (where the user can finish something) a completion-landing row — or an owned TBD. A destination with a tap row but no way-back row is the most common shipped gap.
- **Design-status honesty:** every screens entry listed as "designed" has an actual frame for each named state; specified-but-undrawn states say *"specified, no frame"*. (Design-status overclaims are the single largest fabrication source in audited PRDs.)
- If the feature is an experiment: split, assignment moment, control experience, and existing-user behavior each appear as rows or non-goals — not just "A/B test" in the Summary.
- If design was known-pending at any point: the design cross-check ran after the design arrived, or the PRD is still visibly marked as a pre-design draft.
- Figma links are per-screen node links (URLs with `node-id`), not one link to a whole file. If you don't have a node link, mark TBD — never invent one.
- Event names — if you don't know, mark TBD.
- Non-goals exist (or push back and ask).
- Owner fields are roles, not names.

## The linter

After the audits pass, run:

```
python3 scripts/prd-lint.py {path-to-prd.yaml (final) or draft .md}
```

(relative to this skill's directory). Fix every **error** before delivering; **warnings** are judgment calls — resolve or consciously accept each one. The linter mechanically enforces the traceability audit (dangling TBD refs, duplicate/non-sequential IDs, missing owners, missing Version, empty S-table statuses) and flags likely loop-walk and design-status gaps. It cannot check truth — the anti-fabrication audit stays yours.
