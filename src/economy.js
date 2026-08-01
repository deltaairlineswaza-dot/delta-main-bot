import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const economyConfig = Object.freeze({
  startingBalance: 100,
  dailyAmount: 250,
  dailyCooldownMs: 24 * 60 * 60 * 1000,
  workCooldownMs: 60 * 60 * 1000,
  workMinimum: 40,
  workMaximum: 120,
});

export class EconomyError extends Error {
  constructor(code, message, retryAfterMs) {
    super(message);
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

export class EconomyStore {
  #file;
  #queue = Promise.resolve();

  constructor(file = process.env.ECONOMY_DATA_FILE || './data/economy.json') {
    this.#file = file;
  }

  async #read() {
    try {
      return JSON.parse(await readFile(this.#file, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return { guilds: {} };
      throw error;
    }
  }

  async #write(data) {
    await mkdir(dirname(this.#file), { recursive: true });
    const temporary = `${this.#file}.tmp`;
    await writeFile(temporary, JSON.stringify(data, null, 2));
    await rename(temporary, this.#file);
  }

  #mutate(operation) {
    const result = this.#queue.then(async () => {
      const data = await this.#read();
      const value = await operation(data);
      await this.#write(data);
      return value;
    });
    this.#queue = result.catch(() => {});
    return result;
  }

  #account(data, guildId, userId) {
    const guild = (data.guilds[guildId] ??= { users: {} });
    return (guild.users[userId] ??= { balance: economyConfig.startingBalance, dailyAt: 0, workedAt: 0 });
  }

  async balance(guildId, userId) {
    return this.#mutate(data => this.#account(data, guildId, userId).balance);
  }

  async daily(guildId, userId, now = Date.now()) {
    return this.#mutate(data => {
      const account = this.#account(data, guildId, userId);
      const remaining = economyConfig.dailyCooldownMs - (now - account.dailyAt);
      if (remaining > 0) throw new EconomyError('COOLDOWN', 'Your daily reward is not ready.', remaining);
      account.dailyAt = now;
      account.balance += economyConfig.dailyAmount;
      return { earned: economyConfig.dailyAmount, balance: account.balance };
    });
  }

  async work(guildId, userId, random = Math.random, now = Date.now()) {
    return this.#mutate(data => {
      const account = this.#account(data, guildId, userId);
      const remaining = economyConfig.workCooldownMs - (now - account.workedAt);
      if (remaining > 0) throw new EconomyError('COOLDOWN', 'You need a break before working again.', remaining);
      const earned = Math.floor(random() * (economyConfig.workMaximum - economyConfig.workMinimum + 1)) + economyConfig.workMinimum;
      account.workedAt = now;
      account.balance += earned;
      return { earned, balance: account.balance };
    });
  }

  async pay(guildId, senderId, recipientId, amount) {
    return this.#mutate(data => {
      if (senderId === recipientId) throw new EconomyError('SELF_PAYMENT', 'You cannot pay yourself.');
      const sender = this.#account(data, guildId, senderId);
      if (sender.balance < amount) throw new EconomyError('INSUFFICIENT_FUNDS', 'You do not have enough SkyBucks.');
      const recipient = this.#account(data, guildId, recipientId);
      sender.balance -= amount;
      recipient.balance += amount;
      return { senderBalance: sender.balance, recipientBalance: recipient.balance };
    });
  }

  async leaderboard(guildId, limit = 10) {
    const data = await this.#read();
    const users = data.guilds[guildId]?.users ?? {};
    return Object.entries(users).map(([userId, account]) => ({ userId, balance: account.balance }))
      .sort((a, b) => b.balance - a.balance || a.userId.localeCompare(b.userId)).slice(0, limit);
  }
}

export function formatDuration(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ');
}
