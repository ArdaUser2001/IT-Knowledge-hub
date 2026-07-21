import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fetchUsers, fetchCategories } from './utils/api';
import { User, Category } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import Settings from './pages/Settings';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, categoriesData] = await Promise.all([
          fetchUsers(),
          fetchCategories(),
        ]);
        setUsers(usersData);
        setCategories(categoriesData);
        
        // Set default user (Admin) for demo purposes
        const adminUser = usersData.find(u => u.role === 'admin');
        if (adminUser) {
          setCurrentUser(adminUser);
        } else if (usersData.length > 0) {
          setCurrentUser(usersData[0]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No users available</h1>
          <p className="text-gray-600">Please create a user first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          users={users} 
          currentUser={currentUser} 
          onUserChange={handleUserChange}
        />
        
        <main className="flex-1 p-8 lg:p-12">
          <Routes>
            <Route path="/" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/articles" element={<Articles currentUser={currentUser} />} />
            <Route path="/articles/new" element={<CreateArticle currentUser={currentUser} />} />
            <Route path="/articles/:id" element={<ArticleDetail currentUser={currentUser} />} />
            <Route path="/articles/:id/edit" element={<EditArticle currentUser={currentUser} />} />
            <Route path="/settings" element={<Settings users={users} categories={categories} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
