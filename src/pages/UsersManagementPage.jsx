import { useState, useEffect } from 'react';
import { getUsersRequest, changeUserRoleRequest, getRolesRequest, deleteUserRequest } from '../api/users';
import { IoWarningOutline, IoClose, IoNotificationsOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { getNotificationCitiesRequest, updateUserNotificationPreferencesRequest } from '../api/notificationPreferences';
import { FALLBACK_NOTIFICATION_CITIES, DEFAULT_MAX_NOTIFICATION_CITIES } from '../utils/notificationCities';

function UsersManagementPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cityOptions, setCityOptions] = useState([]);
    const [maxNotificationCities, setMaxNotificationCities] = useState(DEFAULT_MAX_NOTIFICATION_CITIES);
    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
    const [preferencesTarget, setPreferencesTarget] = useState(null);
    const [selectedCities, setSelectedCities] = useState([]);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [preferencesError, setPreferencesError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const loadCityCatalog = async () => {
            try {
                const response = await getNotificationCitiesRequest();
                const apiCities = response.data?.cities;
                setCityOptions(apiCities?.length ? apiCities : FALLBACK_NOTIFICATION_CITIES);
                setMaxNotificationCities(response.data?.maxSelection || DEFAULT_MAX_NOTIFICATION_CITIES);
            } catch (error) {
                console.error('Error loading notification cities:', error);
                setCityOptions(FALLBACK_NOTIFICATION_CITIES);
                setMaxNotificationCities(DEFAULT_MAX_NOTIFICATION_CITIES);
                toast.error('Unable to load notification cities');
            }
        };

        loadCityCatalog();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                getUsersRequest(),
                getRolesRequest()
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await changeUserRoleRequest(userId, { roleId: newRoleId });
            loadData(); // Recargar datos
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
        setIsDeleting(false);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteUserRequest(userToDelete._id);
            loadData(); // Recargar datos
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting user:', error);
            setIsDeleting(false);
        }
    };

    const getCityLabel = (code) => {
        const match = cityOptions.find((city) => city.code === code);
        return match?.label || code;
    };

    const openPreferencesModal = (user) => {
        setPreferencesTarget(user);
        setSelectedCities(user?.notificationPreferences?.cities || []);
        setPreferencesError('');
        setPreferencesModalOpen(true);
    };

    const closePreferencesModal = () => {
        setPreferencesModalOpen(false);
        setPreferencesTarget(null);
        setSelectedCities([]);
        setPreferencesError('');
    };

    const toggleCitySelection = (code) => {
        setPreferencesError('');
        setSelectedCities((prev) => {
            if (prev.includes(code)) {
                return prev.filter((item) => item !== code);
            }
            if (prev.length >= maxNotificationCities) {
                setPreferencesError(`You can select up to ${maxNotificationCities} cities`);
                return prev;
            }
            return [...prev, code];
        });
    };

    const handleSavePreferences = async () => {
        if (!preferencesTarget) return;
        setSavingPreferences(true);
        try {
            await updateUserNotificationPreferencesRequest(preferencesTarget._id, { cities: selectedCities });
            await loadData();
            toast.success('Notification preferences updated');
            closePreferencesModal();
        } catch (error) {
            console.error('Error updating preferences:', error);
            const message = error.response?.data?.message?.[0] || 'Error updating notification preferences';
            setPreferencesError(message);
            toast.error(message);
        } finally {
            setSavingPreferences(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-[var(--soft-black)] px-6 py-4 -mx-6 -mt-6 mb-6">
                <h1 className="text-4xl font-bold mb-2 text-white">User Management</h1>
                <p className="text-gray-400 mt-2">Assign and manage administrator and co-administrator roles</p>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-[var(--gold-accent)]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ backgroundColor: '#F5F5F5' }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Current Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Change Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Notifications
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                        user.role?.role === 'admin' 
                                            ? 'bg-red-100 text-red-800'
                                            : user.role?.role === 'co-admin'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role?.role || 'no role'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role?._id || ''}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2"
                                        style={{ borderColor: '#C8A452' }}
                                    >
                                        {roles.map((role) => (
                                            <option key={role._id} value={role._id}>
                                                {role.role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.notificationPreferences?.cities?.length ? (
                                        <div className="flex flex-wrap gap-1">
                                            {user.notificationPreferences.cities.map((code) => (
                                                <span key={code} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                                                    {getCityLabel(code)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500">No cities</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => openPreferencesModal(user)}
                                            className="text-[var(--gold-accent)] hover:text-[#145a75] font-medium flex items-center gap-1"
                                        >
                                            <IoNotificationsOutline />
                                            Manage
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(user)}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            disabled={user.role?.role === 'admin'}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#F5F5F5', borderColor: '#C8A452' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#3C3C3C' }}>System Roles:</h3>
                <ul className="text-sm" style={{ color: '#3C3C3C' }}>
                    <li className="mb-1"><strong style={{ color: '#C8A452' }}>Admin:</strong> Full access + user management</li>
                    <li className="mb-1"><strong style={{ color: '#C8A452' }}>Co-Admin:</strong> Property and appointment management</li>
                    <li><strong style={{ color: '#C8A452' }}>User:</strong> Public viewing only</li>
                </ul>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 10002 }}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
                            style={{ zIndex: 10001 }}
                            onClick={closeDeleteModal}
                        ></div>

                        {/* Centrar modal */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        {/* Modal */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative" style={{ zIndex: 10002 }}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white/20">
                                            <IoWarningOutline className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            Confirm Deletion
                                        </h3>
                                    </div>
                                    <button
                                        onClick={closeDeleteModal}
                                        className="text-white hover:text-gray-200 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        <IoClose className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="bg-white px-6 py-6">
                                <div className="mb-4">
                                    <p className="text-gray-700 text-base mb-3">
                                        Are you sure you want to delete the following user?
                                    </p>
                                    <div className="bg-gray-50 border-l-4 border-red-500 p-4 rounded">
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {userToDelete?.username}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {userToDelete?.email}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Role: <span className="font-medium">{userToDelete?.role?.role}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                    <p className="text-sm text-yellow-800">
                                        <strong>⚠️ Warning:</strong> This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteUser}
                                    disabled={isDeleting}
                                    className="w-full sm:w-auto sm:ml-3 px-6 py-2.5 bg-red-600 border border-transparent rounded-lg text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete User'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {preferencesModalOpen && (
                <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 10002 }}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
                            style={{ zIndex: 10001 }}
                            onClick={closePreferencesModal}
                        ></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full relative" style={{ zIndex: 10002 }}>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white/20">
                                            <IoNotificationsOutline className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                                            <p className="text-sm text-white/80">{preferencesTarget?.username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closePreferencesModal}
                                        className="text-white hover:text-gray-200 transition-colors"
                                        disabled={savingPreferences}
                                    >
                                        <IoClose className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white px-6 py-6 space-y-4">
                                <p className="text-sm text-gray-600">
                                    Select up to {maxNotificationCities} U.S. cities to personalize SMS campaigns for this investor, or leave all unselected to pause notifications.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {cityOptions.map((city) => {
                                        const isSelected = selectedCities.includes(city.code);
                                        return (
                                            <button
                                                key={city.code}
                                                type="button"
                                                onClick={() => toggleCitySelection(city.code)}
                                                className={`border rounded-xl px-4 py-3 text-left transition-colors ${
                                                    isSelected
                                                        ? 'border-[var(--gold-accent)] bg-[var(--gold-accent)]/10 text-[var(--gold-accent)] font-semibold'
                                                        : 'border-gray-200 text-gray-700 hover:border-[var(--gold-accent)]'
                                                }`}
                                            >
                                                {city.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {preferencesError && (
                                    <p className="text-sm text-red-500">{preferencesError}</p>
                                )}

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
                                    Investors can self-manage up to {maxNotificationCities} cities from their profile (one update per week). For additional markets or to pause alerts entirely, have them email <a href="mailto:support@frfamilyinvestments.com" className="underline font-semibold">support@frfamilyinvestments.com</a>. Administrators can still override preferences here when needed.
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closePreferencesModal}
                                    disabled={savingPreferences}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePreferences}
                                    disabled={savingPreferences}
                                    className="w-full sm:w-auto sm:ml-3 px-6 py-2.5 bg-[var(--gold-accent)] border border-transparent rounded-lg text-white font-medium hover:bg-[#145a75] focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {savingPreferences ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersManagementPage;