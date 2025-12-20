import { BrowserRouter, Routes, Route} from 'react-router';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage'
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
            <main className='container mx-auto px-10'>
              <Navbar/>
              <ToastContainer
                position='top-right'
                autoClose={3000}
                limit={3}
                hideProgressBar={false}
                theme={toastTheme}
              />
              <Routes>
                <Route path='/' element={<HomePage/>} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage/>} />

                {/* Rutas públicas para propiedades */}
                <Route path='/properties' element={<AllPropertiesPage/>} />
                <Route path='/properties/:id' element={<PropertyDetailPage/>} />

                {/* Rutas protegidas - Admin y Co-Admin */}
                <Route element={<ProtectedRoute />}>
                  <Route path='/profile' element={<ProfilePage/>} />
                  <Route path='/my-appointments' element={<MyAppointmentsPage/>} />
                  <Route path='/admin/properties' element={<PropertiesPage/>} />
                  <Route path='/admin/add-property' element={<PropertyFormPage/>} />
                  <Route path='/admin/properties/edit/:id' element={<PropertyFormPage/>} />
                  <Route path='/admin/appointments' element={<AdminAppointmentsPage />} />
                </Route>

                {/* Rutas solo para Admin */}
                <Route element={<AdminOnlyRoute />}>
                  <Route path='/admin/users' element={<UsersManagementPage/>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </main>
          </BrowserRouter>
        </AppointmentsProvider>
      </PropertiesProvider>
    </AuthProvider>
  )
}

export default App