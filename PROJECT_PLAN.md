Title: DevChama – Developer Cooperative Platform
Duration: 5 weeks
Owner: Emmanuel Munubi

1. Project Idea
DevChama adapts the traditional chama (savings/investment group) model for developers. Instead of pooling only money, members pool code, time, skills, and sometimes funds. The aim is to:
- Create collective ownership of projects.
- Provide fair incentives that aren’t monopolized by corporations.
- Allow developers to collaborate on shared goals, track contributions, and grow both financially and technically.

2. Core Features
- Member Management: Register/login, profile, role assignment.
- Chama Groups: Create and join project-based chamas.
- Contribution Tracking:
  - Code contributions (commits, issues, pull requests).
  - Time logs or task completion.
  - Financial contributions (optional).
- Project Management Tools:
  - Task boards (assignments, deadlines).
  - Feedback/peer review.
- Rewards/Dividends:
  - Contribution points → reputation or ownership shares.
  - Financial payout or token-based system (optional).
- Reporting/Dashboard: Visual overview of members’ contributions and group performance.
- Communication Layer (optional): Internal messaging or integration with Slack/Discord.

3. APIs & Integrations (Optional)
- GitHub API (for tracking commits, PRs, issues).
- Payment API (e.g., M-Pesa Daraja API) if you want to integrate financial contributions.
- Authentication: OAuth2 / Firebase Auth.

4. Data Models
User
- id (PK), name, email, password_hash, role (admin/member)
- role is system-wide.

Chama
- id (PK), creator_id (FK to User), title, description
- creator_id tracks who created the group.

Membership
- user_id (PK, FK), chama_id (PK, FK), joined_date, member_role (e.g., Admin, Treasurer, Member)
- Junction Table for User ↔ Chama M:M relationship. member_role is group-specific.

Contribution
- id (PK), user_id (FK), chama_id (FK), type, amount, date, points_awarded
- Links contribution to a specific User and Chama.

Task
- id (PK), chama_id (FK), assigned_to_user_id (FK to User), title, description, status, due_date
- Links task to a Chama and optionally to an assigned User.

Reward/Dividend
- id (PK), user_id (FK), chama_id (FK), points, payout (optional, numeric), date_distributed
- Links reward to a specific User and Chama.

5. API Endpoints
Auth
- POST /auth/register — Create a new user account.
- POST /auth/login — Authenticate and return an access token.
- GET /auth/profile — Retrieve the authenticated user's profile.

Users
- GET /users/:id — Retrieve a specific user's public profile.
- PUT /users/:id — Update a specific user's profile.

Chamas
- POST /chamas — Create a new Chama group.
- GET /chamas — List all Chamas (or Chamas the user is a member of).
- GET /chamas/:id — Retrieve details for a specific Chama.
- PUT /chamas/:id — Update Chama details (Admin/Creator only).

Membership (New)
- POST /chamas/:id/members — Join a Chama (Create a Membership record).
- GET /chamas/:id/members — List all members of a specific Chama.
- DELETE /chamas/:id/members/:user_id — Remove a member from a Chama (Leave or Admin removal).

Contributions
- POST /contributions — Record a new contribution.
- GET /contributions/:chama_id — List all contributions for a Chama.
- GET /contributions/user/:user_id — List all contributions made by a specific user (across Chamas).

Tasks
- POST /tasks — Create a new task in a Chama.
- GET /tasks/:chama_id — List all tasks for a Chama.
- PUT /tasks/:id — Update a task's details or status.

Rewards
- GET /rewards/:chama_id — List distributed rewards for a Chama.
- POST /rewards/distribute — Distribute a new reward/dividend (Admin only).

6. Timeline
Week 1 — Setup & Foundations
- Finalize schema, setup repo, CI/CD.
- Implement authentication & basic User CRUD.

Week 2 — Core Chama Features
- Chama creation/joining (Membership CRUD).
- Member management (defining member_role).

Week 3 — Contributions & Tasks
- Contribution tracking system implementation.
- Task board (CRUD + assignments).

Week 4 — Dashboard & Rewards
- Analytics dashboard implementation.
- Contribution → Reward/Dividend logic.

Week 5 — Integrations & Polish
- GitHub/M-Pesa APIs (if time allows).
- UI polish, testing, deploy MVP.

7. Tools & Stack
- Frontend: React / Next.js (or plain React if simpler).
- Backend: Node.js + Express (or Django if you prefer Python).
- Database: PostgreSQL / MongoDB.
- Auth: JWT / Firebase Auth.
- Deployment: Vercel + Render/Heroku/DigitalOcean.

8. Risks & Notes
- API integrations can eat time → keep optional until core is working.
- Keep scope narrow: build MVP first, expand later.
- Contribution-to-reward logic must be transparent to avoid disputes.

9. ERD Diagram
(Attached by user)

Acceptance Criteria
- Users can register and log in (authentication success).
- Users can create Chamas and join via Membership records.
- Contributions can be recorded and linked to users and Chamas.
- Tasks can be created and assigned within a Chama.
- Admins can distribute rewards based on recorded contribution points.

Next steps
- Create `API_SPEC.md` describing request/response schemas.
- Initialize repository skeleton with chosen stack.
- Open initial issues for Week 1 tasks.
