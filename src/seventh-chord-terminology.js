// Curated names; German kana are learner aids awaiting human proofreading.
export const seventhNames=Object.freeze({
  diminished:Object.freeze({jp:'減七の和音',en:'diminished seventh chord',de:'verminderter Septakkord',reading:'フェアミンデルター ゼプトアコード',readingWords:Object.freeze(['フェアミンデルター','ゼプトアコード'])}),
  'half-diminished':Object.freeze({jp:'半減七の和音',en:'half-diminished seventh chord',de:'halbverminderter Septakkord',reading:'ハルプフェアミンデルター ゼプトアコード',readingWords:Object.freeze(['ハルプフェアミンデルター','ゼプトアコード'])}),
  minor:Object.freeze({jp:'短七の和音',en:'minor seventh chord',de:'kleiner Mollseptakkord',reading:'クライナー モルゼプトアコード',readingWords:Object.freeze(['クライナー','モルゼプトアコード'])}),
  dominant:Object.freeze({jp:'属七の和音',en:'dominant seventh chord',de:'Dominantseptakkord',reading:'ドミナントゼプトアコード',readingWords:Object.freeze(['ドミナントゼプトアコード'])}),
  major:Object.freeze({jp:'長七の和音',en:'major seventh chord',de:'großer Durseptakkord',reading:'グローサー ドゥアゼプトアコード',readingWords:Object.freeze(['グローサー','ドゥアゼプトアコード'])}),
  'augmented-major':Object.freeze({jp:'増七の和音',en:'augmented major seventh chord',de:'großer übermäßiger Septakkord',reading:'グローサー ユーバーメーシガー ゼプトアコード',readingWords:Object.freeze(['グローサー','ユーバーメーシガー','ゼプトアコード'])})
});
export function seventhName(quality){
  if(typeof quality!=='string'||!Object.hasOwn(seventhNames,quality))throw new RangeError('Unsupported seventh quality');
  return seventhNames[quality];
}
const suffixes=Object.freeze({diminished:'dim7','half-diminished':'m7',minor:'m7',dominant:'7',major:'maj7','augmented-major':'maj7'});
const fifths=Object.freeze({'half-diminished':'flat','augmented-major':'sharp'});
export function seventhCodeParts(root,quality){
  seventhName(quality);
  if(root!=='C')throw new RangeError('Unsupported seventh pilot root');
  return Object.freeze({root,suffix:suffixes[quality],fifth:fifths[quality]??null});
}
export function seventhCodeName(root,quality){
  const {suffix,fifth}=seventhCodeParts(root,quality);
  return root+suffix+(fifth?'('+(fifth==='flat'?'♭':'♯')+'5)':'');
}
