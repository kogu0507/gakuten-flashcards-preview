import {validateScaleChordFoundations} from './scale-chord-foundations.js';
const url=new URL('./data/scale-chord-foundations.json',import.meta.url);
let pending;
// One shared lazy document for the two independently owned collections.
export function loadScaleChordFoundations() {
  pending??=(async()=>{
    const data=url.protocol==='file:'?JSON.parse(await(await import('node:fs/promises')).readFile(url,'utf8')):await(async()=>{const response=await fetch(url);if(!response.ok)throw new Error('Could not load foundations');return response.json();})();
    return validateScaleChordFoundations(data);
  })();
  return pending;
}
