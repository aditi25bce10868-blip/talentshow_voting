import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayers } from '../../firebase/db';

export default function PlayerLeaderboard({ playerId, playerName }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const sorted = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const top3   = [sorted[0], sorted[1], sorted[2]]; // [first, second, third]

  // Podium display order: 2nd (left) · 1st (center, tallest) · 3rd (right)
  const podium = [
    {
      player: top3[1], rank: 2, height: 'h-64', badgeSize: 'w-11 h-11 text-sm',
      cardBg: 'bg-slate-300', badgeBg: 'bg-white', badgeText: 'text-slate-500',
      avatarBg: 'bg-white/60', avatarColor: 'text-sky-500',
    },
    {
      player: top3[0], rank: 1, height: 'h-80', badgeSize: 'w-12 h-12 text-base',
      cardBg: 'bg-amber-400', badgeBg: 'bg-white', badgeText: 'text-amber-500',
      avatarBg: 'bg-white/60', avatarColor: 'text-sky-500',
    },
    {
      player: top3[2], rank: 3, height: 'h-56', badgeSize: 'w-11 h-11 text-sm',
      cardBg: 'bg-orange-500', badgeBg: 'bg-white', badgeText: 'text-orange-600',
      avatarBg: 'bg-white/60', avatarColor: 'text-sky-500',
    },
  ];

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

  // Decorative confetti / trophy / sparkle scatter, echoing the reference image
  const decor = [
    { emoji: '🎉', top: '18%', left: '13%', size: 22, delay: 0 },
    { emoji: '🎉', top: '20%', right: '10%', size: 20, delay: 0.8 },
    { emoji: '🎉', top: '78%', right: '12%', size: 20, delay: 1.4 },
    { emoji: '🎉', top: '82%', left: '7%', size: 18, delay: 0.5 },
    { emoji: '🏆', top: '46%', left: '4%', size: 26, delay: 0.3 },
    { emoji: '🏆', top: '65%', right: '5%', size: 26, delay: 1.1 },
    { emoji: '✦', top: '10%', left: '35%', size: 16, delay: 0.2 },
    { emoji: '✦', top: '9%', right: '30%', size: 14, delay: 0.9 },
    { emoji: '✦', top: '58%', left: '6%', size: 14, delay: 1.6 },
  ];

  const Card = ({ player, rank, height, badgeSize, cardBg, badgeBg, badgeText, avatarBg, avatarColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ delay: rank === 1 ? 0.1 : rank === 2 ? 0.25 : 0.4, duration: 0.5 }}
      className={`relative ${height} w-full max-w-[9.5rem] flex flex-col items-center
                  rounded-t-2xl ${cardBg} pt-9 px-3 shadow-lg`}
    >
      {/* Crown above #1 */}
      {rank === 1 && (
        <motion.span
          className="absolute -top-9 left-1/2 -translate-x-1/2 text-2xl z-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          👑
        </motion.span>
      )}

      {/* Rank badge, overlapping the top edge of the card */}
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 ${badgeSize} rounded-full ${badgeBg} ${badgeText}
                    flex items-center justify-center font-black shadow-md z-10`}
      >
        #{rank}
      </div>

      {/* Avatar */}
      <div className={`relative mb-3 mt-1 w-14 h-14 rounded-full ${avatarBg} flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className={`w-7 h-7 ${avatarColor}`}>
          <path
            d="M22 5.9c-.77.34-1.6.57-2.46.67a4.3 4.3 0 0 0 1.88-2.37 8.6 8.6 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.29 3.9A12.15 12.15 0 0 1 2.9 4.6a4.28 4.28 0 0 0 1.33 5.71 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.97A8.6 8.6 0 0 1 2 18.57a12.13 12.13 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.55A8.7 8.7 0 0 0 22 5.9z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Name */}
      <p className="relative z-10 font-black text-slate-900 text-base truncate max-w-full">
        {player ? player.name : '—'}
      </p>

      {/* Score */}
      <p className="relative z-10 text-slate-800/80 font-semibold text-sm mt-0.5 mb-2">
        {player ? `${player.score ?? 0} pts` : '—'}
      </p>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col items-center justify-center bg-black px-4 py-8">
      {/* Nebula / ember background — same animation as the other screens */}
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

        {/* Confetti / trophy / sparkle decorations */}
        {decor.map((d, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ top: d.top, left: d.left, right: d.right, fontSize: d.size }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9], rotate: [0, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
          >
            {d.emoji}
          </motion.span>
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-center gap-2 mb-2"
      >
        <span className="text-3xl">🏆</span>
        <h2 className="text-6xl font-black text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
          Leaderboard
        </h2>
      </motion.div>

      {/* Social Loop heading */}
      <motion.h3
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-10 text-center text-4xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] mb-6"
      >
        Social Loop
      </motion.h3>

      {/* Podium */}
      <div className="relative z-10 flex items-end justify-center gap-3 max-w-md mx-auto w-full pb-2">
        <Card {...podium[0]} />
        <Card {...podium[1]} />
        <Card {...podium[2]} />
      </div>

      {/* Floor glow under the podium */}
      <div
        className="relative z-0 h-3 max-w-md mx-auto w-full -mt-3 mb-6 rounded-full"
        style={{
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(249,115,22,0.55), transparent 80%)',
        }}
      />
    </div>
  );
}