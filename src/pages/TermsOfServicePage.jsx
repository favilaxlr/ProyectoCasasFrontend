<<<<<<< HEAD
import React from 'react';

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section>
        <p>By using FR Family Investments website and services, you agree to these terms. FR Family Investments provides property notifications, appointment scheduling, and verification via SMS as part of our service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">SMS Program</h2>
        <p>Enrollment is voluntary and requires explicit opt-in at registration. Message and data rates may apply. You may opt-out at any time by replying STOP. For help, reply HELP or contact support@frfamilyinvestments.com.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Privacy Link</h2>
        <p>Read our <a className="text-blue-600 hover:underline" href="/privacy-policy">Privacy Policy</a> for details on data handling and SMS opt-in/out.</p>
      </section>
    </main>
  );
}
=======
import { Link } from 'react-router-dom';

const commitments = [
  {
    title: 'Use of Services',
    detail: 'You agree to use FR Family Investments tools solely for evaluating properties, booking appointments, and communicating with our team or approved partners.'
  },
  {
    title: 'Account Security',
    detail: 'Keep credentials confidential. Notify us immediately at support@frfamilyinvestments.com if you suspect unauthorized access.'
  },
  {
    title: 'SMS Program Consent',
    detail: 'Opting into SMS alerts requires checking the consent box on the registration form. Participation is optional, message and data rates may apply, and you can reply STOP to cancel or HELP for assistance at any time.'
  },
  {
    title: 'Acceptable Conduct',
    detail: 'You will not misuse the platform, attempt to scrape listings, or impersonate other customers or staff.'
  }
];

const responsibilities = [
  'Provide accurate contact information and promptly update changes so appointment reminders reach you.',
  'Ensure any properties you submit or discuss are accurate and lawful.',
  'Respect appointment timeslots and notify us if you must reschedule or cancel.'
];

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-10 shadow-2xl">
          <p className="uppercase text-[0.65rem] tracking-[0.5rem] text-gray-300">Service Agreement</p>
          <h1 className="text-4xl font-semibold mt-4">Terms of Service</h1>
          <p className="mt-4 text-gray-200 leading-relaxed">
            These terms govern access to frfamilyinvestments.com and all related portals, mobile experiences, and communications operated by FR Family Investments LLC.
          </p>
          <p className="mt-6 text-sm text-gray-400">Effective date: February 7, 2026</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {commitments.map((item) => (
            <article key={item.title} className="p-6 border border-gray-200 rounded-2xl bg-gray-50">
              <h2 className="text-xl font-semibold text-[var(--charcoal)] mb-2">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)]">SMS Compliance Notice</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            The FR Family Investments Notifications program operated by FR Family Investments LLC complies with CTIA and A2P 10DLC standards. You can only join by visiting frfamilyinvestments.com/register and manually checking the SMS consent box, after which we send a confirmation text before any additional alerts.
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-gray-600 space-y-2">
            <li><strong>Program name:</strong> FR Family Investments Notifications (automated appointment, verification, and property updates).</li>
            <li><strong>Message & data rates:</strong> Message and data rates may apply and message frequency varies based on your activity.</li>
            <li><strong>Opt-out:</strong> Reply STOP to cancel at any time. We will send a final confirmation text acknowledging your opt-out.</li>
            <li><strong>Help:</strong> Reply HELP for assistance or email support@frfamilyinvestments.com.</li>
            <li><strong>Carrier liability:</strong> Wireless carriers (e.g., AT&T, T-Mobile) are not liable for delayed or undelivered messages.</li>
            <li><strong>Consent:</strong> Consent is optional and not a condition of purchase or account creation, and it can be revoked at any time.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            For questions about the texting program, contact us at support@frfamilyinvestments.com or +1 (682) 553-2342.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)]">Customer Responsibilities</h2>
          <div className="space-y-3">
            {responsibilities.map((item, idx) => (
              <p key={idx} className="text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)]">Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            We may suspend or terminate access if we detect abuse, fraud, or a breach of these terms. You may terminate at any time by deleting your account and replying STOP to cancel SMS alerts.
          </p>
        </section>

        <footer className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">Need to understand how we treat your data?</p>
          <Link to="/privacy-policy" className="text-[var(--gold-accent)] font-semibold hover:underline">Read the Privacy Policy</Link>
        </footer>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
>>>>>>> 54fcb6833021d61414e11edb91ae0da5a80bb493
