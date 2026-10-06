// Compact catalog data only. Root/register/position remain explicit in stable IDs.
export const triadPilotTargets = [
  {id:'triad-identify-c4-major-root',codeId:'triad-code-c4-major-root',quality:'major',assetId:'triad-treble-c4-01'},
  {id:'triad-identify-c4-minor-root',codeId:'triad-code-c4-minor-root',quality:'minor',assetId:'triad-treble-c4-02'},
  {id:'triad-identify-c4-diminished-root',codeId:'triad-code-c4-diminished-root',quality:'diminished',assetId:'triad-treble-c4-03'},
  {id:'triad-identify-c4-augmented-root',codeId:'triad-code-c4-augmented-root',quality:'augmented',assetId:'triad-treble-c4-04'}
];
export const triadPilotCardIds = triadPilotTargets.map(target=>target.id);
export const triadCodeCardIds = triadPilotTargets.map(target=>target.codeId);
export const allTriadPilotCardIds = [...triadPilotCardIds,...triadCodeCardIds];
