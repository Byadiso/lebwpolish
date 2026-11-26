import test from 'node:test';
import assert from 'node:assert/strict';
import { safeExternalUrl, boundedText, safeDrafts } from '../src/lib/inputSafety.js';
test('resource URLs only allow web protocols', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('data:text/html,hi'), null);
  assert.equal(safeExternalUrl('//example.com'), null);
  assert.equal(safeExternalUrl('https://example.com/a'), 'https://example.com/a');
});
test('text and draft persistence reject unexpected shapes and limit size', () => {
  assert.equal(boundedText(' abc ', 2), 'ab');
  assert.deepEqual(safeDrafts(['bad'], ['invite']), {});
  assert.deepEqual(safeDrafts({ invite: 'abcd', unknown: 'secret' }, ['invite'], 2), { invite: 'ab' });
});
