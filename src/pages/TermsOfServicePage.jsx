import React from 'react';

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section>
        <p>By using FR Family Investments website and services, you agree to these terms. FR Family Investments provides property notifications, appointment scheduling, and verification via SMS as part of our service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">SMS Program</h2>
        <p>Enrollment is voluntary and requires explicit opt-in at registration. Message and data rates may apply. Message frequency varies based on your activity. You may opt-out at any time by replying <strong>STOP</strong>. For help, reply <strong>HELP</strong> or contact support@frfamilyinvestments.com.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Privacy Link</h2>
        <p>Read our <a className="text-blue-600 hover:underline" href="/privacy-policy">Privacy Policy</a> for details on data handling and SMS opt-in/out.</p>
      </section>
    </main>
  );
}

