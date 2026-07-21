import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, fetchCategories, deleteArticle } from '../utils/api';
import { Article, Category, User, ArticleStatus } from '../types';

interface ArticlesProps {
  currentUser: User;
}

const Articles: React.FC<ArticlesProps> = ({ currentUser }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | ''>('');
  const [selectedTag, setSelectedTag] = useState<string | ''>('');
  const [sortBy, setSortBy] = useState<'updated' | 'views' | 'title'>('updated');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const [articlesData, categoriesData] = await Promise.all([
        fetchArticles({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          tag: selectedTag || undefined,
          sort: sortBy,
          status: statusFilter || undefined,
        }),
        fetchCategories(),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
      
      // Extract all unique tags
      const tagsSet = new Set<string>();
      articlesData.forEach(article => {
        article.tags.forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedTag, sortBy, statusFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        setArticles(articles.filter(a => a.id !== id));
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: ArticleStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage and browse IT knowledge base articles</p>
        </div>
        {currentUser.role === 'admin' && (
          <Link to="/articles/new" className="btn btn-primary">
            ✍️ New Article
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'views' | 'title')}
              className="input"
            >
              <option value="updated">Recently Updated</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | '')}
              className="input max-w-xs"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>
        )}
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Link to={`/articles/${article.id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.body.replace(/[#*_~`]/g, '')}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="badge badge-primary">{article.category_name}</span>
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-gray">{tag}</span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="badge badge-gray">+{article.tags.length - 3} more</span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>👁️ {article.view_count}</span>
                    <span>📅 {new Date(article.updated_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge ${getStatusColor(article.status)}`}>
                    {getStatusLabel(article.status)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {article.author_name}</span>
                  {currentUser.role === 'admin' && currentUser.id === article.author_id && (
                    <div className="flex gap-2">
                      <Link
                        to={`/articles/${article.id}/edit`}
                        className="btn btn-secondary text-xs px-3 py-1"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="btn btn-danger text-xs px-3 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory || selectedTag || statusFilter
              ? 'Try adjusting your filters.'
              : 'There are no articles yet.'}
          </p>
          {currentUser.role === 'admin' && !searchQuery && !selectedCategory && !selectedTag && !statusFilter && (
            <Link to="/articles/new" className="btn btn-primary">
              Create First Article
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Articles;
