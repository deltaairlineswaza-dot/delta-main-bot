# Delta Main Bot

A Discord bot providing five formatted Delta flight notification commands and a leadership-reviewed leave-of-absence workflow.

## Setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` and enter the Discord bot token and application ID.
3. Run `npm start`. The bot registers its slash commands after connecting.

Use `DISCORD_GUILD_ID` while developing for immediate guild command registration; omit it to register globally.

## Deploying on Render

Create a **Web Service** connected to this repository and enter these values:

| Render field | Value |
| --- | --- |
| Root Directory | Leave blank |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free (or any paid instance) |
| Health Check Path | `/health` |

Add the following under **Environment Variables** (do not put the bot token in the commands above):

- `DISCORD_TOKEN`: the token from the Discord Developer Portal's **Bot** page.
  A `TokenInvalid` error means this value is wrong or revoked. Fix it by opening
  **Developer Portal → Applications → your application → Bot**, selecting
  **Reset Token**, and copying the newly generated token. In Render, replace the
  entire `DISCORD_TOKEN` value with it and save before redeploying. Do not use an
  Application ID, Client Secret, Public Key, server ID, or an old token. Paste
  only the token, with no quotes and no `Bot ` prefix.
- `DISCORD_GUILD_ID`: the ID of your Discord server. This is optional, but recommended so slash-command changes appear immediately. Enable Developer Mode in Discord and use **Copy Server ID**.

You do **not** need a client ID on Render anymore; the running bot obtains its application automatically from the bot token. Do not add `PORT`; Render supplies it automatically. After connecting, the bot registers its slash commands itself. The app exposes `/health` so Render can verify that the Web Service is alive.

If you use the optional `npm run deploy` command locally, `DISCORD_CLIENT_ID` is still the **Application ID** found under **General Information** in the [Discord Developer Portal](https://discord.com/developers/applications).

### Resolving this PR's GitHub conflicts

If GitHub shows conflicts between the bot PR branch and `main`, keep the bot
PR's newer version: select **Accept current change** for every conflict block in
`.env.example`, `README.md`, and `src/index.js`. Do not select **Accept both
changes**, because that leaves duplicate imports/login calls. After every block
is resolved, select **Mark as resolved**, then **Commit merge**. Return to the
pull request and merge it before redeploying Render.

### When Render says only "Exited with status 1"

The Events page reports only that the process stopped; it does not contain the
actual error. Select the red **Deploy failed** event, open **View logs** (or the
**Logs** tab), and find the first error immediately above `Exited with status
1`. If it says `TokenInvalid`, replace `DISCORD_TOKEN` using the instructions
above. If it reports a different error, copy that error and its preceding lines;
the deployment cannot be diagnosed from the status-1 message alone.

## Commands

- `/flight-confirmation`
- `/flight-checkin`
- `/flight-final-call`
- `/flight-checkin-closed`
- `/flight-arrived`
- `/loa` — opens a modal for the LOA dates and reason, then sends the request to the configured review channel.
