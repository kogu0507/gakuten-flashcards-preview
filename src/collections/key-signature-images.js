import { keySignatures } from "./key-signature-data.js";
export default {
  id: "key-signature-images",
  cards: keySignatures.map(key => ({
    id: `key-image-${key.id}`, label: key.clue,
    prompt: "次の調号の調名を、長調・短調の両方で答えなさい。",
    answer: `${key.major.jp} / ${key.major.en} / ${key.major.de}。${key.minor.jp} / ${key.minor.en} / ${key.minor.de}`,
    promptContent: [{ type: "key-notation", question: "次の調号の調名を、長調・短調の両方で答えなさい。", image: { src: `./assets/notation/key-signatures/treble-${key.id}.svg`, alt: `高音部譜表の調号、${key.clue}` }, clue: key.clue }],
    answerContent: [{ type: "key-names", rows: [{ label: "長調", ...key.major }, { label: "短調", ...key.minor }] }],
    tags: ["key-signature", "major", "minor"], meta: { accidental: key.accidental, count: key.count }
  }))
};
