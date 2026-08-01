import test from 'node:test';
import assert from 'node:assert/strict';
import { commands } from '../src/commands.js';

test('registers all flight notification commands and LOA', () => {
  assert.deepEqual(commands.map(command => command.name), [
    'flight-confirmation', 'flight-checkin', 'flight-final-call',
    'flight-checkin-closed', 'flight-arrived', 'loa', 'economy',
  ]);
});

test('all command definitions fit Discord slash command option limits', () => {
  for (const command of commands) assert.ok((command.options?.length ?? 0) <= 25);
});
