import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/signin">
          <Button variant="ghost" className="mb-8 gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We collect several types of information from and about users of our service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Personal information (name, email address, phone number)</li>
              <li>Professional information (resume, work history, skills)</li>
              <li>Usage data (how you interact with our service)</li>
              <li>Device information (browser type, IP address)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Provide, maintain, and improve our services</li>
              <li>Match you with relevant job opportunities</li>
              <li>Send you updates and notifications</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
            <p className="text-foreground/80 leading-relaxed">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mt-4">
              <li>Employers when you apply for jobs</li>
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Other users as part of your public profile</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@aimploy.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
