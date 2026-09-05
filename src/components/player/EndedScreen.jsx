import { motion } from 'framer-motion';

// No score/rank here on purpose — the audience isn't competing, they're
// rating a team. This is just the brief screen between the host clicking
// "End Show" and "Reset" for the next performance.
export default function EndedScreen({ playerName }) {
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
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 gap-6 bg-black">
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
        {embers.map((e, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-orange-300"
            style={{
              top: e.top, left: e.left, right: e.right,
              width: e.size, height: e.size,
              boxShadow: '0 0 6px 2px rgba(255,150,60,0.8)',
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: e.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="relative z-10 rounded-2xl p-8 text-center max-w-xs w-full bg-white/[0.03] border border-orange-500/20"
      >
        <div className="text-6xl mb-4">🎤</div>
        <h2 className="text-2xl font-black text-orange-500 mb-1 uppercase tracking-wide">
          Round Complete!
        </h2>
        <p className="text-white/50 text-sm">
          Thanks for voting{playerName ? `, ${playerName}` : ''}! Get ready for the next performance.
        </p>
      </motion.div>
    </div>
  );
}
