import { useState, useEffect } from 'react';
import { fetchUsers, fetchCategories, createUser, createCategory } from '../utils/api';
import { User, Category } from '../types';

interface SettingsProps {
  users: User[];
  categories: Category[];
}

const Settings: React.FC<SettingsProps> = ({ users: initialUsers, categories: initialCategories }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  
  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'viewer'>('viewer');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // New category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserError(null);

    try {
      if (!newUserName.trim()) {
        setUserError('Name is required');
        setCreatingUser(false);
        return;
      }

      const newUser = await createUser(newUserName.trim(), newUserRole);
      setUsers([...users, newUser]);
      setNewUserName('');
      setNewUserRole('viewer');
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCategory(true);
    setCategoryError(null);

    try {
      if (!newCategoryName.trim()) {
        setCategoryError('Name is required');
        setCreatingCategory(false);
        return;
      }

      const newCategory = await createCategory(newCategoryName.trim());
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage users and categories</p>
      </div>

      {/* Users Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        </div>
        
        <div className="p-6">
          {/* User List */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Users</h3>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${
                            user.role === 'admin' ? 'badge-primary' : 'badge-gray'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No users found.</p>
            )}
          </div>

          {/* Create User Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New User</h3>
            
            {userError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg mb-4">
                <p className="text-red-700 text-sm">{userError}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter user name..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'viewer')}
                    className="input"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={creatingUser}
                className="btn btn-primary"
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        </div>
        
        <div className="p-6">
          {/* Category List */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Categories</h3>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="badge badge-primary text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No categories found.</p>
            )}
          </div>

          {/* Create Category Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Category</h3>
            
            {categoryError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg mb-4">
                <p className="text-red-700 text-sm">{categoryError}</p>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="btn btn-primary"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">About IT Knowledge Hub</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          This is an internal knowledge base management system for your IT department. 
          It allows IT staff to create, organize, and search knowledge base articles including 
          troubleshooting guides, how-tos, configuration steps, and common issues.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">Admin Users</div>
            <div className="text-gray-600">Can create, edit, delete, and publish articles</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">Viewer Users</div>
            <div className="text-gray-600">Read-only access for IT staff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
