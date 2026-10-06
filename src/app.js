import { relatedKeyDiagram } from './key-relationships.js';
import { loadCardsByIds, loadCollection, validCardIds } from "./catalog.js";
import { buildAppSearch, parseAppParams } from "./config.js";
import { renderCardContent } from "./content-renderer.js";
import { allManifestCardIds, collectionManifest } from "./manifest.js";
import { buildShelfSections } from './shelf-groups.js';
import { sendAppEngagement } from "./measurement.js";
import {
  addCardIds,
  countIncludedCardIds,
  removeCardId,
  removeCardIds,
  sameCardSet
} from "./practice-set.js";
import { getPreset, presets, presetsForCollection, scaleTypeChoices, scaleModeChoices } from "./presets.js";
import {
  MODES,
  createSession,
  currentCardIndex,
  move,
  reveal,
  resetForMode,
  reshuffle
} from "./flashcards.js";

import { keyCollectionIds, keyRangeGroups, keyRanges, keyModes, keySelectionCardIds, replaceKeySelection, matchKeySelection } from "./key-signature-selection.js";
import { replaceScaleSelection, matchScaleSelection } from "./scale-writing-meta.js";

let scaleSelection = { type: "all", mode: "both" };

const keySelections = new Map(keyCollectionIds.map(id => [id, { range: "all", mode: "both" }]));

const elements = {
  startScreen: document.querySelector("#start-screen"),
  playScreen: document.querySelector("#play-screen"),
  practiceCount: document.querySelector("#practice-count"),
  practiceOrigin: document.querySelector("#practice-origin"),
  practiceEmpty: document.querySelector("#practice-empty"),
  practiceGroups: document.querySelector("#practice-groups"),
  clearPracticeButton: document.querySelector("#clear-practice-button"),
  startPracticeButton: document.querySelector("#start-practice-button"),
  shelfList: document.querySelector("#shelf-list"),
  startStatus: document.querySelector("#start-status"),
  changeRangeButton: document.querySelector("#change-range-button"),
  modeInputs: [...document.querySelectorAll('input[name="mode"]')],
  sourceTitle: document.querySelector("#source-title"),
  sourceDescription: document.querySelector("#source-description"),
  flashcard: document.querySelector("#flashcard"),
  progress: document.querySelector("#progress"),
  prompt: document.querySelector("#card-prompt"),
  answer: document.querySelector("#card-answer"),
  answerWrap: document.querySelector("#answer-wrap"),
  revealButton: document.querySelector("#reveal-button"),
  nextButton: document.querySelector("#next-button"),
  prevButton: document.querySelector("#prev-button"),
  shuffleButton: document.querySelector("#shuffle-button"),
  playStatus: document.querySelector("#play-status")
};

const presetIds = new Set(presets.map((preset) => preset.id));
const initialConfig = parseAppParams(window.location.search, {
  presetIds,
  cardIds: allManifestCardIds
});

let activeMode = initialConfig.mode;
let practiceCardIds = [];
let practiceCards = [];
let practicePresetId = null;
let activeCards = [];
let session = null;
let practiceLoading = false;
let refreshToken = 0;

function modeName(mode) {
  return mode === MODES.QUIZ ? "出題" : "学習";
}

function syncUrl() {
  const search = buildAppSearch({
    mode: activeMode,
    presetId: practicePresetId,
    cardIds: practicePresetId ? [] : practiceCardIds
  });

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${search}${window.location.hash}`
  );
}

function setScreen(screen) {
  const isPlay = screen === "play";
  elements.startScreen.hidden = isPlay;
  elements.playScreen.hidden = !isPlay;
}

function resetPlayViewport() {
  window.requestAnimationFrame(() => {
    elements.flashcard.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: "auto"
    });
  });
}

function practiceOriginText() {
  const preset = practicePresetId ? getPreset(practicePresetId) : null;
  if (preset) {
    return `「${preset.title}」の束が今回のカードに入っています。下の棚で範囲を選んだり、カードを戻したりできます。`;
  }
  return practiceCardIds.length > 0
    ? "棚から集めたカードです。内容を確認してから始められます。"
    : "";
}

function renderPracticeGroups() {
  elements.practiceGroups.replaceChildren();
  if (practiceCards.length === 0) return;

  const byCollection = new Map();
  for (const card of practiceCards) {
    if (!byCollection.has(card.collectionId)) byCollection.set(card.collectionId, []);
    byCollection.get(card.collectionId).push(card);
  }

  const fragment = document.createDocumentFragment();

  for (const meta of collectionManifest) {
    const cards = byCollection.get(meta.id);
    if (!cards?.length) continue;

    const group = document.createElement("section");
    group.className = "practice-group";

    const heading = document.createElement("div");
    heading.className = "practice-group-heading";

    const title = document.createElement("h4");
    title.textContent = `${meta.title}　${cards.length}枚`;

    const removeGroup = document.createElement("button");
    removeGroup.type = "button";
    removeGroup.className = "text-button";
    removeGroup.textContent = "このグループを棚へ戻す";
    removeGroup.addEventListener("click", () => removePracticeCards(cards.map((card) => card.id)));

    heading.append(title, removeGroup);

    const cardList = document.createElement("div");
    cardList.className = "practice-card-list";

    for (const card of cards) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "practice-card-chip";
      chip.title = `${card.label}を棚へ戻す`;
      chip.setAttribute("aria-label", `${card.label}を棚へ戻す`);

      const label = document.createElement("span");
      label.textContent = card.label;
      const remove = document.createElement("span");
      remove.className = "chip-remove";
      remove.setAttribute("aria-hidden", "true");
      remove.textContent = "×";

      chip.append(label, remove);
      chip.addEventListener("click", () => removePracticeCard(card.id));
      cardList.append(chip);
    }

    group.append(heading, cardList);
    fragment.append(group);
  }

  elements.practiceGroups.append(fragment);
}

function renderPracticeSet() {
  const count = practiceCardIds.length;
  elements.practiceCount.textContent = `${count}枚`;
  elements.practiceOrigin.textContent = practiceOriginText();
  elements.practiceOrigin.hidden = count === 0;
  elements.practiceEmpty.hidden = count !== 0 || practiceLoading;
  elements.practiceGroups.hidden = practiceLoading || practiceCards.length === 0;
  elements.clearPracticeButton.hidden = count === 0;
  elements.startPracticeButton.disabled = count === 0 || practiceLoading || practiceCards.length !== count;
  elements.startPracticeButton.textContent = count > 0
    ? `この${count}枚で始める`
    : "カードを追加してください";

  if (practiceLoading) {
    elements.practiceEmpty.hidden = false;
    elements.practiceEmpty.textContent = "今回のカードを読み込んでいます…";
  } else {
    elements.practiceEmpty.textContent = "今回のカードはまだありません。下のカード棚から追加してください。";
  }

  renderPracticeGroups();
  updateShelfControls();
}

function updateShelfControls() {
  const scalePicker = elements.shelfList.querySelector('[data-scale-picker]');
  if (scalePicker) {
    const current = practiceCardIds.filter(id => id.startsWith('scale-write-'));
    const matched = matchScaleSelection(current);
    if (matched) scaleSelection = matched;
    for (const button of scalePicker.querySelectorAll('[data-scale-field]')) {
      button.setAttribute('aria-pressed', String(scaleSelection[button.dataset.scaleField] === button.dataset.scaleValue));
    }
    scalePicker.querySelector('.key-selection-status').textContent = current.length === 0
      ? '範囲を選ぶと、今回のカードに入ります。'
      : matched ? `${current.length}枚を選択中` : `個別に調整した${current.length}枚。範囲を選ぶと入れ替わります。`;
  }
  for (const collectionId of keyCollectionIds) {
    const meta = collectionManifest.find(m => m.id === collectionId);
    const current = practiceCardIds.filter(id => meta.cardIds.includes(id));
    const matched = matchKeySelection(collectionId, current);
    if (matched) keySelections.set(collectionId, matched);
    const selection = keySelections.get(collectionId);
    const picker = elements.shelfList.querySelector(`[data-key-picker="${collectionId}"]`);
    if (!picker) continue;
    for (const button of picker.querySelectorAll("[data-range]")) button.setAttribute("aria-pressed", String(selection.range === button.dataset.range));
    for (const button of picker.querySelectorAll("[data-key-mode]")) button.setAttribute("aria-pressed", String(selection.mode === button.dataset.keyMode));
    const range = keyRanges.find(r => r.id === selection.range).title;
    const mode = collectionId === "key-signature-writing" ? `・${keyModes.find(m => m.id === selection.mode).title}` : "";
    picker.querySelector(".key-selection-status").textContent = current.length === 0
      ? "範囲を選ぶと、今回のカードに入ります。"
      : matched ? `${range}${mode}・${current.length}枚を選択中`
      : `個別に調整した${current.length}枚。範囲を選ぶと入れ替わります。`;
  }
  for (const button of elements.shelfList.querySelectorAll("[data-preset-id]")) {
    const preset = getPreset(button.dataset.presetId);
    if (!preset) continue;
    const included = countIncludedCardIds(practiceCardIds, preset.cardIds);
    const action = button.querySelector(".shelf-action-label");

    if (included === preset.cardIds.length) {
      button.disabled = true;
      action.textContent = "追加済み";
    } else if (included > 0) {
      button.disabled = false;
      action.textContent = `＋ 残り${preset.cardIds.length - included}枚`;
    } else {
      button.disabled = false;
      action.textContent = "＋ 追加";
    }
  }

  const selected = new Set(practiceCardIds);
  for (const button of elements.shelfList.querySelectorAll("[data-card-id]")) {
    const added = selected.has(button.dataset.cardId);
    button.disabled = false;
    button.textContent = added ? "✓ 外す" : "＋ 追加";
    button.setAttribute('aria-pressed', String(added));
    button.setAttribute('aria-label', added
      ? `選択中の${button.dataset.cardLabel}を今回のカードから外す`
      : `${button.dataset.cardLabel}を今回のカードに追加`);
  }
}

async function refreshPracticeSet(message = "") {
  const token = ++refreshToken;
  practiceCardIds = validCardIds(practiceCardIds);

  if (practiceCardIds.length === 0) {
    practiceCards = [];
    practicePresetId = null;
    practiceLoading = false;
    renderPracticeSet();
    syncUrl();
    elements.startStatus.textContent = message;
    return;
  }

  practiceLoading = true;
  renderPracticeSet();
  elements.startStatus.textContent = "カードを読み込んでいます…";

  try {
    const cards = await loadCardsByIds(practiceCardIds);
    if (token !== refreshToken) return;

    practiceCards = cards;
    practiceCardIds = cards.map((card) => card.id);

    const preset = practicePresetId ? getPreset(practicePresetId) : null;
    if (preset && !sameCardSet(practiceCardIds, preset.cardIds)) {
      practicePresetId = null;
    }

    practiceLoading = false;
    renderPracticeSet();
    syncUrl();
    elements.startStatus.textContent = message;
  } catch (error) {
    if (token !== refreshToken) return;
    console.error(error);
    practiceLoading = false;
    practiceCards = [];
    renderPracticeSet();
    elements.startStatus.textContent = "カードを読み込めませんでした。ページを再読み込みしてください。";
  }
}

async function addPreset(presetId) {
  const preset = getPreset(presetId);
  if (!preset) return;

  const beforeCount = practiceCardIds.length;
  const nextIds = addCardIds(practiceCardIds, preset.cardIds);
  if (nextIds.length === beforeCount) {
    elements.startStatus.textContent = `${preset.title}はすでに今回のカードに入っています。`;
    return;
  }

  practiceCardIds = nextIds;
  practicePresetId = sameCardSet(practiceCardIds, preset.cardIds) ? preset.id : null;
  await refreshPracticeSet(`${preset.title}からカードを追加しました。`);
}

async function addIndividualCard(cardId) {
  const nextIds = addCardIds(practiceCardIds, [cardId]);
  if (nextIds.length === practiceCardIds.length) return;
  practiceCardIds = nextIds;
  practicePresetId = null;
  await refreshPracticeSet("カードを1枚追加しました。");
}

async function removePracticeCard(cardId) {
  practiceCardIds = removeCardId(practiceCardIds, cardId);
  practicePresetId = null;
  await refreshPracticeSet("カードを棚へ戻しました。");
}

async function removePracticeCards(cardIds) {
  practiceCardIds = removeCardIds(practiceCardIds, cardIds);
  practicePresetId = null;
  await refreshPracticeSet("選んだグループを棚へ戻しました。");
}

async function clearPracticeSet() {
  practiceCardIds = [];
  practicePresetId = null;
  await refreshPracticeSet("今回のカードを空にしました。");
}

function sourceLabel() {
  const preset = practicePresetId ? getPreset(practicePresetId) : null;
  if (preset && sameCardSet(activeCards.map((card) => card.id), preset.cardIds)) {
    return {
      title: preset.title,
      description: `${activeCards.length}枚のカードをめくります。`
    };
  }

  return {
    title: "今回のカード",
    description: `${activeCards.length}枚のカードをめくります。`
  };
}

function renderPlay(message = "") {
  if (!session || activeCards.length === 0) return;

  const card = activeCards[currentCardIndex(session)];
  const isQuiz = session.mode === MODES.QUIZ;
  const answerVisible = !isQuiz || session.revealed;
  const source = sourceLabel();

  elements.sourceTitle.textContent = source.title;
  elements.sourceDescription.textContent = source.description;
  elements.progress.textContent = `${session.position + 1} / ${session.order.length}`;
  renderCardContent(elements.prompt, card.promptContent, card.prompt);
  renderCardContent(elements.answer, card.answerContent, card.answer);
  const supplement = document.querySelector('#card-supplement');
  supplement.hidden = !answerVisible || !card.supplement;
  document.querySelector('#card-supplement-text').textContent = card.supplement ?? '';
  supplement.open = false;
  const reviewId = document.querySelector('#review-card-id');
  reviewId.hidden = !card.id.startsWith('interval-foundation-');
  reviewId.textContent = reviewId.hidden ? '' : `カードID：${card.id}`;
  const diagramBlock = card.answerContent?.find(block => block.type === 'related-key-diagram');
  const rangeNote = document.querySelector('#related-key-range-note');
  rangeNote.hidden = !answerVisible || !diagramBlock || !relatedKeyDiagram(diagramBlock.signature, diagramBlock.mode).outside;
  if (rangeNote.hidden) rangeNote.open = false;
  syncRelatedDiagramSize();
  elements.answerWrap.hidden = !answerVisible;
  elements.revealButton.hidden = !isQuiz || session.revealed;
  elements.nextButton.hidden = isQuiz && !session.revealed;
  elements.shuffleButton.disabled = !isQuiz;
  elements.playStatus.textContent = message;

  for (const input of elements.modeInputs) {
    input.checked = input.value === session.mode;
  }
}

function renderPlayAtStart(message = "") {
  renderPlay(message);
  resetPlayViewport();
}

async function beginPractice() {
  if (practiceLoading || practiceCardIds.length === 0) return;

  if (practiceCards.length !== practiceCardIds.length) {
    await refreshPracticeSet();
  }
  if (practiceCards.length === 0) return;

  activeCards = [...practiceCards];
  session = createSession(activeCards.length, activeMode);
  setScreen("play");
  renderPlayAtStart();
  sendAppEngagement("practice_started");
}

function showStart(message = "") {
  session = null;
  activeCards = [];
  renderPracticeSet();
  syncUrl();
  elements.startStatus.textContent = message;
  setScreen("start");
}

function nextCard() {
  if (!session) return;
  const wasLast = session.position === session.order.length - 1;
  session = move(session, 1);
  renderPlayAtStart(wasLast ? "一周しました。続けてもう一周できます。" : "");
  sendAppEngagement("next_card");
}

function previousCard() {
  if (!session) return;
  session = move(session, -1);
  renderPlayAtStart();
}

function revealOrNext() {
  if (!session) return;

  if (session.mode === MODES.QUIZ && !session.revealed) {
    session = reveal(session);
    renderPlay("答えを表示しました。");
    sendAppEngagement("answer_revealed");
    return;
  }

  nextCard();
}

function renderIndividualCards(collection, body) {
  const list = document.createElement("div");
  list.className = "shelf-card-list";

  for (const card of collection.cards) {
    const row = document.createElement("div");
    row.className = "shelf-card-row";

    const label = document.createElement("span");
    label.textContent = card.label;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "shelf-card-add secondary compact";
    button.dataset.cardId = card.id;
    button.dataset.cardLabel = card.label;
    button.addEventListener("click", () => practiceCardIds.includes(card.id)
      ? removePracticeCard(card.id) : addIndividualCard(card.id));

    row.append(label, button);
    list.append(row);
  }

  body.replaceChildren(list);
  updateShelfControls();
}

async function selectKeyRange(collectionId, field, value) {
  const selection = { ...keySelections.get(collectionId), [field]: value };
  keySelections.set(collectionId, selection);
  practiceCardIds = replaceKeySelection(practiceCardIds, collectionId, selection.range, selection.mode);
  const prefix = collectionId === "key-signature-images" ? "key-image" : "key-write";
  const preset = getPreset(`${prefix}-${selection.range}`);
  practicePresetId = preset && sameCardSet(practiceCardIds, preset.cardIds) ? preset.id : null;
  await refreshPracticeSet("選んだ範囲に切り替えました。");
}

function renderKeyPicker(meta, body) {
  const picker = document.createElement("div");
  picker.dataset.keyPicker = meta.id;
  picker.className = "key-picker";
  const heading = document.createElement("h4");
  heading.textContent = "範囲を１つ選ぶ";
  const hint = document.createElement("p");
  hint.className = "key-picker-hint";
  hint.textContent = "調号なしはすべての範囲に含みます。別の範囲を選ぶと、この種類のカードが入れ替わります。";
  picker.append(heading, hint);
  for (const ranges of keyRangeGroups) {
    const group = document.createElement("div");
    group.className = "key-range-group";
    for (const range of ranges) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key-choice";
      button.dataset.range = range.id;
      button.textContent = range.title;
      button.addEventListener("click", () => selectKeyRange(meta.id, "range", range.id));
      group.append(button);
    }
    picker.append(group);
  }
  if (meta.id === "key-signature-writing") {
    const modeHeading = document.createElement("h4");
    modeHeading.textContent = "出題する調";
    const modes = document.createElement("div");
    modes.className = "key-mode-group";
    for (const mode of keyModes) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key-choice";
      button.dataset.keyMode = mode.id;
      button.textContent = mode.title;
      button.addEventListener("click", () => selectKeyRange(meta.id, "mode", mode.id));
      modes.append(button);
    }
    picker.append(modeHeading, modes);
  }
  const status = document.createElement("p");
  status.className = "key-selection-status";
  status.setAttribute("aria-live", "polite");
  picker.append(status);
  body.append(picker);
}

function renderScalePicker(body) {
  const picker = document.createElement('div');
  picker.dataset.scalePicker = 'true';
  picker.className = 'key-picker';
  const hint = document.createElement('p');
  hint.className = 'key-picker-hint';
  hint.textContent = '音階の種類と問題形式を１つずつ選びます。音階カードだけが入れ替わります。紙に書いて、答えの譜例で確認してください。';
  picker.append(hint);
  for (const [field, title, choices] of [
    ['type', '音階の種類', scaleTypeChoices],
    ['mode', '問題形式', scaleModeChoices]
  ]) {
    const heading = document.createElement('h4');
    heading.textContent = title;
    const group = document.createElement('div');
    group.className = 'key-range-group';
    for (const choice of choices) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'key-choice';
      button.textContent = choice.title;
      button.dataset.scaleField = field;
      button.dataset.scaleValue = choice.id;
      button.addEventListener('click', async () => {
        scaleSelection = { ...scaleSelection, [field]: choice.id };
        practiceCardIds = replaceScaleSelection(practiceCardIds, scaleSelection.type, scaleSelection.mode);
        const preset = getPreset(`scale-write-${scaleSelection.type}-${scaleSelection.mode}`);
        practicePresetId = sameCardSet(practiceCardIds, preset.cardIds) ? preset.id : null;
        await refreshPracticeSet('選んだ音階と問題形式に切り替えました。');
      });
      group.append(button);
    }
    picker.append(heading, group);
    if (field === 'mode') {
      const explanation = document.createElement('p');
      explanation.className = 'key-picker-hint';
      explanation.textContent = `全形式：${scaleModeChoices[0].description}`;
      picker.append(explanation);
    }
  }
  const status = document.createElement('p');
  status.className = 'key-selection-status';
  picker.append(status);
  body.append(picker);
}

function populateShelf() {
  const fragment = document.createDocumentFragment();
  const initiallyOpenId = collectionManifest.find(meta => meta.shelfVisible !== false)?.id;
  for (const section of buildShelfSections(collectionManifest)) {
    const heading = document.createElement('h4');
    heading.className = 'shelf-unit-heading';
    heading.dataset.shelfUnit = section.id;
    heading.textContent = section.title;
    fragment.append(heading);
    for (const meta of section.collections) {
    const collectionDetails = document.createElement("details");
    collectionDetails.className = "shelf-collection";
    collectionDetails.dataset.collectionId = meta.id;
    collectionDetails.open = meta.id === initiallyOpenId;

    const summary = document.createElement("summary");
    const summaryTitle = document.createElement("strong");
    summaryTitle.textContent = meta.title;
    const summaryMeta = document.createElement("span");
    summaryMeta.textContent = `${meta.cardCount}枚`;
    summary.append(summaryTitle, summaryMeta);

    const body = document.createElement("div");
    body.className = "shelf-collection-body";

    const description = document.createElement("p");
    description.className = "collection-description";
    description.textContent = meta.description;
    body.append(description);

    const collectionPresets = presetsForCollection(meta.id).filter(preset => preset.shelfVisible !== false);
    if (meta.id === "scale-writing") {
      renderScalePicker(body);
    } else if (keyCollectionIds.includes(meta.id)) {
      renderKeyPicker(meta, body);
    } else if (collectionPresets.length > 0) {
      const bundleHeading = document.createElement("h4");
      bundleHeading.textContent = "まとまったカード束";
      body.append(bundleHeading);

      const bundleList = document.createElement("div");
      bundleList.className = "bundle-list";

      for (const preset of collectionPresets) {
        if(preset.separatorBefore===true && bundleList.children.length>0){
          const separator=document.createElement('hr');separator.className='bundle-divider';separator.setAttribute('aria-hidden','true');bundleList.append(separator);
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bundle-button";
        button.dataset.presetId = preset.id;

        const text = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = preset.title;
        const descriptionText = document.createElement("small");
        descriptionText.textContent = `${preset.description}・${preset.cardIds.length}枚`;
        text.append(title, descriptionText);

        const action = document.createElement("span");
        action.className = "shelf-action-label";
        action.textContent = "＋ 追加";

        button.append(text, action);
        button.addEventListener("click", () => addPreset(preset.id));
        bundleList.append(button);
      }

      body.append(bundleList);
    }

    const individual = document.createElement("details");
    individual.className = "individual-picker";
    const individualSummary = document.createElement("summary");
    individualSummary.textContent = "1枚ずつ選ぶ";
    const individualBody = document.createElement("div");
    individualBody.className = "individual-picker-body";
    const loading = document.createElement("p");
    loading.className = "collection-loading";
    loading.textContent = "開くとカード一覧を読み込みます。";
    individualBody.append(loading);
    individual.append(individualSummary, individualBody);

    individual.addEventListener("toggle", async () => {
      if (!individual.open || individual.dataset.loaded === "true") return;
      loading.textContent = "カードを読み込んでいます…";
      try {
        const collection = await loadCollection(meta.id);
        renderIndividualCards(collection, individualBody);
        individual.dataset.loaded = "true";
      } catch (error) {
        console.error(error);
        loading.textContent = "カードを読み込めませんでした。";
      }
    });

    body.append(individual);
    collectionDetails.append(summary, body);
    fragment.append(collectionDetails);
    }
  }

  elements.shelfList.append(fragment);
  updateShelfControls();
}

for (const input of elements.modeInputs) {
  input.addEventListener("change", (event) => {
    if (!event.target.checked || !session) return;
    activeMode = event.target.value;
    session = resetForMode(session, activeMode);
    syncUrl();
    renderPlayAtStart(`${modeName(session.mode)}に切り替えました。`);
  });
}

elements.startPracticeButton.addEventListener("click", beginPractice);
elements.clearPracticeButton.addEventListener("click", clearPracticeSet);
elements.changeRangeButton.addEventListener("click", () => showStart("今回のカードを見直せます。"));
elements.revealButton.addEventListener("click", revealOrNext);
elements.nextButton.addEventListener("click", nextCard);
elements.prevButton.addEventListener("click", previousCard);
elements.shuffleButton.addEventListener("click", () => {
  if (!session) return;
  session = reshuffle(session);
  renderPlayAtStart("出題順をシャッフルしました。");
});

document.addEventListener("keydown", (event) => {
  if (elements.playScreen.hidden) return;

  const target = event.target;
  if (
    target instanceof HTMLSelectElement ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLButtonElement ||
    target?.isContentEditable
  ) return;

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    revealOrNext();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    nextCard();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    previousCard();
  }
});

async function initialize() {
  populateShelf();
  setScreen("start");
  sendAppEngagement("app_opened");

  if (initialConfig.presetId) {
    const preset = getPreset(initialConfig.presetId);
    practicePresetId = preset?.id ?? null;
    practiceCardIds = preset ? [...preset.cardIds] : [];
    await refreshPracticeSet("リンクで指定されたカード束を今回のカードに入れました。");
    return;
  }

  if (initialConfig.cardIds?.length) {
    practiceCardIds = [...initialConfig.cardIds];
    await refreshPracticeSet("リンクで指定されたカードを今回のカードに入れました。");
    return;
  }

  const selectionParams = new URLSearchParams(window.location.search);
  if (selectionParams.has("preset") || selectionParams.has("cards")) {
    await refreshPracticeSet("リンクのカード指定が空か無効です。下の棚からカードを選んでください。");
    return;
  }

  practiceCardIds = keySelectionCardIds("key-signature-images");
  practicePresetId = "key-image-all";
  await refreshPracticeSet("全範囲の15枚で始められます。必要なら下の棚で範囲を選んでください。");
}

initialize();

// Answer slot remains reserved while hidden; observing it also handles rotation.
function syncRelatedDiagramSize() {
  const question = elements.prompt.querySelector('.related-layout-question');
  if (question) question.style.height = `${elements.answer.getBoundingClientRect().height}px`;
}
new ResizeObserver(syncRelatedDiagramSize).observe(elements.answer);
