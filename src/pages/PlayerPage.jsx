import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import usePlayer    from '../hooks/usePlayer';
import { subscribeToQuestions } from '../firebase/db';
import JoinScreen        from '../components/player/JoinScreen';
import LobbyScreen       from '../components/player/LobbyScreen';
import QuestionScreen    from '../components/player/QuestionScreen';
import PlayerLeaderboard from '../components/player/PlayerLeaderboard';
import EndedScreen       from '../components/player/EndedScreen';
import LoadingSpinner    from '../components/shared/LoadingSpinner';
import ErrorScreen       from '../components/shared/ErrorScreen';
import { pageFade as fade } from '../lib/motion';

export default function PlayerPage() {
  const { gameState, loading, error: gameError } = useGameState();
  const { playerId, regNumber, join, joining, error, setError, verified } = usePlayer();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  if (gameError) return <ErrorScreen message={gameError} />;
  if (loading || !verified) return <LoadingSpinner />;

  if (!playerId) {
    return (
      <JoinScreen
        onJoin={join}
        joining={joining}
        error={error}
        onClearError={() => setError('')}
        gameTitle={gameState?.title}
      />
    );
  }

  const phase    = gameState?.phase ?? 'waiting';
  const currentQ = questions[gameState?.currentQuestionIndex ?? 0];

  // Safety net: if phase is 'question' but the current performance doc
  // doesn't exist yet (e.g. admin hasn't set up the next team yet, or it
  // was deleted mid-session), fall back to a visible waiting state instead
  // of silently rendering nothing.
  const missingQuestion = phase === 'question' && !currentQ;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <AnimatePresence mode="wait">

        {/* Leaderboard overlay — independent of phase, admin can reveal it
            any time (typically once every performance is done). Checked
            first so it takes priority over whatever phase is showing. */}
        {gameState?.leaderboardVisible ? (
          <motion.div key="leaderboard" {...fade}>
            <PlayerLeaderboard playerId={playerId} regNumber={regNumber} />
          </motion.div>
        ) : (
          <>
            {(phase === 'waiting' || missingQuestion) && (
              <motion.div key="lobby" {...fade}>
                <LobbyScreen regNumber={regNumber} gameTitle={gameState?.title} />
              </motion.div>
            )}

            {/* QuestionScreen manages its own answered/expired state */}
            {phase === 'question' && currentQ && (
              <motion.div key={`q-${gameState.currentQuestionIndex}`} {...fade}>
                <QuestionScreen
                  question={currentQ}
                  playerId={playerId}
                  questionStartTime={gameState.questionStartTime}
                />
              </motion.div>
            )}

            {phase === 'ended' && (
              <motion.div key="ended" {...fade}>
                <EndedScreen regNumber={regNumber} />
              </motion.div>
            )}
          </>
        )}

      </AnimatePresence>
    </div>
  );
}
