import React from 'react';
import {
  Users,
  UserCheck,
  HeartHandshake,
  DollarSign,
  Crown,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { persianNumber } from '../utils/persianNumbers';

interface AdminOverviewProps {
  data: any;
  loading: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="w-full flex items-center justify-center p-12 text-white/50 text-sm">
        در حال بارگذاری داده‌های داشبورد تحلیلی...
      </div>
    );
  }

  const kpis = data.kpis || {};
  const hourlyActivity = data.hourlyActivity || [];
  const demographics = data.demographics || [];

  const maxHourCount = Math.max(...hourlyActivity.map((h: any) => h.count), 1);
  const maxDemCount = Math.max(
    ...demographics.flatMap((d: any) => [d.male, d.female]),
    1
  );

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold">کل کاربران</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{persianNumber(kpis.totalUsers)}</span>
            <span className="text-[10px] text-emerald-400 flex items-center font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>رشد مداوم</span>
            </span>
          </div>
        </div>

        {/* DAU */}
        <div className="p-4 rounded-2xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold">فعال روزانه (DAU)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{persianNumber(kpis.dau)}</span>
            <span className="text-[10px] text-white/40">امروز آنلاین</span>
          </div>
        </div>

        {/* Matches Today */}
        <div className="p-4 rounded-2xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold">مچ‌های موفق امروز</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-pink-400">{persianNumber(kpis.todayMatches)}</span>
            <span className="text-[10px] text-white/40">گفتگوی موفق</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold">درآمد کل</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-300">
              {persianNumber(Number(kpis.totalRevenue).toLocaleString('fa-IR'))}
            </span>
            <span className="text-[10px] text-white/50">تومان</span>
          </div>
        </div>

        {/* VIP vs Free Ratio */}
        <div className="p-4 rounded-2xl bg-[#141525] border border-white/[0.08] shadow-md flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold">کاربران Pro / رایگان</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-400">{persianNumber(kpis.proUsers)} پرو</span>
            <span className="text-white/30">•</span>
            <span className="text-white/70">{persianNumber(kpis.freeUsers)} رایگان</span>
          </div>
        </div>
      </div>

      {/* 2. Hourly Activity Chart (Line/Area representation) */}
      <div className="p-5 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white">نمودار توزیع فعالیت ساعتی کاربران (شناسایی ساعات پیک)</h3>
          </div>
          <span className="text-[11px] text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
            پیک اصلی: ۲۱:۰۰ تا ۰۱:۰۰
          </span>
        </div>

        <div className="h-44 w-full flex items-end gap-1.5 pt-4 pb-2 px-1 overflow-x-auto hide-scrollbar">
          {hourlyActivity.map((h: any, idx: number) => {
            const heightPercent = Math.max(12, Math.round((h.count / maxHourCount) * 100));
            const isPeak = idx >= 20 || idx <= 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 min-w-[28px] group">
                <div className="w-full flex items-end justify-center h-32 relative">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                      isPeak
                        ? 'bg-gradient-to-t from-purple-600 via-pink-500 to-amber-400 shadow-[0_0_12px_rgba(236,72,153,0.35)]'
                        : 'bg-white/10 group-hover:bg-purple-500/50'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 px-1.5 py-0.5 rounded text-[10px] text-white whitespace-nowrap z-20">
                    {persianNumber(h.count)} نفر
                  </div>
                </div>
                <span className="text-[9px] text-white/40 font-mono scale-90">{h.hour.split(':')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Demographics: Age & Gender Distribution */}
      <div className="p-5 rounded-3xl bg-[#141525] border border-white/[0.08] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black text-white">توزیع جمعیتی کاربران بر اساس سن و جنسیت</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>آقایان</span>
            </span>
            <span className="flex items-center gap-1.5 text-pink-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span>خانم‌ها</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {demographics.map((item: any, idx: number) => {
            const maleWidth = Math.max(8, Math.round((item.male / maxDemCount) * 100));
            const femaleWidth = Math.max(8, Math.round((item.female / maxDemCount) * 100));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white/80">رده سنی {persianNumber(item.group)} سال</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-blue-300">{persianNumber(item.male)} آقا</span>
                    <span className="text-pink-300">{persianNumber(item.female)} خانم</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 h-3.5">
                  {/* Male Bar */}
                  <div className="w-full bg-white/[0.04] rounded-full overflow-hidden flex justify-end p-0.5">
                    <div
                      style={{ width: `${maleWidth}%` }}
                      className="h-full rounded-full bg-gradient-to-l from-blue-500 to-indigo-600 transition-all duration-500"
                    />
                  </div>

                  {/* Female Bar */}
                  <div className="w-full bg-white/[0.04] rounded-full overflow-hidden flex justify-start p-0.5">
                    <div
                      style={{ width: `${femaleWidth}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
