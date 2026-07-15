import test from 'node:test';
import assert from 'node:assert/strict';

import { decryptLlgStrPhone } from '../src/llgStrTools.mjs';

test('decryptLlgStrPhone decodes llgstr phone values', () => {
  assert.equal(decryptLlgStrPhone('1knli8k3'), 18876315178);
});

test('decryptLlgStrPhone supports lowercase base32 letters', () => {
  assert.equal(decryptLlgStrPhone('b'), 2);
});

test('decryptLlgStrPhone supports uppercase base32 letters', () => {
  assert.equal(decryptLlgStrPhone('B'), 2);
});
