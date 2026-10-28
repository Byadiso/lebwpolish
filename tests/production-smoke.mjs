// Run after vite build: source/SSR tests do not execute emitted vendor chunks.
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';

const assets = new URL('../dist/assets/', import.meta.url);
const files = await readdir(assets);
const firebase = files.filter(name => /^firebase-.*\.js$/.test(name));
assert.equal(firebase.length, 1, 'Firebase must stay in one chunk to avoid circular initialization');
// Executes the real minified SDK, catching ReferenceError before initialization.
await import(new URL(firebase[0], assets).href);
console.log('Production Firebase chunk initializes successfully.');
