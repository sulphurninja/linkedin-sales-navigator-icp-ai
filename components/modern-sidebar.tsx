'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Target,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Users,
  TrendingUp,
  Brain,
  Zap,
  BarChart3,
  FileText,
  Star,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ModernSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Search Leads', href: '/search', icon: Search, badge: null },
    { name: 'My Leads', href: '/leads', icon: Users, badge: '24' },
    { name: 'ICP Profile', href: '/icp', icon: Target, badge: null },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
    { name: 'Saved Searches', href: '/saved', icon: Star, badge: '3' },
  ];

  const tools = [
    { name: 'AI Insights', href: '/insights', icon: Brain },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'History', href: '/history', icon: Clock },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userName = user?.name;
  const userEmail = user?.email;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">WowLead</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : ''
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : ''
                    )}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* AI Score Widget */}
        <div className="mx-3 mt-6 rounded-lg border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">AI Credits</p>
              <p className="text-xs text-muted-foreground">750 / 1000</p>
            </div>
          </div>
          <Progress value={75} className="h-1.5" />
        </div>

        {/* Quick Stats */}
        <div className="mx-3 mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-900 dark:text-green-100">Good Fits</span>
            </div>
            <span className="text-sm font-bold text-green-600">15</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Total Leads</span>
            </div>
            <span className="text-sm font-bold text-blue-600">156</span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Link href="/settings">
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </div>
        </Link>

        {/* User Info */}
        <div className="mt-2 rounded-lg bg-muted p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
