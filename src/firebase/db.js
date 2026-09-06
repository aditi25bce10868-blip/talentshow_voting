/**
 * Firestore data layer.
 *
 * Collections:
 *   meta/gameState      – single game-state document
 *   questions/{id}      – one reusable "current performance" doc, edited
 *                          between rounds: { teamName, teamType, timer, order }
 *   players/{id}        – audience member docs
 *   answers/{qId_pId}   – one rating doc per (question, player) pair, LOCKED
 *                          (create-only — see firestore.rules)
 *   sessions/{id}       – one snapshot per performance, saved when voting
 *                          for that team ends
 *
 * Rating model (talent show):
 *   Audience picks 1–5 stars per performance. No correct/wrong, no time
 *   bonus — the star value IS the score. calcScore() just clamps/rounds it.
 */
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// ─── Refs ─────────────────────────────────────────────────────
const gameRef        = doc(db, 'meta', 'gameState');
const questionsCol   = () => collection(db, 'questions');
const playersCol     = () => collection(db, 'players');
const answersCol     = () => collection(db, 'answers');
const sessionsCol    = () => collection(db, 'sessions');

// ─── Scoring ──────────────────────────────────────────────────
// A rating IS the score — no correctness, no time weighting.
export const calcScore = (rating) => {
  const r = Math.round(Number(rating));
  return Math.max(1, Math.min(5, r || 0));
};

// ─── Game state ───────────────────────────────────────────────
export const initGameState = async () => {
  const snap = await getDoc(gameRef);
  if (!snap.exists()) {
    await setDoc(gameRef, {
      phase: 'waiting',
      currentQuestionIndex: 0,
      questionStartTime: null,
      title: 'QuizLive',
      joinUrl: import.meta.env.VITE_JOIN_URL || window.location.origin,
      showQR: false,
      leaderboardVisible: false,
    });
  }
};

export const subscribeToGameState = (cb, onError) =>
  onSnapshot(
    gameRef,
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );

export const updateGameState = (data) => updateDoc(gameRef, data);

export const startQuiz = () =>
  updateDoc(gameRef, {
    phase: 'question',
    currentQuestionIndex: 0,
    questionStartTime: serverTimestamp(),
    startedAt: serverTimestamp(),
    sessionSaved: false,
  });

/** Idempotent via transaction — safe for multiple admin tabs.
 *  Covers BOTH ways the "thanks for voting" screen appears: natural timer
 *  expiry (called from AdminPage's countdown effect) and the host manually
 *  ending voting early (called from GameControl's "Close Voting Early"). */
export const advanceToResults = () =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    if (snap.exists() && snap.data().phase === 'question') {
      tx.update(gameRef, { phase: 'results' });
    }
  });

export const endQuiz = () => updateDoc(gameRef, { phase: 'ended' });

/**
 * Independent leaderboard toggle — deliberately NOT part of `phase`.
 * `phase` drives the live voting flow (waiting/question/results/ended);
 * `leaderboardVisible` is a separate overlay flag admin can flip any time
 * (typically once every performance is done) without touching or being
 * gated by that flow. Whatever renders the top-3 (host screen, etc.)
 * should subscribe to gameState.leaderboardVisible and pull from session
 * history when it flips true.
 */
export const toggleLeaderboard = () =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    const current = snap.exists() && !!snap.data().leaderboardVisible;
    tx.update(gameRef, { leaderboardVisible: !current });
  });

/**
 * Reset for the NEXT performance: clears this round's audience + ratings
 * and drops phase back to 'waiting'. The single reusable question doc is
 * left alone here — admin edits its teamName/teamType/timer separately
 * (via updateQuestion) before hitting Start again.
 */
export const resetGame = async () => {
  const batch = writeBatch(db);
  batch.update(gameRef, {
    phase: 'waiting',
    currentQuestionIndex: 0,
    questionStartTime: null,
    sessionSaved: false,
    leaderboardVisible: false,
  });
  const [players, answers] = await Promise.all([
    getDocs(playersCol()),
    getDocs(answersCol()),
  ]);
  players.forEach((d) => batch.delete(d.ref));
  answers.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

// ─── Questions (performance entries) ───────────────────────────
export const subscribeToQuestions = (cb) =>
  onSnapshot(
    query(questionsCol(), orderBy('order', 'asc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const addQuestion = async (q) => {
  const snap = await getDocs(
    query(questionsCol(), orderBy('order', 'desc'), limit(1))
  );
  const nextOrder = snap.empty ? 0 : snap.docs[0].data().order + 1;
  const newRef = doc(questionsCol());
  await setDoc(newRef, { ...q, order: nextOrder, createdAt: serverTimestamp() });
  return newRef;
};

export const updateQuestion = (id, data) =>
  updateDoc(doc(db, 'questions', id), data);

export const deleteQuestion = (id) =>
  deleteDoc(doc(db, 'questions', id));

export const reorderQuestions = async (orderedIds) => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, idx) =>
    batch.update(doc(db, 'questions', id), { order: idx })
  );
  return batch.commit();
};

// ─── Players (audience) ─────────────────────────────────────────
// Accepts VIT Bhopal institute emails like:
//   anushka25BCE10978@vitbhopal.ac.in
// Pattern: name (letters) + 2 digits + 3 letters + 3-6 digits + @vitbhopal.ac.in
// Digit-group lengths vary across students, so the trailing digit count is
// a range rather than a fixed width. Gmail accepted as a guest fallback.
//
// This is the actual anti-ballot-stuffing mechanism: one verified email =
// one join = one player = one locked rating per performance (locking is
// enforced in firestore.rules on /answers). A free-text name would let one
// person vote many times under slight variations — email uniqueness closes
// that loophole.
const VIT_BHOPAL_EMAIL_RE = /^[a-z]+[0-9]{2}[a-z]{3}[0-9]{3,6}@vitbhopal\.ac\.in$/i;
const GMAIL_EMAIL_RE      = /^[a-z0-9._%+-]+@gmail\.com$/i;

export const joinGame = async (rawEmail) => {
  // Server-side email validation (UI also enforces this, but block bypass attempts)
  const email = String(rawEmail ?? '').trim().toLowerCase();
  if (!VIT_BHOPAL_EMAIL_RE.test(email) && !GMAIL_EMAIL_RE.test(email)) {
    throw new Error('INVALID_REG_NO');
  }

  // Fetch all players to do a case-insensitive duplicate check (fine for ≤50 players)
  const allSnap   = await getDocs(playersCol());
  const allEmails = allSnap.docs.map((d) => d.data().name.toLowerCase());
  if (allEmails.includes(email)) {
    throw new Error('ALREADY_JOINED');
  }

  const ref = doc(playersCol());
  await setDoc(ref, {
    id: ref.id,
    name: email,
    score: 0,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
};

// Aggregates each audience member's score live from /answers — a player's
// "score" is just the rating(s) they've submitted this round (there's only
// ever one active question, so normally one rating per player per cycle).
export const subscribeToPlayers = (cb) => {
  let players = [];
  let answers = [];

  const merge = () => {
    const scoreMap = {};
    answers.forEach(({ playerId, rating }) => {
      scoreMap[playerId] = (scoreMap[playerId] || 0) + calcScore(rating);
    });
    cb(
      players
        .map((p) => ({ ...p, score: scoreMap[p.id] || 0 }))
        .sort((a, b) => b.score - a.score)
    );
  };

  const unsubPlayers = onSnapshot(playersCol(), (snap) => {
    players = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });
  const unsubAnswers = onSnapshot(answersCol(), (snap) => {
    answers = snap.docs.map((d) => d.data());
    merge();
  });

  return () => { unsubPlayers(); unsubAnswers(); };
};

export const subscribeToPlayerCount = (cb) =>
  onSnapshot(playersCol(), (snap) => cb(snap.size));

export const getPlayer = (id) =>
  getDoc(doc(db, 'players', id)).then((s) =>
    s.exists() ? { id: s.id, ...s.data() } : null
  );

// ─── Answers (ratings) ──────────────────────────────────────────
/**
 * One rating per (question, player), LOCKED. Firestore rules deny `update`
 * on /answers entirely, so a second call here for the same player+question
 * is rejected server-side — that's the actual lock, not just a UI disable.
 */
export const submitAnswer = async ({ questionId, playerId, rating }) => {
  const answerRef = doc(db, 'answers', `${questionId}_${playerId}`);
  await setDoc(answerRef, {
    questionId, playerId, rating,
    timestamp: serverTimestamp(),
  });
};

export const getPlayerAnswer = (questionId, playerId) =>
  getDoc(doc(db, 'answers', `${questionId}_${playerId}`)).then((s) =>
    s.exists() ? s.data() : null
  );

/** Real-time listener for one player's rating on the current performance. */
export const subscribeToPlayerAnswer = (questionId, playerId, cb) =>
  onSnapshot(doc(db, 'answers', `${questionId}_${playerId}`), (s) =>
    cb(s.exists() ? s.data() : null)
  );

export const subscribeToQuestionAnswers = (questionId, cb) =>
  onSnapshot(
    query(answersCol(), where('questionId', '==', questionId)),
    (snap) => cb(snap.docs.map((d) => d.data()))
  );

/** Real-time listener for every answer doc across the whole DB — used by
 *  SessionHistory's live tally for the performance currently being voted
 *  on. Cheap here since /answers is wiped on every resetGame(), so this
 *  never holds more than one round's worth of ratings at a time. */
export const subscribeToAllAnswers = (cb) =>
  onSnapshot(answersCol(), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

// ─── Rank helper (handles ties) ───────────────────────────────
/**
 * Returns the 1-based rank of `playerId` in a sorted player list.
 * Tied scores share the same rank (e.g. two players at 60 = both rank 1).
 */
export const getPlayerRank = (players, playerId) => {
  const myScore = players.find((p) => p.id === playerId)?.score ?? 0;
  return players.filter((p) => p.score > myScore).length + 1;
};

// ─── Sessions (leaderboard history) ──────────────────────────
/**
 * Saves one session doc per PERFORMANCE (not per whole show) — called
 * automatically when a round's voting ends (see AdminPage's phase==='ended'
 * effect). Captures the team + the rating aggregate for that round.
 * Transaction-guarded: only saves once even with multiple host tabs open.
 *
 * ⚠️ Shape changed from the original quiz app: this used to store a ranked
 * list of quiz players (`players: [{name, score, rank}]`). That no longer
 * makes sense once audience members are rating a team, not competing
 * themselves — so this now stores {teamName, teamType, voteCount,
 * totalRating, averageRating, breakdown}. SessionHistory.jsx has been
 * updated to match this shape (one saved session = one performance).
 */
export const saveSession = async (gameState, question) => {
  const answerSnap = await getDocs(answersCol());
  const ratings = answerSnap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === 'number');

  const voteCount     = ratings.length;
  const totalRating    = ratings.reduce((sum, r) => sum + r, 0);
  const averageRating  = voteCount ? +(totalRating / voteCount).toFixed(2) : 0;
  const breakdown      = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => { if (breakdown[r] !== undefined) breakdown[r] += 1; });

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists() || snap.data().sessionSaved) return;
    const sessionRef = doc(sessionsCol());
    tx.set(sessionRef, {
      teamName:      question?.teamName ?? 'Unknown team',
      teamType:      question?.teamType ?? '',
      startedAt:     gameState.startedAt ?? null,
      endedAt:       serverTimestamp(),
      voteCount,
      totalRating,
      averageRating,
      breakdown,
    });
    tx.update(gameRef, { sessionSaved: true });
  });
};

export const subscribeToSessions = (cb) =>
  onSnapshot(
    // Cap at the most recent 50 sessions so the history page stays fast
    // even after years of use. Older sessions remain in Firestore (admin
    // can still query them directly if ever needed).
    query(sessionsCol(), orderBy('endedAt', 'desc'), limit(50)),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
