# JobEscape product spec

How product requirements and design handoffs for jobescape services are authored and handed to engineering.

## Language

### Design handoff

**Layout**:
One of frontend-alpha's page frames a Web Screen sits in: `app` (main sidebar), `profile` (settings sidebar), `registration` (top stepper), or `none` (full screen).
_Avoid_: page type, frame

**Platform template**:
The starting HTML file for one Platform (web or iOS) that a designer's agent copies to begin that Platform's file; it carries the kit and, on Web, the Navigation of every Layout.
_Avoid_: Layout template, shell, starter, template (on its own)

**Prototype skill**:
The `jobescape-prototype` skill that tells a designer's coding agent how to build a Prototype; it holds the shared and per-Platform rules, both Platform templates and the examples.
_Avoid_: designer guide, instructions, style guide

**Prototype**:
What a designer hands off: one folder per feature holding its web file, its iOS file, or both, plus the feature's own image assets.
_Avoid_: mockup, HTML design, vibe file

**Platform**:
Where a design runs: Web (frontend-alpha, desktop and mobile web) or iOS (the jobescape-app). Each Platform has its own file, rules and components; Screens and States match across them by name.
_Avoid_: target, version, variant

**Navigation**:
The parts of a Layout around the feature (sidebar, top bar, mobile tab bar, stepper), as opposed to the feature itself.
_Avoid_: chrome (clashes with the browser), shell, frame

**Primitive**:
A component from the Platform's UI library (HeroUI on Web, HeroUI Native on iOS), such as Button, Chip, TextField or Switch. Every primitive in a Prototype is a library one.
_Avoid_: base component, atom, element

**Custom component**:
A new component a designer composes from Primitives, layout and tokens because the library has nothing like it, such as a challenge card or a leaderboard row.
_Avoid_: one-off, bespoke block, snowflake

**Controls**:
The toolbar built into every Prototype for switching Gallery or Flow, Platform, theme, width, Screen and State, with the contract badge; never part of the design.
_Avoid_: demo panel, debug panel, preview bar

**Contract**:
The rules a Platform file must meet that can be checked by machine; the contract badge in the Controls shows them passing (green) or lists what fails.
_Avoid_: lint, validation, spec

**Handoff notes**:
The block at the top of each Platform file, kept by the designer's agent, listing Custom components, needs for HeroUI Pro, Screens not designed yet, animation losses and open questions.
_Avoid_: changelog, design notes, readme

**Gallery**:
The preview view showing every Screen × State of a Prototype side by side; the default when the file opens.
_Avoid_: board, storyboard, overview

**Flow**:
The preview view showing one Screen × State at real size, clickable from screen to screen through the design's own actions.
_Avoid_: live mode, click-through, demo

**Screen**:
A distinct view in a feature's flow, such as the challenge list or challenge details.
_Avoid_: page, view, step

**State**:
A named variant of one Screen, declared on that Screen, such as loading, empty, in progress, or sheet open.
_Avoid_: mode, variant, scenario (for a single Screen's variant)

**Scenario**:
A State name shared by several Screens, standing for the user's situation across the feature, such as not joined or finished.
_Avoid_: flow, case
