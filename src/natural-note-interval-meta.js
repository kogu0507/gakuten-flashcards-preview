export const naturalNotes = Object.freeze([
  { id: "c", ja: "ハ", semitone: 0 },
  { id: "d", ja: "ニ", semitone: 2 },
  { id: "e", ja: "ホ", semitone: 4 },
  { id: "f", ja: "ヘ", semitone: 5 },
  { id: "g", ja: "ト", semitone: 7 },
  { id: "a", ja: "イ", semitone: 9 },
  { id: "b", ja: "ロ", semitone: 11 }
]);

export const naturalIntervalNumbers = Object.freeze([2, 3, 4, 5, 6, 7]);

export function naturalIntervalTargetIndex(fromIndex, intervalNumber) {
  return (fromIndex + intervalNumber - 1) % naturalNotes.length;
}

export function naturalIntervalCardId(fromIndex, intervalNumber) {
  const from = naturalNotes[fromIndex];
  const to = naturalNotes[naturalIntervalTargetIndex(fromIndex, intervalNumber)];
  return `interval-natural-${from.id}-${to.id}-${intervalNumber}`;
}

export const naturalIntervalCardIds = naturalNotes.flatMap((_, fromIndex) =>
  naturalIntervalNumbers.map((intervalNumber) =>
    naturalIntervalCardId(fromIndex, intervalNumber)
  )
);

export function naturalIntervalCardIdsForNumber(intervalNumber) {
  if (!naturalIntervalNumbers.includes(intervalNumber)) return [];
  return naturalNotes.map((_, fromIndex) =>
    naturalIntervalCardId(fromIndex, intervalNumber)
  );
}
