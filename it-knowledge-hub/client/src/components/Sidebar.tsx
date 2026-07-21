import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  users: User[];
  currentUser: User;
  onUserChange: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ users, currentUser, onUserChange }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/articles', label: 'Articles', icon: '📚' },
    { path: '/articles/new', label: 'New Article', icon: '✍️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/articles' && location.pathname.startsWith('/articles'));
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">💡</span>
          IT Knowledge Hub
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Switcher */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Current User
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selectedUser = users.find(u => u.id === Number(e.target.value));
              if (selectedUser) onUserChange(selectedUser);
            }}
            className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id} className="bg-gray-800">
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-gray-400 capitalize">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
