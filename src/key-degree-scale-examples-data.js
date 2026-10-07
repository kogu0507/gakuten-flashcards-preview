import {validateKeyDegreeScaleExamples} from './key-degree-scale-examples.js';
const url=new URL('./data/key-degree-scale-examples.json',import.meta.url);
let pending;
// One shared lazy document for the three independently owned collections.
export function loadKeyDegreeScaleExamples() {
  pending??=(async()=>{
    const data=url.protocol==='file:'?JSON.parse(await(await import('node:fs/promises')).readFile(url,'utf8')):await(async()=>{const response=await fetch(url);if(!response.ok)throw new Error('Could not load foundations');return response.json();})();
    return validateKeyDegreeScaleExamples(data);
  })();
  return pending;
}
