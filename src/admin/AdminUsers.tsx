import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserX,
  UserCheck,
  Coins,
  Send,
  Eye,
  Crown,
  ShieldCheck,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { UserAvatar } from '../components/UserAvatar';
import { fetchAdminApi } from './adminApi';

interface AdminUsersProps {
  users: any[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onRefresh: () => void;
  onPageChange: (p: number) => void;
  onFilterChange: (filters: any) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  total,
  page,
  limit,
  loading,
  onRefresh,
  onPageChange,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedPro, setSelectedPro] = useState('all');
  const [selectedBanned, setSelectedBanned] = useState('all');

  // Modals state
  const [detailUser, setDetailUser] = useState<any | null>(null);
  const [coinUser, setCoinUser] = useState<any | null>(null);
  const [coinAmount, setCoinAmount] = useState<string>('10');
  const [msgUser, setMsgUser] = useState<any | null>(null);
  const [directMsgText, setDirectMsgText] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchTerm,
      gender: selectedGender,
      isPro: selectedPro === 'all' ? undefined : selectedPro,
      isBanned: selectedBanned === 'all' ? undefined : selectedBanned,
    });
  };

  // Actions
  const handleToggleBan = async (user: any) => {
    if (!confirm(`آیا از ${user.is_banned ? 'رفع مسدودیت' : 'مسدودسازی'} این کاربر اطمینان دارید؟`)) return;
    setActionLoading(true);
    const res = await fetchAdminApi('update_user_action', 'POST', {
      userId: user.id,
      type: user.is_banned ? 'unban' : 'ban',
      value: 'تخلف توسط ادمین',
    });
    setActionLoading(false);
    if (res.ok) {
      showToast(res.message);
      onRefresh();
    }
  };

  const handleAdjustCoins = async () => {
    if (!coinUser || !coinAmount) return;
    setActionLoading(true);
    const res = await fetchAdminApi('update_user_action', 'POST', {
      userId: coinUser.id,
      type: 'adjust_coins',
      value: parseInt(coinAmount, 10),
    });
    setActionLoading(false);
    if (res.ok) {
      showToast(res.message);
      setCoinUser(null);
      onRefresh();
    }
  };

  const handleSendDirectMessage = async () => {
    if (!msgUser || !directMsgText.trim()) return;
    setActionLoading(true);
    const res = await fetchAdminApi('update_user_action', 'POST', {
      userId: msgUser.id,
      type: 'send_direct_message',
      messageText: directMsgText.trim(),
    });
    setActionLoading(false);
    if (res.ok) {
      showToast('پیام در تلگرام ارسال شد.');
      setMsgUser(null);
      setDirectMsgText('');
    } else {
      alert('خطا در ارسال پیام تلگرام: ' + (res.error || 'ناشناخته'));
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg animate-bounce">
          {feedbackToast}
        </div>
      )}

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام‌کاربری یا شهر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 rounded-2xl bg-white/5 border border-white/10 px-3.5 pe-9 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-white/40 absolute end-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Gender Filter */}
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="h-10 rounded-2xl bg-[#1a1b2e] border border-white/10 px-3 text-xs text-white focus:outline-none"
        >
          <option value="all">همه جنسیت‌ها</option>
          <option value="male">آقا</option>
          <option value="female">خانم</option>
        </select>

        {/* Pro Filter */}
        <select
          value={selectedPro}
          onChange={(e) => setSelectedPro(e.target.value)}
          className="h-10 rounded-2xl bg-[#1a1b2e] border border-white/10 px-3 text-xs text-white focus:outline-none"
        >
          <option value="all">همه اشتراک‌ها</option>
          <option value="true">فقط VIP Pro</option>
          <option value="false">فقط رایگان</option>
        </select>

        {/* Banned Filter */}
        <select
          value={selectedBanned}
          onChange={(e) => setSelectedBanned(e.target.value)}
          className="h-10 rounded-2xl bg-[#1a1b2e] border border-white/10 px-3 text-xs text-white focus:outline-none"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="true">مسدودشده‌ها</option>
          <option value="false">فعال‌ها</option>
        </select>

        <button
          type="submit"
          className="h-10 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          اعمال فیلتر
        </button>
      </form>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-white/90">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.06] text-[11px] font-bold">
              <tr>
                <th className="p-3.5">کاربر</th>
                <th className="p-3.5">اطلاعات فردی</th>
                <th className="p-3.5">سکونت</th>
                <th className="p-3.5">وضعیت پرو / دعوت</th>
                <th className="p-3.5">سکه</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">در حال بارگذاری لیست کاربران...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">کاربری با این مشخصات یافت نشد.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Profile Cell */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar src={u.photos?.[0]} name={u.name} size="sm" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <span>{u.name}</span>
                            {u.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <span className="text-[10px] text-white/40 font-mono">@{u.username || u.telegram_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Personal Info */}
                    <td className="p-3.5">
                      <div>
                        <span>{u.gender === 'female' ? 'خانم' : 'آقا'}</span>
                        {u.age ? <span> • {persianNumber(u.age)} سال</span> : null}
                      </div>
                      <span className="text-[10px] text-white/40">{u.job || 'شغل ثبت نشده'}</span>
                    </td>

                    {/* Location */}
                    <td className="p-3.5">
                      <span>{u.city || u.province || 'ثبت نشده'}</span>
                    </td>

                    {/* Pro & Invite status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {u.is_pro ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                            <Crown className="w-3 h-3 fill-amber-400" />
                            <span>Pro</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">رایگان</span>
                        )}
                        <span className="text-[10px] text-purple-300 font-bold">({persianNumber(u.invite_count || 0)} دعوت)</span>
                      </div>
                    </td>

                    {/* Coins */}
                    <td className="p-3.5 font-bold text-amber-300 font-mono">
                      {persianNumber(u.coins || 0)} 🪙
                    </td>

                    {/* Status (Banned/Active) */}
                    <td className="p-3.5">
                      {u.is_banned ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                          مسدود
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                          فعال
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail Modal */}
                        <button
                          type="button"
                          onClick={() => setDetailUser(u)}
                          className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="مشاهده جزئیات پروفایل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Adjust Coins */}
                        <button
                          type="button"
                          onClick={() => setCoinUser(u)}
                          className="w-7 h-7 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="شارژ / کسر سکه"
                        >
                          <Coins className="w-3.5 h-3.5" />
                        </button>

                        {/* Send Direct Telegram Message */}
                        <button
                          type="button"
                          onClick={() => setMsgUser(u)}
                          className="w-7 h-7 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="ارسال پیام مستقیم در تلگرام"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban / Unban */}
                        <button
                          type="button"
                          onClick={() => handleToggleBan(u)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                            u.is_banned
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title={u.is_banned ? 'رفع مسدودیت' : 'مسدودسازی'}
                        >
                          {u.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-white/40">
            مجموع: {persianNumber(total)} کاربر • صفحه {persianNumber(page)} از {persianNumber(totalPages)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-lg bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setDetailUser(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-white/10">
              <UserAvatar src={detailUser.photos?.[0]} name={detailUser.name} size="lg" />
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>{detailUser.name}</span>
                  {detailUser.is_pro && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      VIP Pro
                    </span>
                  )}
                </h3>
                <span className="text-xs text-white/50">شناسه عددی تلگرام: {detailUser.telegram_id}</span>
              </div>
            </div>

            {/* Photos Gallery */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-white/60 block mb-2">تصاویر پروفایل:</span>
              {detailUser.photos && detailUser.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {detailUser.photos.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="user" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40 italic">تصویری بارگذاری نشده است.</p>
              )}
            </div>

            {/* Fields list */}
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] mb-4">
              <div><span className="text-white/40">شهر / استان:</span> {detailUser.city || 'ندارد'} / {detailUser.province || 'ندارد'}</div>
              <div><span className="text-white/40">تحصیلات:</span> {detailUser.education || 'ثبت نشده'}</div>
              <div><span className="text-white/40">شغل:</span> {detailUser.job || 'ثبت نشده'}</div>
              <div><span className="text-white/40">قد:</span> {detailUser.height_cm ? `${persianNumber(detailUser.height_cm)} سانتی‌متر` : 'نامشخص'}</div>
              <div><span className="text-white/40">امتیاز XP:</span> {persianNumber(detailUser.xp || 0)}</div>
              <div><span className="text-white/40">تعداد دعوت‌ها:</span> {persianNumber(detailUser.invite_count || 0)} نفر</div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-[11px] font-bold text-white/60 block mb-1">درباره کاربر (بیو):</span>
              <p className="text-xs text-white/80 p-3 bg-white/[0.03] rounded-xl leading-relaxed border border-white/[0.06]">
                {detailUser.bio || 'توضیحاتی ثبت نشده است.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Adjust Coins Modal */}
      {coinUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-sm bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setCoinUser(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black mb-1">شارژ / کسر سکه کاربر</h3>
            <p className="text-xs text-white/50 mb-3">کاربر: {coinUser.name} (موجودی فعلی: {persianNumber(coinUser.coins || 0)})</p>

            <input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="مقدار سکه (مثلاً 10+ یا 5-)"
              className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-xs text-white mb-3 focus:outline-none focus:border-amber-400 font-bold"
            />

            <div className="flex gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleAdjustCoins}
                className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'در حال اعمال...' : 'ثبت موجودی جدید'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Send Direct Telegram Message Modal */}
      {msgUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setMsgUser(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black mb-1">ارسال پیام خصوصی تلگرام</h3>
            <p className="text-xs text-white/50 mb-3">گیرنده: {msgUser.name} (شناسه: {msgUser.telegram_id})</p>

            <textarea
              rows={4}
              value={directMsgText}
              onChange={(e) => setDirectMsgText(e.target.value)}
              placeholder="متن پیام خود را بنویسید (پشتیبانی از تگ‌های HTML)..."
              className="w-full rounded-2xl bg-white/5 border border-white/15 p-3 text-xs text-white mb-3 focus:outline-none focus:border-sky-400 resize-none leading-relaxed"
            />

            <button
              type="button"
              disabled={actionLoading || !directMsgText.trim()}
              onClick={handleSendDirectMessage}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLoading ? 'در حال ارسال به تلگرام...' : 'ارسال مستقیم در ربات تلگرام'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
