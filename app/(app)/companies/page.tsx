'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Globe } from 'lucide-react';

const companies = [
  {
    id: 1,
    name: 'Vercel',
    logo: 'V',
    description: 'The React Framework for Production',
    location: 'San Francisco, CA',
    employees: '250+',
    website: 'vercel.com',
    openJobs: 12,
  },
  {
    id: 2,
    name: 'Stripe',
    logo: 'S',
    description: 'Developer-first payments infrastructure',
    location: 'San Francisco, CA',
    employees: '1000+',
    website: 'stripe.com',
    openJobs: 18,
  },
  {
    id: 3,
    name: 'Databricks',
    logo: 'D',
    description: 'Lakehouse platform for AI',
    location: 'San Francisco, CA',
    employees: '500+',
    website: 'databricks.com',
    openJobs: 15,
  },
];

export default function CompaniesPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground">Discover companies and explore opportunities</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="p-6 border-border hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
                  {company.logo}
                </div>
                <Button variant="outline" size="sm">Follow</Button>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{company.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{company.description}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {company.employees}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {company.website}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Badge variant="secondary">{company.openJobs} open roles</Badge>
                <Button size="sm" variant="ghost">View →</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
