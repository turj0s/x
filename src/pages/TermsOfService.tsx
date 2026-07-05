import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';

const TermsOfService: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read the terms and conditions for using UNICV's CV builder platform."
      />
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block mb-6">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            These terms are maintained by the UNICV team and describe the rules for using the app
            as it works today. They are not a substitute for legal advice.
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using UNICV — browsing templates, opening the editor, or signing in with Google
                — you agree to these Terms of Service. If you do not agree, please stop using the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. What UNICV Provides</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is a free, browser-based CV builder. It offers a curated set of CV
                templates, filters them by your detected country, and lets you edit any template
                in a built-in ONLYOFFICE editor. Signed-in users can save documents to a personal
                "My CVs" library and download them at any time. Features, templates, and
                availability may change as the app evolves.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Accounts and Sign-In</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Accounts are created through Google sign-in. You are responsible for the Google
                account you use and for the activity that happens under it in UNICV. UNICV does
                not manage passwords — that stays with Google.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Your Content</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You own the CVs and content you create in UNICV. You grant UNICV a limited license
                to store, render, and process that content solely so we can display it in your
                account, open it in the ONLYOFFICE editor, and let you download it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Templates</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CV templates provided by UNICV may be used to build your own CV. You may not
                resell, redistribute, or repackage the templates themselves as a competing product.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Acceptable Use</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please do not use UNICV to upload unlawful, deceptive, or harmful content, to
                attempt unauthorized access to the service, to abuse the ONLYOFFICE editor or
                backend, or to disrupt other users. We may suspend or remove accounts that break
                these rules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Third-Party Services</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV depends on Google (sign-in), Lovable Cloud / Supabase (hosting, database,
                auth), and ONLYOFFICE (document editing). Your use of UNICV is also subject to the
                terms and availability of those providers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Termination</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can stop using UNICV at any time, sign out, or delete individual CVs from "My
                CVs". You can also request full account deletion via the contact link below. We
                may suspend or remove accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Disclaimers</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is provided "as is" and "as available". We do not guarantee that every
                template will be a fit for every job market, that the service will be uninterrupted,
                or that stored documents will always be recoverable. Keep your own copies of
                important CVs.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, UNICV and its operators are not liable for
                any indirect, incidental, or consequential damages arising from your use of the
                service, including missed job opportunities or lost documents.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Changes to These Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If UNICV's features or policies change, this page will be updated and the "Last
                updated" date will change. Continued use of the app after that counts as accepting
                the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Questions about these terms? Reach out via{' '}
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

export default TermsOfService;
