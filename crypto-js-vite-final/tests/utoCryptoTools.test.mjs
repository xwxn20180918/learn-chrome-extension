import test from 'node:test';
import assert from 'node:assert/strict';

import { utoDecrypt } from '../src/utoCryptoTools.mjs';

test('utoDecrypt decrypts a Base64 payload with the default key and iv', () => {
  const encrypted = 'fIUbtx2FwHnm3KV4I2mAGU63FiilCTW0FYa1PR3Zy8k=';

  assert.deepEqual(utoDecrypt(encrypted), {
    name: '测试',
    count: 2,
  });
});

test('utoDecrypt returns an empty string for empty input', () => {
  assert.equal(utoDecrypt(''), '');
});

test('utoDecrypt returns an empty string for invalid input', () => {
  assert.equal(utoDecrypt('invalid'), '');
});
