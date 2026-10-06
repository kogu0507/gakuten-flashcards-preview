import { keySignatures } from './key-signature-data.js';
import { scaleAssets } from './scale-assets.js';
import { scaleTargets, scaleTypes, scaleAnswerModes, scaleCardId } from '../scale-writing-meta.js';

const lookup = new Map(scaleAssets.map(asset => [[asset.scaleType, asset.keySignatureId, asset.notation, asset.direction].join('|'), asset]));
if (lookup.size !== 150) throw new Error('Duplicate scale asset mapping');
const instructions = {
  'key-signature': '調号を用いて書くこと。',
  accidentals: '調号を用いず、臨時記号を用いて書くこと。',
  both: '①調号を用いて、②調号を用いず臨時記号を用いて、両方書きなさい。'
};
const labels = { 'key-signature': '調号あり', accidentals: '臨時記号' };
const cards = scaleTargets.flatMap(target => {
  const type = scaleTypes.find(type => type.id === target.scaleType);
  const key = keySignatures.find(key => key.id === target.keySignatureId)[type.mode];
  const name = `${key.jp}の${type.title}`;
  return scaleAnswerModes.map(mode => {
    const notationModes = mode.id === 'both' ? ['key-signature', 'accidentals'] : [mode.id];
    const directions = type.id === 'melodic-minor' ? ['ascending', 'descending'] : ['ascending'];
    const groups = notationModes.map(notation => ({ notation, rows: directions.map(direction => {
      const asset = lookup.get([target.scaleType, target.keySignatureId, notation, direction].join('|'));
      if (!asset) throw new Error(`Missing asset: ${name}/${notation}/${direction}`);
      return { direction, image: { src: asset.src, alt: `${name}・${labels[notation]}${type.id === 'melodic-minor' ? `・${direction === 'ascending' ? '上行形' : '下行形'}` : ''}` } };
    }) }));
    const prompt = mode.id === 'both' ? `高音部譜表上に${name}を、${instructions[mode.id]}` : `高音部譜表上に${name}を書きなさい。${instructions[mode.id]}`;
    return { id: scaleCardId(type.id, target.keySignatureId, mode.id), label: `${name}・${mode.title}`, prompt,
      answer: groups.flatMap(group => group.rows.map(row => row.image.alt)).join('／'),
      promptContent: [{ type: 'text', text: prompt }],
      answerContent: [{ type: 'scale-notation', melodic: type.id === 'melodic-minor', groups }] };
  });
});
export default { id: 'scale-writing', cards };
