import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Brain, TrendingUp, Shield, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">WowLead</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-6 gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Sparkles className="h-3 w-3" />
            AI-Powered Lead Intelligence
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find Perfect B2B Leads
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Qualified by AI
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Stop wasting time on bad leads. WowLead combines People Data Labs with GPT-4
            to find and score prospects that perfectly match your ICP.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 text-base">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • 1,000 free credits
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Everything you need to find quality leads
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powered by cutting-edge AI and premium B2B data
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 mb-4">
                  <Target className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">ICP Matching</h3>
                <p className="text-gray-600 leading-relaxed">
                  Define your Ideal Customer Profile once. Our AI automatically scores every lead against it.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 mb-4">
                  <Brain className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Qualification</h3>
                <p className="text-gray-600 leading-relaxed">
                  GPT-4 analyzes each lead and provides detailed reasoning for every score (0-100).
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200 mb-4">
                  <Shield className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">LinkedIn Verified</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cross-check data accuracy with real LinkedIn profiles. Flag outdated or incorrect information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access millions of B2B contacts from People Data Labs with emails and LinkedIn profiles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 mb-4">
                  <Sparkles className="h-6 w-6 text-red-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Filtering</h3>
                <p className="text-gray-600 leading-relaxed">
                  Filter by title, location, company size, and industry. Find exactly who you're looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 mb-4">
                  <Zap className="h-6 w-6 text-indigo-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Export</h3>
                <p className="text-gray-600 leading-relaxed">
                  Export qualified leads to CSV with one click. Integrate with your CRM or outreach tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">
            Why B2B teams choose WowLead
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10x</div>
              <p className="text-gray-600">Faster lead qualification</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <p className="text-gray-600">Data accuracy with LinkedIn</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$1-5</div>
              <p className="text-gray-600">Per month for 1,000 leads</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Ready to find your perfect leads?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join modern B2B teams using AI to qualify leads automatically
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-gray-50 px-8 text-base shadow-xl">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-blue-100">
            Free trial • No credit card • 1,000 credits included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">WowLead</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 WowLead. Powered by PDL + OpenAI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
