# The flow pass (mandatory, non-skippable — with or without designs)

One or more rounds for everything no single frame contains. In design-first mode this is Phase 2, run after the last per-screen round; **without designs it still runs before any final draft**. Every item below enters the coverage ledger (when one exists) under the same exit rule.

## Loop-walk every exit — the single most-missed layer

For EVERY destination reachable from the feature (each nav item, card, button, story/deeplink target), ask per platform:

- **(a)** where does BACK go from there?
- **(b)** if the user can *finish* something there (a lesson, an assessment, a purchase, a flow), where do they land afterwards?
- **(c)** do those answers change when the same destination is reached from somewhere else in the product (origin-scoping)?

Screen inventories never contain these — every screen shows a place, no screen shows the way back or the landing after completion. Walk the loops item by item; "back works normally" is not an answer, it's a missing row. Optionally render the flow as a small map or list of edges for the PM to correct — a drawn artifact often catches what enumeration misses, but the questions themselves are the mandatory part.

## Screen-to-screen

What triggers each transition? Can the user land mid-flow (deep link, notification, resume)?

## Entry and exit

Where in the product does the flow start? What happens on abandon?

## Segments, gating & rollout

Confirm the hub's checklist item 7 if not yet settled — audience, and full experiment mechanics (split, assignment unit and moment, control experience, existing users). If the feature is an experiment, these become R-rows and non-goals ("nothing changes for control / existing users"), not background.

## Analytics

Propose the event list per the service's naming convention, framed as a proposal; the PM confirms or edits. (Skip for `editscape` and `funnel-constructor-editor` — no tracking layer, per the template's Section 6 rule.)

**Deferral valve:** if the PM defers analytics ("later", "when analytics work starts"), stop proposing — write Section 6 as a single deferred TBD with an owner and milestone, and do not re-raise events in any later round. One deferral from the PM closes the topic.

## Why this pass exists

Skipping it is the protocol's known blind spot: a per-component interview covers what's drawn, and this pass covers what isn't. In audited PRDs, missing return/completion paths are the most common gap that survives all the way to delivery.
