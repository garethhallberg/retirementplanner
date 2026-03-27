# Retirement Transition Companion

A full-stack application to help people plan and navigate the transition into retirement.

## Tech Stack

- **Frontend**: Next.js (React), TypeScript
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker Compose

## What's Been Implemented

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes in the frontend

### Retirement Countdown & Preparation (Module 2)
- **Countdown Timer** — days-until-retirement display with contextual messages, retired state detection
- **Pre-Retirement Checklist** — full CRUD with categories: financial, legal, healthcare, lifestyle
- Frontend checklist and countdown pages wired to the API

### Financial Planning (Module 1 — partial)
- **Account Aggregation** — manual entry of financial accounts (bank, investment, retirement) with CRUD API
- **Net Worth Snapshots** — read endpoint for historical net worth data
- Database schema for `financial_accounts` and `net_worth_snapshots` tables
- No frontend UI yet

### Goals (Module 3 — partial)
- CRUD API for goals with category filtering
- Database schema for `goals` table (title, description, category, status, target date)
- No frontend UI yet

### App Shell
- Navigation bar with links to Dashboard, Countdown, Finances, Checklist, and Goals
- Responsive layout with auth-aware header (login/logout)

## Not Yet Implemented

The following modules from the feature spec have no implementation yet:

- **Financial Planning Dashboard** — UI for accounts, net worth timeline, income planner, expense analyser
- **Milestone Tracker** — visual progress through preparation phases
- **Lifestyle Designer** — interest explorer, daily routine builder, bucket list manager
- **Health & Wellness Tracker** — fitness logging, healthcare planner, nutrition guide
- **Social Connection Hub** — local groups, event calendar, volunteer finder
- **Integrations** — Plaid/Yodlee, Medicare APIs, calendar sync, location services
- **Reporting** — PDF export, printable checklists, adviser reports
- **Notifications** — task reminders, financial alerts, milestone celebrations
- **Onboarding Flow** — guided setup (retirement date, accounts, interests, goals)

## Running Locally

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Running Tests

Run all tests (backend + frontend) from the project root:

```bash
make test
```

### Backend only

```bash
make test-backend
```

### Frontend only

```bash
make test-frontend
```

### Installing dependencies

```bash
make install
```

Requires [uv](https://docs.astral.sh/uv/) for the Python backend and Node.js/npm for the frontend.
