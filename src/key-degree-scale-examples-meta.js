// Stable IDs and exclusive ownership; no card bodies at startup.
export const keyFoundationIds = Object.freeze(["key-foundations-key", "key-foundations-tonality", "key-foundations-root-g"]);
export const scaleDegreeNameIds = Object.freeze(["scale-degree-names-supertonic", "scale-degree-names-mediant", "scale-degree-names-subdominant", "scale-degree-names-dominant", "scale-degree-names-submediant", "scale-degree-names-leading-tone"]);
export const scaleExampleIds = Object.freeze(["scale-examples-pentatonic", "scale-examples-whole-tone", "scale-examples-chromatic"]);
export const keyDegreeScaleExampleIds = Object.freeze([...keyFoundationIds,...scaleDegreeNameIds,...scaleExampleIds]);
