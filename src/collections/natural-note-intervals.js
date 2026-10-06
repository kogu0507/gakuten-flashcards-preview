import { naturalIntervalCardId, naturalIntervalNumbers, naturalIntervalTargetIndex, naturalNotes } from "../natural-note-interval-meta.js";
import { getIntervalName, intervalNameBlock, intervalQualities, legacyIntervalAnswer } from "../interval-terminology.js";

const expectedSemitones = Object.freeze({ 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 });
const qualityIds = Object.freeze(Object.fromEntries(Object.entries(intervalQualities).map(([id, term]) => [term.jp, id])));

function intervalQuality(intervalNumber, semitones) {
  const expected = expectedSemitones[intervalNumber];
  if (intervalNumber === 4 || intervalNumber === 5) {
    if (semitones === expected) return "完全";
    if (semitones === expected + 1) return "増";
    if (semitones === expected - 1) return "減";
  } else {
    if (semitones === expected) return "長";
    if (semitones === expected - 1) return "短";
    if (semitones === expected + 1) return "増";
    if (semitones === expected - 2) return "減";
  }
  throw new Error(`Unsupported natural-note interval: ${intervalNumber} / ${semitones}`);
}

function singleNoteTile(note, octave, role) {
  return {
    src: `./assets/notation/single-note-tiles/treble-${note.id}${octave}.svg`,
    alt: `${role}：ト音記号の五線上に${note.ja}を全音符で示した譜例`
  };
}

const cards = naturalNotes.flatMap((from, fromIndex) =>
  naturalIntervalNumbers.map((intervalNumber) => {
    const to = naturalNotes[naturalIntervalTargetIndex(fromIndex, intervalNumber)];
    const semitones = (to.semitone - from.semitone + 12) % 12;
    const quality = intervalQuality(intervalNumber, semitones);
    const id = naturalIntervalCardId(fromIndex, intervalNumber);
    const targetIndex = fromIndex + intervalNumber - 1;
    const toOctave = 4 + Math.floor(targetIndex / naturalNotes.length);
    const promptContent = [{
      type: "card-face",
      template: "notation-pair-question",
      images: [
        singleNoteTile(from, 4, "開始音"),
        singleNoteTile(to, toOctave, "到達音")
      ],
      question: "この2音の音程は？"
    }];

    return {
      id,
      label: `${from.ja}→${to.ja}`,
      prompt: `${from.ja}から上の${to.ja}までの音程は？`,
      promptContent,
      answer: legacyIntervalAnswer(qualityIds[quality], intervalNumber),
      answerContent: [intervalNameBlock(getIntervalName(qualityIds[quality], intervalNumber))],
      tags: ["interval", "natural-note", `${intervalNumber}`],
      meta: { from: from.id, to: to.id, intervalNumber, semitones, quality }
    };
  })
);

export default {
  id: "natural-note-intervals",
  title: "幹音同士の音程",
  description: "ハ・ニ・ホ・ヘ・ト・イ・ロから上行する2〜7度の音程を答えるカード群。",
  cards
};
