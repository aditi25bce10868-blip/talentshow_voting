import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnswer } from '../../firebase/db';

const RATINGS = [
  { value: 1, label: '1 STAR' },
  { value: 2, label: '2 STARS' },
  { value: 3, label: '3 STARS' },
  { value: 4, label: '4 STARS' },
  { value: 5, label: '5 STARS' },
];

export default function QuestionScreen({ question, playerId, questionStartTime }) {
  const totalTime    = question.timer ?? 15;
  const [timeLeft,   setTimeLeft]   = useState(totalTime);
  const [selected,   setSelected]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expired,    setExpired]    = useState(false);
  const expiredRef   = useRef(false);

  // Reset on new performance
  useEffect(() => {
    setTimeLeft(totalTime);
    setSelected(null);
    setExpired(false);
    expiredRef.current = false;
  }, [question.id, totalTime]);

  // Countdown synced to server timestamp
  useEffect(() => {
    if (!questionStartTime) return;
    const startMs =
      questionStartTime?.toMillis?.() ??
      (questionStartTime?.seconds ?? 0) * 1000;

    const tick = () => {
      const elapsed   = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
      }
    };
    tick();
    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, [question.id, questionStartTime, totalTime]);

  const canRate = !expired && selected === null;

  // Team + type come from the admin-set question doc (QuestionEditor),
  // never from the audience — a rating round is always about whichever
  // performance the host has live right now. Tapping a rating submits
  // and locks it immediately; server-side, firestore.rules denies any
  // further write to this answer doc, so this is a real lock, not just
  // a disabled button.
  const handleSelect = useCallback(async (value) => {
    if (submitting || expired || selected !== null) return;
    setSelected(value);
    setSubmitting(true);

    try {
      await submitAnswer({
        questionId: question.id,
        playerId,
        rating: value,
      });
    } catch (e) {
      // Log only — never show technical errors to the player. Their
      // selection stays visible so the UI never "snaps back" on them.
      // A rejected write here almost always just means the round ended
      // a beat before this landed — not something to alarm them with.
      console.error('submitAnswer failed:', e);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, expired, selected, question, playerId]);

  const pct      = timeLeft / totalTime;
  const barColor = pct > 0.5 ? '#f97316' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  const embers = [
    { top: '4%', left: '8%', size: 3, delay: 0 },
    { top: '9%', left: '20%', size: 2, delay: 0.6 },
    { top: '3%', right: '10%', size: 4, delay: 1.2 },
    { top: '14%', right: '22%', size: 2, delay: 0.3 },
    { top: '22%', left: '4%', size: 2, delay: 1.6 },
    { top: '30%', right: '6%', size: 3, delay: 0.9 },
    { top: '46%', left: '10%', size: 2, delay: 1.9 },
    { top: '55%', right: '14%', size: 2, delay: 0.4 },
    { top: '63%', left: '18%', size: 3, delay: 1.1 },
    { top: '70%', right: '8%', size: 2, delay: 1.7 },
    { top: '80%', left: '6%', size: 2, delay: 0.2 },
    { top: '88%', right: '20%', size: 3, delay: 1.4 },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col bg-black">
      {/* Nebula / ember background — same animation as the join & lobby screens */}
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
            <linearGradient id="streakTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,140,50,0.5)" />
              <stop offset="100%" stopColor="rgba(255,140,50,0)" />
            </linearGradient>
            <linearGradient id="streakTR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,140,50,0.45)" />
              <stop offset="100%" stopColor="rgba(255,140,50,0)" />
            </linearGradient>
          </defs>
          <line x1="-5%" y1="0%" x2="35%" y2="45%" stroke="url(#streakTL)" strokeWidth="1.5" />
          <line x1="0%" y1="8%" x2="30%" y2="50%" stroke="url(#streakTL)" strokeWidth="1" />
          <line x1="105%" y1="0%" x2="65%" y2="40%" stroke="url(#streakTR)" strokeWidth="1.5" />
          <line x1="100%" y1="10%" x2="70%" y2="45%" stroke="url(#streakTR)" strokeWidth="1" />
        </svg>
        {embers.map((e, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-orange-300"
            style={{
              top: e.top,
              left: e.left,
              right: e.right,
              width: e.size,
              height: e.size,
              boxShadow: '0 0 6px 2px rgba(255,150,60,0.8)',
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: e.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Timer bar */}
      <div className="relative z-10 h-1.5 w-full bg-white/10">
        <div
          className="h-full rounded-r-full"
          style={{ backgroundColor: barColor, width: `${pct * 100}%`, transition: 'width 0.08s linear' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-5 py-5 gap-5 max-w-sm mx-auto w-full">
        {/* Header — just the countdown badge, top-right */}
        <div className="flex items-center justify-end">
          <motion.div
            key={Math.ceil(timeLeft)}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black tabular-nums px-4 py-1.5 rounded-xl border"
            style={{ color: barColor, borderColor: barColor }}
          >
            {Math.ceil(timeLeft)}s
          </motion.div>
        </div>

        {/* Who you're rating — set by the host, read-only for the audience */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-2xl border border-orange-500/20 bg-white/[0.02] px-5 py-5"
        >
          <p className="text-4xl font-black text-white leading-tight drop-shadow-[0_0_16px_rgba(249,115,22,0.25)]">
            {question.teamName}
          </p>
          {question.teamType && (
            <p className="text-orange-300 text-sm font-bold uppercase tracking-wider mt-1.5">
              {question.teamType}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-4 mb-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-500/50" />
            <span className="text-xs text-orange-400/70 tracking-widest">•</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-500/50" />
          </div>

          <p className="text-white/60 text-sm font-medium">
            How would you like to rate this performance?
          </p>
        </motion.div>

        {/* Star rating rows */}
        <div className="flex flex-col gap-3 flex-1">
          {RATINGS.map((r, idx) => {
            const isChosen = selected === r.value;
            const disabled = expired || submitting || selected !== null;

            return (
              <motion.button
                key={r.value}
                type="button"
                onClick={() => handleSelect(r.value)}
                disabled={disabled}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3.5 rounded-xl border
                  bg-black/50 border-orange-500/30 transition-all
                  ${isChosen ? 'ring-2 ring-orange-400 border-orange-400 bg-orange-500/10' : ''}
                  ${!disabled ? 'hover:border-orange-400/60 cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                <span className="flex items-center shrink-0" style={{ letterSpacing: '1px' }}>
                  {Array.from({ length: r.value }).map((_, i) => (
                    <span key={i} className="text-2xl text-amber-400">★</span>
                  ))}
                </span>
                <span className="text-base font-bold text-white tracking-wide flex-1 text-left">
                  {r.label}
                </span>
                {isChosen ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center shrink-0"
                  >
                    <span className="text-sm text-black font-black">✓</span>
                  </motion.div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/40 shrink-0">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom status */}
        <AnimatePresence mode="wait">
          {expired && selected === null && (
            <motion.div
              key="no-answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 bg-red-500/20 border
                         border-red-500/30 text-red-300 font-bold text-base"
            >
              ⏰ No rating submitted
            </motion.div>
          )}
          {expired && selected !== null && (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 bg-white/[0.03] border border-orange-500/20 text-white/50 text-base font-medium"
            >
              Rating locked in — watch the screen!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
