import { Link } from 'react-router';
import { IoAlertCircle } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

function CitySelectionReminder() {
  const { isAuthenticated, isAdmin, isCoAdmin, user } = useAuth();
  const hasCities = Boolean(user?.notificationPreferences?.cities?.length);
  const shouldShowReminder = isAuthenticated && !isAdmin && !isCoAdmin && !hasCities;

  if (!shouldShowReminder) return null;

  return (
    <div className="w-full bg-amber-50 border-t border-b border-amber-200 text-amber-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <IoAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={22} />
          <p className="text-sm leading-relaxed">
            Activa tus ciudades de interés para recibir alertas personalizadas. Selecciona hasta 3 mercados en tu perfil para continuar recibiendo SMS cuando publiquemos propiedades en esas zonas.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[var(--gold-accent)] rounded-lg shadow hover:bg-[#145a75] transition-colors"
        >
          Gestionar ciudades
        </Link>
      </div>
    </div>
  );
}

export default CitySelectionReminder;
