import { motion } from 'framer-motion';
import Particles from '../shared/Particles';
import { EASE_OUT } from '../../lib/motion';

// Just a "show's over, thanks" screen. The leaderboard/podium lives on its
// own dedicated screen (LeaderboardPhase) — it should not be duplicated here.
export default function EndedPhase() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <Particles count={40} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="relative z-10 text-center"
      >
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-7xl font-black gradient-text mb-2">Voting Over!</h1>
        <p className="text-brand-300 text-2xl">Thanks everyone for voting!</p>
      </motion.div>
    </div>
  );
}
