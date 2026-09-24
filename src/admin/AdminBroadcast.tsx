import React, { useState } from 'react';
import {
  Send,
  Radio,
  Clock,
  Users,
  Image,
  Link,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { fetchAdminApi } from './adminApi';

export const AdminBroadcast: React.FC = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [segment, setSegment] = useState<'all' | 'offline3d' | 'pro' | 'free'>('all');
  const [scheduledAt, setScheduledAt] = useState('');

  // Inline buttons builder
  const [buttons, setButtons] = useState<Array<{ text: string; url: string }>>([]);
  const [btnText, setBtnText] = useState('');
  const [btnUrl, setBtnUrl] = useState('');

  // Progress State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{
    sent: number;
    failed: number;
    blocked: number;
    total: number;
    isCompleted: boolean;
  } | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddButton = () => {
    if (!btnText.trim() || !btnUrl.trim()) return;
    setButtons([...buttons, { text: btnText.trim(), url: btnUrl.trim() }]);
    setBtnText('');
    setBtnUrl('');
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleStartBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('لطفاً متن پیام برودکست را وارد کنید.');
      return;
    }

    setIsRunning(true);
    setProgress({ sent: 0, failed: 0, blocked: 0, total: 0, isCompleted: false });

    // Format buttons into Telegram inline_keyboard format
    const formattedButtons = buttons.map((b) => [{ text: b.text, url: b.url }]);

    // 1. Create Broadcast Job
    const createRes = await fetchAdminApi('create_broadcast', 'POST', {
      title,
      text: text.trim(),
      photoUrl: photoUrl.trim() || undefined,
      buttons: formattedButtons.length > 0 ? formattedButtons : undefined,
      segment,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    });

    if (!createRes.ok) {
      setIsRunning(false);
      showToast('خطا در ایجاد برودکست: ' + (createRes.error || 'ناشناخته'));
      return;
    }

    const campaignId = createRes.data.campaign.id;
    const totalTargets = createRes.data.totalTargets;
    setProgress((p: any) => ({ ...p, total: totalTargets }));

    if (scheduledAt) {
      setIsRunning(false);
      showToast('کمپین با موفقیت زمان‌بندی شد.');
      return;
    }

    // 2. Run Throttled Delivery Loop in Safe Batches (25 per batch, Rate-Limited < 30/s)
    let completed = false;
    while (!completed) {
      const batchRes = await fetchAdminApi('execute_broadcast_batch', 'POST', {
        campaignId,
        batchSize: 20,
      });

      if (!batchRes.ok) {
        showToast('خطا در ارسال بچ: ' + batchRes.error);
        break;
      }

      const pData = batchRes.data;
      setProgress({
        sent: pData.sent,
        failed: pData.failed,
        blocked: pData.blocked,
        total: pData.total,
        isCompleted: pData.isCompleted,
      });

      completed = pData.isCompleted;

      // Small throttle yield between batch calls
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsRunning(false);
    showToast('ارسال همگانی با موفقیت به پایان رسید.');
  };

  const processedCount = progress ? progress.sent + progress.failed + progress.blocked : 0;
  const progressPercent = progress && progress.total > 0 ? Math.min(100, Math.round((processedCount / progress.total) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* Broadcast Form (2 Cols) */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <Radio className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-black text-white">کمپین ارسال همگانی زمان‌بندی‌شده (Throttled Broadcast)</h3>
        </div>

        <form onSubmit={handleStartBroadcast} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-white/70 font-bold mb-1">عنوان کمپین (اختیاری جهت آرشیو):</label>
            <input
              type="text"
              placeholder="مثلاً: تخفیف ویژه عید یا اعلان قابلیت جدید"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Segment Selection */}
          <div>
            <label className="block text-white/70 font-bold mb-1">انتخاب سگمنت مخاطبان هدف:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', title: 'همه کاربران' },
                { id: 'offline3d', title: 'آفلاین > ۳ روز' },
                { id: 'pro', title: 'کاربران VIP Pro' },
                { id: 'free', title: 'کاربران عادی' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSegment(s.id as any)}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    segment === s.id
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text (HTML Supported) */}
          <div>
            <label className="block text-white/70 font-bold mb-1">متن پیام (پشتیبانی کامل از HTML):</label>
            <textarea
              rows={5}
              placeholder="متن پیام... (می‌توانید از <b>ضخیم</b> یا <i>ایتالیک</i> استفاده کنید)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-white focus:outline-none focus:border-purple-500 leading-relaxed font-sans resize-none"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-white/70 font-bold mb-1">لینک مستقیم تصویر (اختیاری):</label>
            <input
              type="text"
              placeholder="https://example.com/banner.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
              dir="ltr"
            />
          </div>

          {/* Inline Buttons Builder */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-bold text-purple-300 block">دکمه‌های شیشه‌ای اینلاین (URL Buttons):</span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="عنوان دکمه (مثلاً: ورود به ربات)"
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 px-2.5 text-white"
              />
              <input
                type="text"
                placeholder="https://t.me/idoostbot..."
                value={btnUrl}
                onChange={(e) => setBtnUrl(e.target.value)}
                className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 px-2.5 text-white font-mono text-[11px]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddButton}
                className="px-3 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold hover:bg-purple-500/30 transition-colors"
              >
                افزودن
              </button>
            </div>

            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {buttons.map((b, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 text-[11px]">
                    <span>{b.text}</span>
                    <button type="button" onClick={() => handleRemoveButton(idx)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Schedule time */}
          <div>
            <label className="block text-white/70 font-bold mb-1">زمان‌بندی ارسال (اختیاری):</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-white focus:outline-none text-xs"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isRunning || !text.trim()}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 disabled:opacity-40 text-white font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <span>در حال ارسال پیام‌ها به صف تلگرام...</span>
            ) : (
              <>
                <Send className="w-4 h-4 -rotate-45" />
                <span>{scheduledAt ? 'ثبت و زمان‌بندی کمپین' : 'شروع فوری ارسال همگانی'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Progress & Live Monitor (1 Col) */}
      <div className="p-5 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">مانیتورینگ زنده صف ارسال</h3>
          </div>

          {progress ? (
            <div className="space-y-4">
              {/* Progress Percentage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white/60">پیشرفت کل ارسال:</span>
                  <span className="text-purple-300">{persianNumber(progressPercent)}٪</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/40 block text-[10px]">موفق (ارسال شده)</span>
                  <span className="text-lg font-black text-emerald-400">{persianNumber(progress.sent)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/40 block text-[10px]">بلاک ربات (۴۰۳)</span>
                  <span className="text-lg font-black text-rose-400">{persianNumber(progress.blocked)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/40 block text-[10px]">سایر خطاها</span>
                  <span className="text-lg font-black text-amber-400">{persianNumber(progress.failed)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/40 block text-[10px]">کل مخاطبان</span>
                  <span className="text-lg font-black text-white">{persianNumber(progress.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-white/40 text-xs">
              کمپینی در حال اجرا نیست. با تکمیل فرم روبه‌رو می‌توانید ارسال را شروع کنید.
            </div>
          )}
        </div>

        {/* Safety Note from developerAmira repo logic */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
          ⚡ <b>ایمنی ضداسپم:</b> الگوریتم Throttling نرخ ارسال را زیر ۳۰ پیام در ثانیه نگه می‌دارد و در صورت دریافت خطای ۴۲۹ تلگرام، تا زمان انقضای Retry-After مکث می‌کند.
        </div>
      </div>
    </div>
  );
};
