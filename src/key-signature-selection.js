import { keySignatureIds } from "./key-signature-meta.js";

// Layout rows double as the public range order; zero is included in every range.
export const keyRangeGroups = [
  [{ id: "all", title: "全範囲", kind: "both", max: 7 }],
  [{ id: "sharp-all", title: "♯系すべて", kind: "s", max: 7 },
   { id: "flat-all", title: "♭系すべて", kind: "f", max: 7 },
   { id: "both-0-5", title: "♯♭５つまで", kind: "both", max: 5 },
   { id: "both-0-3", title: "♯♭３つまで", kind: "both", max: 3 }],
  [{ id: "sharp-0-5", title: "調号なし～♯５", kind: "s", max: 5 },
   { id: "flat-0-5", title: "調号なし～♭５", kind: "f", max: 5 },
   { id: "sharp-0-3", title: "調号なし～♯３", kind: "s", max: 3 },
   { id: "flat-0-3", title: "調号なし～♭３", kind: "f", max: 3 }]
];
export const keyRanges = keyRangeGroups.flat();
export const keyModes = [{ id: "both", title: "長調・短調" }, { id: "major", title: "長調だけ" }, { id: "minor", title: "短調だけ" }];
export const keyCollectionIds = ["key-signature-images", "key-signature-writing"];

export function keySelectionCardIds(collectionId, rangeId = "all", mode = "both") {
  if (!keyCollectionIds.includes(collectionId)) throw new Error("Unknown key collection");
  const range = keyRanges.find(r => r.id === rangeId);
  if (!range || !keyModes.some(m => m.id === mode)) throw new Error("Unknown key selection");
  const signatures = keySignatureIds.filter(id => id === "0" ||
    ((range.kind === "both" || id.endsWith(range.kind)) && Number(id[0]) <= range.max));
  return collectionId === "key-signature-images"
    ? signatures.map(id => `key-image-${id}`)
    : (mode === "both" ? ["major", "minor"] : [mode]).flatMap(m => signatures.map(id => `key-write-${m}-${id}`));
}

export function replaceKeySelection(currentIds, collectionId, rangeId, mode) {
  const prefix = collectionId === "key-signature-images" ? "key-image-" : "key-write-";
  const next = keySelectionCardIds(collectionId, rangeId, mode);
  return [...currentIds.filter(id => !id.startsWith(prefix)), ...next];
}

export function matchKeySelection(collectionId, cardIds) {
  for (const range of keyRanges) for (const mode of collectionId === "key-signature-images" ? ["both"] : keyModes.map(m => m.id)) {
    const ids = keySelectionCardIds(collectionId, range.id, mode);
    if (ids.length === cardIds.length && ids.every(id => cardIds.includes(id))) return { range: range.id, mode };
  }
  return null;
}
