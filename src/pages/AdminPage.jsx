import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import useGameState    from '../hooks/useGameState';
import {
  subscribeToQuestions,
  subscribeToPlayers,
  subscribeToQuestionAnswers,
  saveSession,
} from '../firebase/db';
import LoginScreen     from '../components/admin/LoginScreen';
import QuestionEditor  from '../components/admin/QuestionEditor';
import GameControl     from '../components/admin/GameControl';
import HostControl     from '../components/admin/HostControl';
import SessionHistory  from '../components/admin/SessionHistory';
import LoadingSpinner  from '../components/shared/LoadingSpinner';
import ErrorScreen     from '../components/shared/ErrorScreen';

const TABS = [
  { id: 'questions', label: '📝 Performances' },
  { id: 'game',      label: '🎮 Vote Control' },
  { id: 'host',      label: '🖥 Host / QR' },
  { id: 'history',   label: '📋 History' },
];

function AboutCorner() {
  return (
    <a
      href="/about"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 group"
    >
      <img
        src="/builder.jpg"
        alt="SivaSoorya G.R"
        className="w-7 h-7 rounded-full object-cover opacity-20 group-hover:opacity-50 transition-opacity"
      />
      <span className="text-white/20 group-hover:text-white/50 transition-colors text-xs">
        About
      </span>
    </a>
  );
}

export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab,         setTab]         = useState('game');
  const [questions,   setQuestions]   = useState([]);
  const [players,     setPlayers]     = useState([]);
  const [votedCount,  setVotedCount]  = useState(0);
  const { gameState, loading, error } = useGameState();
  const sessionSaving                 = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authed) return;
    const u1 = subscribeToQuestions(setQuestions);
    const u2 = subscribeToPlayers(setPlayers);
    return () => { u1(); u2(); };
  }, [authed]);

  // Live "voted" count for the current performance — drives the
  // voted/left badge in the header next to Logout.
  useEffect(() => {
    if (!authed) { setVotedCount(0); return; }
    const currentQ = questions[gameState?.currentQuestionIndex ?? 0];
    if (!currentQ || gameState?.phase === 'waiting' || gameState?.phase === 'ended') {
      setVotedCount(0);
      return;
    }
    const unsub = subscribeToQuestionAnswers(currentQ.id, (answers) => {
      setVotedCount(answers.length);
    });
    return unsub;
  }, [authed, questions, gameState?.currentQuestionIndex, gameState?.phase]);

  // Save session when a performance's voting round ends — admin is
  // authenticated so this write is allowed. Passes the current question
  // (team info) since sessions are now per-performance, not per-show.
  useEffect(() => {
    if (!authed || !gameState || gameState.phase !== 'ended') return;
    if (gameState.sessionSaved || sessionSaving.current) return;
    sessionSaving.current = true;
    const currentQ = questions[gameState.currentQuestionIndex ?? 0];
    saveSession(gameState, currentQ).catch(console.error);
  }, [authed, gameState?.phase, gameState?.sessionSaved, questions]);

  // Reset saving guard when a new quiz starts.
  useEffect(() => {
    if (gameState?.phase === 'waiting') sessionSaving.current = false;
  }, [gameState?.phase]);

  if (authLoading) return <LoadingSpinner />;
  if (!authed)     return <LoginScreen onLogin={() => {}} />;
  if (error)       return <ErrorScreen message={error} />;
  if (loading)     return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-black relative">
      {/* Nebula / ember background — same warm-black theme as the audience screens */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(120,50,10,0.18), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(90,30,0,0.15), transparent 55%)',
          }}
        />
        <motion.div
          className="absolute -bottom-24 -left-20 w-[26rem] h-[26rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,170,60,0.55) 0%, rgba(255,120,20,0.28) 25%, rgba(255,80,0,0.1) 50%, transparent 70%)',
            filter: 'blur(6px)',
          }}
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/40 blur-3xl"
          style={{ transform: 'translate(-30%, 30%)' }}
        />
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-700/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="adminStreakTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,140,50,0.5)" />
              <stop offset="100%" stopColor="rgba(255,140,50,0)" />
            </linearGradient>
            <linearGradient id="adminStreakTR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,140,50,0.45)" />
              <stop offset="100%" stopColor="rgba(255,140,50,0)" />
            </linearGradient>
          </defs>
          <line x1="-5%" y1="0%" x2="35%" y2="45%" stroke="url(#adminStreakTL)" strokeWidth="1.5" />
          <line x1="0%" y1="8%" x2="30%" y2="50%" stroke="url(#adminStreakTL)" strokeWidth="1" />
          <line x1="105%" y1="0%" x2="65%" y2="40%" stroke="url(#adminStreakTR)" strokeWidth="1.5" />
          <line x1="100%" y1="10%" x2="70%" y2="45%" stroke="url(#adminStreakTR)" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-orange-500/20 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <img src="/logo-bsg.png" alt="Social Loop" className="w-8 h-8" />
            <div>
              <h1 className="font-black text-white leading-none">Admin Panel</h1>
              <p className="text-brand-300 text-xs">{gameState?.title ?? 'Social Loop'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl px-3 py-1.5 text-xs text-white/60">
              {players.length} audience · {questions.length} performance{questions.length !== 1 ? 's' : ''}
              {' · '}
              <span className="text-green-300 font-semibold">{votedCount} voted</span>
              {' · '}
              <span className="text-orange-300 font-semibold">
                {Math.max(players.length - votedCount, 0)} left
              </span>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Tab bar */}
        <div className="sticky top-[65px] z-30 glass border-b border-orange-500/10 px-4 flex gap-1 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${tab === t.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-black shadow-lg shadow-orange-900/30'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <main className="p-4 max-w-2xl mx-auto pb-16">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'questions' && (
              <QuestionEditor questions={questions} />
            )}
            {tab === 'game' && (
              <GameControl gameState={gameState} questions={questions} />
            )}
            {tab === 'host' && (
              <HostControl gameState={gameState} />
            )}
            {tab === 'history' && (
              <SessionHistory />
            )}
          </motion.div>
        </main>
      </div>

      <AboutCorner />
    </div>
  );
}
