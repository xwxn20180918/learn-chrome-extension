import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateIdentityBatch,
  generateIdentityRecord,
  isValidIdentityNumber,
} from '../src/identityTools.mjs';

test('generateIdentityRecord creates the expected fields from deterministic randomness', () => {
  assert.deepEqual(generateIdentityRecord(() => 0), {
    name: '赵子子',
    phone: '13500000000',
    idNumber: '420101196001100001',
    bankCard: '6222020000000000000',
  });
});

test('generateIdentityBatch creates 20 valid fictional records by default', () => {
  const records = generateIdentityBatch();

  assert.equal(records.length, 20);
  records.forEach((record) => {
    assert.match(record.name, /^[\u4e00-\u9fff]{3}$/);
    assert.match(record.phone, /^1\d{10}$/);
    assert.match(record.idNumber, /^420101\d{11}[\dX]$/);
    assert.match(record.bankCard, /^622202\d{13}$/);
    assert.equal(isValidIdentityNumber(record.idNumber), true);
  });
});

test('isValidIdentityNumber rejects an incorrect checksum', () => {
  assert.equal(isValidIdentityNumber('420101196001100000'), false);
});
