import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200/40 py-8">
      <div className="w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">FR Family Investments</div>
          <nav className="flex items-center gap-3 text-sm text-gray-600">
            <a
              href="https://www.facebook.com/people/Fermin-Martinez/pfbid0JiMwPPwGNaZmds3FEiHJi9vqHgc7nJhY7d5UxSmQZd7T64otBvH6VG5WBYX8ScCCl/?mibextid=wwXIfr&rdid=Kqr9dZ6hNjAMkJbK&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BXmhACHE9%2F%3Fmibextid%3DwwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook - FR Family Investments"
              className="social-btn facebook animate"
              title="Facebook"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.591l-.467 3.622h-3.124V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </a>

            <a
              href="https://www.instagram.com/frfamilyinvestments?igsh=MWlzdXAyNGJ3ZjJn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram - FR Family Investments"
              className="social-btn instagram"
              title="Instagram"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM18.3 6.2a1.05 1.05 0 11-2.1 0 1.05 1.05 0 012.1 0z" fill="currentColor"/>
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@fr.family.investm?_r=1&_t=ZP-91ygGnp2mDv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok - FR Family Investments"
              className="social-btn tiktok"
              title="TikTok"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M194.2 64.3c-6.6-.8-13.1-1.2-19.6-1.2v61.5c0 22.9-18.5 41.5-41.4 41.5-22.9 0-41.5-18.6-41.5-41.5s18.6-41.4 41.5-41.4c4.1 0 8.1.6 11.9 1.8v27.6c-3.4-1.1-7-1.7-10.9-1.7-11.8 0-21.5 9.7-21.5 21.5 0 11.9 9.7 21.6 21.5 21.6 11.8 0 21.5-9.7 21.5-21.6V54h32.9c1.1 7.2 3.6 13.9 7.4 19.9z" fill="currentColor"/>
              </svg>
            </a>
          </nav>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">© 2026 FR Family Investments. All rights reserved.</div>
=======
        <div className="flex flex-col items-center gap-1 text-center md:items-end">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Link to="/privacy-policy" className="hover:text-[var(--gold-accent)] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[var(--gold-accent)] transition-colors">Terms of Service</Link>
          </div>
          <div className="text-sm text-gray-500">© {new Date().getFullYear()} FR Family Investments</div>
          <div className="text-xs text-gray-400">All rights reserved. FR Family Investments LLC.</div>
>>>>>>> 54fcb6833021d61414e11edb91ae0da5a80bb493
        </div>
      </div>
    </footer>
  );
}
