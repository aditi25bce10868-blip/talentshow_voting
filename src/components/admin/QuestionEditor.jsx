import { useState, useRef } from 'react';
import { addQuestion, updateQuestion, deleteQuestion, reorderQuestions } from '../../firebase/db';

const BLANK = {
  teamName: '',
  teamType: '',
  timer:    15,
};

function QuestionForm({ initial = BLANK, onSave, onCancel, saving }) {
  const [q, setQ] = useState({ ...BLANK, ...initial });
  const typeRef = useRef(null);

  const valid =
    q.teamName.trim() &&
    q.teamType.trim() &&
    q.timer >= 5 &&
    q.timer <= 120;

  // Enter on team name → jump to team type.
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      typeRef.current?.focus();
    }
  };

  const handleTypeKeyDown = (e) => {
    if (e.key === 'Enter' && valid && !saving) {
      e.preventDefault();
      onSave(q);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-4">
      <div>
        <label className="label">Team Name</label>
        <input
          type="text"
          value={q.teamName}
          onChange={(e) => setQ({ ...q, teamName: e.target.value })}
          onKeyDown={handleNameKeyDown}
          placeholder="e.g. The Rising Stars"
          className="input"
        />
      </div>

      <div>
        <label className="label">Team Type</label>
        <input
          type="text"
          ref={typeRef}
          value={q.teamType}
          onChange={(e) => setQ({ ...q, teamType: e.target.value })}
          onKeyDown={handleTypeKeyDown}
          placeholder="e.g. Dance, Singing, Comedy"
          className="input"
        />
      </div>

      <div className="glass rounded-xl p-3 space-y-2.5">
        <p className="text-white/40 text-xs">
          Audience always rates 1–5 stars — no options to configure.
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex flex-col items-center justify-center gap-1 rounded-lg
                         bg-black/40 border border-orange-500/20 py-2"
            >
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                Option {n}
              </span>
              <span className="text-amber-400 text-xs leading-none tracking-tight">
                {'★'.repeat(n)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <label className="label">Voting Timer (seconds)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={120}
              value={q.timer}
              onChange={(e) => setQ({ ...q, timer: Number(e.target.value) })}
              className="input w-24"
            />
            <span className="text-white/30 text-xs">5–120s</span>
          </div>
        </div>

        <div className="flex gap-1 pb-0.5">
          {[10, 15, 20, 30].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQ({ ...q, timer: t })}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all
                ${q.timer === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(q)}
          disabled={!valid || saving}
          className="btn-primary"
        >
          {saving ? 'Saving…' : 'Save Performance'}
        </button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}

export default function QuestionEditor({ questions }) {
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [dragOver,   setDragOver]   = useState(null);
  const dragIdx = useRef(null);

  const handleSave = async (q) => {
    setSaving(true);
    try {
      if (editing === 'new') await addQuestion(q);
      else                   await updateQuestion(editing, q);
      setEditing(null);
    } catch (err) {
      console.error('Save performance failed:', err);
      alert(`Couldn't save performance: ${err.message ?? err}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    // Two-step inline confirm — first click arms, second click fires.
    // Replaced window.confirm() because some browsers silently suppress
    // it (no callback, no console), which made "nothing happens on click"
    // indistinguishable from a real bug.
    if (confirmDel !== id) {
      setConfirmDel(id);
      setTimeout(() => setConfirmDel((cur) => (cur === id ? null : cur)), 4000);
      return;
    }
    setConfirmDel(null);
    setDeleting(id);
    try {
      await deleteQuestion(id);
    } catch (err) {
      console.error('Delete performance failed:', err);
      alert(`Couldn't delete performance: ${err.code || err.message || err}`);
    } finally {
      setDeleting(null);
    }
  };

  const onDragStart = (idx) => { dragIdx.current = idx; };
  const onDragOver  = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDragEnd   = () => { dragIdx.current = null; setDragOver(null); };

  const onDrop = async (e, dropIdx) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === dropIdx) { setDragOver(null); return; }
    const reordered = [...questions];
    const [moved]   = reordered.splice(from, 1);
    reordered.splice(dropIdx, 0, moved);
    setDragOver(null);
    await reorderQuestions(reordered.map((q) => q.id));
  };

  return (
    <div className="space-y-4">
      {editing !== 'new' && (
        <button
          onClick={() => setEditing('new')}
          className="w-full py-3 rounded-xl border-2 border-dashed border-brand-600/50
                     text-brand-400 font-semibold hover:border-brand-400 hover:text-brand-300
                     transition-all flex items-center justify-center gap-2"
        >
          + Add Performance
        </button>
      )}

      {editing === 'new' && (
        <QuestionForm
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {questions.length === 0 && (
        <p className="text-center text-white/30 py-8">No performances yet. Add one above.</p>
      )}

      {questions.length > 1 && (
        <p className="text-white/20 text-xs text-center">Drag ⠿ to reorder</p>
      )}

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            draggable={editing !== q.id}
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={(e) => onDrop(e, idx)}
            onDragEnd={onDragEnd}
            className={`glass rounded-2xl p-4 transition-colors
              ${dragOver === idx ? 'ring-2 ring-brand-400/60 bg-white/5' : ''}`}
          >
            {editing === q.id ? (
              <QuestionForm
                initial={q}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                saving={saving}
              />
            ) : (
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <span className="text-white/20 cursor-grab active:cursor-grabbing text-lg select-none shrink-0 mt-1">
                  ⠿
                </span>

                <span className="glass rounded-lg w-8 h-8 flex items-center justify-center
                                 text-sm font-black text-brand-300 shrink-0 mt-0.5">
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{q.teamName}</p>
                  <p className="text-white/40 text-xs mt-0.5">{q.teamType}</p>
                  <p className="text-white/30 text-xs mt-1.5">⏱ {q.timer ?? 15}s · rated 1–5 ⭐</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(q.id)}
                    className="btn-ghost text-xs py-1 px-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deleting === q.id}
                    className={`text-xs transition-colors py-1 px-3 rounded-xl border
                      ${confirmDel === q.id
                        ? 'bg-red-500/25 border-red-400 text-red-200 font-bold'
                        : 'glass border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-400/40'
                      }`}
                  >
                    {deleting === q.id ? '…' : confirmDel === q.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
