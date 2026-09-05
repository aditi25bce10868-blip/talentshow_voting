import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  startQuiz,
  endQuiz,
  resetGame,
  toggleLeaderboard, // NEW — flips gameState.leaderboardVisible, decoupled from `phase`
} from '../../firebase/db';

// NOTE: 'leaderboard' is no longer a step in the voting flow — the
// leaderboard is now a standalone overlay (see the Leaderboard card below),
// not a phase the game passes through between performances.
// NOTE: there is no 'results' phase anymore — voting goes straight from
// 'question' to 'ended' via the single "End Show" button. The timer is
// audience-only (shown on their phones); the host/admin no longer track
// a countdown or need a manual "close voting early" step.
const PHASE_LABELS = {
  waiting:  { label: 'Waiting for audience',   color: 'text-blue-300',   dot: 'bg-blue-400' },
  question: { label: 'Voting open',            color: 'text-yellow-300', dot: 'bg-yellow-400' },
  ended:    { label: 'Show ended',             color: 'text-red-300',    dot: 'bg-red-400' },
};

function ActionButton({ label, onClick, disabled, variant = 'primary', danger = false }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onClick(); }
    finally { setLoading(false); }
  };

  const base = 'w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    primary: `${base} bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg`,
    secondary: `${base} glass border border-white/20 text-white hover:bg-white/10`,
    danger: `${base} bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600/50`,
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handle}
      disabled={disabled || loading}
      className={danger ? styles.danger : styles[variant]}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Working…
        </span>
      ) : label}
    </motion.button>
  );
}

export default function GameControl({ gameState, questions }) {
  const phase    = gameState?.phase ?? 'waiting';
  const currentQ = questions[gameState?.currentQuestionIndex ?? 0];
  const phaseInfo = PHASE_LABELS[phase] ?? PHASE_LABELS.waiting;
  const leaderboardVisible = gameState?.leaderboardVisible ?? false;

  // Inline two-step confirm for Reset — window.confirm() is silently
  // suppressed by some browsers, which made the button look dead.
  const [confirmReset, setConfirmReset] = useState(false);
  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    try {
      await resetGame();
    } catch (err) {
      console.error('Reset game failed:', err);
      alert(`Couldn't reset game: ${err.code || err.message || err}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-3 h-3 rounded-full ${phaseInfo.dot} animate-pulse`} />
          <span className={`font-bold ${phaseInfo.color}`}>{phaseInfo.label}</span>
          {leaderboardVisible && (
            <span className="ml-auto text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              🏆 Leaderboard live
            </span>
          )}
        </div>

        {phase !== 'waiting' && phase !== 'ended' && (
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Now Performing</p>
            <p className="text-white font-semibold">{currentQ?.teamName ?? '—'}</p>
            {currentQ?.teamType && (
              <p className="text-white/50 text-xs mt-1">{currentQ.teamType}</p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Controls</p>

        {/* Waiting → Start (unchanged function, relabeled for the show) */}
        {phase === 'waiting' && (
          <ActionButton
            label={currentQ?.teamName ? `🚀 Start Voting: ${currentQ.teamName}` : '🚀 Start Voting'}
            disabled={!currentQ}
            onClick={startQuiz}
          />
        )}

        {/* Question ("voting") phase → End Show directly. Performances cycle
            via Reset → admin edits teamName/teamType → Start again, not by
            paging through a pre-loaded list — so this is a single action. */}
        {phase === 'question' && (
          <ActionButton
            label="🏁 End Show"
            onClick={endQuiz}
          />
        )}

        {/* Ended */}
        {phase === 'ended' && (
          <p className="text-center text-white/40 text-sm py-2">
            Show ended. Edit the performance details for the next team, then Reset and Start.
          </p>
        )}
      </div>

      {/* Leaderboard — independent of phase. Admin can reveal/hide it any
          time; typically used once every performance is done, to show the
          top 3 teams. Actual top-3 data comes from session history —
          whatever renders the leaderboard (host screen, etc.) should
          subscribe to gameState.leaderboardVisible to know when to show it. */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Leaderboard</p>
        <ActionButton
          label={leaderboardVisible ? '🙈 Hide Leaderboard' : '🏆 Show Leaderboard (Top 3)'}
          onClick={toggleLeaderboard}
          variant={leaderboardVisible ? 'secondary' : 'primary'}
        />
      </div>

      {/* Reset */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Danger Zone</p>
        <ActionButton
          label={confirmReset
            ? '⚠ Confirm reset — click again to wipe teams & votes'
            : '🔄 Reset Show (clears all teams & votes)'}
          onClick={handleReset}
          danger
        />
      </div>
    </div>
  );
}
