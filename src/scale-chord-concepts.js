import { intervalConcepts } from './interval-terminology.js';

// Curated terminology only. Readings are pedagogical approximations, not IPA.
export const scaleChordConcepts = Object.freeze({
  scale: { jp:'音階', en:'scale', enReading:['スケール'], de:'Tonleiter', deReading:['トーンライター'] },
  tonic: { jp:'主音', en:'tonic', enReading:['トニック'], de:'Tonika', deReading:['トーニカ'] },
  half: { jp:'半音', en:intervalConcepts.half.en, enReading:[intervalConcepts.half.enReading], de:'Halbton', deReading:['ハルプトーン'] },
  'natural-minor': { jp:'自然短音階', en:'natural minor scale', enReading:['ナチュラル','マイナー','スケール'], de:'natürliche Molltonleiter', deReading:['ナテューアリヒェ','モル・トーンライター'] },
  chord: { jp:'和音', en:'chord', enReading:['コード'], de:'Akkord', deReading:['アコルト'] },
  root: { jp:'根音', en:'root', enReading:['ルート'], de:'Grundton', deReading:['グルントトーン'] },
  triad: { jp:'三和音', en:'triad', enReading:['トライアド'], de:'Dreiklang', deReading:['ドライクラング'] },
  seventh: { jp:'七の和音', jpReading:'しちのわおん', en:'seventh chord', enReading:['セヴンス','コード'], de:'Septakkord', deReading:['ゼプトアコルト'] },
  'root-position': { jp:'基本形', en:'root position', enReading:['ルート','ポジション'], de:'Grundstellung', deReading:['グルントシュテルング'] },
  inversion: { jp:'転回形', en:intervalConcepts.inversion.en, enReading:[intervalConcepts.inversion.enReading], de:'Umkehrung', deReading:['ウムケールング'] }
});
for (const term of Object.values(scaleChordConcepts)) {
  // The half-step reading is reused verbatim, as one phrase rather than two words.
  Object.freeze(term.enReading); Object.freeze(term.deReading); Object.freeze(term);
}
export function scaleChordConcept(key) {
  if (typeof key !== 'string' || !Object.hasOwn(scaleChordConcepts,key)) throw new TypeError('Unknown scale/chord concept');
  return scaleChordConcepts[key];
}
