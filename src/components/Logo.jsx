import { useState } from 'react';
import logoImage from '../assets/frfamilylogo.svg';

function Logo({ className = "", size = "medium" }) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: "h-8",
    medium: "h-12",
    large: "h-16"
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Si hay error o no existe la imagen, mostrar logo SVG elegante
  if (imageError) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="bg-[var(--gold-accent)] rounded-lg p-2 shadow-lg">
            <svg className={`${sizeClasses[size]} w-auto text-white`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[var(--gold-accent)] text-lg leading-tight">FR FAMILY</span>
            <span className="font-semibold text-[var(--charcoal)] text-sm leading-tight">INVESTMENTS</span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar la imagen del logo importada correctamente
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage}
        alt="FR Family Investments"
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={handleImageError}
      />
    </div>
  );
}

export default Logo;