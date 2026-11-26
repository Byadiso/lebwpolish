import test from 'node:test';
import assert from 'node:assert/strict';
import { B1_BLOCKS,B1_CARD_IDS,evaluateRecall,sanitizeVocabularyProgress } from '../src/data/b1VocabularyBlocks.js';
test('unique block and card identifiers, valid answer options',()=>{assert.equal(new Set(B1_CARD_IDS).size,B1_CARD_IDS.length);assert.equal(new Set(B1_BLOCKS.map(b=>b.id)).size,B1_BLOCKS.length);for(const block of B1_BLOCKS){assert.ok(block.writing&&block.goal);for(const card of block.cards){assert.ok(card.options.includes(card.answer));assert.ok(card.why&&card.pair);}}});
test('recall normalizes whitespace and case',()=>{const card=B1_BLOCKS[0].cards[0];assert.equal(evaluateRecall(card,'  ZMIENIĆ GRAFIK  '),true);assert.equal(evaluateRecall(card,'incorrect'),false);});
test('progress sanitization rejects unknown IDs and invalid counts',()=>{const id=B1_CARD_IDS[0];assert.deepEqual(sanitizeVocabularyProgress({unknown:{attempts:1,correct:1},[id]:{attempts:2,correct:5}}),{[id]:{attempts:2,correct:2}});assert.deepEqual(sanitizeVocabularyProgress(null),{});});
