import {naturalNotes} from './natural-note-interval-meta.js';
import {keySignatures} from './collections/key-signature-data.js';
const gNote=naturalNotes.find(n=>n.id==='g');
import { intervalConcepts } from './interval-terminology.js';

// Curated terminology only. Readings are pedagogical approximations, not IPA.
export const scaleChordConcepts = Object.freeze({
  'key': {"jp": "調", "en": "key", "enReading": ["キー"], "de": "Tonart", "deReading": ["トーンアート"]},
  'tonality': {"jp": "調性", "en": "tonality", "enReading": ["トナリティ"], "de": "Tonalität", "deReading": ["トナリテート"]},
  'supertonic': {"jp": "上主音", "en": "supertonic", "enReading": ["スーパートニック"], "de": "Supertonika", "deReading": ["ズーパートーニカ"]},
  'mediant': {"jp": "中音（上中音）", "en": "mediant", "enReading": ["ミーディアント"], "de": "Mediante", "deReading": ["メディアンテ"]},
  'subdominant': {"jp": "下属音", "en": "subdominant", "enReading": ["サブドミナント"], "de": "Subdominante", "deReading": ["ズプドミナンテ"]},
  'dominant': {"jp": "属音", "en": "dominant", "enReading": ["ドミナント"], "de": "Dominante", "deReading": ["ドミナンテ"]},
  'submediant': {"jp": "下中音", "en": "submediant", "enReading": ["サブミーディアント"], "de": "Submediante", "deReading": ["ズプメディアンテ"]},
  'leading-tone': {"jp": "導音", "en": "leading tone", "enReading": ["リーディング", "トーン"], "de": "Leitton", "deReading": ["ライトトーン"]},
  'pentatonic': {"jp": "五音音階", "en": "pentatonic scale", "enReading": ["ペンタトニック", "スケール"], "de": "pentatonische Skala", "deReading": ["ペンタトーニシェ", "スカーラ"]},
  'whole-tone': {"jp": "全音音階", "en": "whole-tone scale", "enReading": ["ホールトーン", "スケール"], "de": "Ganzton-Tonleiter", "deReading": ["ガンツトーン・トーンライター"]},
  'chromatic': {"jp": "半音階", "en": "chromatic scale", "enReading": ["クロマティック", "スケール"], "de": "chromatische Tonleiter", "deReading": ["クロマーティシェ", "トーンライター"]},
  'note-g': {jp:gNote.ja,en:gNote.id.toUpperCase(),enReading:['ジー'],de:gNote.id.toUpperCase(),deReading:[keySignatures.find(k=>k.id==='1s').major.reading.split('・')[0]]},
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
