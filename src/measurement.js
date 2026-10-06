// O-009 Phase 1: operation surface, not inferred referral attribution.
// Fixed route values deliberately exclude location, referrer and query state.
const APP_ROUTE = "/app/gakuten-flashcards/";
const ACTION_STAGES = Object.freeze({
  app_opened: "start",
  practice_started: "play",
  answer_revealed: "answer",
  next_card: "play"
});

export function buildEngagementPayload(action) {
  if (typeof action !== "string" || !Object.hasOwn(ACTION_STAGES, action)) return null;
  return {
    source_page: APP_ROUTE,
    destination_type: "app",
    destination_id_or_url: APP_ROUTE,
    placement: "app_internal",
    offer_type: "free",
    content_cluster: "gakuten-flashcards",
    ui_variant: "fixed_single_recall",
    measurement_version: "v1",
    app_id: "gakuten-flashcards",
    action,
    stage: ACTION_STAGES[action]
  };
}

export function sendAppEngagement(action, sender) {
  try {
    const payload = buildEngagementPayload(action);
    // Resolve lazily: absence now does not disable subsequent actions.
    const gtag = sender === undefined ? globalThis.window?.gtag : sender;
    if (!payload || typeof gtag !== "function") return false;
    gtag("event", "app_engagement", payload);
    return true;
  } catch {
    // Measurement is best effort; never retry/replay or interrupt Play.
    return false;
  }
}
