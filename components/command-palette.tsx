'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search,
  LayoutDashboard,
  Target,
  Users,
  Settings,
  FileText,
  Download,
  Plus,
  TrendingUp,
  Mail,
  Linkedin,
  Filter,
  BarChart3,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 shadow-2xl max-w-2xl">
        <Command className="rounded-lg border-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="mb-2">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
                <kbd className="ml-auto text-xs text-muted-foreground">⌘D</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/search'))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <Search className="h-4 w-4" />
                <span>Search Leads</span>
                <kbd className="ml-auto text-xs text-muted-foreground">⌘S</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/icp'))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <Target className="h-4 w-4" />
                <span>ICP Profile</span>
                <kbd className="ml-auto text-xs text-muted-foreground">⌘I</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="mb-2">
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <Plus className="h-4 w-4" />
                <span>Add New Lead</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <Download className="h-4 w-4" />
                <span>Export Leads</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <Filter className="h-4 w-4" />
                <span>Filter Results</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Links">
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <BarChart3 className="h-4 w-4" />
                <span>View Analytics</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <TrendingUp className="h-4 w-4" />
                <span>Top Performers</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

