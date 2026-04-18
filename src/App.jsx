import { BrowserRouter, Routes, Route} from 'react-router';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage'
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProtectedRoute from './ProtectedRoute';
import AdminOnlyRoute from './AdminOnlyRoute';
import Navbar from './components/Navbar';
import { PropertiesProvider } from './context/PropertyContext';
import { AppointmentsProvider } from './context/AppointmentContext';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AllPropertiesPage from './pages/AllPropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyFormPage from './pages/PropertyFormPage';
import UsersManagementPage from './pages/UsersManagementPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import NotificationsPage from './pages/NotificationsPage';
import ConfirmAppointmentPage from './pages/ConfirmAppointmentPage';
import UserOffersPage from './pages/UserOffersPage';
import UserOfferDetailPage from './pages/UserOfferDetailPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminOfferDetailPage from './pages/AdminOfferDetailPage';
import CookieConsent from './components/CookieConsent';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {
  const [toastTheme, setToastTheme] = useState('light');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ? (stored === 'dark' ? 'dark' : 'light') : (prefersDark ? 'dark' : 'light');
    setToastTheme(initial);

    const handler = (e) => {
      const value = e?.detail || (localStorage.getItem ? localStorage.getItem('theme') : null) || 'light';
      setToastTheme(value === 'dark' ? 'dark' : 'light');
    };

    window.addEventListener('theme-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('theme-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return (
    <AuthProvider>
      <PropertiesProvider>
        <AppointmentsProvider>
          <BrowserRouter>
            {/* ToastContainer moved above Navbar for visibility */}
            <ToastContainer
              position='top-right'
              autoClose={3000}
              limit={3}
              hideProgressBar={false}
              theme={toastTheme}
              className='z-[99999]'
              style={{ zIndex: 99999 }}
            />
            <main className='w-full'>
              <Navbar/>
              <Routes>
                <Route path='/' element={<HomePage/>} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage/>} />
                <Route path='/verify' element={<VerificationPage/>} />
                <Route path='/about' element={<AboutPage/>} />
                <Route path='/contact' element={<ContactPage/>} />
                <Route path='/privacy-policy' element={<PrivacyPolicyPage/>} />
                <Route path='/terms-of-service' element={<TermsOfServicePage/>} />

                {/* Ruta pública para confirmar citas por link */}
                <Route path='/confirm-appointment/:id/:code' element={<ConfirmAppointmentPage/>} />

                {/* Rutas públicas para propiedades */}
                <Route path='/properties' element={<AllPropertiesPage/>} />
                <Route path='/properties/:id' element={<PropertyDetailPage/>} />
                {/* Rutas protegidas - Admin y Co-Admin */}
                <Route element={<ProtectedRoute />}>
                  <Route path='/profile' element={<ProfilePage/>} />
                  <Route path='/my-appointments' element={<MyAppointmentsPage/>} />
                  <Route path='/my-offers' element={<UserOffersPage/>} />
                  <Route path='/my-offers/:id' element={<UserOfferDetailPage/>} />
                  <Route path='/admin/properties' element={<PropertiesPage/>} />
                  <Route path='/admin/add-property' element={<PropertyFormPage/>} />
                  <Route path='/admin/properties/edit/:id' element={<PropertyFormPage/>} />
                  <Route path='/admin/appointments' element={<AdminAppointmentsPage />} />
                  <Route path='/admin/notifications' element={<NotificationsPage />} />
                  <Route path='/admin/offers' element={<AdminOffersPage />} />
                  <Route path='/admin/offers/:id' element={<AdminOfferDetailPage />} />
                </Route>

                {/* Rutas solo para Admin */}
                <Route element={<AdminOnlyRoute />}>
                  <Route path='/admin/users' element={<UsersManagementPage/>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <CookieConsent />
            </main>
          </BrowserRouter>
        </AppointmentsProvider>
      </PropertiesProvider>
    </AuthProvider>
  )
}

export default App