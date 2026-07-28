import 'dotenv/config';
import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { buildNotification } from './notifications.js';
import { hasRoleAbove, isLeadership, loaModal, loaRequestMessage } from './loa.js';

if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is required');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, ready => console.log(`Ready as ${ready.user.tag}`));
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

client.login(process.env.DISCORD_TOKEN);
