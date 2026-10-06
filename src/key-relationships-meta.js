import { keySignatureIds } from './key-signature-meta.js';

export const relatedKeyCardId = (mode, signatureId) => `related-key-${mode}-${signatureId}`;
export const relatedKeyCardIds = ['major', 'minor'].flatMap(mode => keySignatureIds.map(id => relatedKeyCardId(mode, id)));
