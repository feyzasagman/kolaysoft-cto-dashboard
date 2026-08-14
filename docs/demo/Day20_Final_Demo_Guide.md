# Day 20 — Final Demo Guide (~8–10 minutes)

**Environment:** Docker Compose — http://localhost:3000  
**Seed ADMIN (DEMO ONLY):** `admin@kolaysoft.com.tr` / `Admin123!`  
**Do not** present this as a production login.

If the local DB volume is empty besides ADMIN, create PM, CTO, and one GREEN + one YELLOW project **during** the ADMIN/PM steps (same as Day 18). Product Tour screenshots already show a GREEN/YELLOW contrast captured from a previous verified demo.

---

## 0:00–0:45 — Problem

**Show:** Login page (logged out).  
**Say:** Weekly status was scattered (mail/files). This MVP gives ADMIN provisioning, PM weekly reporting, and a CTO portfolio with derived health — JWT/RBAC on the API, not only hidden buttons.  
**Point at:** Role-based product; Docker is the official reproducible demo.

---

## 0:45–2:00 — ADMIN

**Click:** Login with seed ADMIN.

**Click:** **Kullanıcılar**.

**Say:** ADMIN creates people; there is no public registration.

**Do:** Create `PROJECT_MANAGER` and `CTO` (unique demo emails). Note the passwords off-screen.

**Click:** **Projeler** → new project (Project A — keep it simple, ACTIVE). Assign the PM as manager.

**Click:** Project **Ekip** tab — add a team member if you created a second user.

**Show:** Users list + project detail assignment.  
**Say:** UI and API both require ADMIN for this.

---

## 2:00–3:30 — PROJECT_MANAGER

**Click:** Logout → login as the PM.

**Show:** No Users admin menu (or it is blocked).

**Click:** Own project → **Haftalık rapor**.

**GREEN example (Project A):** planned **70**, actual **65** (gap 5), schedule on track, optional low/no open HIGH risk.

**Click:** Add a **work item** and a mild **risk** if you will later need YELLOW.

**YELLOW example (Project B, if you add a second project as ADMIN first):**  
After a first GREEN create (required if health would otherwise be YELLOW without a risk): add an open **HIGH** risk, then update planned **70** / actual **55**, `AT_RISK`. Health becomes **YELLOW**.

**Say:** Health is calculated (progress gap, schedule, open risk) — YELLOW/RED without an open risk is rejected (BUG-002 fix).

---

## 3:30–5:30 — CTO Dashboard

**Click:** Logout → login as CTO.

**Show:** http://localhost:3000 dashboard.

**Point at:** KPI strip, **health distribution**, project table/cards.

**Click:** Health / status filters if visible.

**Say:** CTO sees the whole portfolio; PM only saw assigned work.

**Values to call out:** at least one GREEN vs one YELLOW if you created the pair; otherwise explain you will open Project Detail next and that screenshots in README already show the contrast.

---

## 5:30–6:30 — Attention / Insight

**Click:** **Attention Center** (dashboard / portfolio attention panel).

**Say:** Deterministic ranking — no LLM. YELLOW + open HIGH risk + progress gap surface here.

**Click:** YELLOW (or any) project → **Project Detail** → **Yönetici Özeti / Executive Insight**.

**Point at:** target vs actual, health, risk, report status.

---

## 6:30–7:15 — Security / read-only

**On Project Detail as CTO:** no create/edit report, work item, or risk buttons (or they fail via API).

**Say:** Authorization is enforced in Spring Security; hiding controls is not enough.

**Optional:** mention JWT in Authorization header; Actuator `env` is not public.

---

## 7:15–8:00 — Tests / CI / Docker

**Show (pick two):**

- README Quality Snapshot  
- GitHub Actions CI badge / latest green run on `main`  
- `docker compose ps` — postgres/backend healthy, frontend up  
- Health: `/api/v1/health` and `/actuator/health/readiness`

**Say:** Quality gate = backend verify + frontend lint/unit/build + Playwright E2E in CI. Official demo is this Docker stack.

---

## 8:00–8:30 — Closing

**Say:** Full Stack MVP: three roles, weekly reporting, derived health, Docker-reproducible. Public cloud was explored and **deferred**; we do not claim a live production URL.

**Leave on:** Dashboard or Product Tour screenshot in README.

---

## Backup if time is short

Skip work-item detail; keep ADMIN user+project, one PM report, CTO dashboard + insight + read-only.
