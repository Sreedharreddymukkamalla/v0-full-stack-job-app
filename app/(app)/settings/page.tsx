'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, UserCircle, Shield, Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserIcon } from 'lucide-react'; // Declared UserIcon

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and settings</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Account Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Current Title</Label>
                  <Input id="title" placeholder="Senior Frontend Engineer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
                </div>

                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { id: 'jobs', label: 'Job Alerts', desc: 'Get notified about new job matches' },
                  { id: 'messages', label: 'Message Notifications', desc: 'Get notified when you receive messages' },
                  { id: 'connections', label: 'Connection Requests', desc: 'Get notified when someone wants to connect' },
                  { id: 'comments', label: 'Post Comments', desc: 'Get notified about comments on your posts' },
                ].map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-foreground">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'profile', label: 'Public Profile', desc: 'Allow others to view your profile' },
                  { id: 'activity', label: 'Activity Feed', desc: 'Show your activity to connections' },
                  { id: 'search', label: 'Search Engine', desc: 'Allow search engines to index your profile' },
                ].map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-foreground">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Password & Security</h3>
                <Button variant="outline" className="bg-transparent">Change Password</Button>
                <Button variant="outline" className="ml-2 bg-transparent">Two-Factor Authentication</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <h2 className="text-xl font-bold text-foreground">Theme Settings</h2>
                </div>
                <ThemeToggle />
              </div>
              <p className="text-muted-foreground">
                Choose how AImploy looks to you. Select a single theme, or sync with your system settings.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
