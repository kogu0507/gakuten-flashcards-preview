import { intervalConcepts } from './interval-terminology.js';

export const FOUNDATION_SCHEMA = 'gakuten-interval-foundations/v1';
export function exact(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) throw new TypeError('Unknown or invalid foundation field');
}
export function safeText(value, max = 300) {
  if (typeof value !== 'string' || !value.trim() || [...value].length > max || /[<>\u0000-\u001f\u007f]/u.test(value)) throw new TypeError('Unsafe or invalid foundation text');
  return value;
}
function strings(value, maxItems = 8, maxText = 300) {
  if (!Array.isArray(value) || value.length > maxItems) throw new TypeError('Invalid foundation list');
  value.forEach(text => safeText(text, maxText));
}
export function validateDegreePairs(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4 || value.some(pair => !Array.isArray(pair) || pair.length !== 2 || pair.some(text => typeof text !== 'string' || !/^[1-8]度$/.test(text)) || Number(pair[0][0]) + Number(pair[1][0]) !== 9)) throw new TypeError('Invalid inversion degree pairs');
}
export function validateFoundations(data) {
  exact(data, ['schemaVersion', 'title', 'sources', 'cards']);
  if (data.schemaVersion !== FOUNDATION_SCHEMA) throw new TypeError('Unsupported foundation schema');
  safeText(data.title, 40);
  if (!Array.isArray(data.sources) || !data.sources.length || data.sources.length > 40) throw new TypeError('Invalid sources');
  const sourceIds = new Set();
  for (const source of data.sources) {
    exact(source, ['id', 'title', 'url', 'location', 'status']);
    for (const field of ['id', 'title', 'location', 'status']) safeText(source[field]);
    safeText(source.url, 500);
    if (!/^https:\/\//.test(source.url) || sourceIds.has(source.id)) throw new TypeError('Invalid source reference');
    sourceIds.add(source.id);
  }
  if (!Array.isArray(data.cards) || !data.cards.length || data.cards.length > 100) throw new TypeError('Invalid cards');
  const ids = new Set();
  for (const card of data.cards) {
    exact(card, ['id', 'topic', 'prompt', 'answer', 'explanation', 'foreignTerms', 'emphasis', 'conditions', 'supplement', 'sources', 'reviewNotes', 'promptLines', 'degreePairs']);
    if (typeof card.id !== 'string' || !/^interval-foundation-[a-z]+(?:-[a-z]+)*$/.test(card.id) || ids.has(card.id)) throw new TypeError('Invalid or duplicate foundation ID');
    ids.add(card.id);
    safeText(card.topic, 50); safeText(card.prompt, 120); safeText(card.answer, 30); safeText(card.explanation, 100);
    if (card.promptLines !== undefined) {
      strings(card.promptLines, 4, 120);
      if (!card.promptLines.length || card.promptLines.join('') !== card.prompt) throw new TypeError('Prompt lines must preserve question text');
    }
    if (card.degreePairs !== undefined) validateDegreePairs(card.degreePairs);
    for (const field of ['foreignTerms', 'emphasis', 'conditions', 'sources', 'reviewNotes']) strings(card[field], ['foreignTerms', 'emphasis'].includes(field) ? 2 : 8, field === 'emphasis' ? 30 : 300);
    if (card.foreignTerms.length > 2 || new Set(card.foreignTerms).size !== card.foreignTerms.length || card.foreignTerms.some(key => !Object.hasOwn(intervalConcepts, key))) throw new TypeError('Unknown foreign concept');
    if (!card.sources.length || card.sources.some(id => !sourceIds.has(id))) throw new TypeError('Unknown source');
    if (card.emphasis.some(text => !card.explanation.includes(text))) throw new TypeError('Emphasis must refer to explanation text');
    if (card.supplement !== null) safeText(card.supplement);
  }
  return data;
}

export function foundationCard(card) {
  return { id: card.id, label: card.topic, prompt: card.prompt, answer: card.answer,
    ...(card.promptLines ? { promptContent: card.promptLines.map(text => ({ type: 'text', text })) } : {}),
    supplement: card.supplement,
    answerContent: [{ type: 'recall-answer', answer: card.answer, explanation: card.explanation, emphasis: card.emphasis,
      foreign: card.foreignTerms.map(key => { const term = intervalConcepts[key]; return { lang: 'en', text: term.en, reading: term.enReading }; }),
      ...(card.degreePairs ? { degreePairs: card.degreePairs } : {}) }] };
}
