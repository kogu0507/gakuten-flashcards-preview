export const inversionDegreeNumbers = Object.freeze([2, 3, 4, 5, 6, 7]);
export const inversionQualityIds = Object.freeze(["major", "minor", "perfect", "augmented", "diminished"]);
export const inversionDegreeCardIds = Object.freeze(["interval-inversion-degree-sum", ...inversionDegreeNumbers.map(number => `interval-inversion-degree-${number}`)]);
export const inversionQualityCardIds = Object.freeze(inversionQualityIds.map(quality => `interval-inversion-quality-${quality}`));
export const inversionRuleCardIds = Object.freeze([...inversionDegreeCardIds, ...inversionQualityCardIds]);
// Lightweight semantic scope; language strings remain in the lazy-loaded body.
export const inversionAppliedIntervals = Object.freeze([
  ["major", 2], ["minor", 2], ["major", 3], ["minor", 3],
  ["perfect", 4], ["augmented", 4], ["perfect", 5], ["diminished", 5],
  ["major", 6], ["minor", 6], ["major", 7], ["minor", 7]
].map(([quality, number]) => Object.freeze({ quality, number })));
export const inversionAppliedCardIds = Object.freeze(inversionAppliedIntervals.map(({ quality, number }) => `interval-inversion-applied-${quality}-${number}`));
export const inversionCardIds = Object.freeze([...inversionRuleCardIds, ...inversionAppliedCardIds]);
