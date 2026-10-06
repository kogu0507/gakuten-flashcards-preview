import { allManifestCardIds, collectionManifest } from "./manifest.js";

export const USER_CARD_PACK_SCHEMA_VERSION = "gakuten-flashcards-card-pack/v0.1";

export const USER_CARD_PACK_LIMITS = Object.freeze({
  maxJsonBytes: 256 * 1024,
  maxCards: 200,
  maxTitleLength: 120,
  maxCardIdLength: 64,
  maxPromptLength: 500,
  maxAnswerLength: 1_000,
  maxTagsPerItem: 12,
  maxTagLength: 48
});

const PACK_FIELDS = new Set(["schemaVersion", "title", "tags", "cards"]);
const CARD_FIELDS = new Set(["id", "prompt", "answer", "tags"]);
const SOURCE_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const curatedIds = new Set([
  ...allManifestCardIds,
  ...collectionManifest.map((collection) => collection.id)
]);

export class UserCardPackError extends Error {
  constructor(code, path, message) {
    super(message);
    this.name = "UserCardPackError";
    this.code = code;
    this.path = path;
  }
}

function fail(code, path, message) {
  throw new UserCardPackError(code, path, message);
}

function characterCount(value) {
  return [...value].length;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertAllowedFields(value, allowedFields, path) {
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) {
      fail("UNSUPPORTED_FIELD", `${path}.${field}`, `Unsupported field at ${path}.${field}`);
    }
  }
}

function assertRequiredString(value, path, maximumLength) {
  if (typeof value !== "string") {
    fail("INVALID_TYPE", path, `${path} must be a string`);
  }
  if (value.trim().length === 0) {
    fail("INVALID_VALUE", path, `${path} must not be empty`);
  }
  if (characterCount(value) > maximumLength) {
    fail("LIMIT_EXCEEDED", path, `${path} must be ${maximumLength} characters or fewer`);
  }
  return value;
}

function normalizeTags(value, path) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail("INVALID_TYPE", path, `${path} must be an array of strings`);
  if (value.length > USER_CARD_PACK_LIMITS.maxTagsPerItem) {
    fail("LIMIT_EXCEEDED", path, `${path} has too many tags`);
  }

  const seen = new Set();
  return value.map((tag, index) => {
    const tagPath = `${path}[${index}]`;
    const normalizedTag = assertRequiredString(tag, tagPath, USER_CARD_PACK_LIMITS.maxTagLength);
    if (seen.has(normalizedTag)) {
      fail("DUPLICATE_TAG", tagPath, `${tagPath} duplicates an earlier tag`);
    }
    seen.add(normalizedTag);
    return normalizedTag;
  });
}

function normalizeSourceCard(card, index, curatedCardIds) {
  const path = `$.cards[${index}]`;
  if (!isPlainObject(card)) fail("INVALID_TYPE", path, `${path} must be an object`);
  assertAllowedFields(card, CARD_FIELDS, path);

  for (const field of ["id", "prompt", "answer"]) {
    if (!(field in card)) fail("MISSING_FIELD", `${path}.${field}`, `${path}.${field} is required`);
  }

  const id = assertRequiredString(card.id, `${path}.id`, USER_CARD_PACK_LIMITS.maxCardIdLength);
  if (!SOURCE_ID_PATTERN.test(id)) {
    fail("INVALID_VALUE", `${path}.id`, `${path}.id must use lowercase letters, digits, and hyphens and begin with a letter`);
  }
  if (curatedCardIds.has(id)) {
    fail("CURATED_ID_COLLISION", `${path}.id`, `${path}.id conflicts with an operator-curated ID`);
  }

  return {
    id,
    prompt: assertRequiredString(card.prompt, `${path}.prompt`, USER_CARD_PACK_LIMITS.maxPromptLength),
    answer: assertRequiredString(card.answer, `${path}.answer`, USER_CARD_PACK_LIMITS.maxAnswerLength),
    tags: normalizeTags(card.tags, `${path}.tags`)
  };
}

// FNV-1a 64-bit is used only for a compact deterministic local namespace, not security.
function fingerprint(text) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (const codePoint of text) {
    hash ^= BigInt(codePoint.codePointAt(0));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

function normalizePack(value, curatedCardIds) {
  if (!isPlainObject(value)) fail("INVALID_TYPE", "$", "Card pack root must be an object");
  assertAllowedFields(value, PACK_FIELDS, "$");
  for (const field of ["schemaVersion", "title", "cards"]) {
    if (!(field in value)) fail("MISSING_FIELD", `$.${field}`, `$.${field} is required`);
  }
  if (typeof value.schemaVersion !== "string") {
    fail("INVALID_TYPE", "$.schemaVersion", "$.schemaVersion must be a string");
  }
  if (value.schemaVersion !== USER_CARD_PACK_SCHEMA_VERSION) {
    fail("UNSUPPORTED_VERSION", "$.schemaVersion", `Unsupported schemaVersion: ${String(value.schemaVersion)}`);
  }

  const title = assertRequiredString(value.title, "$.title", USER_CARD_PACK_LIMITS.maxTitleLength);
  const tags = normalizeTags(value.tags, "$.tags");
  if (!Array.isArray(value.cards)) fail("INVALID_TYPE", "$.cards", "$.cards must be an array");
  if (value.cards.length === 0) fail("INVALID_VALUE", "$.cards", "$.cards must include at least one card");
  if (value.cards.length > USER_CARD_PACK_LIMITS.maxCards) fail("LIMIT_EXCEEDED", "$.cards", "$.cards has too many cards");

  const cards = value.cards.map((card, index) => normalizeSourceCard(card, index, curatedCardIds));
  const seenSourceIds = new Set();
  for (const card of cards) {
    if (seenSourceIds.has(card.id)) fail("DUPLICATE_CARD_ID", "$.cards", `Duplicate card id: ${card.id}`);
    seenSourceIds.add(card.id);
  }

  const namespace = `local:pack:${fingerprint(JSON.stringify({ schemaVersion: value.schemaVersion, title, tags, cards }))}`;
  const collectionId = namespace;
  return Object.freeze({
    kind: "local-card-pack",
    schemaVersion: USER_CARD_PACK_SCHEMA_VERSION,
    id: namespace,
    title,
    tags: Object.freeze([...tags]),
    collection: Object.freeze({
      id: collectionId,
      title,
      cardCount: cards.length,
      source: "user-import"
    }),
    cards: Object.freeze(cards.map((card) => Object.freeze({
      id: `${namespace}:card:${card.id}`,
      sourceId: card.id,
      collectionId,
      prompt: card.prompt,
      answer: card.answer,
      promptContent: Object.freeze([{ type: "text", text: card.prompt }]),
      answerContent: Object.freeze([{ type: "text", text: card.answer }]),
      tags: Object.freeze([...card.tags])
    })))
  });
}

export function parseUserCardPack(jsonText, { curatedCardIds = curatedIds } = {}) {
  if (typeof jsonText !== "string") fail("INVALID_TYPE", "$", "Card pack input must be a JSON string");
  if (new TextEncoder().encode(jsonText).length > USER_CARD_PACK_LIMITS.maxJsonBytes) {
    fail("LIMIT_EXCEEDED", "$", "Card pack JSON is too large");
  }
  if (!(curatedCardIds instanceof Set)) fail("INVALID_TYPE", "curatedCardIds", "curatedCardIds must be a Set");

  let value;
  try {
    value = JSON.parse(jsonText);
  } catch {
    fail("MALFORMED_JSON", "$", "Card pack is not valid JSON");
  }
  return normalizePack(value, curatedCardIds);
}

export function validateUserCardPack(jsonText, options) {
  try {
    return { ok: true, value: parseUserCardPack(jsonText, options) };
  } catch (error) {
    if (error instanceof UserCardPackError) return { ok: false, error };
    throw error;
  }
}
