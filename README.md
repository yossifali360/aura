# Aura RP — FiveM Server Website

Full-stack website for a FiveM roleplay server with Discord authentication, server applications, rules, and contact form.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, i18next, Axios |
| Backend | Laravel 11, Sanctum, Socialite (Discord) |

## Features

- Discord OAuth login — navbar shows first name + avatar after sign-in
- Server application form (authenticated users only)
- **Police** and **EMS** faction application pages
- Discord webhook notifications when applications are submitted
- **Admin dashboard** — review applications, approve/reject, view contact messages
- Rules page with categorized guidelines
- Contact us form
- Light / dark mode toggle
- Multi-language: English, Arabic (RTL)
- Reusable UI components (`Button`, `Input`, `Textarea`, `Card`, `Badge`)

## Project Structure

```
aura/
├── frontend/     # React SPA
└── backend/      # Laravel API
```

## Prerequisites

- Node.js 18+
- PHP 8.2+ and Composer (for backend)
- Discord Application ([Discord Developer Portal](https://discord.com/developers/applications))

## Discord Setup

One Discord application handles **login** and **DM messages** (no second app needed).

1. Create an application at https://discord.com/developers/applications
2. **OAuth2** → Redirects: add `http://localhost:8000/api/auth/discord/callback`
3. Copy **Client ID** and **Client Secret**
4. **Bot** (same application) → **Add Bot** → **Reset Token** → copy bot token
5. Invite the bot to your server: OAuth2 → URL Generator → scope `bot` → copy link and open it
6. Copy your **Server ID** (Developer Mode → right-click server → Copy Server ID)

```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:8000/api/auth/discord/callback
DISCORD_BOT_TOKEN=your_bot_token_from_same_app
DISCORD_GUILD_ID=your_discord_server_id
```

When users log in with Discord, they are added to your server automatically so the bot can DM them.

## Backend Setup

If you don't have a full Laravel install yet, scaffold one and merge this backend code:

```bash
composer create-project laravel/laravel backend-temp
# Copy custom files from backend/ into backend-temp/ (app/, routes/, config/, database/migrations/, composer.json deps)
```

Or from the `backend/` folder once PHP/Composer is available:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```

Configure `.env`:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:8000/api/auth/discord/callback
DISCORD_BOT_TOKEN=your_bot_token_from_same_app
DISCORD_GUILD_ID=your_discord_server_id

# Discord webhooks (Server Settings → Integrations → Webhooks)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_POLICE=https://discord.com/api/webhooks/...  # optional, falls back to DISCORD_WEBHOOK_URL
DISCORD_WEBHOOK_EMS=https://discord.com/api/webhooks/...      # optional, falls back to DISCORD_WEBHOOK_URL

# Comma-separated Discord user IDs allowed to access /admin
ADMIN_DISCORD_IDS=your_discord_user_id

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Install Socialite Discord provider (included in `composer.json`):

```bash
composer require laravel/sanctum laravel/socialite socialiteproviders/discord
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/auth/discord/redirect` | No | Start Discord OAuth |
| GET | `/api/auth/discord/callback` | No | OAuth callback → redirects to frontend with token |
| GET | `/api/user` | Bearer token | Current user profile |
| POST | `/api/applications` | Bearer token | Submit server application |
| GET | `/api/applications/me?type=server\|police\|ems` | Bearer token | Latest application by type |
| POST | `/api/contact` | No | Send contact message |
| GET | `/api/admin/stats` | Admin token | Dashboard stats |
| GET | `/api/admin/applications` | Admin token | List applications (filter: `type`, `status`) |
| PATCH | `/api/admin/applications/{id}` | Admin token | Update status (`pending`, `approved`, `rejected`) |
| GET | `/api/admin/contacts` | Admin token | List contact messages |

## Auth Flow

1. User clicks **Login with Discord** → redirected to Laravel OAuth
2. After Discord auth, Laravel creates/updates user and redirects to `http://localhost:5173/auth/callback?token=...`
3. Frontend stores token in Zustand (persisted) and fetches user profile
4. Navbar displays first name and Discord avatar

## Production Notes

- Set `FRONTEND_URL` and `VITE_API_URL` to production domains
- Add production Discord redirect URI
- Enable HTTPS for OAuth
- Consider rate limiting on `/api/contact` and `/api/applications`
