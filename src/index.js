import 'dotenv/config';
import { createServer } from 'node:http';
import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import { commands } from './commands.js';
import { config } from './config.js';
import { buildNotification } from './notifications.js';
import { hasRoleAbove, isLeadership, loaModal, loaRequestMessage } from './loa.js';

if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is required');
// Render values are sometimes pasted with surrounding spaces or the HTTP
// authorization prefix. Client#login expects only the token itself.
const discordToken = process.env.DISCORD_TOKEN.trim().replace(/^Bot\s+/i, '');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Render's free Web Service requires an HTTP listener. The Discord connection
// still does all bot work; this endpoint only provides a deployment health check.
const port = Number(process.env.PORT ?? 3000);
createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', discordReady: client.isReady() }));
    return;
  }
  response.writeHead(200, { 'content-type': 'text/plain' });
  response.end('Delta Main Bot is running.');
}).listen(port, '0.0.0.0', () => console.log(`Health server listening on port ${port}`));

client.once(Events.ClientReady, async ready => {
  console.log(`Ready as ${ready.user.tag}`);
  try {
    if (process.env.DISCORD_GUILD_ID) {
      const guild = await ready.guilds.fetch(process.env.DISCORD_GUILD_ID);
      await guild.commands.set(commands);
      console.log(`Registered ${commands.length} commands in ${guild.name}.`);
    } else {
      await ready.application.commands.set(commands);
      console.log(`Registered ${commands.length} global commands.`);
    }
  } catch (error) {
    // Keep the bot and health endpoint online so Render provides useful logs
    // instead of terminating the entire service on a command setup mistake.
    console.error('Could not register Discord slash commands:', error);
  }
});
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'loa') {
        if (!hasRoleAbove(interaction.member, config.loaMinimumRoleId)) return interaction.reply({ content: `You must have a role above <@&${config.loaMinimumRoleId}> to request an LOA.`, ephemeral: true });
        return interaction.showModal(loaModal());
      }
      await interaction.reply(buildNotification(interaction));
      return;
    }
    if (interaction.isModalSubmit() && interaction.customId === 'loa:submit') {
      const channel = await client.channels.fetch(config.loaChannelId);
      if (!channel?.isTextBased()) return interaction.reply({ content: 'The LOA review channel is unavailable.', ephemeral: true });
      await channel.send(loaRequestMessage(interaction));
      await interaction.reply({ content: 'Your LOA request was submitted to Delta Leadership.', ephemeral: true });
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith('loa:')) {
      if (!isLeadership(interaction.member)) return interaction.reply({ content: 'Only Delta Leadership can review LOA requests.', ephemeral: true });
      const decision = interaction.customId.split(':')[1];
      const embed = interaction.message.embeds[0];
      const fields = embed.fields.filter(field => field.name !== 'Status');
      const approved = decision === 'approve';
      const updated = EmbedBuilder.from(embed).setColor(approved ? 0x2ecc71 : 0xe74c3c).setFields(...fields, { name: 'Status', value: `${approved ? 'Approved' : 'Denied'} by <@${interaction.user.id}>` });
      await interaction.update({ embeds: [updated], components: [] });
    }
  } catch (error) {
    console.error(error);
    const response = { content: 'Something went wrong while processing that request.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response).catch(console.error);
    else await interaction.reply(response).catch(console.error);
  }
});

try {
  await client.login(discordToken);
} catch (error) {
  if (error?.code === 'TokenInvalid') {
    console.error([
      'DISCORD_TOKEN is invalid.',
      'In the Discord Developer Portal, open your application, select Bot,',
      'choose Reset Token, and copy the new BOT TOKEN into Render.',
      'Do not use the Application ID, Client Secret, Public Key, or server ID.',
      'Paste the token without quotes, then save and redeploy.',
    ].join(' '));
  } else {
    console.error('Discord login failed:', error);
  }
  process.exit(1);
}
