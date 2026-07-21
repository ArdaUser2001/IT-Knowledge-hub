import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { fetchArticle, deleteArticle } from '../utils/api';
import { Article, User } from '../types';

interface ArticleDetailProps {
  currentUser: User;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Article ID is required');
        const data = await fetchArticle(Number(id));
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !article) return;
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(Number(id));
        navigate('/articles');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete article');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">❌</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/articles" className="btn btn-primary">
          Back to Articles
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Not Found</h3>
        <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
        <Link to="/articles" className="btn btn-primary">
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link to="/articles" className="btn btn-secondary text-sm">
            ← Back to Articles
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="badge badge-primary">{article.category_name}</span>
            {article.tags.map((tag) => (
              <span key={tag} className="badge badge-gray">{tag}</span>
            ))}
            <span className={`status-badge ${getStatusColor(article.status)}`}>
              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Article Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-100 rounded-xl">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>👤 By {article.author_name}</span>
            <span>📅 Created: {new Date(article.created_at).toLocaleDateString()}</span>
            <span>🔄 Updated: {new Date(article.updated_at).toLocaleDateString()}</span>
            <span>👁️ {article.view_count} views</span>
          </div>
          
          {currentUser.role === 'admin' && currentUser.id === article.author_id && (
            <div className="flex gap-2">
              <Link
                to={`/articles/${article.id}/edit`}
                className="btn btn-secondary text-sm px-4 py-2"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-danger text-sm px-4 py-2"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="card p-8 lg:p-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          className="markdown-content"
        >
          {article.body}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="card p-6 text-center text-gray-500 text-sm">
        <p>
          Last updated: {new Date(article.updated_at).toLocaleString()} | 
          Author: {article.author_name}
        </p>
      </div>
    </div>
  );
};

export default ArticleDetail;
