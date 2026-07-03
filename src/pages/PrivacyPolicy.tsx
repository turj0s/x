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

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you use UNICV, we collect information you provide directly, such as your email address 
                and the CV content you create. We also collect usage data to help us improve the service, 
                including your interactions with templates and features.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use your information to provide and maintain the CV builder service, personalize your 
                experience, communicate with you about your account, and improve our platform. We do not 
                sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Data Storage and Security</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored securely using industry-standard encryption. We use trusted backend 
                infrastructure to ensure your CVs and personal information are protected. However, no 
                method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Cookies and Analytics</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to keep you signed in and remember your preferences. We may also use 
                analytics tools to understand how users interact with our site so we can improve the 
                experience.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Third-Party Services</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We rely on third-party providers for authentication, database hosting, and analytics. 
                These providers have access to only the information necessary to perform their services 
                and are bound by confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We retain your account information and CVs for as long as your account is active. You can 
                delete your CVs or account at any time. After deletion, data may remain in backups for a 
                limited period before being permanently removed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Your Rights</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information. You can manage 
                much of this through your account settings. For additional requests, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Contact Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please reach out via{' '}
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
