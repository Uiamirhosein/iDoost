import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Radio,
  CreditCard,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Flame,
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminBroadcast } from './AdminBroadcast';
import { AdminFinance } from './AdminFinance';
import { AdminIcebreaker } from './AdminIcebreaker';
import { fetchAdminApi, ADMIN_AUTH_SECRET } from './adminApi';

export const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('idoost_admin_token') === ADMIN_AUTH_SECRET;
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Tab: 'overview' | 'users' | 'broadcast' | 'finance' | 'icebreaker'
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'broadcast' | 'finance' | 'icebreaker'>('overview');

  // Overview Data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false);

  // Users Data
  const [usersData, setUsersData] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState<number>(0);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersLimit] = useState<number>(15);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersFilters, setUsersFilters] = useState<any>({});

  // Finance Data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [financeLoading, setFinanceLoading] = useState<boolean>(false);

  // Icebreaker Data
  const [icebreakerQuestions, setIcebreakerQuestions] = useState<any[]>([]);
  const [icebreakerChips, setIcebreakerChips] = useState<any[]>([]);
  const [icebreakerEnabled, setIcebreakerEnabled] = useState<boolean>(true);
  const [icebreakerLoading, setIcebreakerLoading] = useState<boolean>(false);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'meo2026' || passwordInput.trim() === ADMIN_AUTH_SECRET) {
      localStorage.setItem('idoost_admin_token', ADMIN_AUTH_SECRET);
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('idoost_admin_token');
    setIsAuthenticated(false);
  };

  // Load Overview Data
  const loadOverview = async () => {
    setOverviewLoading(true);
    const res = await fetchAdminApi('get_overview');
    if (res.ok) setOverviewData(res.data);
    setOverviewLoading(false);
  };

  // Load Users Data
  const loadUsers = async (page = usersPage, filters = usersFilters) => {
    setUsersLoading(true);
    const res = await fetchAdminApi('get_users', 'GET', {
      page: page.toString(),
      limit: usersLimit.toString(),
      ...filters,
    });
    if (res.ok) {
      setUsersData(res.data.users);
      setUsersTotal(res.data.total);
    }
    setUsersLoading(false);
  };

  // Load Finance Data
  const loadFinance = async () => {
    setFinanceLoading(true);
    const res = await fetchAdminApi('get_transactions');
    if (res.ok) {
      setTransactions(res.data.transactions);
    }
    setFinanceLoading(false);
  };

  // Load Icebreaker Data
  const loadIcebreaker = async () => {
    setIcebreakerLoading(true);
    const res = await fetchAdminApi('get_icebreaker_data');
    if (res.ok) {
      setIcebreakerQuestions(res.data.questions || []);
      setIcebreakerChips(res.data.chips || []);
      setIcebreakerEnabled(res.data.isEnabled ?? true);
    }
    setIcebreakerLoading(false);
  };

  const handleToggleIcebreaker = async (newVal: boolean) => {
    setIcebreakerEnabled(newVal);
    const res = await fetchAdminApi('toggle_icebreaker_enabled', 'POST', { enabled: newVal });
    if (res.ok) {
      loadIcebreaker();
    }
  };

  // Initial tab loading
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'finance') loadFinance();
    if (activeTab === 'icebreaker') loadIcebreaker();
  }, [isAuthenticated, activeTab]);

  // If unauthenticated, show sleek Dark Admin Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0a0b14] text-white flex items-center justify-center p-4 font-['Vazirmatn',sans-serif]" dir="rtl">
        <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-[#121324] border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg text-white">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-lg font-black text-white">ورود به پنل مدیریت آی‌دوست</h1>
            <p className="text-xs text-white/50 mt-1">مسیر اختصاصی /meo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 pt-2">
            <input
              type="password"
              placeholder="رمز عبور مدیریت..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full h-11 rounded-2xl bg-white/5 border border-white/15 px-4 text-xs text-white text-center focus:outline-none focus:border-purple-500"
            />

            {authError && (
              <p className="text-[11px] text-rose-400 font-bold">رمز عبور وارد شده نادرست است.</p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer text-white"
            >
              احراز هویت و ورود
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090a12] text-[#e8e9ed] font-['Vazirmatn',sans-serif] flex flex-col selection:bg-purple-500/30" dir="rtl">
      {/* Top Admin Navbar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#0f101d]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-black text-sm">
            iD
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>پنل مدیریت و مانیتورینگ آی‌دوست</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                /meo
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/10"
          >
            <span>نمایش مینی‌اپ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
            title="خروج از حساب"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0 space-y-1.5">
          {[
            { id: 'overview', title: 'داشبورد تحلیلی', icon: LayoutDashboard },
            { id: 'users', title: 'مدیریت کاربران', icon: Users },
            { id: 'icebreaker', title: 'اتاق نفرت مشترک (Icebreaker)', icon: Flame },
            { id: 'broadcast', title: 'ارسال همگانی (Broadcast)', icon: Radio },
            { id: 'finance', title: 'مدیریت مالی و فیش‌ها', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full h-11 px-4 rounded-2xl flex items-center gap-3 font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 border border-purple-500/50 text-white shadow-md'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-white/40'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Panel View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverview data={overviewData} loading={overviewLoading} />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              users={usersData}
              total={usersTotal}
              page={usersPage}
              limit={usersLimit}
              loading={usersLoading}
              onRefresh={() => loadUsers(usersPage, usersFilters)}
              onPageChange={(p) => {
                setUsersPage(p);
                loadUsers(p, usersFilters);
              }}
              onFilterChange={(f) => {
                setUsersFilters(f);
                setUsersPage(1);
                loadUsers(1, f);
              }}
            />
          )}

          {activeTab === 'icebreaker' && (
            <AdminIcebreaker
              questions={icebreakerQuestions}
              chips={icebreakerChips}
              isEnabled={icebreakerEnabled}
              loading={icebreakerLoading}
              onRefresh={loadIcebreaker}
              onToggleEnabled={handleToggleIcebreaker}
            />
          )}

          {activeTab === 'broadcast' && <AdminBroadcast />}

          {activeTab === 'finance' && (
            <AdminFinance
              transactions={transactions}
              loading={financeLoading}
              onRefresh={loadFinance}
            />
          )}
        </main>
      </div>
    </div>
  );
};
