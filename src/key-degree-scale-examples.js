import {exact,safeText} from './interval-foundations.js';
import {scaleChordConcept} from './scale-chord-concepts.js';
import {keyFoundationIds,scaleDegreeNameIds,scaleExampleIds,keyDegreeScaleExampleIds} from './key-degree-scale-examples-meta.js';
export const KEY_DEGREE_SCALE_SCHEMA='gakuten-key-degree-scale-examples/v1';
const groups={'key-foundations':keyFoundationIds,'scale-degree-names':scaleDegreeNameIds,'scale-examples':scaleExampleIds};
export function validateKeyDegreeScaleExamples(data) {
 exact(data,['schemaVersion','title','sources','cards']);
 if(data.schemaVersion!==KEY_DEGREE_SCALE_SCHEMA)throw new TypeError('Unsupported concept schema');safeText(data.title,60);
 if(!Array.isArray(data.sources)||!data.sources.length||data.sources.length>20)throw new TypeError('Invalid sources');
 const sources=new Set();for(const source of data.sources){exact(source,['id','title','url','status']);for(const key of ['id','title','url','status'])safeText(source[key],500);if(!/^https:\/\//.test(source.url)||sources.has(source.id))throw new TypeError('Invalid source');sources.add(source.id);}
 if(!Array.isArray(data.cards)||data.cards.length!==12)throw new TypeError('Expected 12 concepts');
 const ids=new Set();for(const card of data.cards){
  exact(card,['id','group','topic','prompt','answer','explanation','concept','sources','reviewNotes']);
  if(!Object.hasOwn(groups,card.group)||!groups[card.group].includes(card.id)||ids.has(card.id))throw new TypeError('Invalid concept ID or ownership');ids.add(card.id);
  for(const[key,max]of[['topic',50],['prompt',120],['answer',30],['explanation',100]])safeText(card[key],max);
  if(scaleChordConcept(card.concept).jp!==card.answer)throw new TypeError('Concept answer mismatch');
  if(!Array.isArray(card.sources)||!card.sources.length||card.sources.some(id=>!sources.has(id)))throw new TypeError('Unknown source');
  if(!Array.isArray(card.reviewNotes)||card.reviewNotes.length>6)throw new TypeError('Invalid review notes');card.reviewNotes.forEach(note=>safeText(note,300));
 }
 if(ids.size!==keyDegreeScaleExampleIds.length)throw new TypeError('Incomplete concepts');return data;
}
export function keyDegreeScaleExampleCard(card){return{id:card.id,label:card.topic,prompt:card.prompt,answer:card.answer,answerContent:[{type:'concept-recall',concept:card.concept,explanation:card.explanation}]};}
