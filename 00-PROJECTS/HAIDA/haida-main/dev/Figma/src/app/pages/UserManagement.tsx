/**
 * Página de Gestión de Usuarios y Permisos
 * Solo accesible para usuarios con rol 'admin'
 */

import React, { useState, useEffect } from 'react';
import { permissionsService } from '../lib/permissions-service';
import type { User, Role, Permission, UserWithPermissions } from '../lib/permissions-types';

interface UserListItemProps {
  user: User;
  onEdit: (user: User) => void;
  onManagePermissions: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  onEdit,
  onManagePermissions,
  onToggleActive,
  onDelete
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'qa_engineer': return 'bg-yellow-100 text-yellow-800';
      case 'developer': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'qa_engineer': return 'QA Engineer';
      case 'developer': return 'Desarrollador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
          {getRoleDisplayName(user.role)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="Editar usuario"
        >
          ✏️
        </button>
        <button
          onClick={() => onManagePermissions(user)}
          className="text-purple-600 hover:text-purple-900 mr-3"
          title="Gestionar permisos"
        >
          🔒
        </button>
        <button
          onClick={() => onToggleActive(user)}
          className="text-yellow-600 hover:text-yellow-900 mr-3"
          title={user.is_active ? 'Desactivar' : 'Activar'}
        >
          {user.is_active ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={() => onDelete(user)}
          className="text-red-600 hover:text-red-900"
          title="Eliminar usuario"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        permissionsService.getUsers(),
        permissionsService.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleToggleActive = async (user: User) => {
    if (window.confirm(`¿Estás seguro de ${user.is_active ? 'desactivar' : 'activar'} a ${user.email}?`)) {
      try {
        await permissionsService.toggleUserActive(user.id, !user.is_active);
        await loadData();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar a ${user.email}?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await permissionsService.deleteUser(user.id);
        await loadData();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl">❌ Error: {error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">Administra usuarios y sus permisos en HAIDA</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Rol
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Usuarios</div>
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Activos</div>
          <div className="text-3xl font-bold text-green-600">
            {users.filter(u => u.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Administradores</div>
          <div className="text-3xl font-bold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">QA Engineers</div>
          <div className="text-3xl font-bold text-yellow-600">
            {users.filter(u => u.role === 'qa_engineer').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onManagePermissions={handleManagePermissions}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteUser}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadData();
          }}
        />
      )}

      {showPermissionsModal && selectedUser && (
        <ManagePermissionsModal
          user={selectedUser}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

/* Modal Components - Simplified versions, can be expanded */

interface CreateUserModalProps {
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ roles, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await permissionsService.createUser(email, password, role, fullName);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {roles.map(r => (
                <option key={r.id} value={r.name}>
                  {r.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditUserModalProps {
  user: User;
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, roles, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await permissionsService.updateUser(user.id, { full_name: fullName });
      if (role !== user.role) {
        await permissionsService.updateUserRole(user.id, role);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Editar Usuario</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {roles.map(r => (
                <option key={r.id} value={r.name}>
                  {r.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ManagePermissionsModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const ManagePermissionsModal: React.FC<ManagePermissionsModalProps> = ({ user, onClose, onSuccess }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const [allPerms, userPerms] = await Promise.all([
        permissionsService.getPermissions(),
        permissionsService.getUserWithPermissions(user.id)
      ]);
      setPermissions(allPerms);
      setUserPermissions(userPerms);
    } catch (err) {
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permission: Permission) => {
    // TODO: Implement permission toggle
    alert(`Toggle permission: ${permission.name}`);
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Gestionar Permisos</h2>
        <p className="text-gray-600 mb-6">
          Usuario: <strong>{user.email}</strong> ({user.role})
        </p>

        {loading ? (
          <div className="text-center py-8">Cargando permisos...</div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedPermissions).sort().map(resource => (
              <div key={resource} className="border-b pb-4">
                <h3 className="font-bold text-lg mb-3 capitalize">{resource}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {groupedPermissions[resource].map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        onChange={() => handleTogglePermission(perm)}
                      />
                      <span className="text-sm">{perm.action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
