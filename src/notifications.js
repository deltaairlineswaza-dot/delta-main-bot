import { EmbedBuilder } from 'discord.js';
import { config, emoji as e } from './config.js';

const header = title => `${e.tail} **${title} |** ${e.skyTeam}\n\n-# ${config.address}`;
const footer = `\n\n-# Keep Climbing, Delta Air Lines.`;
const thanks = `> ${e.wingPin} **Thank you,** for choosing **Delta Air Lines.**`;
const value = (interaction, name) => interaction.options.getString(name, true);
const flightNumber = interaction => value(interaction, 'flight_number').replace(/^DL\s*-?\s*/i, '');

export function buildNotification(interaction) {
  const number = flightNumber(interaction);
  const link = interaction.options.getString('link');
  let content;

  switch (interaction.commandName) {
    case 'flight-confirmation':
      content = `${header('Your Delta Flight Confirmation')}\n\n> ${e.tail} ${e.rightArrow} **[Thank you for choosing Delta Airlines as your first choice.](${link})**\n\n> ${e.blueArrow} **Please,** take a moment to view **all** of **Your Trip Details** below.${footer}\n> **Flight Number: DL - ${number}**\n> **Aircraft: ${value(interaction, 'aircraft')}**\n> **Route: ${value(interaction, 'route')}**\n> **Skymiles Earned: ${interaction.options.getInteger('skymiles', true)}**\n> **Classes Available: ${value(interaction, 'classes')}**\n> **Onboard Services: ${value(interaction, 'services')}**`;
      break;
    case 'flight-checkin':
      content = `${header("It's time to check in for your flight.")}\n\n> ${e.tail} ${e.rightArrow} **[Check in for DL - ${number} is now open.](${link})**\n\n> ${e.blueArrow} **Please,** ensure that **all necessary travel documents** are ready for flight. Along with **all classes** having been **redeemed** prior to your flight, as our team **may not** be able to assign classes at this time.\n\n${thanks}${footer}`;
      break;
    case 'flight-final-call': {
      const destination = value(interaction, 'destination');
      content = `${header(`Final Check-in Call for DL - ${number}`)}\n\n> ${e.tail} ${e.rightArrow} **[Check-in for DL - ${number} will be closing shortly.](${link})**\n\n> ${e.blueArrow} **In order to be allowed access on to your flight with service to ${destination},** please join **as soon as possible.**\n\n${thanks}${footer}`;
      break;
    }
    case 'flight-checkin-closed': {
      const destination = value(interaction, 'destination');
      content = `${header(`Check-in Closed for DL - ${number}`)}\n\n> ${e.tail} ${e.rightArrow} **Check in for DL - ${number} with service to ${destination} is officially closed.**\n\n> ${e.blueArrow} **If you have missed your flight,** we apologize for any inconveniences caused and ask you to consider rebooking on the **next available flight.**\n\n${thanks}${footer}`;
      break;
    }
    case 'flight-arrived': {
      const destination = value(interaction, 'destination');
      content = `${header(`DL - ${number} with service to ${destination} has officially arrived.`)}\n\n> ${e.tail} ${e.rightArrow} **Your Flight DL - ${number}** with service from **${value(interaction, 'origin')}** to **${destination}** has officially arrived **${value(interaction, 'status')}.**\n\n> ${e.blueArrow} **If you would like to leave a review on your flight,** and **suggest any improvements,** please head over to our **Delta Helpdesk** and fill out a form!\n\n${thanks}${footer}`;
      break;
    }
    default: throw new Error(`Unknown notification command: ${interaction.commandName}`);
  }

  return { content, embeds: [new EmbedBuilder().setImage(config.bannerUrl)] };
}
