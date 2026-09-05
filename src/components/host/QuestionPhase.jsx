import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToQuestionAnswers } from '../../firebase/db';

export default function QuestionPhase({ question }) {
  const [answerCount, setAnswerCount] = useState(0);

  // Live vote counter
  useEffect(() => {
    const unsub = subscribeToQuestionAnswers(question.id, (answers) => {
      setAnswerCount(answers.length);
    });
    return unsub;
  }, [question.id]);

  return (
    <div className="min-h-screen w-full flex flex-col p-8 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Top bar — no countdown here; the timer is audience-only, shown on their phones */}
      <div className="flex items-center justify-between mb-6">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-brand-300 text-sm font-semibold">Voting Open</span>
        </div>

        {/* Vote count */}
        <motion.div
          key={answerCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="glass rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-semibold">{answerCount} voted</span>
        </motion.div>
      </div>

      {/* Team on stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-10 flex flex-col items-center justify-center flex-1 gap-3"
      >
        <p className="text-brand-300 text-lg font-bold uppercase tracking-widest">Now Performing</p>
        <h2 className="text-6xl font-black text-white text-center leading-tight">
          {question.teamName}
        </h2>
        {question.teamType && (
          <p className="text-white/50 text-2xl font-semibold">{question.teamType}</p>
        )}
        <div className="flex gap-2 text-4xl mt-4">
          <span>⭐⭐⭐⭐⭐</span>
        </div>
        <p className="text-white/30 text-sm mt-1">Audience is rating on their phones now</p>
      </motion.div>
    </div>
  );
}
