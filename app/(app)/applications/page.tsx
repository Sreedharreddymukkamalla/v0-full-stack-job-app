'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Upload, X } from 'lucide-react';

export default function ApplicationDetailsPage() {
  const [customFields, setCustomFields] = useState<Array<{ name: string; value: string }>>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    resume: null as File | null,
  });

  const addCustomField = () => {
    if (newFieldName && newFieldValue) {
      setCustomFields([...customFields, { name: newFieldName, value: newFieldValue }]);
      setNewFieldName('');
      setNewFieldValue('');
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const isFormValid = formData.fullName.trim() !== '' && 
                      formData.email.trim() !== '' && 
                      formData.phone.trim() !== '';

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Application Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            These fields are used to auto-fill job applications. Required fields are marked.
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Full name"
                className="h-11"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="h-11"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                type="tel"
                placeholder="Phone"
                className="h-11"
                required
                pattern="[0-9+\-\s\(\)]+"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Location"
                className="h-11"
              />
            </div>

            {/* Resume URL */}
            <div className="space-y-2">
              <Label htmlFor="resumeUrl" className="text-sm font-semibold">
                Resume URL <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://"
                  className="h-11 flex-1"
                  required
                />
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('[v0] Resume file selected:', file.name, file.type);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-transparent whitespace-nowrap"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload resume
                </Button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-semibold">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                className="h-11"
              />
            </div>

            {/* Portfolio */}
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-sm font-semibold">
                Portfolio
              </Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                className="h-11"
              />
            </div>

            {/* Visa Status / Work Authorization */}
            <div className="space-y-2">
              <Label htmlFor="visaStatus" className="text-sm font-semibold">
                Visa Status / Work Authorization
              </Label>
              <Select>
                <SelectTrigger id="visaStatus" className="h-11">
                  <SelectValue placeholder="Select visa status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">US Citizen</SelectItem>
                  <SelectItem value="green-card">Green Card Holder</SelectItem>
                  <SelectItem value="h1b">H1B Visa</SelectItem>
                  <SelectItem value="opt">OPT</SelectItem>
                  <SelectItem value="cpt">CPT</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="require-sponsorship">Require Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                {customFields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={field.name}
                      readOnly
                      className="h-11 flex-1"
                      placeholder="Field name"
                    />
                    <Input
                      value={field.value}
                      readOnly
                      className="h-11 flex-1"
                      placeholder="Value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomField(index)}
                      className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Another Field */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-sm font-semibold">Add another field</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Field name (e.g., github, cover_letter)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="h-11 flex-1"
                />
                <Input
                  placeholder="Value"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="h-11 flex-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addCustomField}
                className="bg-transparent text-primary"
              >
                Add field
              </Button>
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={!isFormValid}
              >
                Save Application Details
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
