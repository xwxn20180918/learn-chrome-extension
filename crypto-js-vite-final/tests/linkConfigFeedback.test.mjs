import test from 'node:test';
import assert from 'node:assert/strict';

import { createLinkResultSummary } from '../src/linkConfigFeedback.mjs';

test('createLinkResultSummary returns success state with copyable URL', () => {
  const summary = createLinkResultSummary({
    type: 'success',
    title: '宏参数已替换',
    url: 'https://example.com/?adv_id=123456',
  });

  assert.deepEqual(summary, {
    type: 'success',
    title: '操作成功',
    message: '宏参数已替换',
    url: 'https://example.com/?adv_id=123456',
  });
});

test('createLinkResultSummary returns no-change state without copyable URL', () => {
  const summary = createLinkResultSummary({
    type: 'no-change',
    title: '宏参数已替换',
  });

  assert.deepEqual(summary, {
    type: 'no-change',
    title: '无变化',
    message: '当前链接没有可处理的变化',
    url: '',
  });
});

test('createLinkResultSummary returns error state with error text', () => {
  const summary = createLinkResultSummary({
    type: 'error',
    message: '请输入需要添加或覆盖的参数',
  });

  assert.deepEqual(summary, {
    type: 'error',
    title: '操作失败',
    message: '请输入需要添加或覆盖的参数',
    url: '',
  });
});

test('createLinkResultSummary returns parse state with concise URL details', () => {
  const summary = createLinkResultSummary({
    type: 'parse',
    protocol: 'https:',
    host: 'example.com',
    path: '/landing',
    paramCount: 3,
  });

  assert.deepEqual(summary, {
    type: 'parse',
    title: '解析完成',
    message: 'https://example.com/landing，参数 3 个',
    url: '',
  });
});
