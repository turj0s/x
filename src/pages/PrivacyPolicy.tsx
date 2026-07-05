import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Learn how UNICV collects, uses, and protects your personal information."
      />
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block mb-6">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            This page is maintained by the UNICV team to explain, in plain language, how UNICV
            actually works today and what data it handles. It is not a legal certification or an
            audit report — it describes the app's current features and practices.
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. What UNICV Is</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is a browser-based CV builder. It shows a curated library of CV templates,
                auto-detects your country to surface locally relevant formats, and lets you open any
                template in a built-in ONLYOFFICE editor to customize and download it. You can sign
                in with Google to save your CVs to a personal "My CVs" library.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                We only collect what UNICV actually needs to work:
              </p>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-foreground">Account data from Google sign-in:</strong>{' '}
                  when you continue with Google, we receive your email address, name, and profile
                  picture from Google. UNICV does not ask for or store passwords.
                </li>
                <li>
                  <strong className="text-foreground">CV content:</strong> the templates you open,
                  the edits you make in the ONLYOFFICE editor, and any CVs you save to "My CVs".
                </li>
                <li>
                  <strong className="text-foreground">Approximate country:</strong> detected from
                  your IP address so we can show CV templates for your region. We do not store a
                  precise location.
                </li>
                <li>
                  <strong className="text-foreground">Basic technical data:</strong> standard
                  request information (browser type, timestamps, error logs) needed to run and
                  debug the service.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your information is used to sign you in, show country-appropriate templates, open
                and save documents in the ONLYOFFICE editor, and keep your "My CVs" library
                available across sessions. We do not sell your personal data and we do not use your
                CV content to train AI models.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Where Your Data Lives</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV runs on Lovable Cloud, which uses Supabase for authentication and database
                storage. Documents you edit are processed through ONLYOFFICE. Google is used only
                as the sign-in provider. These providers process data on our behalf and are the
                only third parties that receive it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Cookies and Sessions</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV uses the cookies and local storage needed to keep you signed in after you
                authenticate with Google and to remember lightweight preferences (like your
                selected country). We do not use advertising cookies or third-party ad trackers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Data Retention and Deletion</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Saved CVs stay in your "My CVs" library until you delete them. If you want your
                account and associated CVs removed entirely, contact us at the address below and we
                will delete them. Standard backups may retain data for a short period before being
                overwritten.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Your Choices</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can sign out at any time, delete individual CVs from "My CVs", or request full
                account deletion. You can also revoke UNICV's access from your Google account
                settings, which will prevent future sign-ins.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Children</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is intended for people old enough to be looking for work or building a
                professional CV. It is not directed at children under 13, and we do not knowingly
                collect data from them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Changes to This Policy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If UNICV's features change in a way that affects what data is collected or how it
                is used, this page will be updated and the "Last updated" date at the top will
                change.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Questions about privacy or data requests? Reach out via{' '}
                <a href="https://turjo.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
                  turjo.dev
                </a>.
              </p>
            </section>
          </div>

        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
