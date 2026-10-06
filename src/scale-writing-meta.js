import { keySignatureIds } from './key-signature-meta.js';

export const scaleTypes = [
  { id: 'major', title: '長音階', mode: 'major' },
  { id: 'natural-minor', title: '自然短音階', mode: 'minor' },
  { id: 'harmonic-minor', title: '和声的短音階', mode: 'minor' },
  { id: 'melodic-minor', title: '旋律的短音階', mode: 'minor' }
];
export const scaleAnswerModes = [
  { id: 'key-signature', title: '調号を用いる' },
  { id: 'accidentals', title: '臨時記号を用いる' },
  { id: 'both', title: '両方' }
];
export const scaleTargets = scaleTypes.flatMap(type => keySignatureIds.map(keySignatureId => ({ scaleType: type.id, keySignatureId })));
export function scaleCardId(scaleType, keySignatureId, answerMode) {
  return `scale-write-${scaleType}-${keySignatureId}-${answerMode}`;
}
export function scaleSelectionCardIds(type = 'all', mode = 'both') {
  if (type !== 'all' && !scaleTypes.some(t => t.id === type)) throw new RangeError('Unknown scale type');
  if (mode !== 'all' && !scaleAnswerModes.some(m => m.id === mode)) throw new RangeError('Unknown scale answer mode');
  return scaleTargets.filter(target => type === 'all' || target.scaleType === type)
    .flatMap(target => scaleAnswerModes.filter(m => mode === 'all' || mode === m.id)
      .map(m => scaleCardId(target.scaleType, target.keySignatureId, m.id)));
}
export const scaleCardIds = scaleSelectionCardIds('all', 'all');
const owned = new Set(scaleCardIds);
export function replaceScaleSelection(currentIds, type, mode) {
  return [...currentIds.filter(id => !owned.has(id)), ...scaleSelectionCardIds(type, mode)];
}
export function matchScaleSelection(cardIds) {
  for (const type of ['all', ...scaleTypes.map(t => t.id)]) for (const mode of ['all', ...scaleAnswerModes.map(m => m.id)]) {
    const ids = scaleSelectionCardIds(type, mode);
    if (ids.length === cardIds.length && ids.every(id => cardIds.includes(id))) return { type, mode };
  }
  return null;
}
