import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EconomyError, EconomyStore } from '../src/economy.js';

async function withStore(run) {
  const directory = await mkdtemp(join(tmpdir(), 'delta-economy-'));
  try { await run(new EconomyStore(join(directory, 'economy.json'))); }
  finally { await rm(directory, { recursive: true, force: true }); }
}

test('daily rewards, work, and transfers update balances', () => withStore(async store => {
  assert.equal(await store.balance('guild', 'one'), 100);
  assert.deepEqual(await store.daily('guild', 'one', 1_000_000_000), { earned: 250, balance: 350 });
  assert.deepEqual(await store.work('guild', 'one', () => 0, 1_000_000_000), { earned: 40, balance: 390 });
  assert.deepEqual(await store.pay('guild', 'one', 'two', 90), { senderBalance: 300, recipientBalance: 190 });
}));

test('cooldowns and invalid transfers are rejected', () => withStore(async store => {
  await store.daily('guild', 'one', 1_000_000_000);
  await assert.rejects(store.daily('guild', 'one', 1_000_000_001), error => error instanceof EconomyError && error.code === 'COOLDOWN');
  await assert.rejects(store.pay('guild', 'one', 'one', 1), error => error.code === 'SELF_PAYMENT');
  await assert.rejects(store.pay('guild', 'one', 'two', 999), error => error.code === 'INSUFFICIENT_FUNDS');
}));

test('leaderboard is ordered by balance', () => withStore(async store => {
  await store.pay('guild', 'one', 'two', 25);
  assert.deepEqual(await store.leaderboard('guild'), [
    { userId: 'two', balance: 125 }, { userId: 'one', balance: 75 },
  ]);
}));
