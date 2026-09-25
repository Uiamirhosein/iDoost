import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Swords,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { fetchAdminApi } from './adminApi';

interface AdminIcebreakerProps {
  questions: any[];
  chips: any[];
  isEnabled: boolean;
  loading: boolean;
  onRefresh: () => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export const AdminIcebreaker: React.FC<AdminIcebreakerProps> = ({
  questions,
  chips,
  isEnabled,
  loading,
  onRefresh,
  onToggleEnabled,
}) => {
  // Tab state: 'questions' | 'chips'
  const [activeTab, setActiveTab] = useState<'questions' | 'chips'>('questions');

  // Question Form Modal State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qPrompt, setQPrompt] = useState('');
  const [qCategory, setQCategory] = useState('daily_cringe');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [qIsActive, setQIsActive] = useState(true);

  // Chip Form Modal State
  const [editingChip, setEditingChip] = useState<any | null>(null);
  const [isChipModalOpen, setIsChipModalOpen] = useState(false);
  const [chipType, setChipType] = useState<'agreed' | 'conflict'>('agreed');
  const [chipTarget, setChipTarget] = useState<'user1' | 'user2' | 'all'>('all');
  const [chipText, setChipText] = useState('');
  const [chipIsActive, setChipIsActive] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Open Question Modal
  const handleOpenQuestionModal = (q?: any) => {
    if (q) {
      setEditingQuestion(q);
      setQPrompt(q.prompt);
      setQCategory(q.category || 'daily_cringe');
      setOpt1(q.options?.[0]?.text || '');
      setOpt2(q.options?.[1]?.text || '');
      setQIsActive(q.is_active ?? true);
    } else {
      setEditingQuestion(null);
      setQPrompt('');
      setQCategory('daily_cringe');
      setOpt1('');
      setOpt2('');
      setQIsActive(true);
    }
    setIsQuestionModalOpen(true);
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim() || !opt1.trim() || !opt2.trim()) {
      alert('لطفاً صورت سوال و هر دو گزینه را پر کنید.');
      return;
    }

    setActionLoading(true);
    const options = [
      { id: 1, text: opt1.trim() },
      { id: 2, text: opt2.trim() },
    ];

    const res = await fetchAdminApi('save_icebreaker_question', 'POST', {
      id: editingQuestion?.id,
      prompt: qPrompt.trim(),
      category: qCategory,
      options,
      is_active: qIsActive,
    });
    setActionLoading(false);

    if (res.ok) {
      showToast(res.message);
      setIsQuestionModalOpen(false);
      onRefresh();
    } else {
      alert('خطا در ذخیره سوال: ' + res.error);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('آیا از حذف این سوال اطمینان دارید؟')) return;
    setActionLoading(true);
    const res = await fetchAdminApi('delete_icebreaker_question', 'POST', { id });
    setActionLoading(false);
    if (res.ok) {
      showToast(res.message);
      onRefresh();
    }
  };

  // Open Chip Modal
  const handleOpenChipModal = (c?: any) => {
    if (c) {
      setEditingChip(c);
      setChipType(c.type || 'agreed');
      setChipTarget(c.user_target || 'all');
      setChipText(c.text || '');
      setChipIsActive(c.is_active ?? true);
    } else {
      setEditingChip(null);
      setChipType('agreed');
      setChipTarget('all');
      setChipText('');
      setChipIsActive(true);
    }
    setIsChipModalOpen(true);
  };

  // Save Chip
  const handleSaveChip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chipText.trim()) {
      alert('لطفاً متن پیام پیشنهادی را وارد کنید.');
      return;
    }

    setActionLoading(true);
    const res = await fetchAdminApi('save_chip_suggestion', 'POST', {
      id: editingChip?.id,
      type: chipType,
      user_target: chipTarget,
      text: chipText.trim(),
      is_active: chipIsActive,
    });
    setActionLoading(false);

    if (res.ok) {
      showToast(res.message);
      setIsChipModalOpen(false);
      onRefresh();
    } else {
      alert('خطا در ذخیره پیام: ' + res.error);
    }
  };

  // Delete Chip
  const handleDeleteChip = async (id: string) => {
    if (!confirm('آیا از حذف این پیام پیشنهادی اطمینان دارید؟')) return;
    setActionLoading(true);
    const res = await fetchAdminApi('delete_chip_suggestion', 'POST', { id });
    setActionLoading(false);
    if (res.ok) {
      showToast(res.message);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* Header and Switcher */}
      <div className="p-4 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">مدیریت اتاق نفرت مشترک (Icebreaker)</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {isEnabled ? 'وضعیت: فعال در مینی‌اپ' : 'وضعیت: غیرفعال'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">تنظیم بانک سوالات، سناریوها و پیام‌های پیشنهادی اینپوت</p>
          </div>
        </div>

        {/* Global Toggle & Tab Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Main Feature On/Off Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleEnabled(!isEnabled)}
            className={`h-9 px-3.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              isEnabled
                ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span>{isEnabled ? '⛔ غیرفعال‌سازی این فیچر' : '✅ فعال‌سازی این فیچر'}</span>
          </button>

          <div className="flex items-center p-1 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'questions' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              سوالات ({persianNumber(questions.length)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chips')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'chips' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              پیام‌های چیپسی ({persianNumber(chips.length)})
            </button>
          </div>

          <button
            type="button"
            onClick={() => (activeTab === 'questions' ? handleOpenQuestionModal() : handleOpenChipModal())}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'questions' ? 'افزودن سوال' : 'افزودن چیپس'}</span>
          </button>
        </div>
      </div>

      {/* 1. QUESTIONS LIST VIEW */}
      {activeTab === 'questions' && (
        <div className="rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-xs">در حال بارگذاری سوالات...</div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs">سوالی ثبت نشده است.</div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      {persianNumber(idx + 1)}
                    </span>
                    <span className="font-black text-white text-sm">{q.prompt}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/40 font-mono">
                      {q.category}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                      <b>گزینه الف:</b> {q.options?.[0]?.text}
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                      <b>گزینه ب:</b> {q.options?.[1]?.text}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionModal(q)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. CHIP SUGGESTIONS LIST VIEW */}
      {activeTab === 'chips' && (
        <div className="rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-xs">در حال بارگذاری پیام‌های پیشنهادی...</div>
          ) : chips.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs">پیامی ثبت نشده است.</div>
          ) : (
            chips.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      c.type === 'agreed'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {c.type === 'agreed' ? <Flame className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs leading-relaxed truncate">{c.text}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                      <span>حالت: {c.type === 'agreed' ? '🔥 هم‌نظر' : '⚔️ اختلاف‌نظر'}</span>
                      <span>•</span>
                      <span>گیرنده: {c.user_target === 'user1' ? 'کاربر اول' : c.user_target === 'user2' ? 'کاربر دوم' : 'هر دو'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenChipModal(c)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChip(c.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black mb-3">{editingQuestion ? 'ویرایش سوال' : 'افزودن سوال جدید'}</h3>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">دسته‌بندی:</label>
                <select
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-white focus:outline-none"
                >
                  <option value="daily_cringe">daily_cringe (رفتارهای روی مخ روزمره)</option>
                  <option value="chat_crimes">chat_crimes (جنایات چتی)</option>
                  <option value="dating_fails">dating_fails (فاجعه‌های قرار اول)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">صورت سوال (با لحن طنز و تیز):</label>
                <textarea
                  rows={3}
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="مثلاً: کدوم حرکت تو چت باید پیگرد قانونی داشته باشه؟"
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">متن گزینه الف:</label>
                <input
                  type="text"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  placeholder="گزینه اول..."
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">متن گزینه ب:</label>
                <input
                  type="text"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  placeholder="گزینه دوم..."
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer mt-2"
              >
                {actionLoading ? 'در حال ذخیره...' : 'ذخیره سوال'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHIP MODAL */}
      {isChipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setIsChipModalOpen(false)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black mb-3">{editingChip ? 'ویرایش پیام پیشنهادی' : 'افزودن پیام پیشنهادی جدید'}</h3>

            <form onSubmit={handleSaveChip} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/70 font-bold mb-1">سناریو و وضعیت:</label>
                  <select
                    value={chipType}
                    onChange={(e) => setChipType(e.target.value as any)}
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-2.5 text-white focus:outline-none"
                  >
                    <option value="agreed">🔥 هر دو هم‌نظر</option>
                    <option value="conflict">⚔️ اختلاف‌نظر (دعوا)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">نمایش برای کدام طرف:</label>
                  <select
                    value={chipTarget}
                    onChange={(e) => setChipTarget(e.target.value as any)}
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-2.5 text-white focus:outline-none"
                  >
                    <option value="all">هر دو کاربر (رندوم)</option>
                    <option value="user1">فقط کاربر اول</option>
                    <option value="user2">فقط کاربر دوم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">متن پیام پیشنهادی چیپس (با لحن صمیمی و محاوره‌ای):</label>
                <textarea
                  rows={3}
                  value={chipText}
                  onChange={(e) => setChipText(e.target.value)}
                  placeholder="مثلاً: پشمام جفتمون همینو زدیم! دقیقاً سر این حرکت که گفتی بارها قاطی کردم 😂"
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer mt-2"
              >
                {actionLoading ? 'در حال ذخیره...' : 'ذخیره پیام پیشنهادی'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
