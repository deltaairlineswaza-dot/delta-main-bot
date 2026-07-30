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
].map(command => command.toJSON());
