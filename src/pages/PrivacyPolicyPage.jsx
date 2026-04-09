import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-8">
        <p className="mb-4">FR Family Investments ("FR Family Investments", "we", "us") is committed to protecting your personal information and ensuring transparency in our SMS communications.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">SMS Communications & Privacy</h2>
        <p>FR Family Investments is committed to protecting your privacy. By consenting on our registration form, you authorize us to send automated text messages regarding appointments, property updates, and verification codes.</p>

        <h3 className="text-xl font-semibold mt-4">Mobile Information Sharing:</h3>
        <p><strong>No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</strong></p>

        <h3 className="text-xl font-semibold mt-4">Opt-out & Support:</h3>
        <p>Message frequency varies based on your activity. Message and data rates may apply. You can opt-out at any time by replying STOP to any message. For assistance, reply HELP or email support@frfamilyinvestments.com.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Consent and Data</h2>
        <p>We collect your phone number, transaction data, and SMS consent only to deliver requested services. Consent is optional and can be revoked at any time by replying STOP.</p>
      </section>

      {/* Línea eliminada: referencia a Twilio/TCR para compliance eliminada */}
    </main>
  );
}

