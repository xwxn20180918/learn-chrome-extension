import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatOmctxOutput,
  omctxDecrypt,
} from '../src/omctxCryptoTools.mjs';

test('omctxDecrypt normalizes escaped slashes and decodes the decrypted URI text', () => {
  const encrypted = 'iL8hBYhCXvgqRWhBBRm5vzd1Z3+6183\\/9JiylvNiWAE=';

  assert.equal(omctxDecrypt(encrypted), 'OMCTX 测试/ok');
});

test('omctxDecrypt returns an empty string for empty input', () => {
  assert.equal(omctxDecrypt(''), '');
});

test('omctxDecrypt returns an empty string for invalid input', () => {
  assert.equal(omctxDecrypt('invalid'), '');
});

test('formatOmctxOutput converts decrypted query parameters to JSON output', () => {
  const encrypted =
    '1/Tv2d57JkOnCqY0LZ2gLFKcvAIne0ymJMc/bk5VRqUO4dDr5V5wLGezuHqQDqOpCbOFdKaskHenLhFuFPEkYldOiV/uY/hAuogEjD6P5gwos04uoU6hx1UjfdewhMnpgwgQpfyQ9zy96/HLZarv1GmKwE/lZeZ8nPDOK2TH8m8/YjHHA31pxrgpDBygw+fjQiet6G5OpdHBf16qhp+pupP+BIAhEfFvIA4h1rhQqFa+CF47HOMI1xYfSf1hY55B';
  const output = formatOmctxOutput(omctxDecrypt(encrypted));

  assert.equal(output.isJSON, true);
  assert.deepEqual(JSON.parse(output.content), {
    page: '1',
    limit: '20',
    date: '2026-07-17 ~ 2026-07-24',
    address: '',
    client_id: '',
    supplier_group_id: '',
    product_id: '',
    activity: '',
    channel: '',
    status: '',
    active_date: '',
    first_recharge_date: '',
    finish_at_date: '',
  });
});
