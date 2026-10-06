// Shelf taxonomy only: manifest ownership and practice/session order stay separate.
export const shelfGroups = [
  { id: 'intervals', title: '音程', collectionIds: ['interval-foundations', 'natural-note-intervals', 'interval-inversions'] },
  { id: 'keys', title: '調・調号', collectionIds: ['key-signature-images', 'key-signature-writing', 'key-relationships'] },
  { id: 'scales', title: '音階', collectionIds: ['scale-writing'] },
  { id:'chords',title:'和音',collectionIds:['triad-identification'] }
];

export function buildShelfSections(collections, groups = shelfGroups) {
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const groupIds = new Set(['other']);
  const assigned = new Set();
  if (!Array.isArray(groups) || !Array.isArray(collections)) throw new TypeError('Invalid shelf metadata');
  for (const group of groups) {
    if (!group || Object.keys(group).some(key => !['id', 'title', 'collectionIds'].includes(key))
      || !text(group.id) || !text(group.title) || !Array.isArray(group.collectionIds)
      || groupIds.has(group.id)) throw new TypeError('Invalid shelf group');
    groupIds.add(group.id);
    for (const id of group.collectionIds) {
      if (!text(id) || assigned.has(id)) throw new TypeError('Duplicate or invalid shelf collection');
      assigned.add(id);
    }
  }
  const visible = new Map();
  for (const collection of collections) {
    if (!collection || !text(collection.id) || visible.has(collection.id)) throw new TypeError('Invalid shelf collection');
    // Hidden legacy collections stay addressable by existing queries, not on shelf.
    if (collection.shelfVisible !== false) visible.set(collection.id, collection);
  }
  const sections = groups.map(group => ({ id: group.id, title: group.title,
    collections: group.collectionIds.filter(id => visible.has(id)).map(id => visible.get(id))
  })).filter(section => section.collections.length > 0);
  const remaining = [...visible.values()].filter(collection => !assigned.has(collection.id));
  if (remaining.length) sections.push({ id: 'other', title: 'その他のカード', collections: remaining });
  return sections;
}
