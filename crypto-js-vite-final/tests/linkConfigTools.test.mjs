import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyManualParams,
  parseLandingUrl,
  replaceMacroParams,
  replaceUrlPrefix,
} from '../src/linkConfigTools.mjs';

test('replaceMacroParams replaces known macro keys with six digit numbers only', () => {
  const input = 'https://example.com/page?adv_id={adv_id}&plan_id=${plan_id}&click_id=__CLICK__&keep=abc';
  const result = replaceMacroParams(input);
  const parsed = new URL(result);

  assert.match(parsed.searchParams.get('adv_id'), /^\d{6}$/);
  assert.match(parsed.searchParams.get('plan_id'), /^\d{6}$/);
  assert.match(parsed.searchParams.get('click_id'), /^\d{6}$/);
  assert.equal(parsed.searchParams.get('keep'), 'abc');
});

test('replaceMacroParams leaves missing macro keys untouched', () => {
  const input = 'https://example.com/page?keep=abc';

  assert.equal(replaceMacroParams(input), input);
});

test('applyManualParams overwrites existing values and appends new values', () => {
  const input = 'https://example.com/page?adv_id=123456&keep=abc#top';
  const result = applyManualParams(input, 'adv_id=654321\nnew_key=hello world');
  const parsed = new URL(result);

  assert.equal(parsed.searchParams.get('adv_id'), '654321');
  assert.equal(parsed.searchParams.get('new_key'), 'hello world');
  assert.equal(parsed.searchParams.get('keep'), 'abc');
  assert.equal(parsed.hash, '#top');
});

test('applyManualParams supports flexible separators', () => {
  const input = 'https://example.com/page?foo=old';
  const result = applyManualParams(input, 'foo=new&bar=2\nbaz = 3');
  const parsed = new URL(result);

  assert.equal(parsed.searchParams.get('foo'), 'new');
  assert.equal(parsed.searchParams.get('bar'), '2');
  assert.equal(parsed.searchParams.get('baz'), '3');
});

test('replaceUrlPrefix swaps origin and preserves path query and hash', () => {
  const input = 'https://old.example.com/a/b?adv_id=123456#anchor';
  const result = replaceUrlPrefix(input, 'http://xw.beta.zonelian.com');

  assert.equal(result, 'http://xw.beta.zonelian.com/a/b?adv_id=123456#anchor');
});

test('parseLandingUrl decodes URL details and query params', () => {
  const input = 'https://example.com/path?name=%E6%B5%8B%E8%AF%95&empty=&encoded=a%2520b#hash';
  const result = parseLandingUrl(input);

  assert.equal(result.origin, 'https://example.com');
  assert.equal(result.path, '/path');
  assert.equal(result.hash, '#hash');
  assert.deepEqual(result.params, [
    { key: 'name', value: '测试' },
    { key: 'empty', value: '' },
    { key: 'encoded', value: 'a%20b' },
  ]);
});
