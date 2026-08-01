import { SlashCommandBuilder } from 'discord.js';

const link = option => option.setName('link').setDescription('Roblox event/game link').setRequired(true);
const number = option => option.setName('flight_number').setDescription('Flight number (without DL)').setRequired(true);
const destination = option => option.setName('destination').setDescription('Destination airport or city').setRequired(true);

export const commands = [
  new SlashCommandBuilder().setName('flight-confirmation').setDescription('Post a Delta flight confirmation')
    .addStringOption(number).addStringOption(o => o.setName('aircraft').setDescription('Aircraft type').setRequired(true))
    .addStringOption(o => o.setName('route').setDescription('Route, e.g. JFK - MCO').setRequired(true))
    .addIntegerOption(o => o.setName('skymiles').setDescription('SkyMiles earned').setMinValue(0).setRequired(true))
    .addStringOption(o => o.setName('classes').setDescription('Available cabin classes (text or custom emojis)').setRequired(true))
    .addStringOption(o => o.setName('services').setDescription('Onboard services (text or custom emojis)').setRequired(true))
    .addStringOption(link),
  new SlashCommandBuilder().setName('flight-checkin').setDescription('Post that flight check-in is open')
    .addStringOption(number).addStringOption(link),
  new SlashCommandBuilder().setName('flight-final-call').setDescription('Post a final flight check-in call')
    .addStringOption(number).addStringOption(destination).addStringOption(link),
  new SlashCommandBuilder().setName('flight-checkin-closed').setDescription('Post that flight check-in is closed')
    .addStringOption(number).addStringOption(destination),
  new SlashCommandBuilder().setName('flight-arrived').setDescription('Post a flight arrival notification')
    .addStringOption(number)
    .addStringOption(o => o.setName('origin').setDescription('Origin airport or city').setRequired(true))
    .addStringOption(destination)
    .addStringOption(o => o.setName('status').setDescription('Arrival status').setRequired(true).addChoices(
      { name: 'On-time', value: 'On-time' }, { name: 'Late', value: 'Late' }, { name: 'Early', value: 'Early' },
    )),
  new SlashCommandBuilder().setName('loa').setDescription('Request a leave of absence'),
  new SlashCommandBuilder().setName('economy').setDescription('Earn and share SkyBucks')
    .addSubcommand(command => command.setName('balance').setDescription('View a SkyBucks balance')
      .addUserOption(option => option.setName('user').setDescription('Member to view (defaults to you)')))
    .addSubcommand(command => command.setName('daily').setDescription('Collect your daily SkyBucks'))
    .addSubcommand(command => command.setName('work').setDescription('Work a shift to earn SkyBucks'))
    .addSubcommand(command => command.setName('pay').setDescription('Send SkyBucks to another member')
      .addUserOption(option => option.setName('user').setDescription('Member to pay').setRequired(true))
      .addIntegerOption(option => option.setName('amount').setDescription('SkyBucks to send').setMinValue(1).setRequired(true)))
    .addSubcommand(command => command.setName('leaderboard').setDescription('View the richest members')),
].map(command => command.toJSON());
