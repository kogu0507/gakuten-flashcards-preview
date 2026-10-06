import { scaleChordFoundationCard } from '../scale-chord-foundations.js';
import { loadScaleChordFoundations } from '../scale-chord-foundations-data.js';
import { chordFoundationIds } from '../scale-chord-foundations-meta.js';
const data=await loadScaleChordFoundations();
export default {id:'chord-foundations',cards:data.cards.filter(c=>chordFoundationIds.includes(c.id)).map(scaleChordFoundationCard)};
