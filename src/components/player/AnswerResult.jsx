import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayerAnswer } from '../../firebase/db';

export default function AnswerResult({ question, playerId }) {
  const [voted,   setVoted]   = useState(false);
  const [loading, setLoading] = useState(true);

  // Confirm the vote was actually recorded before showing success.
  useEffect(() => {
    let settled = false;
    const unsub = subscribeToPlayerAnswer(question.id, playerId, (r) => {
      if (r) {
        setVoted(true);
        setLoading(false);
        settled = true;
      }
    });
    // Give up the spinner after 4s even if the write is still in flight —
    // the vote almost certainly went through, no need to block the UI.
    const t = setTimeout(() => { if (!settled) setLoading(false); }, 4000);
    return () => { unsub(); clearTimeout(t); };
  }, [question.id, playerId]);

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

  const Background = () => (
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
  );

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <Background />
        <div className="relative z-10 w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 gap-6 bg-black">
      <Background />

      {/* Golden checkmark badge in a glowing ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative z-10 w-28 h-28 rounded-full border-2 border-orange-400/70 flex items-center justify-center"
        style={{ boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-500/60" />
          <span className="text-xs text-orange-400/80 tracking-widest">•</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-500/60" />
        </div>
        <p className="text-3xl md:text-4xl font-black uppercase tracking-wide text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] leading-tight">
          Voted<br />Successfully
        </p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-500/60" />
          <span className="text-xs text-orange-400/80 tracking-widest">•</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-500/60" />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-white/70 text-base font-medium"
      >
        {voted ? 'Thanks for voting!' : "Time's up — no vote recorded."}
      </motion.p>
    </div>
  );
}