import { useState, useEffect } from 'react';
import { joinGame, getPlayer } from '../firebase/db';

const PLAYER_ID_KEY  = 'ql_player_id';
const PLAYER_REG_KEY = 'ql_player_reg';

// Accepts VIT Bhopal institute emails like:
//   anushka25BCE10978@vitbhopal.ac.in
//   ANNN21BCE156@vitbhopal.ac.in
// Pattern: name (letters) + 2 digits + 3 letters + 3-6 digits + @vitbhopal.ac.in
// Digit-group lengths vary across students (seen 3, 4, and 5 digits), so the
// trailing digit count is a range rather than a fixed width.
const VIT_BHOPAL_EMAIL_RE = /^[a-z]+[0-9]{2}[a-z]{3}[0-9]{3,6}@vitbhopal\.ac\.in$/i;

// Also accept any personal Gmail address as a fallback join ID.
const GMAIL_EMAIL_RE = /^[a-z0-9._%+-]+@gmail\.com$/i;

// localStorage may be unavailable in some browsing modes (Safari ITP private,
// strict 3rd-party cookie blockers). Wrap it so failures don't crash the app —
// the student can still join, just without rejoin-after-refresh.
const safeStorage = {
  get(k)  { try { return localStorage.getItem(k); } catch { return null; } },
  set(k,v){ try { localStorage.setItem(k, v); }   catch { /* noop */ } },
  remove(k){ try { localStorage.removeItem(k); }  catch { /* noop */ } },
};

export default function usePlayer() {
  const [playerId, setPlayerId] = useState(() => safeStorage.get(PLAYER_ID_KEY)  || '');
  const [regNumber, setRegNumber] = useState(() => safeStorage.get(PLAYER_REG_KEY) || '');
  const [joining,   setJoining]   = useState(false);
  const [error,     setError]     = useState('');
  const [verified,  setVerified]  = useState(false); // true once Firestore check done

  // On load: verify stored playerId still exists in Firestore.
  // If voting was reset, the doc is deleted — clear localStorage and re-show JoinScreen.
  useEffect(() => {
    const storedId = safeStorage.get(PLAYER_ID_KEY);
    if (!storedId) {
      setVerified(true);
      return;
    }
    getPlayer(storedId).then((player) => {
      if (!player) {
        // Doc deleted (voting was reset) — force re-join
        safeStorage.remove(PLAYER_ID_KEY);
        safeStorage.remove(PLAYER_REG_KEY);
        setPlayerId('');
        setRegNumber('');
      }
      setVerified(true);
    }).catch(() => setVerified(true));
  }, []);

  const join = async (reg) => {
    const trimmed = reg.trim();

    if (!VIT_BHOPAL_EMAIL_RE.test(trimmed) && !GMAIL_EMAIL_RE.test(trimmed)) {
      setError('Enter a valid VIT Bhopal email or Gmail address.');
      return;
    }

    // Normalize casing — email addresses aren't meaningfully case-sensitive
    // here, and we want a stable key for the "already joined" check.
    const normalized = trimmed.toLowerCase();

    setJoining(true);
    setError('');
    try {
      const id = await joinGame(normalized);
      safeStorage.set(PLAYER_ID_KEY,  id);
      safeStorage.set(PLAYER_REG_KEY, normalized);
      setPlayerId(id);
      setRegNumber(normalized);
    } catch (e) {
      console.error('joinGame failed:', e.code, e.message); // TEMP: remove once fixed — check console for the real error
      if (e.message === 'ALREADY_JOINED') {
        setError('This email has already joined.');
      } else if (e.message === 'INVALID_REG_NO') {
        setError('Enter a valid VIT Bhopal email or Gmail address.');
      } else {
        setError('Could not join. Try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  const leave = () => {
    safeStorage.remove(PLAYER_ID_KEY);
    safeStorage.remove(PLAYER_REG_KEY);
    setPlayerId('');
    setRegNumber('');
  };

  return {
    playerId,
    regNumber,
    join,
    leave,
    joining,
    error,
    setError,
    verified,
  };
}
