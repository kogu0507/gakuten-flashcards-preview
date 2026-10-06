import { foundationCardIds } from './interval-foundations-meta.js';
import { allNaturalTriadCardIds } from './triad-natural-roots-meta.js';
import {allSeventhPilotCardIds} from './seventh-chord-meta.js';
import { relatedKeyCardIds } from './key-relationships-meta.js';
import { imageToKeyIds, keyToImageIds } from "./key-signature-meta.js";
import { naturalIntervalCardIds } from "./natural-note-interval-meta.js";
import { inversionCardIds } from "./interval-inversion-meta.js";
import { scaleCardIds } from "./scale-writing-meta.js";

export const collectionManifest = [
  { id: "key-signature-images", title: "調号画像 → 調名", description: "高音部譜表の調号から、長調・短調の調名を三か国語で確認します。", cardCount: 15, modulePath: "./collections/key-signature-images.js", cardIds: imageToKeyIds },
  { id: "key-signature-writing", title: "調名 → 調号を書く", description: "日本語・英語・ドイツ語の調名から、高音部譜表の調号を思い出します。紙に書くか頭の中で思い浮かべて、正解画像で確認してください。短調は基本の調号を扱います。", cardCount: 30, modulePath: "./collections/key-signature-writing.js", cardIds: keyToImageIds },
  {
    id: "major-key-signatures",
    shelfVisible: false,
    title: "長調の調号",
    description: "調号の数から長調の調名を答えるカード群。",
    cardCount: 15,
    modulePath: "./collections/major-key-signatures.js",
    cardIds: [
      "major-0",
      "major-1s",
      "major-2s",
      "major-3s",
      "major-4s",
      "major-5s",
      "major-6s",
      "major-7s",
      "major-1f",
      "major-2f",
      "major-3f",
      "major-4f",
      "major-5f",
      "major-6f",
      "major-7f"
    ]
  },
  {
    id: "natural-note-intervals",
    title: "幹音同士の音程",
    description: "ハ・ニ・ホ・ヘ・ト・イ・ロから上行する2〜7度。答えは日本語・英語・ドイツ語（読み付き）で確認します。",
    cardCount: naturalIntervalCardIds.length,
    modulePath: "./collections/natural-note-intervals.js",
    cardIds: naturalIntervalCardIds
  },
  {
    id: "interval-inversions",
    title: "転回音程",
    description: "単音程の転回の基本規則12枚と、音程を転回して答える12枚。2〜7度の代表的な音程を確認します。",
    cardCount: inversionCardIds.length,
    modulePath: "./collections/interval-inversions.js",
    cardIds: inversionCardIds
  },
  { id: "scale-writing", title: "音階を書く", description: "全15調の長音階・短音階を紙に書いて、正解の譜例で確認します。旋律的短音階は上行形と下行形を書きます。", cardCount: 180, modulePath: "./collections/scale-writing.js", cardIds: scaleCardIds },
  { id: "key-relationships", title: "近親調", description: "長調15調・短調15調を主調とし、属調・下属調・平行調・同主調を表で確認します。短調の属調・下属調は自然短調の関係です。", cardCount: 30, modulePath: "./collections/key-relationships.js", cardIds: relatedKeyCardIds },
  { id: 'interval-foundations', title: '音程の基礎用語', description: '音程の基本用語を穴埋めで思い出す32枚。答え・短い解説・英語の読みで確認します。基本概念を短い解説で確認します。', cardCount: 32, modulePath: './collections/interval-foundations.js', cardIds: foundationCardIds },
  {id:'triad-identification',title:'三和音（基本形）',description:'根音が幹音の28譜例。種類28枚とコード28枚は別問題で、同じSVGを共有します。',cardCount:56,modulePath:'./collections/triad-identification.js',cardIds:allNaturalTriadCardIds},
  {id:'seventh-chord-identification',title:'七の和音（根音C・試作）',description:'根音Cの6譜例。種類6枚とコード6枚は別問題で、同じSVGを共有します。他根音は未収録です。',cardCount:12,modulePath:'./collections/seventh-chord-identification.js',cardIds:allSeventhPilotCardIds}
];

const collectionMap = new Map(collectionManifest.map((item) => [item.id, item]));
const cardToCollection = new Map();

for (const collection of collectionManifest) {
  for (const cardId of collection.cardIds) {
    if (cardToCollection.has(cardId)) {
      throw new Error(`Duplicate card id in manifest: ${cardId}`);
    }
    cardToCollection.set(cardId, collection.id);
  }
}

export const allManifestCardIds = new Set(cardToCollection.keys());

export function getCollectionMeta(collectionId) {
  return collectionMap.get(collectionId) ?? null;
}

export function collectionIdsForCardIds(cardIds) {
  const requested = new Set(cardIds);
  return collectionManifest
    .filter((collection) => collection.cardIds.some((cardId) => requested.has(cardId)))
    .map((collection) => collection.id);
}

export function validManifestCardIds(cardIds) {
  const seen = new Set();
  return cardIds.filter((id) => {
    if (!allManifestCardIds.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

