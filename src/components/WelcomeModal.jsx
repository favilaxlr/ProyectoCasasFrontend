import { IoSparklesSharp, IoPulseSharp } from 'react-icons/io5';
import logoImage from '../assets/frfamilylogo.svg';

function WelcomeModal({ open, onClose }) {
  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="welcome-modal-overlay fixed inset-0 z-[120000] flex items-center justify-center px-4 py-8"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(3,7,18,0.35)] welcome-modal-card max-h-[85vh] sm:max-h-[90vh]"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
      >
        <div className="relative z-10 flex max-h-[85vh] flex-col gap-4 overflow-y-auto px-6 pb-8 pt-12 text-center sm:max-h-none sm:px-8 sm:pb-10 sm:pt-12 md:px-12 md:pb-12">
          <div className="welcome-modal-aurora" />

          <div className="mb-2 flex justify-center">
            <img
              src={logoImage}
              alt="FR Family Investments"
              className="h-16 w-auto drop-shadow-sm"
              style={{ filter: 'brightness(0)' }}
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gold-accent)]">
            Welcome Home
          </p>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl md:text-3xl">
            Every day we work to elevate your real estate experience
          </h2>
          <p className="text-sm text-slate-600 sm:text-base md:text-lg">
            Explore homes curated with human dedication, intelligent technology, and the close guidance that defines us.
          </p>

          <div className="grid gap-2 text-left text-xs text-slate-600 sm:text-sm md:grid-cols-2">
            <div className="welcome-pill">
              <IoSparklesSharp className="text-lg text-[var(--gold-accent)]" />
              Daily curation of standout homes
            </div>
            <div className="welcome-pill">
              <IoPulseSharp className="text-lg text-[var(--gold-accent)]" />
              Personalized alerts and follow ups
            </div>
            <div className="welcome-pill">
              <IoSparklesSharp className="text-lg text-[var(--gold-accent)]" />
              Local experts ready to help
            </div>
            <div className="welcome-pill">
              <IoPulseSharp className="text-lg text-[var(--gold-accent)]" />
              Visits and appointments in minutes
            </div>
          </div>

          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 sm:px-5 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--gold-accent)]" />
              Dive into the marketplace and make it yours
            </div>
            <span className="text-[0.65rem] uppercase tracking-wide text-slate-500 sm:text-xs">
              Tap anywhere on this window to close the welcome message
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
