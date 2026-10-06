// Curated triad names, separate from interval adjective grammar.
// German readings are learner aids, awaiting human proofreading.
export const triadNames = Object.freeze({
  major:Object.freeze({jp:'長三和音',en:'major triad',de:'Dur-Dreiklang',reading:'ドゥア・ドライクラング'}),
  minor:Object.freeze({jp:'短三和音',en:'minor triad',de:'Moll-Dreiklang',reading:'モル・ドライクラング'}),
  diminished:Object.freeze({jp:'減三和音',en:'diminished triad',de:'verminderter Dreiklang',reading:'フェアミンデルター ドライクラング'}),
  augmented:Object.freeze({jp:'増三和音',en:'augmented triad',de:'übermäßiger Dreiklang',reading:'ユーバーメーシガー ドライクラング'})
});
export function triadName(quality) {
  if (typeof quality !== 'string' || !Object.hasOwn(triadNames,quality)) throw new RangeError('Unsupported triad quality');
  return triadNames[quality];
}

const codeSuffixes=Object.freeze({major:'',minor:'m',diminished:'dim',augmented:'aug'});
export function triadCodeParts(root,quality) {
  triadName(quality);
  if (typeof root !== 'string' || !['C','D','E','F','G','A','B'].includes(root)) throw new RangeError('Unsupported natural triad root');
  return Object.freeze({root,suffix:codeSuffixes[quality]});
}
export function triadCodeName(root,quality) {
  const parts=triadCodeParts(root,quality);
  return parts.root+parts.suffix;
}
