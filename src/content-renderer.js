import { exact, safeText, validateDegreePairs } from './interval-foundations.js';
import { triadName, triadCodeName, triadCodeParts } from './chord-terminology.js';
import { naturalTriadTargets } from './triad-natural-roots-meta.js';
import {naturalSeventhTargets} from './seventh-natural-roots-meta.js';
import {seventhName,seventhCodeName,seventhCodeParts} from './seventh-chord-terminology.js';
import { relatedKeyDiagram, relatedKeyName, relatedKeyQuestion } from './key-relationships.js';
import { melodicDisplayCrops } from "./scale-notation-crops.js";
const SVG_NS = "http://www.w3.org/2000/svg";
const CARD_FACE_TEMPLATE = "notation-pair-question";
const CARD_FACE_MAX_QUESTION_LENGTH = 32;
const CARD_FACE_LINE_LENGTH = 16;

function normalizeTextBlock(block) {
  if (typeof block.text !== "string" || block.text.length === 0) {
    throw new TypeError("Text content requires a non-empty text string");
  }
  return { type: "text", text: block.text };
}

function normalizeImageData(image) {
  if (!image || typeof image !== "object") {
    throw new TypeError("Image content requires an image object");
  }
  if (typeof image.src !== "string" || image.src.length === 0) {
    throw new TypeError("Image content requires a non-empty src string");
  }
  if (typeof image.alt !== "string" || image.alt.length === 0) {
    throw new TypeError("Image content requires a non-empty alt string");
  }
  return { src: image.src, alt: image.alt };
}

function normalizeImageBlock(block) {
  return { type: "image", ...normalizeImageData(block) };
}

function normalizeCardFaceBlock(block) {
  if (block.template !== CARD_FACE_TEMPLATE) {
    throw new TypeError(`Unsupported card-face template: ${block.template}`);
  }
  if (!Array.isArray(block.images) || block.images.length !== 2) {
    throw new TypeError("Notation-pair card-face requires exactly two images");
  }
  if (typeof block.question !== "string" || block.question.length === 0) {
    throw new TypeError("Notation-pair card-face requires a non-empty question");
  }
  if ([...block.question].length > CARD_FACE_MAX_QUESTION_LENGTH) {
    throw new TypeError(`Notation-pair card-face question must be ${CARD_FACE_MAX_QUESTION_LENGTH} characters or fewer`);
  }
  return {
    type: "card-face",
    template: CARD_FACE_TEMPLATE,
    images: block.images.map(normalizeImageData),
    question: block.question
  };
}

function boundedString(value, name, max = 80) {
  if (typeof value !== "string" || !value.trim() || [...value].length > max) {
    throw new TypeError(`Invalid ${name}`);
  }
  return value;
}

function exactFields(value, fields) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) {
    throw new TypeError("Unknown scale-notation field");
  }
}

function normalizeScaleNotation(block) {
  exactFields(block, ["type", "melodic", "groups"]);
  if (typeof block.melodic !== "boolean" || !Array.isArray(block.groups) || block.groups.length < 1 || block.groups.length > 2) throw new TypeError("Invalid scale groups");
  const modes = block.groups.map(group => group?.notation);
  if (modes.some(mode => !["key-signature", "accidentals"].includes(mode)) || new Set(modes).size !== modes.length || (modes.length === 2 && modes[0] !== "key-signature")) throw new TypeError("Invalid scale notation order");
  return { type: "scale-notation", melodic: block.melodic, groups: block.groups.map(group => {
    exactFields(group, ["notation", "rows"]);
    const directions = block.melodic ? ["ascending", "descending"] : ["ascending"];
    if (!Array.isArray(group.rows) || group.rows.length !== directions.length) throw new TypeError("Invalid scale row count");
    return { notation: group.notation, rows: group.rows.map((row, index) => {
      exactFields(row, ["direction", "image"]);
      exactFields(row.image, ["src", "alt"]);
      if (row.direction !== directions[index]) throw new TypeError("Invalid scale direction order");
      const image = normalizeImageData(row.image);
      if (!/^\.\/assets\/notation\/scales\/[a-z0-9-]+\.svg$/.test(image.src)) throw new TypeError("Scale notation requires a local prepared SVG");
      boundedString(image.alt, "scale alt", 120);
      if (/[<>\u0000-\u001f\u007f]/u.test(image.alt)) throw new TypeError("Invalid scale alt");
      return { direction: row.direction, image };
    }) };
  }) };
}

function createScaleNotation(block) {
  if (block.melodic && block.groups.length === 2) return createCroppedMelodicNotation(block);
  // Dimensions/layout are renderer-owned. Data provides only semantic groups/images.
  const groupHeight = block.melodic ? 60 + 2 * 270 : 60 + 222;
  const height = groupHeight * block.groups.length;
  const face = svgElement("svg", { class: "scale-notation-face", viewBox: `0 0 900 ${height}`, preserveAspectRatio: "xMidYMid meet", role: "img", focusable: "false",
    "aria-label": block.groups.flatMap(group => group.rows.map(row => row.image.alt)).join("。") });
  let y = 0;
  const label = (text, baseline, size) => {
    const node = svgElement("text", { x: 450, y: baseline, "text-anchor": "middle", "font-size": size, fill: "currentColor" });
    node.textContent = text;
    face.append(node);
  };
  for (const group of block.groups) {
    label(group.notation === "key-signature" ? "調号あり" : "臨時記号", y + 46, 48);
    y += 60;
    for (const row of group.rows) {
      if (block.melodic) { label(row.direction === "ascending" ? "上行形" : "下行形", y + 35, 40); y += 48; }
      face.append(svgElement("image", { href: row.image.src, x: 0, y, width: 900, height: 222, preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" }));
      y += 222;
    }
  }
  return face;
}

function createCroppedMelodicNotation(block) {
  const rows = block.groups.flatMap(group => group.rows.map(row => ({ ...row, notation: group.notation })));
  const crops = rows.map(row => melodicDisplayCrops[row.image.src] ?? { top: 0, height: 222 });
  const labelHeight = 44;
  const height = crops.reduce((sum, crop) => sum + crop.height + labelHeight, 0);
  const face = svgElement("svg", { class: "scale-notation-face scale-notation-face-four-row", viewBox: `0 0 900 ${height}`, preserveAspectRatio: "xMidYMid meet", role: "img", focusable: "false",
    "aria-label": rows.map(row => row.image.alt).join("。") });
  let y = 0;
  rows.forEach((row, index) => {
    const crop = crops[index];
    const label = svgElement("text", { x: 450, y: y + 32, "text-anchor": "middle", "font-size": 36, fill: "currentColor" });
    label.textContent = `${row.notation === "key-signature" ? "調号あり" : "臨時記号"}・${row.direction === "ascending" ? "上行形" : "下行形"}`;
    face.append(label);
    y += labelHeight;
    // Nested viewport clips only display whitespace; the external SVG stays intact.
    const viewport = svgElement("svg", { x: 0, y, width: 900, height: crop.height, viewBox: `0 ${crop.top} 900 ${crop.height}`, overflow: "hidden", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
    viewport.append(svgElement("image", { href: row.image.src, x: 0, y: 0, width: 900, height: 222, preserveAspectRatio: "xMidYMid meet" }));
    face.append(viewport);
    y += crop.height;
  });
  return face;
}

function normalizeKeyBlock(block) {
  const question = block.question == null ? null : boundedString(block.question, "question");
  if (block.type === "key-notation") {
    return { type: block.type, question, image: normalizeImageData(block.image), clue: boundedString(block.clue, "clue", 16) };
  }
  if (!Array.isArray(block.rows) || block.rows.length < 1 || block.rows.length > 2) throw new TypeError("Key names require one or two rows");
  return { type: block.type, question, rows: block.rows.map(row => {
    if (!row || !["長調", "短調"].includes(row.label)) throw new TypeError("Invalid key mode");
    return Object.fromEntries(["label", "jp", "en", "de", "reading"].map(field => [field, boundedString(row[field], field)]));
  }) };
}

function normalizeIntervalNameBlock(block) {
  const fields = ["type", "jp", "en", "de", "reading"];
  if (Object.keys(block).some(field => !fields.includes(field))) throw new TypeError("Unknown interval-name field");
  return Object.fromEntries(fields.map(field => {
    if (field === "type") return [field, "interval-name"];
    const text = boundedString(block[field], field, 64);
    if (/[<>\u0000-\u001f\u007f]/u.test(text)) throw new TypeError(`Markup/control characters are not allowed in ${field}`);
    return [field, text];
  }));
}

function textElement(tag, text, className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function germanRuby(row) {
  const ruby = document.createElement("ruby");
  ruby.setAttribute("lang", "de");
  const reading = textElement("rt", row.reading);
  reading.setAttribute("lang", "ja");
  ruby.append(textElement("span", row.de), textElement("rp", "（"), reading, textElement("rp", "）"));
  return ruby;
}

// A single item and a major/minor pair share language order and typography.
// Only validated names enter this renderer-owned table; no layout field in data.
function createLanguageNameTable(rows, classPrefix, raisedTonic = false) {
  const table = document.createElement('table');
  table.className = 'multilingual-name-table language-rows ' + (rows.length === 1 ? 'single-name' : 'paired-names key-names-table');
  table.setAttribute('aria-label', rows.length === 1 ? '日本語・英語・ドイツ語の名称' : '長調・短調の調名、日本語・英語・ドイツ語');
  const heading = (label, scope, lang = 'ja') => {
    const cell = textElement('th', label);
    cell.setAttribute('scope', scope);
    cell.setAttribute('lang', lang);
    return cell;
  };
  if (rows.length > 1) {
    const head = document.createElement('thead');
    const line = document.createElement('tr');
    line.append(heading('', 'col'));
    rows.forEach(row => line.append(heading(row.label, 'col')));
    head.append(line);
    table.append(head);
  }
  const body = document.createElement('tbody');
  for (const [key, label, lang] of [['jp', '日本語', 'ja'], ['en', 'English', 'en'], ['de', 'Deutsch', 'de']]) {
    const line = document.createElement('tr');
    line.append(heading(label, 'row', lang));
    rows.forEach(row => {
      const cell = textElement('td', key === 'de' ? '' : row[key], `name-term name-term-${key} ${classPrefix}-${key}`);
      cell.setAttribute('lang', lang);
      // Presentation only: preserve the SSOT name; major/minor is ordinary text.
      const tonic = raisedTonic && key === 'en' && /^([A-G])([♯♭])( major| minor)$/.exec(row.en);
      if (tonic) {
        cell.textContent = '';
        const root = textElement('span', tonic[1], 'key-tonic');
        root.append(textElement('sup', tonic[2], 'noto-music-symbol ' + (tonic[2] === '♯' ? 'sharp' : 'flat')));
        cell.append(root, textElement('span', tonic[3]));
      }
      if (key === 'de') cell.append(germanRuby(row));
      line.append(cell);
    });
    body.append(line);
  }
  table.append(body);
  return table;
}

function createIntervalName(block) {
  const face = document.createElement("div");
  face.className = "interval-name";
  face.append(createLanguageNameTable([block], 'interval-name'));
  return face;
}

function createChordQuality(block) {
  const term=block.type==='seventh-quality'?seventhName(block.quality):triadName(block.quality),face=textElement('div','','chord-quality-face'+(block.type==='seventh-quality'?' seventh-quality-face':''));
  const table=textElement('table','','chord-quality-table');table.setAttribute('aria-label','和音の種類、日本語・英語・ドイツ語');
  const body=document.createElement('tbody');
  for(const [key,label,lang] of [['jp','日本語','ja'],['en','English','en'],['de','Deutsch','de']]) {
    const row=document.createElement('tr');
    const th=textElement('th',label);th.setAttribute('scope','row');th.setAttribute('lang',lang);
    const td=textElement('td',key==='de'?'':term[key],'chord-quality-'+key);td.setAttribute('lang',lang);
    if(key==='en'&&block.type==='seventh-quality') {
      // Compact display only; the canonical name and accessible expansion stay whole.
      const index=term.en.indexOf('seventh');
      const ordinal=textElement('abbr','7th');ordinal.setAttribute('title','seventh');
      td.textContent='';td.setAttribute('aria-label',term.en);
      td.append(textElement('span',term.en.slice(0,index)),ordinal,textElement('span',term.en.slice(index+7)));
    }
    if(key==='de'){
      if(block.type==='seventh-quality')term.de.split(' ').forEach((word,index)=>{
        if(index)td.append(textElement('span',' '));
        td.append(germanRuby({de:word,reading:term.readingWords[index]}));
      });
      else td.append(germanRuby(term));
    }
    row.append(th,td);body.append(row);
  }
  table.append(body);face.append(table);return face;
}

function createChordSymbol(block) {
  const face=textElement('div','','chord-symbol-face'),value=textElement('div','','chord-symbol-value');
  const parts=triadCodeParts(block.root,block.quality);
  value.setAttribute('lang','en');value.setAttribute('aria-label',triadCodeName(block.root,block.quality));
  value.append(textElement('span',parts.root,'chord-code-root'));
  if(parts.suffix)value.append(textElement('span',parts.suffix,'chord-code-suffix'));
  face.setAttribute('aria-label','コードネーム');face.append(value);return face;
}

function createSeventhSymbol(block) {
  const face=textElement('div','','chord-symbol-face'),value=textElement('div','','chord-symbol-value');
  const parts=seventhCodeParts(block.root,block.quality);
  value.setAttribute('lang','en');value.setAttribute('aria-label',seventhCodeName(block.root,block.quality));
  value.append(textElement('span',parts.root,'chord-code-root'));
  const suffix=textElement('span',parts.suffix,'chord-code-suffix');
  if(parts.fifth){
    suffix.append(textElement('span','('),textElement('span',parts.fifth==='flat'?'♭':'♯',`noto-music-symbol chord-suffix-${parts.fifth}`),textElement('span','5)'));
  }
  value.append(suffix);face.setAttribute('aria-label','コードネーム');face.append(value);return face;
}

function createKeyContent(block) {
  const face = document.createElement("div");
  face.className = `key-content ${block.type}`;
  if (block.question) face.append(textElement("div", block.question, "key-question"));
  if (block.type === "key-notation") {
    face.append(createImageElement(block.image, "key-notation-image"), textElement("div", `（${block.clue}）`, "key-clue"));
  } else face.append(createLanguageNameTable(block.rows, 'key-name', !block.question && block.rows.length === 2));
  return face;
}

export function normalizeCardContent(content, fallbackText = "") {
  if (content == null) {
    return fallbackText ? [{ type: "text", text: fallbackText }] : [];
  }
  if (!Array.isArray(content)) {
    throw new TypeError("Card content must be an array of content blocks");
  }
  return content.map((block) => {
    if (!block || typeof block !== "object") throw new TypeError("Card content blocks must be objects");
    if (block.type === 'recall-answer') return normalizeRecallAnswer(block);
    if (block.type === "related-key-diagram") {
      exactFields(block, ['type', 'signature', 'mode', 'blank']);
      relatedKeyDiagram(block.signature, block.mode);
      if (typeof block.blank !== 'boolean') throw new TypeError('Invalid diagram visibility');
      return { type: block.type, signature: block.signature, mode: block.mode, blank: block.blank };
    }
    if (block.type === "scale-notation") return normalizeScaleNotation(block);
    if (block.type === "interval-name") return normalizeIntervalNameBlock(block);
    if (block.type === 'triad-notation') {
      exactFields(block,['type','assetId','question']);
      if (typeof block.assetId !== 'string' || !naturalTriadTargets.some(target=>target.assetId===block.assetId)) throw new TypeError('Unknown prepared triad asset');
      const question=boundedString(block.question,'triad question',32);
      if (/[<>\u0000-\u001f\u007f]/u.test(question)) throw new TypeError('Invalid triad question');
      return {type:'triad-notation',assetId:block.assetId,question};
    }
    if(block.type==='seventh-notation'){
      exactFields(block,['type','assetId','question']);
      if(typeof block.assetId!=='string'||!naturalSeventhTargets.some(t=>t.assetId===block.assetId))throw new TypeError('Unknown prepared seventh asset');
      const question=boundedString(block.question,'seventh question',32);
      if(/[<>\u0000-\u001f\u007f]/u.test(question))throw new TypeError('Invalid seventh question');
      return {type:block.type,assetId:block.assetId,question};
    }
    if(block.type==='seventh-quality'){
      exactFields(block,['type','quality']);seventhName(block.quality);
      return {type:block.type,quality:block.quality};
    }
    if(block.type==='seventh-symbol'){
      exactFields(block,['type','quality','root']);seventhCodeName(block.root,block.quality);
      return {type:block.type,quality:block.quality,root:block.root};
    }
    if(block.type==='chord-quality') {
      exactFields(block,['type','quality']);triadName(block.quality);
      return {type:block.type,quality:block.quality};
    }
    if (block.type === 'chord-name' || block.type==='chord-symbol') {
      exactFields(block,['type','quality','root']);
      triadName(block.quality);
      triadCodeName(block.root,block.quality);
      return {type:block.type,quality:block.quality,root:block.root};
    }
    if (["key-notation", "key-names"].includes(block.type)) return normalizeKeyBlock(block);
    if (block.type === "text") return normalizeTextBlock(block);
    if (block.type === "image") return normalizeImageBlock(block);
    if (block.type === "card-face") return normalizeCardFaceBlock(block);
    throw new TypeError(`Unsupported card content type: ${block.type}`);
  });
}

function createImageElement(imageData, className = "card-content-image") {
  const image = document.createElement("img");
  image.className = className;
  image.src = imageData.src;
  image.alt = imageData.alt;
  image.decoding = "async";
  image.loading = "eager";
  return image;
}

function svgElement(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
  return element;
}

function questionLines(question) {
  const chars = [...question];
  if (chars.length <= CARD_FACE_LINE_LENGTH) return [question];
  return [
    chars.slice(0, CARD_FACE_LINE_LENGTH).join(""),
    chars.slice(CARD_FACE_LINE_LENGTH).join("")
  ];
}

function createNotationPairFace(block) {
  const svg = svgElement("svg", {
    class: "card-content-face card-content-face-notation-pair",
    viewBox: "0 0 600 320",
    role: "img",
    "aria-label": `${block.question}。${block.images[0].alt}。${block.images[1].alt}`,
    focusable: "false",
    preserveAspectRatio: "xMidYMid meet"
  });

  const lines = questionLines(block.question);
  const text = svgElement("text", {
    class: "card-content-face-question",
    x: 300,
    y: lines.length === 1 ? 54 : 36,
    "text-anchor": "middle"
  });
  lines.forEach((line, index) => {
    const tspan = svgElement("tspan", {
      x: 300,
      dy: index === 0 ? 0 : 32
    });
    tspan.textContent = line;
    text.append(tspan);
  });
  svg.append(text);

  svg.append(svgElement("line", {
    class: "card-content-face-divider",
    x1: 42, y1: 88, x2: 558, y2: 88
  }));

  const imagePositions = [
    { x: 28, y: 98 },
    { x: 308, y: 98 }
  ];
  block.images.forEach((imageData, index) => {
    const image = svgElement("image", {
      href: imageData.src,
      x: imagePositions[index].x,
      y: imagePositions[index].y,
      width: 264,
      height: 212,
      preserveAspectRatio: "xMidYMid meet",
      "aria-hidden": "true"
    });
    svg.append(image);
  });

  return svg;
}

export function renderCardContent(container, content, fallbackText = "") {
  const blocks = normalizeCardContent(content, fallbackText);
  container.replaceChildren();
  for (const block of blocks) {
    if (block.type === 'recall-answer') { container.append(createRecallAnswer(block)); continue; }
    if (block.type === "related-key-diagram") {
      if (block.blank) container.append(textElement('span', relatedKeyQuestion, 'card-content-text'));
      container.append(createRelatedKeyDiagram(block)); continue;
    }
    if (block.type === "scale-notation") { container.append(createScaleNotation(block)); continue; }
    if (block.type === "interval-name") { container.append(createIntervalName(block)); continue; }
    if (block.type === 'triad-notation' || block.type==='seventh-notation') {
      const face=textElement('div','','triad-notation');
      const question=textElement('div',block.question,'triad-question');
      const keyword='コードネーム',index=block.question.indexOf(keyword);
      if(index>=0) question.replaceChildren(textElement('span',block.question.slice(0,index)),textElement('span',keyword,'triad-question-keyword'),textElement('span',block.question.slice(index+keyword.length)));
      const seventh=block.type==='seventh-notation';
      face.append(question,createImageElement({src:`./assets/notation/${seventh?'sevenths':'triads'}/${block.assetId}.svg`,alt:`高音部譜表の同時に鳴る${seventh?'4':'3'}音`},'triad-notation-image'));
      container.append(face); continue;
    }
    if(block.type==='chord-quality'||block.type==='seventh-quality') {container.append(createChordQuality(block));continue;}
    if(block.type==='seventh-symbol') {container.append(createSeventhSymbol(block));continue;}
    if(block.type==='chord-symbol') {container.append(createChordSymbol(block));continue;}
    if (block.type === 'chord-name') {
      const face=textElement('div','','chord-name chord-answer-sections');
      const kind=textElement('section','','chord-kind-section');
      kind.setAttribute('aria-label','和音の種類');
      kind.append(textElement('h4','和音の種類','chord-answer-heading'),createLanguageNameTable([triadName(block.quality)],'chord-name'));
      const code=textElement('section','','chord-code-section');
      code.setAttribute('aria-label','コードネーム');
      const value=textElement('div',triadCodeName(block.root,block.quality),'chord-code-value');
      value.setAttribute('lang','en');
      value.setAttribute('aria-label',triadCodeName(block.root,block.quality));
      const parts=triadCodeParts(block.root,block.quality);
      value.replaceChildren(textElement('span',parts.root,'chord-code-root'));
      if(parts.suffix) value.append(textElement('span',parts.suffix,'chord-code-suffix'));
      code.append(textElement('h4','コードネーム','chord-answer-heading'),value);
      face.append(kind,code);
      container.append(face); continue;
    }
    if (["key-notation", "key-names"].includes(block.type)) { container.append(createKeyContent(block)); continue; }
    if (block.type === "text") {
      const text = document.createElement("span");
      text.className = "card-content-text";
      text.textContent = block.text;
      container.append(text);
      continue;
    }
    if (block.type === "image") {
      container.append(createImageElement(block));
      continue;
    }
    container.append(createNotationPairFace(block));
  }
}


function normalizeRecallAnswer(block) {
  exact(block, ['type', 'answer', 'explanation', 'foreign', 'emphasis', 'degreePairs']);
  safeText(block.answer, 30); safeText(block.explanation, 100);
  if (!Array.isArray(block.emphasis) || block.emphasis.length > 2 || block.emphasis.some(text => { safeText(text, 30); return !block.explanation.includes(text); })) throw new TypeError('Invalid recall emphasis');
  if (!Array.isArray(block.foreign) || block.foreign.length > 2) throw new TypeError('Invalid recall foreign terms');
  block.foreign.forEach(term => {
    exact(term, ['lang', 'text', 'reading']);
    if (term.lang !== 'en') throw new TypeError('Invalid recall language');
    safeText(term.text, 64); safeText(term.reading, 64);
  });
  if (block.degreePairs !== undefined) validateDegreePairs(block.degreePairs);
  return { type: block.type, answer: block.answer, explanation: block.explanation, emphasis: [...block.emphasis], foreign: block.foreign.map(term => ({ ...term })), ...(block.degreePairs ? { degreePairs: block.degreePairs.map(pair => [...pair]) } : {}) };
}

function createRecallAnswer(block) {
  const face = textElement('span', '', 'recall-answer');
  face.append(textElement('span', block.answer, 'recall-answer-term'));
  for (const term of block.foreign) {
    const line = textElement('span', '', 'recall-answer-foreign');
    const ruby = document.createElement('ruby');
    ruby.setAttribute('lang', term.lang);
    ruby.append(textElement('span', term.text), textElement('rp', '（'), textElement('rt', term.reading), textElement('rp', '）'));
    line.append(ruby); face.append(line);
  }
  const explanation = textElement('span', '', 'recall-answer-explanation');
  if (block.degreePairs) {
    explanation.className += ' recall-degree-table';
    explanation.setAttribute('role', 'table');
    explanation.setAttribute('aria-label', block.explanation);
    for (const [index, heading] of ['原音程', '転回音程'].entries()) {
      const row = textElement('span', '', 'recall-degree-row');
      row.setAttribute('role', 'row');
      const label = textElement('span', heading); label.setAttribute('role', 'rowheader'); row.append(label);
      for (const pair of block.degreePairs) { const cell = textElement('span', pair[index]); cell.setAttribute('role', 'cell'); row.append(cell); }
      explanation.append(row);
    }
    face.append(explanation);
    return face;
  }
  let remaining = block.explanation;
  while (remaining) {
    const matches = block.emphasis.map(text => ({ text, index: remaining.indexOf(text) })).filter(match => match.index >= 0).sort((a, b) => a.index - b.index);
    if (!matches.length) { explanation.append(textElement('span', remaining)); break; }
    const match = matches[0];
    if (match.index) explanation.append(textElement('span', remaining.slice(0, match.index)));
    explanation.append(textElement('u', match.text));
    remaining = remaining.slice(match.index + match.text.length);
  }
  face.append(explanation);
  return face;
}

function createRelatedKeyDiagram(block) {
  const diagram = relatedKeyDiagram(block.signature, block.mode);
  const name = relatedKeyName(block.signature, block.mode);
  const description = block.blank ? '4つの関係先の調名は空欄。' : diagram.cells.map(cell => `${cell.relation}：${cell.name}${cell.outside ? '、通常の調号範囲外' : ''}`).join('。');
  const svg = svgElement('svg', { viewBox: `0 0 500 ${diagram.outside ? 158 : 130}`, class: `related-layout${block.blank ? ' related-layout-question' : ''}`, role: 'img', focusable: 'false', preserveAspectRatio: 'xMidYMid meet', 'aria-label': `${name}を主調とする近親調。上段長調、下段短調。${description}` });
  const add = (tag, attrs, text) => { const node = svgElement(tag, attrs); if (text !== undefined) node.textContent = text; svg.append(node); };
  add('rect', {width:500,height:130,rx:5,fill:'#fff'});
  add('rect', {width:500,height:26,fill:'#e5eee9'});
  diagram.columns.forEach((signature, col) => {
    const label = signature === 0 ? 'なし' : `${signature < 0 ? '♭' : '♯'}${Math.abs(signature)}${Math.abs(signature)>7 ? '相当' : ''}`;
    add('text', {x:col*100+50,y:20,'text-anchor':'middle','font-size':Math.abs(signature)>7?17:20,'font-weight':700,fill:'#334c40'}, label);
    if(col) add('line', {x1:col*100,y1:26,x2:col*100,y2:130,stroke:'#e2e7e4'});
  });
  diagram.cells.forEach(cell => {
    const x = cell.column*100, y = cell.mode === 'major' ? 26 : 78;
    if(cell.relation === '主調') add('rect', {x:x+1,y:y+1,width:98,height:50,fill:'#e0eee6',stroke:'#496a58','stroke-width':2});
    add('text', {x:x+50,y:y+18,'text-anchor':'middle','font-size':18,fill:'#4b6254'}, cell.relation+(!block.blank&&cell.outside?'※':''));
    add('text', {x:x+50,y:y+44,'text-anchor':'middle','font-size':24,'font-weight':cell.relation==='主調'?800:700,fill:'#1f2937','data-key-name':'','data-relation':cell.relation,'data-mode':cell.mode,'data-column':cell.column}, block.blank&&cell.relation!=='主調'?'＿＿＿':cell.name);
  });
  add('line', {x1:0,y1:26,x2:500,y2:26,stroke:'#496a58','stroke-width':2});
  add('line', {x1:0,y1:78,x2:500,y2:78,stroke:'#d8e0da'});
  if(diagram.outside&&!block.blank) add('text', {x:250,y:153,'text-anchor':'middle','font-size':20,fill:'#4b6254','data-note':''}, '※通常の調号（♯・♭7個まで）の範囲外');
  return svg;
}
