import {keyDegreeScaleExampleCard} from '../key-degree-scale-examples.js';
import {loadKeyDegreeScaleExamples} from '../key-degree-scale-examples-data.js';
import {keyFoundationIds} from '../key-degree-scale-examples-meta.js';
const data=await loadKeyDegreeScaleExamples();
export default {id:'key-foundations',cards:data.cards.filter(c=>keyFoundationIds.includes(c.id)).map(keyDegreeScaleExampleCard)};
