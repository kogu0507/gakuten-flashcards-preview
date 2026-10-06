const collection = {
  id: "major-key-signatures",
  title: "長調の調号",
  description: "調号の数から長調の調名を答えるカード群。",
  cards: [
    { id: "major-0", label: "♯♭なし", prompt: "♯・♭なしの長調は？", answer: "ハ長調 / C major", tags: ["key-signature", "major"], meta: { accidental: "none", count: 0 } },
    { id: "major-1s", label: "♯1", prompt: "♯1個の長調は？", answer: "ト長調 / G major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 1 } },
    { id: "major-2s", label: "♯2", prompt: "♯2個の長調は？", answer: "ニ長調 / D major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 2 } },
    { id: "major-3s", label: "♯3", prompt: "♯3個の長調は？", answer: "イ長調 / A major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 3 } },
    { id: "major-4s", label: "♯4", prompt: "♯4個の長調は？", answer: "ホ長調 / E major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 4 } },
    { id: "major-5s", label: "♯5", prompt: "♯5個の長調は？", answer: "ロ長調 / B major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 5 } },
    { id: "major-6s", label: "♯6", prompt: "♯6個の長調は？", answer: "嬰ヘ長調 / F♯ major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 6 } },
    { id: "major-7s", label: "♯7", prompt: "♯7個の長調は？", answer: "嬰ハ長調 / C♯ major", tags: ["key-signature", "major", "sharps"], meta: { accidental: "sharp", count: 7 } },
    { id: "major-1f", label: "♭1", prompt: "♭1個の長調は？", answer: "ヘ長調 / F major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 1 } },
    { id: "major-2f", label: "♭2", prompt: "♭2個の長調は？", answer: "変ロ長調 / B♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 2 } },
    { id: "major-3f", label: "♭3", prompt: "♭3個の長調は？", answer: "変ホ長調 / E♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 3 } },
    { id: "major-4f", label: "♭4", prompt: "♭4個の長調は？", answer: "変イ長調 / A♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 4 } },
    { id: "major-5f", label: "♭5", prompt: "♭5個の長調は？", answer: "変ニ長調 / D♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 5 } },
    { id: "major-6f", label: "♭6", prompt: "♭6個の長調は？", answer: "変ト長調 / G♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 6 } },
    { id: "major-7f", label: "♭7", prompt: "♭7個の長調は？", answer: "変ハ長調 / C♭ major", tags: ["key-signature", "major", "flats"], meta: { accidental: "flat", count: 7 } }
  ]
};

export default collection;
