import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import usePlayer    from '../hooks/usePlayer';
import { subscribeToQuestions } from '../firebase/db';
import JoinScreen        from '../components/player/JoinScreen';
import LobbyScreen       from '../components/player/LobbyScreen';
import QuestionScreen    from '../components/player/QuestionScreen';
import AnswerResult      from '../components/player/AnswerResult';
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

  // Safety net: if phase is 'question' or 'results' but the matching
  // question doc doesn't exist yet (e.g. deleted mid-session, or the
  // admin advanced the phase before adding questions), fall back to a
  // visible waiting state instead of silently rendering nothing.
  const missingQuestion = (phase === 'question' || phase === 'results') && !currentQ;

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">

        {phase === 'waiting' && (
          <motion.div key="lobby" {...fade}>
            <LobbyScreen regNumber={regNumber} gameTitle={gameState?.title} />
          </motion.div>
        )}

        {missingQuestion && (
          <motion.div key="missing-question" {...fade}>
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
              questionIndex={gameState.currentQuestionIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'results' && currentQ && (
          <motion.div key={`ar-${gameState.currentQuestionIndex}`} {...fade}>
            <AnswerResult question={currentQ} playerId={playerId} />
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div key="leaderboard" {...fade}>
            <PlayerLeaderboard playerId={playerId} regNumber={regNumber} />
          </motion.div>
        )}

        {phase === 'ended' && (
          <motion.div key="ended" {...fade}>
            <EndedScreen playerId={playerId} regNumber={regNumber} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}