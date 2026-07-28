import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';

const { DISCORD_TOKEN: token, DISCORD_CLIENT_ID: clientId, DISCORD_GUILD_ID: guildId } = process.env;
if (!token || !clientId) throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required');
const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
await new REST().setToken(token).put(route, { body: commands });
console.log(`Registered ${commands.length} ${guildId ? 'guild' : 'global'} commands.`);
