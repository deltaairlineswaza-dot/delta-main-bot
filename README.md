# Delta Main Bot

A Discord bot providing five formatted Delta flight notification commands and a leadership-reviewed leave-of-absence workflow.

## Setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` and enter the Discord bot token and application ID.
3. Run `npm run deploy` to register slash commands.
4. Run `npm start`.

Use `DISCORD_GUILD_ID` while developing for immediate guild command registration; omit it to register globally.

## Commands

- `/flight-confirmation`
- `/flight-checkin`
- `/flight-final-call`
- `/flight-checkin-closed`
- `/flight-arrived`
- `/loa` — opens a modal for the LOA dates and reason, then sends the request to the configured review channel.
