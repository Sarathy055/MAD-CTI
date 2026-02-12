# Dark Web Threat Intelligence Dashboard

## Features
## Quick start (Windows / PowerShell)

1. Install dependencies (frontend + backend):

```powershell
npm install
```

2. Set required environment variables (development):

- `VT_API_KEY` — your VirusTotal API v3 key (optional; VT endpoints will error if not set)
- `AUTH_SECRET` — secret string used to sign JWTs (recommended to set in dev)

Example (PowerShell):

```powershell
$env:VT_API_KEY = 'your_virustotal_api_key_here';
$env:AUTH_SECRET = 'replace_with_a_long_secret';
npm run start-server
```

3. Start the frontend in a separate terminal:

```powershell
npm start
```

The frontend will open in your browser (default port 3000). The backend runs on port 5000 by default.

## User persistence

The backend persists registered users locally so you don't need to re-register after a restart. The server will try to use `lowdb` (pure-JS JSON DB) if installed; otherwise it falls back to a simple `users.json` file in the project root.

- If `lowdb` is available a `db.json` file will be used/created.
- If `lowdb` isn't installed, `users.json` is used (this file is created automatically when you register).

You can inspect `users.json` to verify saved users; password hashes are bcrypt hashes (not reversible).

## OAuth (optional)

The repo contains optional Passport scaffolding for Google, GitHub, and Microsoft OAuth. To enable these you must:

1. Register an OAuth app with the provider and set the callback URL to `http://localhost:5000/auth/<provider>/callback`.
2. Set provider client ID/secret environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.).
3. Restart the backend so the strategies are initialized.

OAuth requires provider-side configuration and correct redirect URIs; without those the social sign-in buttons will open the provider page but the flow won't complete.

## Common issues & troubleshooting

- "Failed to fetch" on auth endpoints from the frontend:
	- Make sure the backend is running on port 5000 (`npm run start-server`).
	- Verify the frontend is calling the backend at `http://localhost:5000` (some dev setups proxy calls and can return HTML from the dev server). The app is already wired to call the backend directly.
	- Check the browser console and network tab for the failing request. If the request shows CORS or network errors, ensure the backend printed `Auth server listening on 5000` and there is no firewall blocking local loopback.
	- You can test the backend health from PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/health
```

- "Cannot login after restart" or users disappearing:
	- Confirm `users.json` or `db.json` exists in the project root. The server will create `users.json` when the first user registers if lowdb is not installed.
	- If you previously had in-memory users (before these changes), they won't survive restarts. After the recent changes the server persists users to `users.json` (or `db.json` if you install `lowdb`).
	- To ensure the current server process uses persistent storage, stop any old node process and restart the server from the project root:

```powershell
# Find the process using port 5000 and stop it (if any), then start server
Get-NetTCPConnection -LocalPort 5000 | Format-List
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
Stop-Process -Id <pid> -Force
node "${PWD}\server.js"
```

- "EADDRINUSE: address already in use :::5000" when starting the server:
	- Another process (often a previous node server) is already listening on port 5000. Find and stop it with PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 5000 | Format-List
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
Stop-Process -Id <pid> -Force
```

Then start the server from the project root:

```powershell
node "c:\Users\<you>\OneDrive\Documents\Desktop\darkweb-threat-intel\darkweb-threat-intel\server.js"
```

## Development notes

- The frontend is in `src/` and the key components for auth and VT are `src/components/Login.js`, `src/components/SearchBar.js`, and `src/components/ThreatDashboard.js`.
- The backend is `server.js` and exposes:
	- POST `/api/auth/register` — register a user
	- POST `/api/auth/login` — login (returns JWT)
	- GET `/api/auth/me` — get profile (requires Authorization: Bearer <token>)
	- POST `/api/vt/lookup` — VirusTotal lookup (requires `VT_API_KEY` in env)

## Next steps and optional improvements

- Install `lowdb` to use `db.json` instead of `users.json`: `npm install lowdb`.
- Improve production secrets management (don't store secrets in plain env in production).
- Add rate limiting and input validation on VT endpoints to avoid abuse.

If you want, I can:
- Wire `lowdb` fully (migrate and remove `users.json` fallback), or
- Walk you through registering OAuth apps and testing social login end-to-end.

---

Happy hacking — open an issue or ask here if anything fails while you run it.

## Installation

1. Install dependencies:
```bash
npm install