import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/signin">
          <Button variant="ghost" className="mb-8 gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing and using AIMPLOY, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Permission is granted to temporarily use AIMPLOY for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on AIMPLOY</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-foreground/80 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Content</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post to the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclaimer</h2>
            <p className="text-foreground/80 leading-relaxed">
              The materials on AIMPLOY are provided on an 'as is' basis. AIMPLOY makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitations</h2>
            <p className="text-foreground/80 leading-relaxed">
              In no event shall AIMPLOY or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AIMPLOY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Revisions</h2>
            <p className="text-foreground/80 leading-relaxed">
              AIMPLOY may revise these terms of service at any time without notice. By using this service you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Information</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about these Terms, please contact us at support@aimploy.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
