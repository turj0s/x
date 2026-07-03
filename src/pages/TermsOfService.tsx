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

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using UNICV, you agree to be bound by these Terms of Service. If you do 
                not agree, please do not use the service. These terms apply to all visitors, users, and 
                others who access or use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is an online CV builder that allows users to create, customize, and download 
                professional resumes using pre-designed templates. Features and availability may change 
                over time as we improve the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are responsible for safeguarding your account credentials and for all activities 
                that occur under your account. You agree to provide accurate and complete information 
                when creating an account and to keep it up to date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. User Content</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You retain ownership of the content you create using UNICV. By using the service, you 
                grant us a limited license to store and process your content solely for the purpose of 
                providing the CV builder service to you.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Acceptable Use</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree not to use UNICV for any unlawful purpose, to transmit any harmful code, to 
                attempt unauthorized access to any part of the service, or to interfere with other users' 
                access. We reserve the right to suspend accounts that violate these rules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Termination</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may terminate or suspend your account at any time, without prior notice, for any 
                reason, including breach of these terms. You may also delete your account at any time 
                through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Disclaimers</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UNICV is provided "as is" without warranties of any kind. We do not guarantee that the 
                service will be error-free, secure, or available at all times. You use the service at 
                your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, UNICV and its operators shall not be liable for 
                any indirect, incidental, or consequential damages arising out of or in connection with 
                your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update these Terms of Service from time to time. Continued use of the service 
                after changes constitutes acceptance of the new terms. We encourage you to review this 
                page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Contact Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us via{' '}
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
