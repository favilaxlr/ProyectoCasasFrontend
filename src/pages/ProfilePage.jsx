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
      toast.error('Username cannot be empty');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfileRequest(formData);
      
      if (updateUserData) {
        updateUserData(res.data.user);
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error updating profile';
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
      toast.error('The new password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error changing password';
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
      toast.error('File type not allowed. Use JPG, PNG, GIF or WebP');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum 5MB');
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
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating profile image:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error updating profile picture';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F1F1F' }}>My Profile</h1>
        <p className="text-gray-600">Manage your personal information and security</p>
      </div>

      {/* Profile Picture Card */}
      <div className="bg-white rounded-lg shadow-lg mb-6 border-t-4 border-[var(--gold-accent)]">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#3C3C3C' }}>Profile Picture</h2>
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {user?.profileImage?.url ? (
                  <img 
                    src={user.profileImage.url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IoPersonSharp size={64} className="text-gray-400" />
                )}
              </div>
              {/* Camera button to change photo */}
              <label 
                htmlFor="profileImageInput" 
                className="absolute bottom-0 right-0 bg-[var(--gold-accent)] hover:bg-[#145a75] text-white p-2 rounded-full cursor-pointer transition-all"
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
              <p className="text-gray-700 mb-2">Click the camera icon to change your profile picture</p>
              <p className="text-sm text-gray-500">Allowed formats: JPG, PNG, GIF, WebP (maximum 5MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-lg mb-6 border-t-4 border-[var(--gold-accent)]">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: '#3C3C3C' }}>Personal Information</h2>
            <p className="text-gray-600 text-sm mt-1">Update your account information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[var(--gold-accent)] hover:bg-[#145a75] text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Edit
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* User Role */}
          <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <IoShieldCheckmarkSharp size={24} className="text-[var(--gold-accent)]" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">User Role</p>
              <p className="text-lg font-semibold" style={{ color: '#3C3C3C' }}>
                {user?.role?.role === 'admin' ? '🔴 Administrator' : user?.role?.role === 'co-admin' ? '🟡 Co-Administrator' : '🟢 User'}
              </p>
            </div>
          </div>

          {/* Campos de Edición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IoPersonSharp className="mr-2 text-[var(--gold-accent)]" />
                Username
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
                <IoMailSharp className="mr-2 text-[var(--gold-accent)]" />
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <IoPhonePortraitSharp className="mr-2 text-[var(--gold-accent)]" />
                Phone
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
                className="bg-[var(--gold-accent)] hover:bg-[#145a75] text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center"
              >
                <IoCheckmarkCircleSharp className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
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
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-lg shadow-lg border-t-4 border-[var(--gold-accent)]">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold flex items-center" style={{ color: '#3C3C3C' }}>
              <IoLockClosedSharp className="mr-2" />
              Security
            </h2>
            <p className="text-gray-600 text-sm mt-1">Change your password</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-[var(--gold-accent)] hover:bg-[#145a75] text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Change Password
            </button>
          )}
        </div>

        <div className="p-6">
          {!isChangingPassword ? (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
              <p className="text-gray-700 text-sm">
                For your security, we recommend changing your password regularly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat your new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="bg-[var(--gold-accent)] hover:bg-[#145a75] text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center"
                >
                  <IoCheckmarkCircleSharp className="mr-2" />
                  {loading ? 'Updating...' : 'Update Password'}
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
                  Cancel
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