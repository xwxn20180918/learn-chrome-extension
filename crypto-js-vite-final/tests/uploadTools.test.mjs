import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatBatchUploadJson,
  getFileExtension,
  normalizeUploadPath,
} from '../src/uploadTools.mjs';

test('normalizeUploadPath trims whitespace and surrounding slashes', () => {
  assert.equal(normalizeUploadPath(' /campaign/assets/ '), 'campaign/assets');
  assert.equal(normalizeUploadPath(''), 'upload');
});

test('getFileExtension supports regular and extensionless file names', () => {
  assert.equal(getFileExtension('banner.final.png'), '.png');
  assert.equal(getFileExtension('README'), '');
  assert.equal(getFileExtension('.env'), '');
});

test('formatBatchUploadJson outputs fileName and url only', () => {
  const json = formatBatchUploadJson([
    { fileName: 'a.png', url: 'https://cdn.example.com/a.png', ignored: true },
    { fileName: 'report.pdf', url: 'https://cdn.example.com/report.pdf' },
  ]);

  assert.equal(json, JSON.stringify([
    { fileName: 'a.png', url: 'https://cdn.example.com/a.png' },
    { fileName: 'report.pdf', url: 'https://cdn.example.com/report.pdf' },
  ], null, 2));
});
