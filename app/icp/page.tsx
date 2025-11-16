'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernLayout } from '@/components/modern-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, X, LayoutDashboard } from 'lucide-react';

export default function ICPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [description, setDescription] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [roleTitles, setRoleTitles] = useState<string[]>([]);
  const [minEmployees, setMinEmployees] = useState('');
  const [maxEmployees, setMaxEmployees] = useState('');

  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  useEffect(() => {
    fetchICP();
  }, []);

  const fetchICP = async () => {
    try {
      const response = await fetch('/api/icp');
      if (response.ok) {
        const data = await response.json();
        const icp = data.icp;
        setDescription(icp.description || '');
        setIndustries(icp.industries || []);
        setLocations(icp.locations || []);
        setRoleTitles(icp.roleTitles || []);
        setMinEmployees(icp.minEmployees?.toString() || '');
        setMaxEmployees(icp.maxEmployees?.toString() || '');
      }
    } catch (err) {
      console.error('Failed to fetch ICP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = () => {
    if (industryInput.trim() && !industries.includes(industryInput.trim())) {
      setIndustries([...industries, industryInput.trim()]);
      setIndustryInput('');
    }
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !roleTitles.includes(roleInput.trim())) {
      setRoleTitles([...roleTitles, roleInput.trim()]);
      setRoleInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch('/api/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          industries,
          locations,
          roleTitles,
          minEmployees: minEmployees ? parseInt(minEmployees) : undefined,
          maxEmployees: maxEmployees ? parseInt(maxEmployees) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save ICP');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/search');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ICP Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Define your Ideal Customer Profile
          </p>
        </div>
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Target className="h-8 w-8 text-primary" />
            Ideal Customer Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Define your ideal customer to help AI qualify leads effectively
          </p>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ICP profile saved successfully! Redirecting to search...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>ICP Description</CardTitle>
              <CardDescription>
                Describe your ideal customer in detail. Be specific about industry, company type, pain points, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., We target B2B SaaS companies in the fintech space with 50-500 employees. Our ideal customers are experiencing challenges with payment processing automation and are looking to modernize their infrastructure..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </CardContent>
          </Card>

          {/* Industries */}
          <Card>
            <CardHeader>
              <CardTitle>Target Industries</CardTitle>
              <CardDescription>Add industries your ideal customers operate in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., SaaS, Fintech, Healthcare"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIndustry())}
                />
                <Button type="button" onClick={handleAddIndustry} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="gap-1">
                      {industry}
                      <button
                        type="button"
                        onClick={() => setIndustries(industries.filter((i) => i !== industry))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Target Locations</CardTitle>
              <CardDescription>Add geographic locations or regions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., San Francisco, United States, Europe"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                />
                <Button type="button" onClick={handleAddLocation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <Badge key={location} variant="secondary" className="gap-1">
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
            </CardContent>
          </Card>

          {/* Role Titles */}
          <Card>
            <CardHeader>
              <CardTitle>Target Role Titles</CardTitle>
              <CardDescription>Add job titles of decision-makers you want to reach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., CTO, VP of Engineering, Head of Sales"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                />
                <Button type="button" onClick={handleAddRole} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {roleTitles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {roleTitles.map((role) => (
                    <Badge key={role} variant="secondary" className="gap-1">
                      {role}
                      <button
                        type="button"
                        onClick={() => setRoleTitles(roleTitles.filter((r) => r !== role))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Size */}
          <Card>
            <CardHeader>
              <CardTitle>Company Size</CardTitle>
              <CardDescription>Define the employee count range (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minEmployees">Min Employees</Label>
                  <Input
                    id="minEmployees"
                    type="number"
                    placeholder="e.g., 50"
                    value={minEmployees}
                    onChange={(e) => setMinEmployees(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEmployees">Max Employees</Label>
                  <Input
                    id="maxEmployees"
                    type="number"
                    placeholder="e.g., 500"
                    value={maxEmployees}
                    onChange={(e) => setMaxEmployees(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save ICP Profile'}
            </Button>
          </div>
        </form>
      </div>
    </ModernLayout>
  );
}

