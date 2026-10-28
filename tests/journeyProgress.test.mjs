import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/data/journey.js';
import { emptyProgress, completeMission, reviewWord, normalizeAnswer, readProgress, dayKey } from '../src/lib/journeyProgress.js';
const now = Date.UTC(2026, 9, 28, 12);
test('completing and repeating missions preserves review progress without farming XP', () => {
  let progress = completeMission(emptyProgress(), missions[0], now);
  assert.equal(progress.xp, 30);
  assert.equal(Object.keys(progress.words).length, 2);
  progress = reviewWord(progress, 'kawa', true, now);
  const repeated = completeMission(progress, missions[0], now);
  assert.equal(repeated.xp, 30);
  assert.equal(repeated.days.length, 1);
  assert.equal(repeated.words.kawa.due, progress.words.kawa.due);
});
test('recall increases intervals and a difficult phrase returns in ten minutes', () => {
  let progress = completeMission(emptyProgress(), missions[0], now);
  let reviewTime=now;
  for (const days of [1, 3, 7, 14, 30, 30]) {
    progress = reviewWord(progress, 'kawa', true, reviewTime);
    assert.equal(progress.words.kawa.due, reviewTime + days * 86400000);
    reviewTime=progress.words.kawa.due;
  }
  progress = reviewWord(progress, 'kawa', false, reviewTime);
  assert.equal(progress.words.kawa.due, reviewTime + 600000);
  assert.equal(progress.words.kawa.box, 0);
});
test('answer matching tolerates formatting but retains Polish spelling', () => {
  assert.equal(normalizeAnswer('  POPROSZĘ   kawę! '), 'poproszę kawę');
  assert.notEqual(normalizeAnswer('kawe'), normalizeAnswer('kawę'));
  assert.equal(normalizeAnswer('we\u0328'), normalizeAnswer('wę'));
});
test('invalid or unavailable storage starts safely', () => {
  for (const getItem of [() => '{broken', () => 'null', () => '{}', () => { throw Error('blocked'); }]) {
    assert.deepEqual(readProgress({ getItem }), emptyProgress());
  }
});
test('activity dates use local calendar dates', () => {
  assert.equal(dayKey(new Date(2026, 9, 28, 0, 5)), '2026-10-28');
});

test('future reviews cannot be advanced early or counted twice',()=>{
 let p=completeMission(emptyProgress(),missions[0],now);
 p=reviewWord(p,'kawa',true,now);
 assert.deepEqual(reviewWord(p,'kawa',true,now),p);
 assert.equal(p.daily[dayKey(new Date(now))].length,2);
});
test('mission curriculum uses unique IDs and valid answer sets',()=>{
 assert.equal(missions.length,12);
 assert.equal(new Set(missions.map(m=>m.id)).size,missions.length);
 for(const m of missions){assert.equal(m.tasks.length,3);for(const t of m.tasks){assert.ok(t.answers.length);assert.ok(t.hint);assert.ok(t.why);}}
});
