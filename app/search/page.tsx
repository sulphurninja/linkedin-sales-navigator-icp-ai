'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModernLayout } from '@/components/modern-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  X, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Filter,
  Mail,
  Linkedin,
  Building2,
  MapPin,
  Award,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Lead {
  apolloId: string;
  fullName: string;
  email: string;
  phone?: string;
  title: string;
  companyName: string;
  companyDomain: string;
  location: string;
  linkedinUrl: string;
  aiFitScore: number;
  aiFitLabel: 'good' | 'maybe' | 'bad';
  aiReason: string;
  aiTags: string[];
  alreadySaved?: boolean;
}

export default function SearchPage() {
  const [hasICP, setHasICP] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [titles, setTitles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  
  const [titleInput, setTitleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  
  // Results
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [savingLeads, setSavingLeads] = useState<Set<string>>(new Set());
  const [filterView, setFilterView] = useState<'all' | 'good' | 'maybe' | 'bad'>('all');

  useEffect(() => {
    checkICP();
  }, []);

  const checkICP = async () => {
    try {
      const response = await fetch('/api/icp');
      setHasICP(response.ok);
    } catch (err) {
      setHasICP(false);
    }
  };

  const companySizeOptions = [
    { value: '1,10', label: '1-10', icon: '👥' },
    { value: '11,50', label: '11-50', icon: '👥' },
    { value: '51,200', label: '51-200', icon: '🏢' },
    { value: '201,500', label: '201-500', icon: '🏢' },
    { value: '501,1000', label: '501-1K', icon: '🏭' },
    { value: '1001,5000', label: '1K-5K', icon: '🏭' },
    { value: '5001,10000', label: '5K-10K', icon: '🌐' },
    { value: '10001,10000000000', label: '10K+', icon: '🌐' },
  ];

  const handleAddTitle = () => {
    if (titleInput.trim() && !titles.includes(titleInput.trim())) {
      setTitles([...titles, titleInput.trim()]);
      setTitleInput('');
    }
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const toggleCompanySize = (size: string) => {
    if (companySizes.includes(size)) {
      setCompanySizes(companySizes.filter((s) => s !== size));
    } else {
      setCompanySizes([...companySizes, size]);
    }
  };

  const handleSearch = async () => {
    if (!hasICP) {
      setError('Please create an ICP profile first');
      return;
    }

    if (titles.length === 0 && locations.length === 0 && companySizes.length === 0) {
      setError('Please add at least one filter');
      return;
    }

    setError('');
    setSearching(true);
    setLeads([]);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titles: titles.length > 0 ? titles : undefined,
          locations: locations.length > 0 ? locations : undefined,
          companySizes: companySizes.length > 0 ? companySizes : undefined,
          perPage: 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Search failed');
      }

      const data = await response.json();
      setLeads(data.leads);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveLead = async (lead: Lead) => {
    if (lead.alreadySaved) return;

    setSavingLeads(new Set(savingLeads).add(lead.apolloId));

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save lead');
      }

      setLeads(
        leads.map((l) =>
          l.apolloId === lead.apolloId ? { ...l, alreadySaved: true } : l
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingLeads((prev) => {
        const next = new Set(prev);
        next.delete(lead.apolloId);
        return next;
      });
    }
  };

  const filteredLeads = leads
    .filter((lead) => filterView === 'all' || lead.aiFitLabel === filterView)
    .sort((a, b) => b.aiFitScore - a.aiFitScore);

  const stats = {
    total: leads.length,
    good: leads.filter((l) => l.aiFitLabel === 'good').length,
    maybe: leads.filter((l) => l.aiFitLabel === 'maybe').length,
    bad: leads.filter((l) => l.aiFitLabel === 'bad').length,
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lead Search</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered lead discovery and qualification
              </p>
            </div>
          </div>
        </div>

        {/* ICP Warning */}
        {!hasICP && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              You must create an ICP profile before searching.{' '}
              <Link href="/icp" className="font-semibold underline">
                Create ICP Profile →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Filters Sidebar */}
          <Card className="h-fit border-0 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Search Filters</CardTitle>
              </div>
              <CardDescription className="text-xs">Define your search criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Job Titles */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Job Titles</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., CTO, VP Eng"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTitle())}
                    className="rounded-lg"
                  />
                  <Button type="button" onClick={handleAddTitle} size="icon" className="rounded-lg shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {titles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {titles.map((title) => (
                      <Badge key={title} variant="secondary" className="gap-1 rounded-lg">
                        {title}
                        <button
                          type="button"
                          onClick={() => setTitles(titles.filter((t) => t !== title))}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Locations</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., San Francisco"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                    className="rounded-lg"
                  />
                  <Button type="button" onClick={handleAddLocation} size="icon" className="rounded-lg shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {locations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <Badge key={location} variant="secondary" className="gap-1 rounded-lg">
                        {location}
                        <button
                          type="button"
                          onClick={() => setLocations(locations.filter((l) => l !== location))}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Size */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Company Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {companySizeOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={companySizes.includes(option.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCompanySize(option.value)}
                      className="justify-start rounded-lg text-xs"
                    >
                      <span className="mr-1.5">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={searching || !hasICP} 
                className="w-full rounded-lg"
                size="lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Search & Qualify
                  </>
                )}
              </Button>

              {/* Active Filters Summary */}
              {(titles.length > 0 || locations.length > 0 || companySizes.length > 0) && (
                <div className="rounded-lg bg-muted/50 p-3 text-xs">
                  <p className="font-semibold mb-1">Active Filters:</p>
                  <p className="text-muted-foreground">
                    {titles.length} title{titles.length !== 1 ? 's' : ''} • {' '}
                    {locations.length} location{locations.length !== 1 ? 's' : ''} • {' '}
                    {companySizes.length} size{companySizes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Area */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Stats */}
            {leads.length > 0 && !searching && (
              <div className="grid gap-4 sm:grid-cols-4">
                <Card className="border-0 shadow-sm rounded-lg">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <Search className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm rounded-lg">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Good Fit</p>
                        <p className="text-2xl font-bold text-green-600">{stats.good}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600/30" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm rounded-lg">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Maybe</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.maybe}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-600/30" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm rounded-lg">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">Poor Fit</p>
                        <p className="text-2xl font-bold text-red-600">{stats.bad}</p>
                      </div>
                      <X className="h-8 w-8 text-red-600/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading State */}
            {searching && (
              <Card className="border-0 shadow-sm rounded-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Searching for leads...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI is analyzing and qualifying prospects
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    This may take 10-30 seconds
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!searching && leads.length === 0 && (
              <Card className="border-0 shadow-sm rounded-lg border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Ready to find leads</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Set your search filters and click "Search & Qualify" to discover qualified prospects
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results with Tabs */}
            {leads.length > 0 && !searching && (
              <Card className="border-0 shadow-sm rounded-lg">
                <CardHeader className="border-b border-border/50 pb-3">
                  <Tabs value={filterView} onValueChange={(v: any) => setFilterView(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 rounded-lg">
                      <TabsTrigger value="all" className="rounded-lg">All ({stats.total})</TabsTrigger>
                      <TabsTrigger value="good" className="rounded-lg">Good ({stats.good})</TabsTrigger>
                      <TabsTrigger value="maybe" className="rounded-lg">Maybe ({stats.maybe})</TabsTrigger>
                      <TabsTrigger value="bad" className="rounded-lg">Poor ({stats.bad})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {filteredLeads.map((lead, index) => (
                      <div 
                        key={lead.apolloId} 
                        className="p-6 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-6">
                          {/* AI Score Badge */}
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg ${
                              lead.aiFitLabel === 'good' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30' 
                                : lead.aiFitLabel === 'maybe' 
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30' 
                                : 'bg-red-100 text-red-700 dark:bg-red-950/30'
                            }`}>
                              {lead.aiFitScore}
                            </div>
                            <p className="text-xs text-muted-foreground">AI Score</p>
                          </div>

                          {/* Lead Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h4 className="text-lg font-semibold mb-1">{lead.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{lead.title}</p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  lead.aiFitLabel === 'good' 
                                    ? 'border-green-200 text-green-700 bg-green-50 dark:bg-green-950/20' 
                                    : lead.aiFitLabel === 'maybe' 
                                    ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/20' 
                                    : 'border-red-200 text-red-700 bg-red-50 dark:bg-red-950/20'
                                } rounded-lg capitalize`}
                              >
                                {lead.aiFitLabel} Fit
                              </Badge>
                            </div>

                            {/* Company & Location */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="font-medium">{lead.companyName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{lead.location}</span>
                              </div>
                            </div>

                            {/* AI Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {lead.aiTags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs rounded-lg">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* AI Reason */}
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {lead.aiReason}
                            </p>

                            {/* Verification & Contact Status */}
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                              {lead.linkedinUrl ? (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <Linkedin className="h-3.5 w-3.5" />
                                  <span className="font-medium">Verified</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-600">
                                  <Linkedin className="h-3.5 w-3.5" />
                                  <span>No Profile</span>
                                </div>
                              )}
                              
                              {lead.email ? (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="font-medium">{lead.email}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span>No Email</span>
                                </div>
                              )}

                              {lead.phone && (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                  </svg>
                                  <span className="font-medium">{lead.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {lead.alreadySaved ? (
                                <Button variant="outline" size="sm" disabled className="rounded-lg">
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                  Saved
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleSaveLead(lead)}
                                  size="sm"
                                  disabled={savingLeads.has(lead.apolloId)}
                                  className="rounded-lg"
                                >
                                  {savingLeads.has(lead.apolloId) ? (
                                    <>
                                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="mr-2 h-3.5 w-3.5" />
                                      Save Lead
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                                className="rounded-lg"
                              >
                                View Details
                              </Button>
                              {lead.linkedinUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(lead.linkedinUrl, '_blank')}
                                  className="rounded-lg"
                                >
                                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                  LinkedIn
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Lead Details Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl rounded-lg">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>Complete AI analysis and contact information</DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg font-bold text-xl ${
                    selectedLead.aiFitLabel === 'good' 
                      ? 'bg-green-100 text-green-700' 
                      : selectedLead.aiFitLabel === 'maybe' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedLead.aiFitScore}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold">{selectedLead.fullName}</h4>
                    <p className="text-sm text-muted-foreground">{selectedLead.title}</p>
                    <p className="text-sm font-medium mt-1">{selectedLead.companyName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{selectedLead.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    {selectedLead.email ? (
                      <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedLead.email}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not available</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    {selectedLead.phone ? (
                      <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {selectedLead.phone}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not available</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Company Domain</p>
                    <p className="text-sm font-medium">{selectedLead.companyDomain || 'Not available'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">AI Analysis</Label>
                  <p className="text-sm text-muted-foreground rounded-lg bg-muted/30 p-3">
                    {selectedLead.aiReason}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">AI Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.aiTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {selectedLead.linkedinUrl && (
                    <Button
                      onClick={() => window.open(selectedLead.linkedinUrl, '_blank')}
                      className="gap-2 rounded-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on LinkedIn
                    </Button>
                  )}
                  {!selectedLead.alreadySaved && (
                    <Button
                      variant="outline"
                      onClick={() => handleSaveLead(selectedLead)}
                      disabled={savingLeads.has(selectedLead.apolloId)}
                      className="gap-2 rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Save Lead
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ModernLayout>
  );
}
