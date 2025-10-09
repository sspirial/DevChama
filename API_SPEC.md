DevChama API Specification

Authentication
- JWT-based Bearer tokens recommended.
- Endpoints that require auth: all Chama, Membership, Contributions, Tasks, Rewards operations except public Chama listings and user public profiles.

1) Auth
POST /auth/register
- Request
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
- Response (201)
  {
    "id": "uuid",
    "name": "string",
    "email": "string"
  }

POST /auth/login
- Request
  {
    "email": "string",
    "password": "string"
  }
- Response (200)
  {
    "accessToken": "jwt-token",
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }

GET /auth/profile
- Headers: Authorization: Bearer <token>
- Response (200)
  { "id": "uuid", "name": "string", "email": "string", "role": "member" }

2) Users
GET /users/:id
- Response (200)
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "member"
  }

PUT /users/:id
- Headers: Authorization: Bearer <token>
- Request
  {
    "name": "string",
    "email": "string"
  }
- Response (200) updated user

3) Chamas
POST /chamas
- Headers: Authorization
- Request
  {
    "title": "string",
    "description": "string"
  }
- Response (201) created chama

GET /chamas
- Query params: member_of=true to return chamas the user is a member of
- Response (200) [chama]

GET /chamas/:id
- Response (200) chama details including member count

PUT /chamas/:id
- Headers: Authorization (Admin/creator only)
- Request body same as create

4) Membership
POST /chamas/:id/members
- Headers: Authorization
- Request
  {
    "member_role": "Member" // optional, defaults to Member
  }
- Response (201) membership record

GET /chamas/:id/members
- Response (200) [ { user, member_role, joined_date } ]

DELETE /chamas/:id/members/:user_id
- Authorization: member self or admin
- Response (204)

5) Contributions
POST /contributions
- Headers: Authorization
- Request
  {
    "chama_id": "uuid",
    "type": "code|time|money|other",
    "amount": number_or_null,
    "metadata": { /* provider-specific, e.g., github pr link */ }
  }
- Response (201) contribution with points_awarded

GET /contributions/:chama_id
- Response (200) [contribution]

GET /contributions/user/:user_id
- Response (200) [contribution]

6) Tasks
POST /tasks
- Headers: Authorization
- Request
  {
    "chama_id": "uuid",
    "assigned_to_user_id": "uuid | null",
    "title": "string",
    "description": "string",
    "due_date": "ISO8601"
  }
- Response (201) task

GET /tasks/:chama_id
- Response (200) [task]

PUT /tasks/:id
- Headers: Authorization (assigned user or chama admin)
- Request can update status (open, in_progress, done), title, description, due_date

7) Rewards
GET /rewards/:chama_id
- Response (200) [reward]

POST /rewards/distribute
- Headers: Authorization (Admin only)
- Request
  {
    "chama_id": "uuid",
    "distribution": [ { "user_id": "uuid", "points": number, "payout": number|null } ],
    "reason": "string"
  }
- Response (200) distribution record

Notes
- Use per-tenant (chama) roles to gate admin actions within a chama. System role "admin" is global.
- Record audit trails for membership changes, contribution edits, and reward distributions.

Simple JSON Schemas (examples)
User (partial)
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "member"
}

Membership
{
  "user_id": "uuid",
  "chama_id": "uuid",
  "member_role": "string",
  "joined_date": "ISO8601"
}

Contribution
{
  "id": "uuid",
  "user_id": "uuid",
  "chama_id": "uuid",
  "type": "string",
  "amount": number | null,
  "metadata": { },
  "points_awarded": number,
  "date": "ISO8601"
}
