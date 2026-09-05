import { Link } from 'react-router';
import { IoPricetagOutline } from 'react-icons/io5';

export default function SellHomeLink({ variant = 'full', className = '', onClick }) {
    const icon = <IoPricetagOutline size={variant === 'icon' ? 22 : 18} />;

    if (variant === 'icon') {
        return (
            <Link
                to="/sell"
                onClick={onClick}
                aria-label="Sell Your Home"
                title="Sell Your Home"
                className={`inline-flex items-center justify-center bg-[var(--gold-accent)] text-white rounded-xl hover:opacity-90 transition-all shadow-sm ${className}`}
            >
                {icon}
            </Link>
        );
    }

    return (
        <Link
            to="/sell"
            onClick={onClick}
            className={`inline-flex items-center gap-2 bg-[var(--gold-accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm ${className}`}
        >
            {icon}
            <span className="whitespace-nowrap">Sell Your Home</span>
        </Link>
    );
}
