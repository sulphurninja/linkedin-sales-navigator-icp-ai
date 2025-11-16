'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModernLayout } from '@/components/modern-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Trash2, 
  Filter, 
  Target,
  TrendingUp,
  Users,
  Brain,
  Zap,
  Award,
  Activity,
  Mail,
  Linkedin,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  title: string;
  companyName: string;
  location: string;
  linkedinUrl: string;
  aiFitScore: number;
  aiFitLabel: 'good' | 'maybe' | 'bad';
  aiReason: string;
  aiTags: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [hasICP, setHasICP] = useState(false);

  useEffect(() => {
    fetchLeads();
    checkICP();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkICP = async () => {
    try {
      const res = await fetch('/api/icp');
      if (res.ok) {
        const data = await res.json();
        setHasICP(!!data.icp);
      }
    } catch (error) {
      console.error('Failed to check ICP:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter((l) => l._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/leads/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export leads:', error);
    }
  };

  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterLabel === 'all' || lead.aiFitLabel === filterLabel;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.aiFitScore - a.aiFitScore);

  // Calculate metrics
  const goodLeads = leads.filter((l) => l.aiFitLabel === 'good').length;
  const maybeLeads = leads.filter((l) => l.aiFitLabel === 'maybe').length;
  const badLeads = leads.filter((l) => l.aiFitLabel === 'bad').length;
  const leadsWithEmail = leads.filter((l) => l.email).length;
  const leadsWithPhone = leads.filter((l) => l.phone).length;
  const leadsWithLinkedIn = leads.filter((l) => l.linkedinUrl).length;
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.aiFitScore, 0) / leads.length) : 0;

  // Chart data
  const scoreDistribution = [
    { range: '90-100', count: leads.filter(l => l.aiFitScore >= 90).length },
    { range: '80-89', count: leads.filter(l => l.aiFitScore >= 80 && l.aiFitScore < 90).length },
    { range: '70-79', count: leads.filter(l => l.aiFitScore >= 70 && l.aiFitScore < 80).length },
    { range: '60-69', count: leads.filter(l => l.aiFitScore >= 60 && l.aiFitScore < 70).length },
    { range: '50-59', count: leads.filter(l => l.aiFitScore >= 50 && l.aiFitScore < 60).length },
    { range: '<50', count: leads.filter(l => l.aiFitScore < 50).length },
  ];

  const pieData = [
    { name: 'Good Fit', value: goodLeads, color: '#10b981' },
    { name: 'Maybe', value: maybeLeads, color: '#f59e0b' },
    { name: 'Poor Fit', value: badLeads, color: '#ef4444' },
  ];

  // Mock timeline data (last 7 days)
  const timelineData = [
    { day: 'Mon', leads: 8 },
    { day: 'Tue', leads: 12 },
    { day: 'Wed', leads: 15 },
    { day: 'Thu', leads: 10 },
    { day: 'Fri', leads: 18 },
    { day: 'Sat', leads: 6 },
    { day: 'Sun', leads: 9 },
  ];

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bad':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">AI-Powered Lead Intelligence</span>
              </div>
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <p className="mt-2 text-primary-foreground/80 max-w-2xl">
                Your AI assistant has analyzed {leads.length} leads with an average fit score of {avgScore}/100.
                {goodLeads > 0 && ` You have ${goodLeads} high-quality prospects ready to contact.`}
              </p>
              
              <div className="mt-6 flex items-center gap-4">
                <Link href="/search">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90 shadow-lg">
                    <Search className="mr-2 h-5 w-5" />
                    Find New Leads
                  </Button>
                </Link>
                {!hasICP && (
                  <Link href="/icp">
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      <Target className="mr-2 h-5 w-5" />
                      Define ICP
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                  <Brain className="h-16 w-16 text-primary-foreground" />
                </div>
                <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ICP Alert */}
        {!hasICP && (
          <Alert className="border-amber-200 bg-amber-50">
            <Target className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <span className="font-medium">Define your ICP</span> to get more accurate AI lead scoring.{' '}
              <Link href="/icp" className="font-semibold underline">
                Create ICP Profile →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{leads.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{leadsWithEmail} with emails</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Good Fit</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{goodLeads}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">High priority</p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg AI Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{avgScore}</p>
                  <p className="text-xs text-gray-500 mt-1">Out of 100</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Info</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{leadsWithEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{leadsWithEmail} emails</p>
                    <span className="text-xs text-gray-300">•</span>
                    <p className="text-xs text-gray-500">{leadsWithPhone} phones</p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Score Distribution Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription className="mt-1">AI fit scores across all leads</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Quality Pie Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Lead Quality
                  </CardTitle>
                  <CardDescription className="mt-1">Breakdown by AI assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity This Week
            </CardTitle>
            <CardDescription>Leads added over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
                <CardDescription>Your saved and qualified prospects</CardDescription>
              </div>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterLabel} onValueChange={setFilterLabel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="good">Good Fit</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="bad">Poor Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No leads found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search for new leads</p>
                <Link href="/search" className="mt-4">
                  <Button className="gap-2">
                    <Search className="h-4 w-4" />
                    Search New Leads
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Lead</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Company</TableHead>
                      <TableHead className="font-semibold">Score</TableHead>
                      <TableHead className="font-semibold">Fit</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.slice(0, 10).map((lead) => (
                      <TableRow key={lead._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{lead.fullName}</div>
                            <div className="mt-1 space-y-1">
                              {lead.email ? (
                                <div className="text-xs text-green-600 flex items-center gap-1.5">
                                  <Mail className="h-3 w-3" />
                                  <span className="font-medium">{lead.email}</span>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Mail className="h-3 w-3" />
                                  <span>No email</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="text-xs text-green-600 flex items-center gap-1.5">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                  </svg>
                                  <span className="font-medium">{lead.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{lead.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{lead.companyName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full ${
                                  lead.aiFitScore >= 80
                                    ? 'bg-green-500'
                                    : lead.aiFitScore >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${lead.aiFitScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{lead.aiFitScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLabelColor(lead.aiFitLabel)} variant="outline">
                            {lead.aiFitLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lead.linkedinUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(lead.linkedinUrl, '_blank')}
                                title="View LinkedIn"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(lead._id)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
