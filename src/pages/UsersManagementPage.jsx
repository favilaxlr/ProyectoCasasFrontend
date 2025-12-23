import { useState, useEffect } from 'react';
import { getUsersRequest, changeUserRoleRequest, getRolesRequest, deleteUserRequest } from '../api/users';

function UsersManagementPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
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

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await deleteUserRequest(userId);
                loadData(); // Recargar datos
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F1F1F' }}>Gestión de Usuarios</h1>
            <p className="text-gray-600 mb-6">Asigna y administra roles de administrador y co-administrador</p>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border-t-4" style={{ borderColor: '#C8A452' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ backgroundColor: '#F5F5F5' }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Rol Actual
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Cambiar Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Acciones
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
                                        {user.role?.role || 'sin rol'}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        disabled={user.role?.role === 'admin'}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#F5F5F5', borderColor: '#C8A452' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#3C3C3C' }}>Roles del Sistema:</h3>
                <ul className="text-sm" style={{ color: '#3C3C3C' }}>
                    <li className="mb-1"><strong style={{ color: '#C8A452' }}>Admin:</strong> Acceso completo + gestión de usuarios</li>
                    <li className="mb-1"><strong style={{ color: '#C8A452' }}>Co-Admin:</strong> Gestión de propiedades y citas</li>
                    <li><strong style={{ color: '#C8A452' }}>User:</strong> Solo visualización pública</li>
                </ul>
            </div>
        </div>
    );
}

export default UsersManagementPage;