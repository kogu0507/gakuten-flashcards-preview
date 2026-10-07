import {keyDegreeScaleExampleCard} from '../key-degree-scale-examples.js';
import {loadKeyDegreeScaleExamples} from '../key-degree-scale-examples-data.js';
import {scaleExampleIds} from '../key-degree-scale-examples-meta.js';
const data=await loadKeyDegreeScaleExamples();
export default {id:'scale-examples',cards:data.cards.filter(c=>scaleExampleIds.includes(c.id)).map(keyDegreeScaleExampleCard)};
