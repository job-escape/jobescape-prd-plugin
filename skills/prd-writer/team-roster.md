# Team roster

Reference data for the `prd-writer` skill. When filling any **Owner** field in a PRD (Analytics events table, Open questions, Rollout dependencies), use this roster to map roles → specific people instead of leaving generic placeholders like `Owner: PM`.

## Usage rules

1. **Map role → person.** If a section calls for `Owner: PM`, replace it with a specific PM from the roster.
2. **If multiple people fit a role, ask the PM at the end of the draft which one.** Don't pick silently. Batch the questions: "I need to assign owners — for the analytics events, is it Сергей or Алёна? For the design questions, Ақниет or Дидар?"
3. **If no one in the roster fits**, keep the field role-level (`Owner: mobile analytics owner [TBD person]`) and add a corresponding entry to Open Questions asking who owns it.
4. **Don't invent roles** that aren't in the roster.
5. **Two people may share a first name** (e.g. two `Мирас`, two `Ислам`). Always disambiguate by the role suffix in parentheses, e.g. `Ислам (CPO)` vs `Ислам (PM)`.

## Roster

### Executive / Leadership

- **Мирас (CEO)** — CEO
- **Маргулан** — CTO
- **Ислам (CPO)** — Chief Product Officer
- **Әнуар** — Head of User Acquisition & Product Owner (Marketing AI Automations)
- **Амандық** — Head of Support

### Product Management

- **Арай** — Product Manager
- **Ислам (PM)** — Product Manager
- **Ельнур** — Growth Product Manager

### Engineering — Frontend

- **Мукан** — Frontend developer
- **Нұрлан** — Frontend developer
- **Асанали** — Frontend developer
- **Дастан** — Frontend developer
- **Асылан** — Frontend developer

### Engineering — Backend

- **Назира** — Backend Engineer
- **Ернар** — Backend Engineer
- **Мырза** — Backend Engineer

### QA

- **Жұлдыз** — QA Engineer

### Design

- **Ақниет** — Lead Product Designer
- **Дидар** — UX/UI Designer

### Content & Learning Experience

- **Әйгерім** — Content Lead
- **Гүлжан** — LX Specialist (Learning Experience)
- **Динара** — LxD (Learning Experience Designer)

### Analytics & Data

- **Сергей** — Analyst
- **Алёна** — Data Analyst
- **Мирлан** — Data Analyst
- **Сабина** — Data Analyst
- **Аружан** — Financial Analyst

### Growth & User Acquisition

- **Ильяс** — Growth
- **Алтынай** — Growth Manager
- **Нұрмұхамед** — Growth Manager
- **Шерхан** — Junior User Acquisition Manager (Google)

### Creative

- **Дильназ** — Creative Producer
- **Мадияр** — Creative Producer
- **Азат** — Creative Producer
- **Олжас** — Lead Video Editor

### Customer Support

- **Назерке** — Support Agent
- **Тамила** — Customer Support
- **Варвара** — Junior Customer Support Agent

### AI / Specialty

- **Темирлан** — AI Specialist

### Payments

- **Мирас (Payments)** — Payments

## Common role → likely owner shortcuts

For typical PRD Owner fields, here are sensible defaults. **Still ask the PM if more than one fits.**

| PRD Owner role | Roster candidates |
|---|---|
| `Owner: PM` | Арай, Ислам (PM), Ельнур — ask which |
| `Owner: design` / `Owner: design lead` | Ақниет (lead), Дидар (UX/UI) |
| `Owner: content lead` | Әйгерім |
| `Owner: Academy lead` / `Owner: LX` | Гүлжан, Динара — ask which |
| `Owner: backend` | Назира, Ернар, Мырза — ask which |
| `Owner: frontend` | Мукан, Нұрлан, Асанали, Дастан, Асылан — ask which |
| `Owner: QA` | Жұлдыз |
| `Owner: analytics` / `Owner: data` | Сергей, Алёна, Мирлан, Сабина — ask which |
| `Owner: growth` | Ельнур, Алтынай, Нұрмұхамед, Ильяс — ask which |
| `Owner: support` | Амандық (head), Назерке, Тамила, Варвара |
| `Owner: payments` | Мирас (Payments) |
| `Owner: AI` | Темирлан |
| `Owner: CTO` | Маргулан |
| `Owner: CPO` | Ислам (CPO) |
| `Owner: CEO` | Мирас (CEO) |

## Maintenance

This file is the source of truth for who's on the team. Update when people join, leave, or change roles. Bump the plugin version (`plugin.json` + `marketplace.json`) on any roster change so PMs running `/plugin marketplace update jobescape` pull the latest list.
