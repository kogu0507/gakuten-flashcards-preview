import {keyDegreeScaleExampleCard} from '../key-degree-scale-examples.js';
import {loadKeyDegreeScaleExamples} from '../key-degree-scale-examples-data.js';
import {scaleDegreeNameIds} from '../key-degree-scale-examples-meta.js';
const data=await loadKeyDegreeScaleExamples();
export default {id:'scale-degree-names',cards:data.cards.filter(c=>scaleDegreeNameIds.includes(c.id)).map(keyDegreeScaleExampleCard)};
