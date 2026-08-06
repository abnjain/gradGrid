import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { StaticShell } from "@/components/shared/static-shell";
import { buildPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "The terms and conditions that govern your use of the GradGrid platform. Please read them carefully.",
  path: "/terms",
  noIndex: true,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold font-display text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-mid leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  const { contact, legal } = siteConfig;

  return (
    <StaticShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle={`Please read these terms carefully before using ${siteConfig.name}. By creating an account or using the platform, you agree to be bound by these terms.`}
    >
      <p className="text-xs text-mist mb-10">
        Last updated: {legal.termsUpdatedAt}
      </p>

      <Section title="1. Acceptance of Terms">
        <p>
          These Terms of Service ("Terms") govern your access to and use of the {siteConfig.name}{" "}
          platform, including its website, applications, and related services (collectively, the
          "Service"). By registering for an account or otherwise accessing the Service, you agree
          to these Terms. If you are using the Service on behalf of an institution, you represent
          that you have the authority to bind that institution.
        </p>
      </Section>

      <Section title="2. The Service">
        <p>
          {siteConfig.name} is a cloud-based platform that helps educational institutions manage
          students, staff, attendance, examinations, fees, and communication. We provide the
          Service on a subscription basis, and we may add, modify, or retire features over time.
        </p>
      </Section>

      <Section title="3. Accounts & Responsibilities">
        <p>
          To use the Service, you must create an account with accurate, current information. You are
          responsible for safeguarding your login credentials and for all activity that occurs under
          your account. Notify us immediately at {contact.supportEmail} if you suspect unauthorized
          access.
        </p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to misuse the Service, including by:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Uploading unlawful, harmful, or infringing content;</li>
          <li>Attempting to gain unauthorized access to the Service or other accounts;</li>
          <li>Interfering with the operation, performance, or security of the Service;</li>
          <li>Reselling or sublicensing the Service without our written consent;</li>
          <li>Using the Service to send unsolicited messages or violate any applicable law.</li>
        </ul>
      </Section>

      <Section title="5. Fees & Payment">
        <p>
          Certain features of the Service are offered on a paid subscription basis. Fees are
          described at the time of purchase and are payable in advance for the applicable term.
          Unless otherwise stated, fees are non-refundable. We may change pricing for future
          subscriptions with reasonable advance notice; changes will not affect your current term.
        </p>
      </Section>

      <Section title="6. Your Data & Privacy">
        <p>
          You retain ownership of the data you and your institution submit to the Service. We
          process your data only to provide and improve the Service, and we never sell your data.
          Our handling of personal information is described in our{" "}
          <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          The Service, including its software, design, trademarks, and content, is owned by{" "}
          {siteConfig.name} or its licensors and is protected by applicable intellectual property
          laws. We grant you a limited, non-exclusive, non-transferable right to use the Service
          solely for your internal operations in accordance with these Terms.
        </p>
      </Section>

      <Section title="8. Disclaimers">
        <p>
          The Service is provided "as is" and "as available," without warranties of any kind,
          whether express or implied, including implied warranties of merchantability, fitness for
          a particular purpose, and non-infringement. We do not warrant that the Service will be
          uninterrupted, error-free, or free of harmful components.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, {siteConfig.name} shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, data, or goodwill, arising out of or related to your use of the Service. Our
          total liability for any claim shall not exceed the amount you paid to us for the Service
          in the twelve (12) months preceding the claim.
        </p>
      </Section>

      <Section title="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate your access if
          you breach these Terms or where required by law. Upon termination, your right to use the
          Service ceases, and we will make reasonable efforts to help you export your data within a
          reasonable period.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will notify you of material changes
          through the Service or by email. Your continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          If you have any questions about these Terms, contact us at{" "}
          <a href={`mailto:${contact.email}`} className="text-brand hover:underline">
            {contact.email}
          </a>{" "}
          or by mail at {contact.address}, {contact.city}, {contact.state}, {contact.country}.
        </p>
      </Section>
    </StaticShell>
  );
}
