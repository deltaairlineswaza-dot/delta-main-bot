import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { config } from './config.js';

export function hasRoleAbove(member, roleId) {
  const boundary = member.guild.roles.cache.get(roleId);
  return Boolean(boundary && member.roles.highest.comparePositionTo(boundary) > 0);
}

export function loaModal() {
  const field = (id, label, style = TextInputStyle.Short) => new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(true);
  return new ModalBuilder().setCustomId('loa:submit').setTitle('Leave of Absence Request').addComponents(
    new ActionRowBuilder().addComponents(field('start', 'First day of LOA (YYYY-MM-DD)')),
    new ActionRowBuilder().addComponents(field('end', 'Return date (YYYY-MM-DD)')),
    new ActionRowBuilder().addComponents(field('reason', 'Why are you requesting an LOA?', TextInputStyle.Paragraph).setMaxLength(1000)),
  );
}

export function loaRequestMessage(interaction) {
  const id = interaction.id;
  return {
    content: `<@&${config.leadershipRoleId}>`,
    allowedMentions: { roles: [config.leadershipRoleId] },
    embeds: [new EmbedBuilder().setColor(0x0b1f66).setTitle('Leave of Absence Request').setDescription(`Request from <@${interaction.user.id}>`).addFields(
      { name: 'First day', value: interaction.fields.getTextInputValue('start'), inline: true },
      { name: 'Return date', value: interaction.fields.getTextInputValue('end'), inline: true },
      { name: 'Reason', value: interaction.fields.getTextInputValue('reason') },
      { name: 'Status', value: 'Pending leadership review' },
    ).setTimestamp()],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`loa:approve:${id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`loa:deny:${id}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
    )],
  };
}

export function isLeadership(member) {
  const leadership = member.guild.roles.cache.get(config.leadershipRoleId);
  return Boolean(leadership && member.roles.highest.comparePositionTo(leadership) >= 0);
}
