'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Users,
  Target,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  Database,
  FileDown,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  hasLinkedIn?: boolean;
}

export function Sidebar({ userEmail, userName, hasLinkedIn }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Search Leads',
      href: '/search',
      icon: Search,
      badge: 'AI',
    },
    {
      name: 'My Leads',
      href: '/leads',
      icon: Users,
      badge: null,
    },
    {
      name: 'ICP Profile',
      href: '/icp',
      icon: Target,
      badge: null,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: 'Soon',
    },
  ];

  const bottomNavigation = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Export Data',
      href: '/export',
      icon: FileDown,
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200/80 px-6">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              WowLead
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-lg p-0 hover:bg-gray-100"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 text-gray-600 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="border-b border-gray-200/80 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-semibold text-blue-700">
              {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              {hasLinkedIn && (
                <div className="mt-1.5 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-700">
                    LinkedIn Connected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badge === 'AI' ? 'default' : 'secondary'}
                        className={cn(
                          'h-5 px-1.5 text-xs font-medium',
                          item.badge === 'AI' &&
                            'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* AI Status Card */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">AI-Powered</p>
              <p className="mt-0.5 text-xs text-gray-600">
                Every lead scored with GPT-4
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="space-y-1 border-t border-gray-200/80 px-3 py-4">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Data Source Indicator */}
      {!collapsed && (
        <div className="border-t border-gray-200/80 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Database className="h-3.5 w-3.5" />
            <span>Powered by PDL + OpenAI</span>
          </div>
        </div>
      )}
    </div>
  );
}

