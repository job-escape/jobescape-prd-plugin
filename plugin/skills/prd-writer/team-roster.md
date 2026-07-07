# Team roster

Reference data about the jobescape team. **Not wired into PRD drafting** — `prd-writer` fills Owner fields with roles, not names, and does not consult this file. Kept as a standalone reference (who's on the team, who fits which role) for when someone asks explicitly.

## Usage rules

1. **Do not use this file during PRD drafting.** Owner fields in PRDs stay role-level (`Owner: PM`, `Owner: design`).
2. **Two people may share a first name** (e.g. two `Мирас`, two `Ислам`). Always disambiguate by the role suffix in parentheses, e.g. `Ислам (CPO)` vs `Ислам (PM)`.

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

Reference only — who typically fits a given role.

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
