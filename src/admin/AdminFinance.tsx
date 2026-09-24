import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Check,
  X,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';
import { fetchAdminApi } from './adminApi';

interface AdminFinanceProps {
  transactions: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ transactions, loading, onRefresh }) => {
  const [detailTx, setDetailTx] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleReview = async (transactionId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    const res = await fetchAdminApi('review_transaction', 'POST', {
      transactionId,
      status,
      adminNote,
    });
    setActionLoading(false);
    if (res.ok) {
      showToast(res.message);
      setDetailTx(null);
      setAdminNote('');
      onRefresh();
    } else {
      alert('خطا در بررسی تراکنش: ' + res.error);
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

      {/* Header Info Banner */}
      <div className="p-4 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-black text-white">مدیریت تراکنش‌های مالی و تایید فیش کارت‌به‌کارت</h3>
        </div>
        <span className="text-xs text-white/50">
          مجموع تراکنش‌ها: {persianNumber(transactions.length)} مورد
        </span>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-white/90">
            <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.06] text-[11px] font-bold">
              <tr>
                <th className="p-3.5">شناسه / کاربر</th>
                <th className="p-3.5">مبلغ</th>
                <th className="p-3.5">روش پرداخت</th>
                <th className="p-3.5">کد پیگیری / رسید</th>
                <th className="p-3.5">تاریخ ثبت</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">در حال بارگذاری تراکنش‌ها...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">تراکنشی جهت نمایش وجود ندارد.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{tx.users?.name || 'کاربر سیستم'}</div>
                      <span className="text-[10px] text-white/40 font-mono">@{tx.users?.username || tx.telegram_id}</span>
                    </td>

                    <td className="p-3.5 font-bold text-amber-300">
                      {persianNumber(Number(tx.amount).toLocaleString('fa-IR'))} تومان
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'zarinpal' ? 'bg-sky-500/15 text-sky-300' : 'bg-purple-500/15 text-purple-300'
                      }`}>
                        {tx.type === 'zarinpal' ? 'درگاه زرین‌پال' : 'کارت‌به‌کارت دستی'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px]">
                      {tx.ref_id || tx.tracking_code || '---'}
                    </td>

                    <td className="p-3.5 text-white/50 text-[11px]">
                      {new Date(tx.created_at).toLocaleDateString('fa-IR')}
                    </td>

                    <td className="p-3.5">
                      {tx.status === 'approved' || tx.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تایید شده</span>
                        </span>
                      ) : tx.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>رد شده</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>در انتظار بررسی</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailTx(tx);
                          setAdminNote(tx.admin_note || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
                      >
                        بررسی فیش
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-[#141525] border border-white/10 rounded-3xl p-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setDetailTx(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black mb-3">بررسی و تایید تراکنش</h3>

            <div className="space-y-3 text-xs mb-4">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div><span className="text-white/40">نام کاربر:</span> <b>{detailTx.users?.name || 'کاربر'}</b></div>
                <div><span className="text-white/40">شناسه تلگرام:</span> <b className="font-mono">{detailTx.telegram_id}</b></div>
                <div><span className="text-white/40">مبلغ واریزی:</span> <b className="text-amber-300 text-sm">{persianNumber(Number(detailTx.amount).toLocaleString('fa-IR'))} تومان</b></div>
                <div><span className="text-white/40">شماره کارت واریزکننده:</span> <b className="font-mono">{detailTx.card_number || '---'}</b></div>
                <div><span className="text-white/40">نام صاحب کارت:</span> <b>{detailTx.card_holder || '---'}</b></div>
              </div>

              {/* Receipt Image Preview */}
              {detailTx.receipt_image_url && (
                <div>
                  <span className="text-[11px] font-bold text-white/60 block mb-1.5">تصویر فیش ارسالی:</span>
                  <div className="rounded-2xl overflow-hidden border border-white/15 max-h-56">
                    <img src={detailTx.receipt_image_url} alt="receipt" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 mb-1">یادداشت مدیر (اختیاری):</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="علت تایید یا رد..."
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-3 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReview(detailTx.id, 'approved')}
                className="h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>تایید فیش و فعال‌سازی پرو</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReview(detailTx.id, 'rejected')}
                className="h-11 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>رد فیش واریزی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
