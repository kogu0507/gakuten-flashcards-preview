import { keySignatures } from "./key-signature-data.js";
export default {
  id: "key-signature-writing",
  cards: ["major", "minor"].flatMap(mode => keySignatures.map(key => ({
    id: `key-write-${mode}-${key.id}`, label: key[mode].jp,
    prompt: `次の調の調号を、高音部譜表に書きなさい。${key[mode].jp} / ${key[mode].en} / ${key[mode].de}`,
    answer: `高音部譜表の調号（${key.clue}）`,
    promptContent: [{ type: "key-names", question: "次の調の調号を、高音部譜表に書きなさい。", rows: [{ label: mode === "major" ? "長調" : "短調", ...key[mode] }] }],
    answerContent: [{ type: "key-notation", image: { src: `./assets/notation/key-signatures/treble-${key.id}.svg`, alt: `高音部譜表の調号、${key.clue}` }, clue: key.clue }],
    tags: ["key-signature", mode], meta: { accidental: key.accidental, count: key.count }
  })))
};
