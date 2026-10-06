import { MODES } from "./flashcards.js";

export function parseAppParams(search, { presetIds, cardIds }) {
  const params = new URLSearchParams(search);
  const mode = MODES.QUIZ;

  const requestedPreset = params.get("preset");
  if (requestedPreset && presetIds.has(requestedPreset)) {
    return { mode, presetId: requestedPreset, cardIds: null };
  }

  const requestedCards = (params.get("cards") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const filteredCards = [...new Set(requestedCards.filter((id) => cardIds.has(id)))];
  if (filteredCards.length > 0) {
    return { mode, presetId: null, cardIds: filteredCards };
  }

  return { mode, presetId: null, cardIds: [] };
}

export function buildAppSearch({ presetId = null, cardIds = [] }) {
  const params = new URLSearchParams();

  if (presetId) {
    params.set("preset", presetId);
  } else if (cardIds.length > 0) {
    params.set("cards", cardIds.join(","));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
