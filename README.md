# The Logo Craft — AI Website Manager MVP

A Next.js management dashboard for The Logo Craft (Lovable frontend + WordPress REST API blog backend). This starter is intentionally **read-only**.

## What is included

- Next.js App Router dashboard and login screen.
- Credentials authentication using Auth.js, bcrypt password verification, and a server-side bootstrap admin.
- PostgreSQL + Prisma schema for websites, tasks, findings, approvals, and audit logs.
- WordPress REST API reader for published posts and site metadata.
- Vercel deployments reader.
- OpenAI tool-calling agent with only three read tools.
- API routes for agent commands, integration health, task history, and approval proposals.
- Production write actions are not implemented.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- PostgreSQL 15+
- WordPress site with REST API enabled
- Optional Vercel project and read-only API token
- OpenAI API key

## 1. Install

```bash
npm install
cp .env.example .env
```

Create a PostgreSQL database named `logo_craft_agent`, then set `DATABASE_URL` in `.env`.

Generate a strong Auth.js secret:

```bash
openssl rand -base64 32
```

Set `AUTH_SECRET` and `APP_URL=http://localhost:3000`.

## 2. Create the admin password hash

```bash
node -e "require('bcryptjs').hash('YOUR_STRONG_PASSWORD',12).then(console.log)"
```

Put the resulting hash in `ADMIN_PASSWORD_HASH` and your login email in `ADMIN_EMAIL`.
Do not put a plain-text password in `.env`.

## 3. Configure WordPress read access

In WordPress, create a dedicated integration user with the minimum permissions needed to read published content. Generate an Application Password for that user under its profile.

Set:

```dotenv
WORDPRESS_URL="https://thelogocraft.com"
WORDPRESS_USERNAME="your-integration-user"
WORDPRESS_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```

The client removes spaces from the application password. Never use your main administrator password. The code only issues GET requests to `/wp-json/` and `/wp-json/wp/v2/posts`.

If the Lovable frontend uses a different WordPress API host, set `WORDPRESS_URL` to the actual API host. Confirm the correct endpoint before configuring.

## 4. Configure Vercel read access (optional)

Create a Vercel token restricted to the relevant project and read-only deployment scope. Set:

```dotenv
VERCEL_TOKEN="..."
VERCEL_PROJECT_ID="prj_..."
VERCEL_TEAM_ID="" # optional
```

The integration only reads the latest deployments. It does not create, promote, cancel, or delete deployments.

## 5. Configure AI (optional until agent commands are used)

```dotenv
OPENAI_API_KEY="..."
OPENAI_MODEL="gpt-4.1-mini"
```

Keep this key server-side. Do not prefix it with `NEXT_PUBLIC_`.

## 6. Initialize database and run

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000 and sign in with the configured admin account.

## API endpoints

All management endpoints require an authenticated session.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Basic service health |
| GET | `/api/integrations/status` | Check WordPress and Vercel read connectivity |
| GET | `/api/tasks` | Latest agent tasks |
| POST | `/api/agent` | Run a natural-language read-only agent command |
| GET | `/api/approvals` | List approval proposals |
| POST | `/api/approvals` | Create an approval proposal (does not execute it) |

## Example agent commands

- `List the latest 20 published WordPress posts and show their titles and links.`
- `Check whether the WordPress REST API is reachable and summarize the site metadata.`
- `Show the latest Vercel deployments and their states.`

The agent cannot perform writes. If asked to publish, edit, deploy, change DNS, or modify production, it must explain that it can only prepare a proposal.

## Security and production checklist

Before deploying this dashboard:

1. Use a managed PostgreSQL database with TLS and automated backups.
2. Set `AUTH_SECRET` to a unique, high-entropy secret.
3. Use a separate WordPress integration account and rotate its Application Password.
4. Scope Vercel token to the one project and read-only permissions.
5. Add rate limiting to `/api/agent` and login, plus CSRF/origin controls appropriate to your deployment.
6. Add Sentry or equivalent server-side error monitoring.
7. Configure HTTPS, secure cookie settings, database backups, and secret management.
8. Review the Auth.js and Next.js versions against current security advisories before production launch.
9. Add Search Console and GA4 through their official OAuth flows in a later milestone.
10. Run `npm run build` and test all routes before deploying.

## Important integration note

This project does not assume that the public Lovable site is hosted on Vercel. The WordPress API host and Vercel project are independent settings. If The Logo Craft frontend is hosted somewhere else, leave Vercel variables blank and connect the correct hosting provider in a later integration.

## Current limitations

- The dashboard is a working starter UI, not a finished multi-user SaaS product.
- The login uses one environment-configured bootstrap admin. The Prisma `User` model is groundwork for later user management.
- SEO audits, PageSpeed, Search Console, GA4, scheduled jobs, alerts, and Elementor/Lovable editing are not yet implemented.
- Approval proposals are stored, but there is deliberately no approval-to-production execution path.
- Do not connect production write credentials to this version.
