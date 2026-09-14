import React from 'react';
import { motion } from 'motion/react';
import { Compass, History, User } from 'lucide-react';
import { ActiveTab } from '../types';
import { persianNumber } from '../utils/persianNumbers';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount?: number;
  matchesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  historyCount = 0,
  matchesCount,
}) => {
  const badgeCount = historyCount || matchesCount || 0;
  const tabs = [
    {
      id: 'explore' as ActiveTab,
      label: 'صفحه اصلی',
      icon: Compass,
    },
    {
      id: 'history' as ActiveTab,
      label: 'تاریخچه چت‌ها',
      icon: History,
      badge: badgeCount,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'پروفایل من',
      icon: User,
    },
  ];

  return (
    <nav className="w-full bg-[#0f1017]/95 backdrop-blur-lg border-t border-white/[0.08] px-6 py-2 shrink-0 select-none z-20">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 group"
              aria-label={tab.label}
            >
              {/* Active Tab Background Pill Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-2xl bg-purple-500/15 border border-purple-500/25"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center z-10 mb-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'text-purple-300 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                      : 'text-white/40 group-hover:text-white/70'
                  }`}
                />

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                    {persianNumber(tab.badge)}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium z-10 transition-colors ${
                  isActive ? 'text-purple-200 font-semibold' : 'text-white/40 group-hover:text-white/70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
