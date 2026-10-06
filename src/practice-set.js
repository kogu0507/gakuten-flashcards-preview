export function addCardIds(currentIds, addedIds) {
  const seen = new Set(currentIds);
  const result = [...currentIds];

  for (const id of addedIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

export function removeCardId(currentIds, cardId) {
  return currentIds.filter((id) => id !== cardId);
}

export function removeCardIds(currentIds, removedIds) {
  const removed = new Set(removedIds);
  return currentIds.filter((id) => !removed.has(id));
}

export function countIncludedCardIds(currentIds, candidateIds) {
  const current = new Set(currentIds);
  return candidateIds.reduce((count, id) => count + (current.has(id) ? 1 : 0), 0);
}

export function sameCardSet(firstIds, secondIds) {
  if (firstIds.length !== secondIds.length) return false;
  const second = new Set(secondIds);
  return firstIds.every((id) => second.has(id));
}
