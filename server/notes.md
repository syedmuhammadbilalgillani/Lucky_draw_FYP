2. API List (for complete project)

Assume REST-style APIs with JSON. You can adapt these to Express, Django, etc.

Auth

POST /api/auth/register
Register new user (participant by default).

POST /api/auth/login
Login, return JWT/session.

POST /api/auth/logout
Invalidate session / token (if using server-side sessions).

GET /api/auth/me
Get current user profile and role.

Users (Admin)

GET /api/users
List users (with filters: role, status).

GET /api/users/:id
Get user details.

PATCH /api/users/:id
Update role, status, or basic info.

DELETE /api/users/:id
Soft delete / block user (optional).

Lucky Draws

For participants / public:

GET /api/draws
List draws (filters: status, upcoming, completed).

GET /api/draws/:id
Get draw detail (info, prizes, schedule).

GET /api/draws/:id/entries/me
Check if current user joined this draw and entry status.

GET /api/draws/:id/winners
Public winners list after completion.

For admins (management):

POST /api/draws
Create new draw (title, time, type, maxWinners, criteria, etc.).

PATCH /api/draws/:id
Update draw (only if not completed).

PATCH /api/draws/:id/status
Change status: DRAFT → OPEN → CLOSED → COMPLETED.

DELETE /api/draws/:id
Cancel/remove draw (if allowed by business rules).

GET /api/draws/:id/participants
List all participant entries for a draw.

POST /api/draws/:id/run
Trigger random winner selection algorithm and store winners.

Prizes (per draw)

GET /api/draws/:id/prizes
List prizes for a draw.

POST /api/draws/:id/prizes
Create prizes for a draw.

PATCH /api/prizes/:prizeId
Update prize details.

DELETE /api/prizes/:prizeId
Remove prize.

Participant Entries (joining draws)

POST /api/draws/:id/entries
Join draw (current user). Validate eligibility and status.

GET /api/me/entries
List all entries of logged-in user (with draw info).

PATCH /api/entries/:entryId/validate (Admin)
Mark entry as valid/invalid and reason if invalid.

Winners

GET /api/winners (Admin)
List winners across draws (filters: date range, drawId).

GET /api/me/wins
List all wins for current user.

Notifications

GET /api/notifications
List notifications for logged-in user.

PATCH /api/notifications/:id/read
Mark single notification as read.

PATCH /api/notifications/read-all
Mark all as read.

Reports / History (Admin)

GET /api/reports/draws
Summary per draw: total entries, valid entries, winners, etc.

GET /api/reports/draws/:id
Detailed report for a single draw.

3. Frontend Pages + Descriptions

You can implement these with React/Vue + a router.

Public / Participant Side

Landing Page

Basic intro to the platform.

Shows featured / upcoming draws.

Buttons: “Login”, “Register”, “View Draws”.

Register Page

Form: name, email, password, confirm.

On success → go to dashboard or login.

Login Page

Email + password.

After login: redirect based on role:

PARTICIPANT → Participant Dashboard.

ADMIN → Admin Dashboard.

Participant Dashboard

Overview of:

“Upcoming Draws”

“My Active Entries”

“My Wins”

Quick links: “Browse All Draws”, “My Notifications”.

Draw List Page (All Draws)

Shows list with filters:

Status: Upcoming / Open / Closed / Completed.

Each card: title, short description, dates, status, “View Details”.

Draw Detail Page

Shows:

Draw info (title, description, type, schedule, status).

Prize list (rank, name, quantity).

Eligibility rules.

Actions for participant:

If OPEN and not joined: “Join Draw” button.

If already joined: show entry status and ticket number.

If COMPLETED: show winners list and highlight if user is a winner.

My Entries Page

Table of all draws user has joined.

Columns: Draw name, entry time, status, result (Won / Lost / Pending).

Click row → open draw detail.

My Wins Page

Only entries where user is a winner.

Shows prize, draw name, win time, claim instructions (if needed).

Profile Page

View & edit basic info (name).

Change password.

View email and role.

Notifications Page

List notifications (new at top).

Each item: type (Win / Draw Open / General), short text, date.

Action: mark as read, “Mark all as read”.

Clicking may open related draw.

Admin Side

Admin Dashboard

Cards or charts:

Total draws.

Upcoming vs Open vs Completed.

Total participants.

Recent draws list and quick actions:

“Create New Draw”.

Draw Management Page (Admin Draw List)

Table of all draws:

Columns: Title, Status, Start, End, Created By, Actions.

Actions per row:

Edit, View, Manage Prizes, View Participants, Run Draw, Delete/Close.

Create / Edit Draw Page

Form fields:

Title, description.

Draw type (single/multi winner).

Start / End date/time.

Max winners.

Eligibility criteria.

Status (Draft/Open).

Actions:

Save as draft.

Publish / Open.

Draw Detail (Admin)

Same info as participant, plus:

Tabs:

Overview (info + stats).

Prizes.

Participants.

Winners.

Buttons:

Open/Close Draw.

Run Lucky Draw (random selection) if status = CLOSED.

Re-run (if business rules allow).

Prize Management Page

For a specific draw.

List all prizes (rank, name, quantity).

Actions:

Add new prize.

Edit prize.

Delete prize.

Participants Management Page

For a specific draw.

Table: Participant name, email, entryTime, isValid, invalidReason.

Actions:

Mark entry valid/invalid with reason.

Export list (CSV/Excel if you implement it).

Winners Page (Admin)

For a specific draw:

Show winners + prizes.

Global winners view:

Filter by draw, date range.

Reports Page

Summary cards + filters:

Draw performance (entries, conversion).

Top draws by participation.

Option to export reports.

User Management Page (Admin)

List users:

Name, email, role, status, createdAt.

Actions:

Change role (participant/admin).

Block/unblock user.

View user details & their entries.