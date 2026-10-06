// Curated terminology shared by recognition and inversion cards. Learner
// readings are Japanese reading aids, not phonetic transcriptions.
export const intervalQualities = Object.freeze({
  major: Object.freeze({ jp: "長", en: "major", de: "groß", reading: "グロース", adjective: "große", adjectiveReading: "グローセ", inversion: "minor" }),
  minor: Object.freeze({ jp: "短", en: "minor", de: "klein", reading: "クライン", adjective: "kleine", adjectiveReading: "クライネ", inversion: "major" }),
  perfect: Object.freeze({ jp: "完全", en: "perfect", de: "rein", reading: "ライン", adjective: "reine", adjectiveReading: "ライネ", inversion: "perfect" }),
  augmented: Object.freeze({ jp: "増", en: "augmented", de: "übermäßig", reading: "ユーバーメーシヒ", adjective: "übermäßige", adjectiveReading: "ユーバーメーシゲ", inversion: "diminished" }),
  diminished: Object.freeze({ jp: "減", en: "diminished", de: "vermindert", reading: "フェアミンデルト", adjective: "verminderte", adjectiveReading: "フェアミンデルテ", inversion: "augmented" })
});

export const intervalDegrees = Object.freeze(Object.fromEntries([
  [2, "second", "2nd", "Sekunde", "ゼクンデ"],
  [3, "third", "3rd", "Terz", "テルツ"],
  [4, "fourth", "4th", "Quarte", "クヴァルテ"],
  [5, "fifth", "5th", "Quinte", "クヴィンテ"],
  [6, "sixth", "6th", "Sexte", "ゼクステ"],
  [7, "seventh", "7th", "Septime", "ゼプティーメ"]
].map(([number, en, ordinal, de, reading]) => [number, Object.freeze({ jp: `${number}度`, en, ordinal, de, reading, inversion: 9 - number })])));

function languageFields(term) {
  return { jp: term.jp, en: term.en, de: term.de, reading: term.reading };
}

export function getIntervalDegree(number) {
  if (!Number.isInteger(number) || !Object.hasOwn(intervalDegrees, number)) throw new RangeError(`Unsupported interval degree: ${number}`);
  return intervalDegrees[number];
}

export function getIntervalQuality(quality) {
  if (typeof quality !== "string" || !Object.hasOwn(intervalQualities, quality)) throw new RangeError(`Unsupported interval quality: ${quality}`);
  return intervalQualities[quality];
}

export function getIntervalName(quality, number) {
  const q = getIntervalQuality(quality);
  const d = getIntervalDegree(number);
  const perfectFamily = number === 4 || number === 5;
  if ((quality === "perfect" && !perfectFamily) || (["major", "minor"].includes(quality) && perfectFamily)) {
    throw new RangeError(`Unsupported interval name: ${quality} ${number}`);
  }
  return Object.freeze({ quality, number, jp: `${q.jp}${d.jp}`, en: `${q.en} ${d.en}`, de: `${q.adjective} ${d.de}`, reading: `${q.adjectiveReading} ${d.reading}`, inversionQuality: q.inversion, inversionNumber: d.inversion });
}

export function intervalNameBlock(term) {
  return { type: "interval-name", ...languageFields(term) };
}

export function legacyIntervalAnswer(quality, number) {
  const q = getIntervalQuality(quality);
  const d = getIntervalDegree(number);
  return `${q.jp}${d.jp} / ${q.en} ${d.ordinal}`;
}

// Shared conceptual English names. Readings are educational approximations.
export const intervalConcepts = Object.freeze({
  interval: Object.freeze({ en: "interval", enReading: "インターヴァル" }),
  number: Object.freeze({ en: "interval number", enReading: "インターヴァル ナンバー" }),
  quality: Object.freeze({ en: "interval quality", enReading: "インターヴァル クオリティ" }),
  melodic: Object.freeze({ en: "melodic interval", enReading: "メロディック インターヴァル" }),
  harmonic: Object.freeze({ en: "harmonic interval", enReading: "ハーモニック インターヴァル" }),
  half: Object.freeze({ en: "half step", enReading: "ハーフ ステップ" }),
  whole: Object.freeze({ en: "whole step", enReading: "ホール ステップ" }),
  simple: Object.freeze({ en: "simple interval", enReading: "シンプル インターヴァル" }),
  compound: Object.freeze({ en: "compound interval", enReading: "コンパウンド インターヴァル" }),
  inversion: Object.freeze({ en: "inversion", enReading: "インヴァージョン" }),
  enharmonic: Object.freeze({ en: "enharmonic equivalents", enReading: "エンハーモニック イクイヴァレンツ" }),
  consonant: Object.freeze({ en: "consonant interval", enReading: "コンソナント インターヴァル" }),
  dissonant: Object.freeze({ en: "dissonant interval", enReading: "ディソナント インターヴァル" }),
  accidental: Object.freeze({ en: "accidental", enReading: "アクシデンタル" }),
  perfect: Object.freeze({ en: intervalQualities.perfect.en + ' interval', enReading: 'パーフェクト インターヴァル' }),
  major: Object.freeze({ en: intervalQualities.major.en + ' interval', enReading: 'メイジャー インターヴァル' }),
  minor: Object.freeze({ en: intervalQualities.minor.en + ' interval', enReading: 'マイナー インターヴァル' }),
  augmented: Object.freeze({ en: intervalQualities.augmented.en + ' interval', enReading: 'オーグメンティド インターヴァル' }),
  diminished: Object.freeze({ en: intervalQualities.diminished.en + ' interval', enReading: 'ディミニシュト インターヴァル' }),
});
