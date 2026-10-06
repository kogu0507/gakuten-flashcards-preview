// Compact targets generated from the explicit seventh pilot source.
export const seventhPilotTargets=[
  {
    "id": "seventh-identify-c4-diminished-root",
    "codeId": "seventh-code-c4-diminished-root",
    "quality": "diminished",
    "root": "C",
    "assetId": "seventh-treble-c4-01"
  },
  {
    "id": "seventh-identify-c4-half-diminished-root",
    "codeId": "seventh-code-c4-half-diminished-root",
    "quality": "half-diminished",
    "root": "C",
    "assetId": "seventh-treble-c4-02"
  },
  {
    "id": "seventh-identify-c4-minor-root",
    "codeId": "seventh-code-c4-minor-root",
    "quality": "minor",
    "root": "C",
    "assetId": "seventh-treble-c4-03"
  },
  {
    "id": "seventh-identify-c4-dominant-root",
    "codeId": "seventh-code-c4-dominant-root",
    "quality": "dominant",
    "root": "C",
    "assetId": "seventh-treble-c4-04"
  },
  {
    "id": "seventh-identify-c4-major-root",
    "codeId": "seventh-code-c4-major-root",
    "quality": "major",
    "root": "C",
    "assetId": "seventh-treble-c4-05"
  },
  {
    "id": "seventh-identify-c4-augmented-major-root",
    "codeId": "seventh-code-c4-augmented-major-root",
    "quality": "augmented-major",
    "root": "C",
    "assetId": "seventh-treble-c4-06"
  }
];
export const seventhQualityIds=seventhPilotTargets.map(t=>t.id);
export const seventhCodeIds=seventhPilotTargets.map(t=>t.codeId);
export const allSeventhPilotCardIds=[...seventhQualityIds,...seventhCodeIds];
