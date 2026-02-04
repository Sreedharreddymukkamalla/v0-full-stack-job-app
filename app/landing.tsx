'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Briefcase, MessageSquare, Users, Zap, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              A
            </div>
            <span className="text-xl font-bold text-foreground">AImploy</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Job Networking Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect, Apply, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Succeed</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            AImploy brings together job seekers and recruiters in one seamless platform. Network with professionals, discover opportunities, and grow your career with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Exploring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to succeed in your career</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Job Discovery</h3>
              </div>
              <p className="text-muted-foreground">Browse curated job listings, apply directly, and track your applications in one place.</p>
            </Card>
            
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Real-time Messaging</h3>
              </div>
              <p className="text-muted-foreground">Connect with recruiters and peers through instant messaging and threaded conversations.</p>
            </Card>
            
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">AI Agent</h3>
              </div>
              <p className="text-muted-foreground">Get personalized career advice, resume suggestions, and intelligent job matching powered by AI.</p>
            </Card>
            
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Professional Network</h3>
              </div>
              <p className="text-muted-foreground">Build meaningful connections with professionals across your industry and discover hidden opportunities.</p>
            </Card>
            
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Smart Matching</h3>
              </div>
              <p className="text-muted-foreground">Our advanced algorithms match you with roles that align with your skills and career goals.</p>
            </Card>
            
            <Card className="p-8 border border-border hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Application Tracking</h3>
              </div>
              <p className="text-muted-foreground">Track your applications, manage interview schedules, and never miss an opportunity.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 text-center border border-border">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Your Career?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of professionals on AImploy and unlock new opportunities.</p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Create Your Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                  A
                </div>
                <span className="font-bold text-foreground">AImploy</span>
              </div>
              <p className="text-sm text-muted-foreground">Connecting talent with opportunity.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Jobs</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Companies</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Messages</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Events</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AImploy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
