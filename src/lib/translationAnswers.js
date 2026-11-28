import { normalizeAnswer } from './journeyProgress.js';

// Curated equivalents only: do not erase Polish diacritics or use fuzzy scoring.
export function matchesTranslation(input, drill) {
  if (typeof input !== 'string' || !input.trim() || !drill) return false;
  return [drill.polish, ...(drill.alternatives || [])].some(answer =>
    typeof answer === 'string' && normalizeAnswer(answer) === normalizeAnswer(input));
}
