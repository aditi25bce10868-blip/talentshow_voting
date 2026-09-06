import { useEffect, useState } from 'react';
import { subscribeToSessions } from '../firebase/db';

/**
 * Ranks the saved `sessions` docs (one per performance, written by
 * saveSession() when a round ends) by average rating — this is the
 * "session history" the finale leaderboard (host + player) pulls its
 * top-3 teams from. Ties broken by vote count (more audience votes wins).
 */
export default function useTopSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const unsub = subscribeToSessions(setSessions);
    return unsub;
  }, []);

  const ranked = [...sessions]
    .sort((a, b) => {
      const ra = a.averageRating ?? 0;
      const rb = b.averageRating ?? 0;
      if (rb !== ra) return rb - ra;
      return (b.voteCount ?? 0) - (a.voteCount ?? 0);
    })
    .map((s, _, arr) => {
      const myRating = s.averageRating ?? 0;
      return {
        ...s,
        rank: arr.filter((x) => (x.averageRating ?? 0) > myRating).length + 1,
      };
    });

  return { sessions: ranked, top3: ranked.slice(0, 3) };
}
