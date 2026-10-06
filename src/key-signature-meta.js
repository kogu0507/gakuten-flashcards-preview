export const keySignatureIds = ["0", "1s", "2s", "3s", "4s", "5s", "6s", "7s", "1f", "2f", "3f", "4f", "5f", "6f", "7f"];
export const imageToKeyIds = keySignatureIds.map(id => `key-image-${id}`);
export const keyToImageIds = ["major", "minor"].flatMap(mode => keySignatureIds.map(id => `key-write-${mode}-${id}`));
