function setupShelfAccordion() {
  const shelfList = document.querySelector("#shelf-list");
  if (!shelfList) return;

  const collections = [...shelfList.querySelectorAll(":scope > .shelf-collection")];
  for (const collection of collections) {
    collection.open = false;
    collection.addEventListener("toggle", () => {
      if (!collection.open) return;
      for (const other of collections) {
        if (other !== collection) other.open = false;
      }
    });
  }
}

function splitPracticeGroupHeading(text) {
  const normalized = text.trim();
  const match = normalized.match(/^(.*?)[\s\u3000]+(\d+枚)$/);
  return match
    ? { title: match[1], count: match[2] }
    : { title: normalized, count: "" };
}

function renderPracticeOverview(groups, overview) {
  const fragment = document.createDocumentFragment();

  for (const group of groups.querySelectorAll(":scope > .practice-group")) {
    const heading = group.querySelector(".practice-group-heading h4");
    if (!heading) continue;

    const { title, count } = splitPracticeGroupHeading(heading.textContent ?? "");
    if (!title) continue;

    const row = document.createElement("div");
    row.className = "practice-overview-row";

    const label = document.createElement("span");
    label.textContent = title;

    const amount = document.createElement("strong");
    amount.textContent = count;

    row.append(label, amount);
    fragment.append(row);
  }

  overview.replaceChildren(fragment);
}

function syncPracticeDisclosure(groups, overview, details) {
  const hasGroups = groups.querySelectorAll(":scope > .practice-group").length > 0;
  overview.hidden = !hasGroups;
  details.hidden = !hasGroups;
  if (!hasGroups) details.open = false;
  renderPracticeOverview(groups, overview);
}

function setupPracticeDisclosure() {
  const groups = document.querySelector("#practice-groups");
  if (!groups || groups.closest(".practice-details")) return;

  const overview = document.createElement("div");
  overview.className = "practice-overview";
  overview.setAttribute("aria-label", "今回のカードの概要");

  const details = document.createElement("details");
  details.className = "practice-details";

  const summary = document.createElement("summary");
  const label = document.createElement("strong");
  label.textContent = "カードの内訳を見る";
  const hint = document.createElement("span");
  hint.className = "practice-details-hint";
  hint.textContent = "必要なときに確認・調整";
  summary.append(label, hint);

  groups.before(overview, details);
  details.append(summary, groups);

  const syncUi = () => {
    syncPracticeDisclosure(groups, overview, details);
  };

  const observer = new MutationObserver(syncUi);
  observer.observe(groups, {
    attributes: true,
    attributeFilter: ["hidden"],
    childList: true,
    subtree: true,
    characterData: true
  });
  syncUi();
}

function initializeDisclosureUi() {
  setupShelfAccordion();
  setupPracticeDisclosure();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDisclosureUi, { once: true });
} else {
  initializeDisclosureUi();
}
