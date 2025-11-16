'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CommandPalette } from '@/components/command-palette';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Command,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Zap,
  Wallet,
  Plus,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New high-quality lead',
      description: 'John Doe from Tech Corp matches your ICP',
      time: '5m ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'AI scoring complete',
      description: '25 leads have been qualified',
      time: '1h ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'LinkedIn verification',
      description: '12 profiles verified successfully',
      time: '2h ago',
      type: 'success',
    },
  ];

  const unreadCount = notifications.length;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        {/* Search Button */}
        <div className="flex-1 max-w-">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Search or jump to...</span>
            <span className="md:hidden">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center gap-4">
         
          <div className="h-6 w-px bg-border" />
         
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet/Credits */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-lg">
                <Wallet className="h-4 w-4" />
                <span className="hidden md:inline">750 Credits</span>
                <span className="md:hidden">750</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="flex items-center justify-between">
                  <span>AI Credits</span>
                  <Badge variant="secondary">Pro Plan</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Available Credits</span>
                  <span className="text-2xl font-bold text-primary">750</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Used: 250</span>
                    <span>Total: 1000</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lead searches</span>
                    <span className="font-medium">5 credits/search</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI scoring</span>
                    <span className="font-medium">2 credits/lead</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">LinkedIn verify</span>
                    <span className="font-medium">3 credits/check</span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>Buy More Credits</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border" />
          {/* Command Center */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="relative"
          >
            <Command className="h-5 w-5" />
            <span className="sr-only">Command Center</span>
          </Button> */}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-lg">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="ml-auto">
                  {unreadCount} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                    <div className="flex w-full items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {notification.time}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

