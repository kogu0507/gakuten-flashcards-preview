export const MODES = Object.freeze({
  STUDY: "study",
  QUIZ: "quiz"
});

export function canonicalOrder(cardCount) {
  return Array.from({ length: cardCount }, (_, index) => index);
}

export function shuffledOrder(cardCount, random = Math.random) {
  const order = canonicalOrder(cardCount);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}

export function orderForMode(cardCount, mode, random = Math.random) {
  return mode === MODES.QUIZ
    ? shuffledOrder(cardCount, random)
    : canonicalOrder(cardCount);
}

export function createSession(cardCount, mode = MODES.STUDY, random = Math.random) {
  if (!Number.isInteger(cardCount) || cardCount < 1) {
    throw new RangeError("cardCount must be a positive integer");
  }

  return {
    mode,
    order: orderForMode(cardCount, mode, random),
    position: 0,
    revealed: mode === MODES.STUDY
  };
}

export function currentCardIndex(session) {
  return session.order[session.position];
}

export function move(session, delta) {
  const length = session.order.length;
  const position = (session.position + delta + length) % length;

  return {
    ...session,
    position,
    revealed: session.mode === MODES.STUDY
  };
}

export function reveal(session) {
  return { ...session, revealed: true };
}

export function resetForMode(session, mode, random = Math.random) {
  return createSession(session.order.length, mode, random);
}

export function reshuffle(session, random = Math.random) {
  if (session.mode !== MODES.QUIZ) return session;
  return createSession(session.order.length, MODES.QUIZ, random);
}
