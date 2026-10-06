import { exact, safeText } from './interval-foundations.js';
import { scaleChordConcept } from './scale-chord-concepts.js';
import { scaleChordFoundationIds } from './scale-chord-foundations-meta.js';
export const SCALE_CHORD_FOUNDATION_SCHEMA = 'gakuten-scale-chord-foundations/v1';
export function validateScaleChordFoundations(data) {
  exact(data,['schemaVersion','title','sources','cards']);
  if(data.schemaVersion!==SCALE_CHORD_FOUNDATION_SCHEMA) throw new TypeError('Unsupported scale/chord schema');
  safeText(data.title,60);
  if(!Array.isArray(data.sources)||!data.sources.length||data.sources.length>20) throw new TypeError('Invalid sources');
  const sources=new Set();
  for(const source of data.sources) {
    exact(source,['id','title','url','status']);
    for(const key of ['id','title','url','status']) safeText(source[key],500);
    if(!/^https:\/\//.test(source.url)||sources.has(source.id)) throw new TypeError('Invalid source');
    sources.add(source.id);
  }
  if(!Array.isArray(data.cards)||data.cards.length!==13) throw new TypeError('Expected 13 scale/chord foundations');
  const ids=new Set();
  for(const card of data.cards) {
    exact(card,['id','topic','prompt','answer','explanation','concept','sources','reviewNotes']);
    if(!scaleChordFoundationIds.includes(card.id)||ids.has(card.id)) throw new TypeError('Invalid foundation ID');
    ids.add(card.id);
    for(const [key,max] of [['topic',50],['prompt',120],['answer',30],['explanation',100]])safeText(card[key],max);
    if(card.concept!==null && scaleChordConcept(card.concept).jp!==card.answer)throw new TypeError('Concept answer mismatch');
    if(card.concept===null&&!['VII–VIII','V–VI','VII'].includes(card.answer))throw new TypeError('Unsupported numeral answer');
    if(!Array.isArray(card.sources)||!card.sources.length||card.sources.some(id=>!sources.has(id)))throw new TypeError('Unknown source');
    if(!Array.isArray(card.reviewNotes)||card.reviewNotes.length>6)throw new TypeError('Invalid review notes');
    card.reviewNotes.forEach(note=>safeText(note,300));
  }
  return data;
}
export function scaleChordFoundationCard(card) {
  return {id:card.id,label:card.topic,prompt:card.prompt,answer:card.answer,answerContent:card.concept===null
    ?[{type:'recall-answer',answer:card.answer,explanation:card.explanation,emphasis:[],foreign:[]}]
    :[{type:'concept-recall',concept:card.concept,explanation:card.explanation}]};
}
