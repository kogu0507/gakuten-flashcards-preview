import { validateFoundations, foundationCard } from '../interval-foundations.js';

const url = new URL('../data/interval-foundations.json', import.meta.url);
// JSON stays the single source. Node's file reader is only for local QA/tools;
// static browsers fetch the collection body only after catalog selection.
const data = url.protocol === 'file:'
  ? JSON.parse(await (await import('node:fs/promises')).readFile(url, 'utf8'))
  : await (async () => { const response = await fetch(url); if (!response.ok) throw new Error('Could not load interval foundations'); return response.json(); })();
export default { id: 'interval-foundations', cards: validateFoundations(data).cards.map(foundationCard) };
