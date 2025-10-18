# DevChama Project – Week 2 Progress Report
**Date:** October 18, 2025  
**Owner:** Emmanuel Munubi  
**Sprint:** Week 2 – Core Chama Features

---

## 1. Highlights & Deliverables
- **User Management**
  - Added registration endpoint with password validation and profile retrieval/update APIs (`POST /api/auth/register/`, `GET|PUT /api/auth/profile/`).
- **Access Control**
  - Introduced custom permission helpers for chama-based roles.
  - Scoped list/detail endpoints so members only see chamas, contributions, tasks, and rewards they belong to.
- **Membership Management**
  - Prevented duplicate joins, enabled admins to invite/promote/demote, and added self-serve leave endpoint (`DELETE /api/chamas/<id>/members/me/`).
  - Added "My Chamas" view (`GET /api/me/chamas/`).
- **Task & Contribution Validation**
  - Enforced monetary contribution rules, ensured task assignees are members, and exposed `assigned_to_user_id` helper for API clients.
- **Automated Tests**
  - Added seven API/serializer test cases covering membership flows, task permissions, and contribution validation (`manage.py test api`).
- **API Documentation**
  - Integrated drf-spectacular with Swagger UI (`/api/docs/`), Redoc (`/api/redoc/`), and JSON schema (`/api/schema/`).
  - Published starter Postman/Insomnia collection (`api_collection.json`).

## 2. Challenges & Resolutions
| Challenge | Impact | Resolution |
|-----------|--------|------------|
| Aligning chama-level permissions with Django’s auth model | Needed granular control by group role | Built reusable helpers (`is_chama_member`, `is_chama_admin`) and custom DRF permission classes applied across viewsets |
| Handling membership edge cases (duplicate joins, owner leaving) | Risk of inconsistent state | Added validation paths and explicit error handling; prevented owner from leaving without transfer |
| Documenting rapidly evolving APIs | Ensuring consumers stay up-to-date | Adopted drf-spectacular to auto-generate schema and exposed friendly docs endpoints |

## 3. Quality Gates
- ✅ `python manage.py check`
- ✅ `python manage.py test api` (7 tests, all passing)
- 🔄 No lint suite configured yet (recommend adding `flake8`/`ruff` in Week 3)

## 4. What’s Next (Week 3 Plan)
1. **Contributions & Task Enhancements**
   - Implement points calculation logic and task status transitions with audit trail.
   - Add filters/search to contributions and tasks endpoints (by type, status, due date).
2. **Dashboard Foundations**
   - Prepare summary endpoints for contributions and tasks to seed analytics/dashboards (planned Week 4).
3. **Frontend Kickoff (Stretch)**
   - Scaffold frontend project (Next.js/React) and consume newly documented API endpoints.
4. **Engineering Hygiene**
   - Add lint/type checks to CI.
   - Extend automated tests (reward distribution, nested membership permissions).

## 5. Risks & Mitigations
- **Permissions Complexity** – Continue writing targeted tests as new roles/actions are added.
- **Scope Creep** – Keep integrations (GitHub, M-Pesa) parked until core contributions and dashboards are stable.
- **Testing Coverage** – Expand tests incrementally; consider coverage reporting in CI.

## 6. Reference Artifacts
- Project Plan: `PROJECT_PLAN.md`
- API Spec: `API_SPEC.md`
- Backend README & setup: `backend/README.md`
- Postman Collection: `api_collection.json`
- Test Suite: `backend/api/tests/`
- API Docs: `/api/docs/`, `/api/redoc/`

---
**Summary:** Week 2 delivered end-to-end chama membership management, robust permission enforcement, stronger validation, and working API documentation with tests. The backend is ready for Week 3’s focus on contribution metrics, task workflows, and dashboard groundwork.
