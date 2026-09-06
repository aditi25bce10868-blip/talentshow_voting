import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Accepts letters + digits in the local part, ending in @vitbhopal.ac.in or @gmail.com
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@(vitbhopal\.ac\.in|gmail\.com)$/i;

export default function JoinScreen({ onJoin, joining, error, suggested, onClearSuggested, gameTitle = 'TALENT SHOW' }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (suggested) setEmail(suggested);
  }, [suggested]);

  const valid = EMAIL_RE.test(email.trim());

  const submit = (e) => {
    e.preventDefault();
    if (valid) onJoin(email.trim().toLowerCase());
  };

  const isTaken = error === 'name_taken';

  // A handful of fixed "ember" positions so the sparkle field doesn't reflow on re-render
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
    <div className="fixed inset-0 overflow-y-auto flex flex-col items-center justify-center px-4 py-6 bg-black">
      {/* Nebula / ember background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-black">
        {/* base vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(120,50,10,0.18), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(90,30,0,0.15), transparent 55%)',
          }}
        />

        {/* bright ember burst, bottom-left — echoes the reference nebula image */}
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

        {/* soft corner glows */}
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-700/5 rounded-full blur-3xl" />

        {/* diagonal light streaks, top corners */}
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

        {/* scattered embers */}
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header with TALENT SHOW */}
        <div className="text-center mb-3">
          {/* Logo with bounce animation */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
            className="mb-2"
          >
            <img
              src="/logo-bsg.png"
              alt="BSG Logo"
              className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-2xl shadow-lg shadow-orange-900/30 object-contain"
            />
          </motion.div>

          {/* TALENT SHOW - White with elegant glow, forced onto one line and scaled to fit narrow screens */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 200,
            }}
            className="px-1"
          >
            <h1
              className="whitespace-nowrap uppercase relative font-black
                         text-[clamp(1.5rem,7vw,3.75rem)]
                         tracking-wide sm:tracking-wider leading-none"
            >
              <span className="relative inline-block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                {gameTitle}
              </span>

              {/* Subtle white glow layers */}
              <span className="absolute inset-0 text-white/20 blur-xl">{gameTitle}</span>
            </h1>
          </motion.div>

          {/* Decorative line with pulse animation */}
          <motion.div
            className="relative w-24 sm:w-32 h-0.5 mx-auto mt-3"
            animate={{
              scaleX: [0.8, 1, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent rounded-full blur-sm" />
          </motion.div>

          {/* Decorative dots */}
          <motion.div
            className="flex justify-center gap-3 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
                className="w-1.5 h-1.5 rounded-full bg-orange-400/60"
              />
            ))}
          </motion.div>
        </div>

        {/* Poster Section with fade-in animation */}
        <motion.div
          className="rounded-2xl p-1.5 border border-orange-500/30 bg-white/[0.02] shadow-lg shadow-orange-900/20 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img
            src="/poster.png"
            alt="Social Loopers Poster"
            className="w-full rounded-xl object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.className =
                'w-full rounded-xl bg-gradient-to-br from-orange-900/30 to-orange-600/10 p-6 sm:p-8 aspect-[4/3] flex flex-col items-center justify-center text-center';
              fallback.innerHTML = `
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-3">
                  <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 class="text-orange-400 font-bold text-lg sm:text-xl">SOCIAL LOOPERS</h3>
                <p class="text-white/60 text-xs sm:text-sm mt-1">VIT Bhopal • Talent Show 2026</p>
                <div class="mt-3 flex gap-2">
                  <span class="px-3 py-1 bg-orange-500/20 rounded-full text-orange-300 text-xs font-semibold">Live</span>
                  <span class="px-3 py-1 bg-orange-500/20 rounded-full text-orange-300 text-xs font-semibold">Voting</span>
                </div>
              </div>`;
              parent.appendChild(fallback);
            }}
          />
        </motion.div>

        {/* Form Section with slide-up animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-center text-white/70 text-xs sm:text-sm mt-3 sm:mt-4 font-medium">
            Enter your registered college email id to join
          </p>

          <form onSubmit={submit} className="mt-3 sm:mt-4 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 bg-white/[0.03] border border-orange-500/20">
            <div>
              <label className="block text-xs font-semibold text-orange-400 mb-2 uppercase tracking-wider">
                REGISTERED EMAIL ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md border border-orange-500/30 text-orange-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                    <path d="M3 6.5l9 6 9-6" />
                  </svg>
                </span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (suggested) onClearSuggested();
                  }}
                  placeholder="e.g. yourname@vitbhopal.ac.in"
                  maxLength={60}
                  autoFocus
                  className="w-full bg-black/40 border border-orange-500/30 rounded-xl pl-12 pr-4 py-3 text-white
                             placeholder-white/30 text-sm sm:text-base font-medium focus:outline-none
                             focus:border-orange-400 focus:bg-black/60 transition-all duration-300"
                />
              </div>
            </div>

            <AnimatePresence>
              {isTaken && suggested && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="rounded-xl px-4 py-3 bg-white/[0.04] border border-amber-500/30 overflow-hidden"
                >
                  <p className="text-amber-300 text-xs font-semibold">This email has already joined.</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Joining as <span className="text-white font-bold">"{suggested}"</span> — edit above to use a different email.
                  </p>
                </motion.div>
              )}

              {error && !isTaken && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-red-400/80 text-xs"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={joining || !valid}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="w-full py-3.5 sm:py-4 rounded-xl font-black text-base sm:text-lg tracking-wide text-black uppercase
                         bg-gradient-to-r from-orange-500 to-orange-400
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:from-orange-400 hover:to-orange-300
                         transition-all duration-300 shadow-lg shadow-orange-900/30
                         relative overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{
                  x: ['0%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                }}
              />
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  Joining…
                </span>
              ) : (
                'JOIN'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer with fade-in animation */}
        <motion.div
          className="mt-4 sm:mt-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.p
            className="flex items-center justify-center gap-2 text-orange-400/80 text-xs font-semibold tracking-wider"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M12 3l7 3v6c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6l7-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Secure • Private • Fair Voting
          </motion.p>
          <p className="text-white/40 text-xs mt-1 tracking-wider">Your vote matters!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
