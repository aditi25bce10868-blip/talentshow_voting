import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeToQuestions,
  subscribeToAllAnswers,
  subscribeToSessions,
} from '../../firebase/db';

const MEDALS = ['🥇', '🥈', '🥉'];
const PERFORMANCE_TYPES = ['All', 'Solo', 'Duet', 'Group', 'Band', 'Dance', 'Other'];

// CSV-injection guard
function csvEscape(val) {
  const s = String(val ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportPerformancesCSV(performances, title = 'talent-show-voting-results') {
  const rows = [
    [
      'Rank',
      'Team Name',
      'Performance Type',
      '5 Star Votes',
      '4 Star Votes',
      '3 Star Votes',
      '2 Star Votes',
      '1 Star Votes',
      'Total Votes',
      'Total Rating Points',
      'Average Rating (out of 5)',
    ],
    ...performances.map((p) => [
      p.rank,
      p.teamName,
      p.performanceType,
      p.votes5,
      p.votes4,
      p.votes3,
      p.votes2,
      p.votes1,
      p.totalVotes,
      p.totalRating,
      p.averageRating,
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

function StarDistributionBar({ p }) {
  const total = p.totalVotes || 1;
  const p5 = (p.votes5 / total) * 100;
  const p4 = (p.votes4 / total) * 100;
  const p3 = (p.votes3 / total) * 100;
  const p2 = (p.votes2 / total) * 100;
  const p1 = (p.votes1 / total) * 100;

  return (
    <div className="space-y-1.5 pt-2">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
        {p5 > 0 && <div style={{ width: `${p5}%` }} className="bg-amber-400 h-full" title={`5★: ${p.votes5}`} />}
        {p4 > 0 && <div style={{ width: `${p4}%` }} className="bg-orange-400 h-full" title={`4★: ${p.votes4}`} />}
        {p3 > 0 && <div style={{ width: `${p3}%` }} className="bg-orange-500 h-full" title={`3★: ${p.votes3}`} />}
        {p2 > 0 && <div style={{ width: `${p2}%` }} className="bg-red-400 h-full" title={`2★: ${p.votes2}`} />}
        {p1 > 0 && <div style={{ width: `${p1}%` }} className="bg-red-600 h-full" title={`1★: ${p.votes1}`} />}
      </div>
      <div className="flex justify-between items-center text-[11px] text-white/50 font-medium flex-wrap gap-1">
        <span className="flex items-center gap-1">
          <span className="text-amber-400 font-bold">5★:</span> {p.votes5}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-orange-400 font-bold">4★:</span> {p.votes4}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-orange-500 font-bold">3★:</span> {p.votes3}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-400 font-bold">2★:</span> {p.votes2}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-500 font-bold">1★:</span> {p.votes1}
        </span>
      </div>
    </div>
  );
}

export default function SessionHistory() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'saved'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const unsubQ = subscribeToQuestions(setQuestions);
    const unsubA = subscribeToAllAnswers(setAnswers);
    const unsubS = subscribeToSessions(setSessions);
    return () => {
      unsubQ();
      unsubA();
      unsubS();
    };
  }, []);

  // Compute live performance results from current questions + answers
  const livePerformances = useMemo(() => {
    const map = {};

    // 1. Initialize from questions
    questions.forEach((q, idx) => {
      map[q.id] = {
        id: q.id,
        order: q.order ?? idx,
        teamName: q.text || `Performance ${idx + 1}`,
        performanceType: 'Performance',
        votes5: 0,
        votes4: 0,
        votes3: 0,
        votes2: 0,
        votes1: 0,
        totalVotes: 0,
        totalRating: 0,
        averageRating: '0.00',
      };
    });

    // 2. Tally all answers
    answers.forEach((a) => {
      const qId = a.questionId;
      if (!map[qId]) {
        map[qId] = {
          id: qId,
          order: 999,
          teamName: a.teamName || 'Performance',
          performanceType: a.performanceType || 'Performance',
          votes5: 0,
          votes4: 0,
          votes3: 0,
          votes2: 0,
          votes1: 0,
          totalVotes: 0,
          totalRating: 0,
          averageRating: '0.00',
        };
      }

      const p = map[qId];
      if (a.teamName && (!p.teamName || p.teamName.startsWith('Performance'))) {
        p.teamName = a.teamName;
      }
      if (a.performanceType && p.performanceType === 'Performance') {
        p.performanceType = a.performanceType;
      }

      const val = Number(a.answer);
      if (val === 5) p.votes5 += 1;
      else if (val === 4) p.votes4 += 1;
      else if (val === 3) p.votes3 += 1;
      else if (val === 2) p.votes2 += 1;
      else if (val === 1) p.votes1 += 1;
    });

    // 3. Compute totals and rank
    const list = Object.values(map).map((p) => {
      const totalVotes = p.votes5 + p.votes4 + p.votes3 + p.votes2 + p.votes1;
      const totalRating =
        5 * p.votes5 + 4 * p.votes4 + 3 * p.votes3 + 2 * p.votes2 + 1 * p.votes1;
      const averageRating =
        totalVotes > 0 ? (totalRating / totalVotes).toFixed(2) : '0.00';
      return {
        ...p,
        totalVotes,
        totalRating,
        averageRating,
      };
    });

    // Sort: Total Rating DESC, then Total Votes DESC
    list.sort((a, b) => {
      if (b.totalRating !== a.totalRating) return b.totalRating - a.totalRating;
      return b.totalVotes - a.totalVotes;
    });

    // Assign Rank handling ties
    return list.map((p, _, arr) => ({
      ...p,
      rank: arr.filter((x) => x.totalRating > p.totalRating).length + 1,
    }));
  }, [questions, answers]);

  // Selected saved session performances if viewing archived
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const savedPerformances = useMemo(() => {
    if (!selectedSession || !selectedSession.performances) return [];
    return selectedSession.performances;
  }, [selectedSession]);

  const activePerformances = viewMode === 'live' ? livePerformances : savedPerformances;

  // Filtered by Search and Performance Type
  const filteredPerformances = useMemo(() => {
    return activePerformances.filter((p) => {
      const matchesSearch =
        (p.teamName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.performanceType || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'All' ||
        (p.performanceType || '').toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [activePerformances, searchQuery, selectedType]);

  // Winner (Rank 1)
  const winner = activePerformances.length > 0 && activePerformances[0].totalVotes > 0 ? activePerformances[0] : null;
  const top3 = activePerformances.filter((p) => p.totalVotes > 0).slice(0, 3);

  const totalAllVotes = activePerformances.reduce((acc, p) => acc + p.totalVotes, 0);
  const totalAllRating = activePerformances.reduce((acc, p) => acc + p.totalRating, 0);

  return (
    <div className="space-y-6">
      {/* View Switcher & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass rounded-2xl p-3">
        <div className="flex rounded-xl bg-black/40 p-1 border border-orange-500/20">
          <button
            onClick={() => setViewMode('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'live'
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Voting ({totalAllVotes} votes)
          </button>
          {sessions.length > 0 && (
            <button
              onClick={() => setViewMode('saved')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'saved'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              📁 Saved Sessions ({sessions.length})
            </button>
          )}
        </div>

        <button
          onClick={() => exportPerformancesCSV(activePerformances, viewMode === 'live' ? 'live-voting-results' : selectedSession?.title || 'session-results')}
          disabled={activePerformances.length === 0}
          className="btn-ghost flex items-center justify-center gap-2 text-xs py-2 px-4 shrink-0 hover:border-orange-400 text-orange-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Saved Session Selector (if in saved mode) */}
      {viewMode === 'saved' && sessions.length > 0 && (
        <div className="glass-strong rounded-2xl p-4 space-y-2 border border-orange-500/30">
          <label className="label">Select Past Session</label>
          <select
            value={selectedSessionId || sessions[0]?.id}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="input"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                {s.title || 'Session'} — {s.endedAt?.seconds ? new Date(s.endedAt.seconds * 1000).toLocaleString() : 'Archived'} ({s.performances?.length || 0} performances)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center border border-orange-500/20">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Performances</p>
          <p className="text-xl font-black text-white mt-0.5">{activePerformances.length}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center border border-orange-500/20">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Total Votes</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{totalAllVotes}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center border border-orange-500/20">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Total Rating Pts</p>
          <p className="text-xl font-black text-orange-400 mt-0.5">{totalAllRating}</p>
        </div>
      </div>

      {/* Winner Hero Banner */}
      {winner ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl p-6 border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-black/80 shadow-2xl shadow-orange-950/50 text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            🏆 Current Winner (Rank 1)
          </div>

          <div className="text-4xl">{MEDALS[0]}</div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
              {winner.teamName}
            </h2>
            <div className="inline-block text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md bg-white/10 text-orange-300 border border-orange-400/30">
              Type: {winner.performanceType}
            </div>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 pt-2">
            <div className="glass rounded-xl p-2.5">
              <p className="text-white/50 text-[11px] font-bold uppercase">No of votes</p>
              <p className="text-xl font-black text-amber-300">{winner.totalVotes}</p>
            </div>
            <div className="glass rounded-xl p-2.5">
              <p className="text-white/50 text-[11px] font-bold uppercase">Total Rating</p>
              <p className="text-xl font-black text-orange-400">{winner.totalRating} pts</p>
            </div>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <StarDistributionBar p={winner} />
          </div>
        </motion.div>
      ) : (
        <div className="glass-strong rounded-2xl p-8 text-center border border-orange-500/20">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-white font-bold text-base">No votes recorded yet</p>
          <p className="text-white/40 text-xs mt-1">
            Votes cast by the audience will appear here live with automatic vote counts and winner calculations.
          </p>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {top3.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Top Performers Podium</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`glass rounded-2xl p-4 text-center border ${
                  idx === 0
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : idx === 1
                    ? 'border-slate-300/40 bg-slate-500/10'
                    : 'border-amber-700/40 bg-amber-700/10'
                }`}
              >
                <div className="text-2xl mb-1">{MEDALS[idx] ?? `#${p.rank}`}</div>
                <p className="text-white font-black text-sm truncate">{p.teamName}</p>
                <p className="text-white/50 text-xs truncate">Type: {p.performanceType}</p>
                <div className="flex justify-center items-center gap-3 mt-2 text-xs font-bold">
                  <span className="text-amber-300">{p.totalVotes} votes</span>
                  <span className="text-white/30">•</span>
                  <span className="text-orange-400">{p.totalRating} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
            All Performances ({filteredPerformances.length})
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
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

          <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
            {PERFORMANCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-orange-500 text-black shadow'
                    : 'glass text-white/50 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Performances List */}
        <div className="space-y-3">
          {filteredPerformances.map((p, idx) => (
            <motion.div
              key={p.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass-strong rounded-2xl p-4 border border-orange-500/25 space-y-3 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="glass rounded-xl w-9 h-9 flex items-center justify-center text-sm font-black text-amber-400 shrink-0 border border-orange-500/30">
                    {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-black text-base">{p.teamName}</p>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {p.performanceType}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">
                      Avg Rating: <span className="text-amber-300 font-bold">★ {p.averageRating}</span> / 5.0
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white text-xs font-bold">
                    <span className="text-white/50">No of votes:</span>{' '}
                    <span className="text-amber-300 text-sm font-black">{p.totalVotes}</span>
                  </p>
                  <p className="text-xs font-bold text-orange-400 mt-0.5">
                    <span className="text-white/50">total rating:</span>{' '}
                    <span className="font-black text-sm">{p.totalRating} pts</span>
                  </p>
                </div>
              </div>

              {/* Vote breakdown distribution */}
              <StarDistributionBar p={p} />
            </motion.div>
          ))}

          {filteredPerformances.length === 0 && (
            <p className="text-center text-white/30 py-8 text-sm glass rounded-2xl">
              No matching performances found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

