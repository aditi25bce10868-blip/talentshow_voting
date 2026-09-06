import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeToQuestions,
  subscribeToAllAnswers,
  subscribeToSessions,
  calcScore,
} from '../../firebase/db';

const MEDALS = ['🥇', '🥈', '🥉'];

// CSV-injection guard
function csvEscape(val) {
  const s = String(val ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function exportCSV(performances, title) {
  const rows = [
    ['Rank', 'Team Name', 'Team Type', '5★', '4★', '3★', '2★', '1★', 'Total Votes', 'Total Rating Points', 'Average Rating (out of 5)', 'Ended At'],
    ...performances.map((p) => [
      p.rank,
      p.teamName,
      p.teamType,
      p.breakdown?.[5] ?? 0,
      p.breakdown?.[4] ?? 0,
      p.breakdown?.[3] ?? 0,
      p.breakdown?.[2] ?? 0,
      p.breakdown?.[1] ?? 0,
      p.voteCount,
      p.totalRating,
      p.averageRating,
      formatDate(p.endedAt),
    ]),
  ];
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StarDistributionBar({ breakdown = {}, totalVotes }) {
  const total = totalVotes || 1;
  const pct = (n) => ((breakdown[n] ?? 0) / total) * 100;

  return (
    <div className="space-y-1.5 pt-2">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
        {pct(5) > 0 && <div style={{ width: `${pct(5)}%` }} className="bg-amber-400 h-full" title={`5★: ${breakdown[5]}`} />}
        {pct(4) > 0 && <div style={{ width: `${pct(4)}%` }} className="bg-orange-400 h-full" title={`4★: ${breakdown[4]}`} />}
        {pct(3) > 0 && <div style={{ width: `${pct(3)}%` }} className="bg-orange-500 h-full" title={`3★: ${breakdown[3]}`} />}
        {pct(2) > 0 && <div style={{ width: `${pct(2)}%` }} className="bg-red-400 h-full" title={`2★: ${breakdown[2]}`} />}
        {pct(1) > 0 && <div style={{ width: `${pct(1)}%` }} className="bg-red-600 h-full" title={`1★: ${breakdown[1]}`} />}
      </div>
      <div className="flex justify-between items-center text-[11px] text-white/50 font-medium flex-wrap gap-1">
        <span><span className="text-amber-400 font-bold">5★:</span> {breakdown[5] ?? 0}</span>
        <span><span className="text-orange-400 font-bold">4★:</span> {breakdown[4] ?? 0}</span>
        <span><span className="text-orange-500 font-bold">3★:</span> {breakdown[3] ?? 0}</span>
        <span><span className="text-red-400 font-bold">2★:</span> {breakdown[2] ?? 0}</span>
        <span><span className="text-red-500 font-bold">1★:</span> {breakdown[1] ?? 0}</span>
      </div>
    </div>
  );
}

export default function SessionHistory() {
  const [currentQ, setCurrentQ] = useState(null);
  const [liveAnswers, setLiveAnswers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only one reusable "current performance" doc exists at a time.
    const unsubQ = subscribeToQuestions((qs) => setCurrentQ(qs[0] ?? null));
    const unsubA = subscribeToAllAnswers(setLiveAnswers);
    const unsubS = subscribeToSessions(setSessions);
    return () => { unsubQ(); unsubA(); unsubS(); };
  }, []);

  // Live tally for whichever performance is currently being voted on
  // (answers get wiped by resetGame each round, so this is always just
  // the in-progress round, not a running total across performances).
  const liveTally = useMemo(() => {
    if (!currentQ) return null;
    const relevant = liveAnswers.filter((a) => a.questionId === currentQ.id);
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    relevant.forEach((a) => {
      const r = calcScore(a.rating);
      if (breakdown[r] !== undefined) breakdown[r] += 1;
    });
    const voteCount = relevant.length;
    const totalRating = Object.entries(breakdown).reduce((sum, [star, n]) => sum + Number(star) * n, 0);
    const averageRating = voteCount ? +(totalRating / voteCount).toFixed(2) : 0;
    return {
      teamName: currentQ.teamName || 'Current performance',
      teamType: currentQ.teamType || '',
      breakdown,
      voteCount,
      totalRating,
      averageRating,
    };
  }, [currentQ, liveAnswers]);

  // Ranked session history (tie-aware, by average rating)
  const rankedSessions = useMemo(() => {
    return sessions
      .map((s) => ({ ...s, averageRating: Number(s.averageRating) || 0 }))
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
        return (b.voteCount ?? 0) - (a.voteCount ?? 0);
      })
      .map((s, _, arr) => ({
        ...s,
        rank: arr.filter((x) => x.averageRating > s.averageRating).length + 1,
      }));
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return rankedSessions;
    return rankedSessions.filter(
      (s) =>
        (s.teamName || '').toLowerCase().includes(q) ||
        (s.teamType || '').toLowerCase().includes(q)
    );
  }, [rankedSessions, searchQuery]);

  const winner = rankedSessions[0] && rankedSessions[0].voteCount > 0 ? rankedSessions[0] : null;
  const top3 = rankedSessions.filter((s) => s.voteCount > 0).slice(0, 3);
  const totalAllVotes = rankedSessions.reduce((acc, s) => acc + (s.voteCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Live round in progress */}
      {liveTally && liveTally.voteCount >= 0 && currentQ && (
        <div className="glass-strong rounded-2xl p-4 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-bold text-red-300 uppercase tracking-wider">Live Now</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white font-black">{liveTally.teamName}</p>
              {liveTally.teamType && <p className="text-white/40 text-xs">{liveTally.teamType}</p>}
            </div>
            <div className="text-right">
              <p className="text-amber-300 font-black text-lg">{liveTally.voteCount} votes</p>
              <p className="text-white/40 text-xs">avg {liveTally.averageRating.toFixed(2)} ★</p>
            </div>
          </div>
          <StarDistributionBar breakdown={liveTally.breakdown} totalVotes={liveTally.voteCount} />
        </div>
      )}

      {/* Overview stats + export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass rounded-2xl p-3">
        <div className="flex items-center gap-4 px-2">
          <div>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Performances</p>
            <p className="text-lg font-black text-white">{rankedSessions.length}</p>
          </div>
          <div>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Total Votes</p>
            <p className="text-lg font-black text-amber-400">{totalAllVotes}</p>
          </div>
        </div>
        <button
          onClick={() => exportCSV(rankedSessions, 'talent-show-voting-results')}
          disabled={rankedSessions.length === 0}
          className="btn-ghost flex items-center justify-center gap-2 text-xs py-2 px-4 shrink-0 hover:border-orange-400 text-orange-300 disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Winner banner */}
      {winner ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl p-6 border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-black/80 shadow-2xl shadow-orange-950/50 text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            🏆 Current Winner
          </div>
          <div className="text-4xl">{MEDALS[0]}</div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{winner.teamName}</h2>
            {winner.teamType && (
              <div className="inline-block text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md bg-white/10 text-orange-300 border border-orange-400/30">
                {winner.teamType}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 pt-2">
            <div className="glass rounded-xl p-2.5">
              <p className="text-white/50 text-[11px] font-bold uppercase">Votes</p>
              <p className="text-xl font-black text-amber-300">{winner.voteCount}</p>
            </div>
            <div className="glass rounded-xl p-2.5">
              <p className="text-white/50 text-[11px] font-bold uppercase">Avg Rating</p>
              <p className="text-xl font-black text-orange-400">{winner.averageRating.toFixed(2)} ★</p>
            </div>
          </div>
          <div className="max-w-md mx-auto pt-2">
            <StarDistributionBar breakdown={winner.breakdown} totalVotes={winner.voteCount} />
          </div>
        </motion.div>
      ) : (
        <div className="glass-strong rounded-2xl p-8 text-center border border-orange-500/20">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-white font-bold text-base">No completed performances yet</p>
          <p className="text-white/40 text-xs mt-1">
            Results are saved here automatically each time a round's voting ends.
          </p>
        </div>
      )}

      {/* Podium — top 3 completed performances */}
      {top3.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Top Performers Podium</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((s, idx) => (
              <div
                key={s.id}
                className={`glass rounded-2xl p-4 text-center border ${
                  idx === 0 ? 'border-amber-400/50 bg-amber-500/10'
                  : idx === 1 ? 'border-slate-300/40 bg-slate-500/10'
                  : 'border-amber-700/40 bg-amber-700/10'
                }`}
              >
                <div className="text-2xl mb-1">{MEDALS[idx] ?? `#${s.rank}`}</div>
                <p className="text-white font-black text-sm truncate">{s.teamName}</p>
                {s.teamType && <p className="text-white/50 text-xs truncate">{s.teamType}</p>}
                <div className="flex justify-center items-center gap-3 mt-2 text-xs font-bold">
                  <span className="text-amber-300">{s.voteCount} votes</span>
                  <span className="text-white/30">•</span>
                  <span className="text-orange-400">{s.averageRating.toFixed(2)} ★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + full history list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
            All Performances ({filtered.length})
          </h3>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team name or type…"
            className="input pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-strong rounded-2xl p-4 border border-orange-500/25 space-y-3 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="glass rounded-xl w-9 h-9 flex items-center justify-center text-sm font-black text-amber-400 shrink-0 border border-orange-500/30">
                      {s.rank <= 3 ? MEDALS[s.rank - 1] : `#${s.rank}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-black text-base">{s.teamName}</p>
                        {s.teamType && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {s.teamType}
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{formatDate(s.endedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white text-xs font-bold">
                      <span className="text-white/50">votes:</span>{' '}
                      <span className="text-amber-300 text-sm font-black">{s.voteCount}</span>
                    </p>
                    <p className="text-xs font-bold text-orange-400 mt-0.5">
                      <span className="text-white/50">avg:</span>{' '}
                      <span className="font-black text-sm">{s.averageRating.toFixed(2)} ★</span>
                    </p>
                  </div>
                </div>
                <StarDistributionBar breakdown={s.breakdown} totalVotes={s.voteCount} />
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center text-white/30 py-8 text-sm glass rounded-2xl">
              No matching performances found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
