import { useEffect, useState } from 'react';
import { IoShieldCheckmark } from 'react-icons/io5';

function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedConsent = window.localStorage.getItem('cookieConsentAccepted');

    if (!storedConsent) {
      const timer = window.setTimeout(() => setIsVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }

    setIsVisible(false);
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cookieConsentAccepted', 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-wrapper fixed inset-x-0 bottom-4 z-[110000] flex justify-center px-4">
      <div className="cookie-consent-card w-full max-w-xl rounded-2xl border border-white/40 bg-[var(--glass-white)] p-5 shadow-[0_25px_70px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="cookie-consent-icon">
            <IoShieldCheckmark className="text-2xl" />
          </div>
          <div className="flex-1 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Cookies to enhance your experience</p>
            <p className="mt-1 text-[0.9rem] leading-snug">
              We use essential cookies to keep things running smoothly and optional analytics to learn what inspires you.
              By tapping "Accept cookies" you agree to our cookie policy.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="cookie-consent-primary"
              >
                Accept cookies
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              You can update your choice anytime in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
