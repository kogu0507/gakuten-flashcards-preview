import { keySignatures } from './key-signature-data.js';
import { relatedKeyCardId } from '../key-relationships-meta.js';
import { relatedKeyName, relatedKeyDiagram, relatedKeyQuestion, signedSignature } from '../key-relationships.js';

export default { id: 'key-relationships', cards: ['major', 'minor'].flatMap(mode => keySignatures.map(key => {
  const signature = signedSignature(key);
  const name = relatedKeyName(signature, mode);
  return {
    id: relatedKeyCardId(mode, key.id), label: `${name}の近親調`,
    prompt: `${relatedKeyQuestion} 主調：${name}。4つの関係先の調名は空欄。`,
    answer: relatedKeyDiagram(signature, mode).cells.map(cell => `${cell.relation}：${cell.name}${cell.outside ? '※' : ''}`).join('／'),
    promptContent: [{ type: 'related-key-diagram', signature, mode, blank: true }],
    answerContent: [{ type: 'related-key-diagram', signature, mode, blank: false }]
  };
})) };
