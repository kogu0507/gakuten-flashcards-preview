import { scaleChordFoundationCard } from '../scale-chord-foundations.js';
import { loadScaleChordFoundations } from '../scale-chord-foundations-data.js';
import { scaleFoundationIds } from '../scale-chord-foundations-meta.js';
const data=await loadScaleChordFoundations();
export default {id:'scale-foundations',cards:data.cards.filter(c=>scaleFoundationIds.includes(c.id)).map(scaleChordFoundationCard)};
