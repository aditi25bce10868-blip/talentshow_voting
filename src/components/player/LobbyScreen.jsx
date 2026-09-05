import { motion } from 'framer-motion';

export default function LobbyScreen({ playerName }) {
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
    <div className="fixed inset-0 overflow-y-auto flex flex-col items-center justify-center px-5 py-8 bg-black">
      {/* Nebula / ember background — same animation as the join screen */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-black">
        {/* base vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(120,50,10,0.18), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(90,30,0,0.15), transparent 55%)',
          }}
        />

        {/* bright ember burst, bottom-left */}
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
        className="relative z-10 w-full max-w-sm text-center"
      >
        {/* Logo with bounce animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          className="mb-3"
        >
          <img
            src="/logo-bsg.png"
            alt="BSG Logo"
            className="w-20 h-20 mx-auto rounded-2xl shadow-lg shadow-orange-900/30 object-contain"
          />
        </motion.div>

        {/* Social Loop - Dark Orange */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-wider uppercase relative">
            <span className="relative inline-block text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.35)]">
              Social Loop
            </span>
            <span className="absolute inset-0 text-orange-500/30 blur-xl">Social Loop</span>
          </h1>
        </motion.div>

        {/* Waiting card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 rounded-2xl border border-orange-500/30 bg-white/[0.02] px-6 py-10 flex flex-col items-center gap-6"
        >
          {/* Hourglass icon in a glowing ring */}
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full border border-orange-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(255,140,50,0.3)]"
          >
            <span className="text-6xl">⏳</span>
          </motion.div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-white/80 text-lg font-medium tracking-wide">
              Waiting for the host
            </span>
            <span className="text-white/80 text-lg font-medium tracking-wide">to start</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}