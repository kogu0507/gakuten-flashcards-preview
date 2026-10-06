import { foundationCardIds } from './interval-foundations-meta.js';
import { triadPilotCardIds,triadCodeCardIds } from './triad-identification-meta.js';
import {naturalTriadQualityIds,naturalTriadCodeIds,allNaturalTriadCardIds} from './triad-natural-roots-meta.js';
import { relatedKeyCardIds } from './key-relationships-meta.js';
import { keySignatureIds } from "./key-signature-meta.js";
import { scaleTypes, scaleAnswerModes, scaleSelectionCardIds } from "./scale-writing-meta.js";
import { inversionCardIds, inversionDegreeCardIds, inversionQualityCardIds, inversionRuleCardIds, inversionAppliedCardIds } from "./interval-inversion-meta.js";
import { getCollectionMeta } from "./manifest.js";
import {
  naturalIntervalCardIds,
  naturalIntervalCardIdsForNumber
} from "./natural-note-interval-meta.js";

// Shelf wording/order is separate from the unchanged card labels and prompts.
export const scaleTypeChoices = [{ id: 'all', title: '全範囲' }, ...scaleTypes];
export const scaleModeChoices = [
  { id: 'all', title: '全形式', description: '調号・臨時記号・両方の3形式を混ぜる' },
  ...scaleAnswerModes.map(mode => ({ ...mode, title: mode.id === 'both' ? '1枚で両方を書く' : mode.title }))
];

const majorKeyCardIds = getCollectionMeta("major-key-signatures")?.cardIds ?? [];

// Learning-set proposal: reuse existing IDs without loading card bodies.
const foundationContextIds = new Set([
  'melodic', 'harmonic', 'enharmonic-respelling', 'consonant', 'dissonant',
  'perfect-consonance', 'imperfect-consonance', 'absolute-consonance'
].map(slug => `interval-foundation-${slug}`));

const signatureRanges = [
  { suffix: "sharp-0-3", title: "調号なし～♯３", kind: "s", max: 3 },
  { suffix: "sharp-0-5", title: "調号なし～♯５", kind: "s", max: 5 },
  { suffix: "sharp-all", title: "♯系すべて", kind: "s", max: 7 },
  { suffix: "flat-0-3", title: "調号なし～♭３", kind: "f", max: 3 },
  { suffix: "flat-0-5", title: "調号なし～♭５", kind: "f", max: 5 },
  { suffix: "flat-all", title: "♭系すべて", kind: "f", max: 7 }
];

export const presets = [
  {id:'triad-identification-pilot',title:'三和音の種類 4枚（試作）',description:'長・短・減・増、根音ハの基本形',collectionIds:['triad-identification'],cardIds:[...triadPilotCardIds],shelfVisible:false},
  {id:'triad-code-pilot',title:'コードネーム 4枚（試作）',description:'同じ4譜例のコードネームだけを答える',collectionIds:['triad-identification'],cardIds:[...triadCodeCardIds],shelfVisible:false},
  {id:'chord-all',title:'全範囲',description:'収録済みの和音・種類問題とコード問題。現在は幹音根音の三和音のみ',collectionIds:['triad-identification'],cardIds:[...allNaturalTriadCardIds]},
  {id:'triad-all',title:'三和音のみ',description:'現在は全範囲と同じ内容',collectionIds:['triad-identification'],cardIds:[...allNaturalTriadCardIds],separatorBefore:true},
  {id:'triad-natural-roots',title:'根音が幹音の三和音',description:'C～Bの7根音・4種類。現在の三和音収録範囲',collectionIds:['triad-identification'],cardIds:[...allNaturalTriadCardIds],separatorBefore:true},
  {id:'triad-quality-natural-roots',title:'和音の種類だけ',description:'日本語・英語・ドイツ語で種類を答える',collectionIds:['triad-identification'],cardIds:[...naturalTriadQualityIds],separatorBefore:true},
  {id:'triad-code-natural-roots',title:'コードネームだけ',description:'同じ28譜例のコードネームだけを答える',collectionIds:['triad-identification'],cardIds:[...naturalTriadCodeIds]},
  { id: 'interval-foundations-all', title: '全範囲', description: '音程・転回・分類・音と記号の基本用語', collectionIds: ['interval-foundations'], cardIds: [...foundationCardIds] },
  { id: 'interval-foundations-core', title: 'まず覚える：数え方・種類・転回', description: '音程計算と、その前提となる音・記号', collectionIds: ['interval-foundations'], cardIds: foundationCardIds.filter(id => !foundationContextIds.has(id)) },
  { id: 'interval-foundations-context', title: '理解を広げる：響き・分類・関連用語', description: '鳴らし方・響きの分類・綴りの読み替え', collectionIds: ['interval-foundations'], cardIds: foundationCardIds.filter(id => foundationContextIds.has(id)) },
  ...[['all', '全範囲', 30], ['major', '長調', 15], ['minor', '短調', 15]].map(([mode, title, count]) => ({
    id: `related-key-${mode}`, title, description: `${count}主調・4関係を同時に自己確認`, collectionIds: ['key-relationships'],
    cardIds: relatedKeyCardIds.filter(id => mode === 'all' || id.startsWith(`related-key-${mode}-`))
  })),
  ...scaleTypeChoices.flatMap(type =>
    scaleModeChoices.map(mode => ({
      id: `scale-write-${type.id}-${mode.id}`, title: `${type.title}・${mode.title}`,
      description: mode.description ? `全15調・${mode.description}` : "全15調", collectionIds: ["scale-writing"],
      cardIds: scaleSelectionCardIds(type.id, mode.id)
    }))),
  ...["key-signature-images", "key-signature-writing"].flatMap(collectionId => {
    const image = collectionId === "key-signature-images";
    const prefix = image ? "key-image" : "key-write";
    const ids = getCollectionMeta(collectionId).cardIds;
    const all = { id: `${prefix}-all`, title: "全範囲", description: "調号なし＋♯1〜7つ＋♭1〜7つ", collectionIds: [collectionId], cardIds: [...ids] };
    const ranges = signatureRanges.map(range => ({
      id: `${prefix}-${range.suffix}`, title: range.title,
      description: range.max === 7 ? "調号なしを含む" : `調号なし＋${range.kind === "s" ? "♯" : "♭"}1〜${range.max}つ`,
      collectionIds: [collectionId],
      cardIds: ids.filter(id => { const signature = id.split("-").at(-1); return signature === "0" || (signature.endsWith(range.kind) && Number(signature[0]) <= range.max); })
    }));
    return image ? [all, ...ranges] : [all,
      ...["major", "minor"].map(mode => ({ id: `key-write-${mode}`, title: mode === "major" ? "長調だけ" : "短調だけ", description: "全15調", collectionIds: [collectionId], cardIds: keySignatureIds.map(id => `key-write-${mode}-${id}`) })),
      ...ranges];
  }),
  // Preserve links used while reviewing the initial candidate; omit these from the shelf.
  ...["key-signature-images", "key-signature-writing"].map(collectionId => ({
    id: collectionId === "key-signature-images" ? "key-image-0-3" : "key-write-0-3",
    title: "♯・♭0〜3つ", description: "調号なし＋♯1〜3つ＋♭1〜3つ", shelfVisible: false,
    collectionIds: [collectionId], cardIds: getCollectionMeta(collectionId).cardIds.filter(id => /-(0|[1-3][sf])$/.test(id))
  })),
  {
    id: "key-all",
    title: "調号 全範囲",
    description: "♯・♭なし＋♯1〜7個＋♭1〜7個",
    collectionIds: ["major-key-signatures"],
    cardIds: [...majorKeyCardIds]
  },
  {
    id: "key-sharp-0-3",
    title: "調号 ♯0〜3",
    description: "♯・♭なし＋♯1〜3個",
    collectionIds: ["major-key-signatures"],
    cardIds: ["major-0", "major-1s", "major-2s", "major-3s"]
  },
  {
    id: "key-sharp-0-5",
    title: "調号 ♯0〜5",
    description: "♯・♭なし＋♯1〜5個",
    collectionIds: ["major-key-signatures"],
    cardIds: ["major-0", "major-1s", "major-2s", "major-3s", "major-4s", "major-5s"]
  },
  {
    id: "key-sharp-flat-0-3",
    title: "調号 ♯♭0〜3",
    description: "♯・♭なし＋♯1〜3個＋♭1〜3個",
    collectionIds: ["major-key-signatures"],
    cardIds: ["major-0", "major-1s", "major-2s", "major-3s", "major-1f", "major-2f", "major-3f"]
  },
  {
    id: "interval-natural-all",
    title: "幹音 全範囲",
    description: "幹音同士の2〜7度",
    collectionIds: ["natural-note-intervals"],
    cardIds: [...naturalIntervalCardIds]
  },
  ...[2, 3, 4, 5, 6, 7].map((intervalNumber) => ({
    id: `interval-natural-${intervalNumber}`,
    title: `幹音 ${intervalNumber}度`,
    description: `幹音同士の${intervalNumber}度・7枚`,
    collectionIds: ["natural-note-intervals"],
    cardIds: naturalIntervalCardIdsForNumber(intervalNumber)
  })),
  ...[
    ["all", "転回 全範囲", "基本規則＋音程を答える・24枚", inversionCardIds],
    ["rules", "転回 基本規則", "度数と性質の基本規則・12枚", inversionRuleCardIds],
    ["applied", "転回 音程を答える", "長3度→短6度など・12枚", inversionAppliedCardIds],
    ["degrees", "転回 度数", "度数の和と2〜7度・7枚", inversionDegreeCardIds],
    ["qualities", "転回 性質", "長・短・完全・増・減・5枚", inversionQualityCardIds]
  ].map(([suffix, title, description, ids]) => ({ id: `interval-inversion-${suffix}`, title, description, collectionIds: ["interval-inversions"], cardIds: [...ids] }))
];

export const DEFAULT_PRESET_ID = "key-all";
const presetMap = new Map(presets.map((preset) => [preset.id, preset]));

export function getPreset(presetId) {
  return presetMap.get(presetId) ?? null;
}

export function presetsForCollection(collectionId) {
  return presets.filter((preset) => preset.collectionIds.includes(collectionId));
}

