import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfileRequest, changePasswordRequest, updateProfileImageRequest } from '../api/users';
import { toast } from 'react-toastify';
import { IoPersonSharp, IoMailSharp, IoPhonePortraitSharp, IoLockClosedSharp, IoShieldCheckmarkSharp, IoCheckmarkCircleSharp, IoCloseCircleSharp, IoCameraSharp } from 'react-icons/io5';

function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    // Validaciones básicas
    if (!formData.username.trim()) {
      toast.error('El usuario no puede estar vacío');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('El email no puede estar vacío');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('El teléfono no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfileRequest(formData);
      
      if (updateUserData) {
        updateUserData(res.data.user);
      }
      
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error al actualizar el perfil';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!passwordData.currentPassword) {
      toast.error('You must enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error al cambiar la contraseña';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 5MB');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await updateProfileImageRequest(formData);
      
      if (updateUserData) {
        updateUserData(res.data.user);
      }
      
      toast.success('Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error updating profile image:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error al actualizar la foto de perfil';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F1F1F' }}>Mi Perfil</h1>
        <p className="text-gray-600">Administra tu información personal y seguridad</p>
      </div>

      {/* Card de Foto de Perfil */}
      <div className="bg-white rounded-lg shadow-lg mb-6 border-t-4" style={{ borderColor: '#C8A452' }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#3C3C3C' }}>Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            {/* Imagen de perfil */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {user?.profileImage?.url ? (
                  <img 
                    src={user.profileImage.url} 
                    alt="Perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IoPersonSharp size={64} className="text-gray-400" />
                )}
              </div>
              {/* Botón de cámara para cambiar foto */}
              <label 
                htmlFor="profileImageInput" 
                className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: '#C8A452' }}
              >
                <IoCameraSharp size={20} />
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            {/* Instrucciones */}
            <div className="flex-1">
              <p className="text-gray-700 mb-2">Haz clic en el icono de cámara para cambiar tu foto de perfil</p>
              <p className="text-sm text-gray-500">Formatos permitidos: JPG, PNG, GIF, WebP (máximo 5MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Información Personal */}
      <div className="bg-white rounded-lg shadow-lg mb-6 border-t-4" style={{ borderColor: '#C8A452' }}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: '#3C3C3C' }}>Información Personal</h2>
            <p className="text-gray-600 text-sm mt-1">Actualiza tu información de cuenta</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-white px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#C8A452' }}
            >
              Editar
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Rol del Usuario */}
          <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <IoShieldCheckmarkSharp size={24} style={{ color: '#C8A452' }} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Rol de Usuario</p>
              <p className="text-lg font-semibold" style={{ color: '#3C3C3C' }}>
                {user?.role?.role === 'admin' ? '🔴 Administrador' : user?.role?.role === 'co-admin' ? '🟡 Co-Administrador' : '🟢 Usuario'}
              </p>
            </div>
          </div>

          {/* Campos de Edición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IoPersonSharp className="mr-2" style={{ color: '#C8A452' }} />
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100"
                style={{ focusRing: '#C8A452' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IoMailSharp className="mr-2" style={{ color: '#C8A452' }} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100"
                style={{ focusRing: '#C8A452' }}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IoPhonePortraitSharp className="mr-2" style={{ color: '#C8A452' }} />
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+1 (123) 456-7890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100"
                style={{ focusRing: '#C8A452' }}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="text-white px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center"
                style={{ backgroundColor: '#C8A452' }}
              >
                <IoCheckmarkCircleSharp className="mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: user?.username || '',
                    email: user?.email || '',
                    phone: user?.phone || ''
                  });
                }}
                className="text-gray-700 px-6 py-2 rounded-lg font-medium border border-gray-300 transition-all hover:bg-gray-50"
              >
                <IoCloseCircleSharp className="mr-2 inline" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card de Seguridad */}
      <div className="bg-white rounded-lg shadow-lg border-t-4" style={{ borderColor: '#C8A452' }}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold flex items-center" style={{ color: '#3C3C3C' }}>
              <IoLockClosedSharp className="mr-2" />
              Seguridad
            </h2>
            <p className="text-gray-600 text-sm mt-1">Cambia tu contraseña</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="text-white px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#C8A452' }}
            >
              Cambiar Contraseña
            </button>
          )}
        </div>

        <div className="p-6">
          {!isChangingPassword ? (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
              <p className="text-gray-700 text-sm">
                Por tu seguridad, te recomendamos cambiar tu contraseña regularmente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="text-white px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center"
                  style={{ backgroundColor: '#C8A452' }}
                >
                  <IoCheckmarkCircleSharp className="mr-2" />
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="text-gray-700 px-6 py-2 rounded-lg font-medium border border-gray-300 transition-all hover:bg-gray-50"
                >
                  <IoCloseCircleSharp className="mr-2 inline" />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;