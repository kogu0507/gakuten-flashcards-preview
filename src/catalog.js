import {
  collectionIdsForCardIds,
  collectionManifest,
  getCollectionMeta,
  validManifestCardIds
} from "./manifest.js";

const collectionCache = new Map();

function validateCollection(collection, meta) {
  if (!collection || collection.id !== meta.id || !Array.isArray(collection.cards)) {
    throw new Error(`Invalid collection module: ${meta.id}`);
  }

  const moduleCardIds = collection.cards.map((card) => card.id);
  if (
    moduleCardIds.length !== meta.cardIds.length ||
    moduleCardIds.some((id, index) => id !== meta.cardIds[index])
  ) {
    throw new Error(`Collection card ids do not match manifest: ${meta.id}`);
  }

  return collection;
}

export function loadedCollectionIds() {
  return [...collectionCache.keys()];
}

export async function loadCollection(collectionId, importer = (path) => import(path)) {
  if (collectionCache.has(collectionId)) {
    return collectionCache.get(collectionId);
  }

  const meta = getCollectionMeta(collectionId);
  if (!meta) throw new RangeError(`Unknown collection: ${collectionId}`);

  const module = await importer(meta.modulePath);
  const collection = validateCollection(module.default ?? module.collection, meta);
  collectionCache.set(collectionId, collection);
  return collection;
}

export async function loadCollections(collectionIds) {
  const requested = new Set(collectionIds);
  const orderedIds = collectionManifest
    .filter((item) => requested.has(item.id))
    .map((item) => item.id);

  return Promise.all(orderedIds.map((id) => loadCollection(id)));
}

export async function loadCardsByIds(cardIds) {
  const validIds = validManifestCardIds(cardIds);
  const selected = new Set(validIds);
  const collectionIds = collectionIdsForCardIds(validIds);
  const collections = await loadCollections(collectionIds);

  return collections.flatMap((collection) =>
    collection.cards
      .filter((card) => selected.has(card.id))
      .map((card) => ({ ...card, collectionId: collection.id }))
  );
}

export { validManifestCardIds as validCardIds };
