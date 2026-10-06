import { keySignatures } from './collections/key-signature-data.js';

export const relatedKeyQuestion = '空欄に入る調名を答えて、表を完成させなさい。';
export const signedSignature = key => key.accidental === 'flat' ? -key.count : key.count;
// Only missing names. See docs/key-relationships-v0.12.0.md for derivation.
const extendedNames = new Map([
  ['8-major', '嬰ト長調'], ['9-major', '嬰ニ長調'], ['10-major', '嬰イ長調'], ['8-minor', '嬰ホ短調'],
  ['-8-major', '変ヘ長調'], ['-8-minor', '変ニ短調'], ['-9-minor', '変ト短調'], ['-10-minor', '変ハ短調']
]);
export function relatedKeyName(signature, mode) {
  const name = keySignatures.find(key => signedSignature(key) === signature)?.[mode]?.jp ?? extendedNames.get(`${signature}-${mode}`);
  if (!name) throw new RangeError('Unsupported related key');
  return name;
}
export function relatedKeyDiagram(signature, mode) {
  if (!Number.isInteger(signature) || Math.abs(signature) > 7 || !['major', 'minor'].includes(mode)) throw new TypeError('Invalid principal key');
  const offsets = mode === 'major' ? [-3, -2, -1, 0, 1] : [-1, 0, 1, 2, 3];
  const definitions = mode === 'major'
    ? [[-1,'major','下属調'],[0,'major','主調'],[1,'major','属調'],[-3,'minor','同主調'],[0,'minor','平行調']]
    : [[0,'major','平行調'],[3,'major','同主調'],[-1,'minor','下属調'],[0,'minor','主調'],[1,'minor','属調']];
  const cells = definitions.map(([offset, rowMode, relation]) => ({
    signature: signature + offset, mode: rowMode, relation, column: offsets.indexOf(offset),
    name: relatedKeyName(signature + offset, rowMode), outside: Math.abs(signature + offset) > 7
  }));
  return { columns: offsets.map(offset => signature + offset), cells, outside: cells.some(cell => cell.outside) };
}
