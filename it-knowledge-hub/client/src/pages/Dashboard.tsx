import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, fetchStats, fetchCategories } from '../utils/api';
import { Article, Stats, User } from '../types';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, statsData] = await Promise.all([
          fetchArticles({ sort: 'updated', status: 'published' }),
          fetchStats(),
        ]);
        setArticles(articlesData);
        setStats(statsData);
        
        // Get recent articles (last 5)
        const recent = articlesData.slice(0, 5);
        setRecentArticles(recent);
        
        // Get popular articles (most viewed)
        const popular = [...articlesData].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
        setPopularArticles(popular);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {currentUser.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalArticles || 0}</div>
              <div className="text-sm text-gray-600">Total Articles</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalCategories || 0}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👁️</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {articles.reduce((sum, a) => sum + a.view_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Articles</h2>
          </div>
          <div className="p-6">
            {recentArticles.length > 0 ? (
              <ul className="space-y-4">
                {recentArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/articles/${article.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600">📄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="badge badge-primary">{article.category_name}</span>
                          <span>👁️ {article.view_count}</span>
                          <span>📅 {new Date(article.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent articles found.</p>
                {currentUser.role === 'admin' && (
                  <Link to="/articles/new" className="btn btn-primary mt-4 inline-block">
                    Create First Article
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Most Viewed Articles */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Most Viewed Articles</h2>
          </div>
          <div className="p-6">
            {popularArticles.length > 0 ? (
              <ul className="space-y-4">
                {popularArticles.map((article, index) => (
                  <li key={article.id}>
                    <Link
                      to={`/articles/${article.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 font-bold">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="badge badge-gray">{article.category_name}</span>
                          <span>👁️ {article.view_count}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No popular articles yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {currentUser.role === 'admin' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/articles/new" className="btn btn-primary">
              ✍️ New Article
            </Link>
            <Link to="/articles" className="btn btn-secondary">
              📚 View All Articles
            </Link>
            <Link to="/settings" className="btn btn-secondary">
              ⚙️ Manage Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
