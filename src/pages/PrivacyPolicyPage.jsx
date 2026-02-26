import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Contact information such as name, email, and mobile phone number submitted through account registration forms.',
      'Property preferences, scheduling details, and documents you elect to upload to coordinate property showings.',
      'Usage data that helps us understand how you interact with our listings, appointment tools, and notification preferences.'
    ]
  },
  {
    title: 'How We Use Your Information',
    body: [
      'Deliver account services, including identity verification, appointment reminders, and property alerts you request.',
      'Send transactional and marketing SMS messages once you have provided express written consent via our opt-in checkbox.',
      'Improve our platform by analyzing aggregate usage while honoring your privacy preferences.'
    ]
  },
  {
    title: 'SMS Communications',
    body: [
      'By consenting on the registration form, you authorize FR Family Investments LLC to contact you via automated text messages regarding appointments, property updates, and verification codes.',
      'Message frequency varies based on your activity. Message and data rates may apply. Reply STOP to opt out at any time or HELP for help.',
      'La información de consentimiento y los datos personales obtenidos para el envío de mensajes de texto (SMS) no serán compartidos, vendidos ni alquilados a terceros ni afiliados bajo ninguna circunstancia con fines de marketing o publicidad.',
      'Mobile Information Sharing: No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.'
    ]
  },
  {
    title: 'Your Choices',
    body: [
      'Update profile data or withdraw SMS consent within your account or by replying STOP to any message.',
      'Request deletion of your account and associated data by contacting support@frfamilyinvestments.com.',
      'Manage cookie preferences through the on-site consent manager.'
    ]
  }
];

const lastUpdated = 'February 7, 2026';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 md:p-12 space-y-8">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Trust & Transparency</p>
          <h1 className="text-4xl font-semibold text-[var(--charcoal)]">Privacy Policy</h1>
          <p className="text-gray-600">
            FR Family Investments LLC ("FR Family Investments", "we", "us") collects and processes data solely to provide personalized real-estate services.
          </p>
          <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
        </header>

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <p className="text-sm text-blue-900">
            Questions? Email <a href="mailto:support@frfamilyinvestments.com" className="underline font-medium">support@frfamilyinvestments.com</a> or call +1 (469) 405-1309.
          </p>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--charcoal)]">{section.title}</h2>
            <ul className="space-y-3">
              {section.body.map((paragraph, idx) => (
                <li key={idx} className="text-gray-600 leading-relaxed bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                  {paragraph}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)]">Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We apply encryption in transit, role-based access controls, and vendor due diligence to protect your information. No security practice is perfect, but we continuously review our controls to meet CTIA/A2P and Texas privacy requirements.
          </p>
        </section>

        <footer className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">Need to review the rules you agree to when creating an account?</p>
          <Link to="/terms-of-service" className="text-[var(--gold-accent)] font-semibold hover:underline">View Terms of Service</Link>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
