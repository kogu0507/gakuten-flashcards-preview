import { inversionDegreeNumbers, inversionQualityIds, inversionAppliedIntervals } from "../interval-inversion-meta.js";
import { getIntervalDegree, getIntervalQuality, getIntervalName, intervalNameBlock } from "../interval-terminology.js";

const cards = [
  { id: "interval-inversion-degree-sum", label: "転回の度数の和", prompt: "単音程を転回すると、元の度数と転回後の度数の和は？", answer: "9", tags: ["interval", "inversion", "degree"], meta: { rule: "degree-sum", sum: 9 } },
  ...inversionDegreeNumbers.map(number => {
    const degree = getIntervalDegree(number);
    const answer = getIntervalDegree(degree.inversion);
    return { id: `interval-inversion-degree-${number}`, label: `${number}度の転回`, prompt: `${number}度を転回すると何度？`, answer: answer.jp, answerContent: [intervalNameBlock(answer)], tags: ["interval", "inversion", "degree"], meta: { rule: "degree", number, inversionNumber: degree.inversion } };
  }),
  ...inversionQualityIds.map(quality => {
    const term = getIntervalQuality(quality);
    const answer = getIntervalQuality(term.inversion);
    return { id: `interval-inversion-quality-${quality}`, label: `${term.jp}音程の転回`, prompt: `${term.jp}音程を転回すると、性質は？`, answer: answer.jp, answerContent: [intervalNameBlock(answer)], tags: ["interval", "inversion", "quality"], meta: { rule: "quality", quality, inversionQuality: term.inversion } };
  }),
  ...inversionAppliedIntervals.map(({ quality, number }) => {
    const interval = getIntervalName(quality, number);
    const answer = getIntervalName(interval.inversionQuality, interval.inversionNumber);
    return { id: `interval-inversion-applied-${quality}-${number}`, label: `${interval.jp}の転回`, prompt: `次の音程を転回すると？\n${interval.jp}`, promptContent: [{ type: "text", text: "次の音程を転回すると？" }, { type: "text", text: interval.jp }], answer: answer.jp, answerContent: [intervalNameBlock(answer)], tags: ["interval", "inversion", "applied"], meta: { rule: "applied", quality, number, inversionQuality: interval.inversionQuality, inversionNumber: interval.inversionNumber } };
  })
];

export default { id: "interval-inversions", title: "転回音程", description: "単音程の転回の基本規則12枚と、音程を転回して答える12枚。2〜7度の代表的な音程を扱います。", cards };
