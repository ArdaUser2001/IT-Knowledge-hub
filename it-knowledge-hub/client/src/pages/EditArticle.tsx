import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchArticle, fetchCategories, updateArticle } from '../utils/api';
import { Category, User, Article, ArticleStatus } from '../types';

interface EditArticleProps {
  currentUser: User;
}

const EditArticle: React.FC<EditArticleProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) throw new Error('Article ID is required');
        const [articleData, categoriesData] = await Promise.all([
          fetchArticle(Number(id)),
          fetchCategories(),
        ]);
        setArticle(articleData);
        setCategories(categoriesData);
        setTitle(articleData.title);
        setBody(articleData.body);
        setCategory(articleData.category_name);
        setTags(articleData.tags);
        setStatus(articleData.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!id) throw new Error('Article ID is required');
      if (!title.trim()) {
        setError('Title is required');
        setSaving(false);
        return;
      }
      
      if (!body.trim()) {
        setError('Content is required');
        setSaving(false);
        return;
      }

      await updateArticle(Number(id), {
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
        status,
      });

      navigate(`/articles/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
    } finally {
      setSaving(false);
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
        <button onClick={() => navigate('/articles')} className="btn btn-primary">
          Back to Articles
        </button>
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
        <p className="text-gray-600 mb-4">The article you're trying to edit doesn't exist.</p>
        <button onClick={() => navigate('/articles')} className="btn btn-primary">
          Back to Articles
        </button>
      </div>
    );
  }

  if (currentUser.role !== 'admin' || currentUser.id !== article.author_id) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission Denied</h3>
        <p className="text-gray-600 mb-4">Only the article author can edit this article.</p>
        <button onClick={() => navigate(`/articles/${id}`)} className="btn btn-primary">
          View Article
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-600 mt-1">Update your knowledge base article</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="card p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-gray flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your article content here..."
                className="input min-h-[400px] resize-vertical font-mono"
              />
              <div className="mt-2 text-sm text-gray-500">
                Supports Markdown formatting
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary min-w-[120px]"
          >
            {saving ? 'Saving...' : 'Update Article'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/articles/${id}`)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Markdown Help */}
      <div className="card p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Markdown Formatting Help</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Headings</div>
            <div className="text-gray-600"># H1, ## H2, ### H3</div>
          </div>
          <div>
            <div className="font-medium">Text</div>
            <div className="text-gray-600">**bold**, *italic*, ~~strikethrough~~</div>
          </div>
          <div>
            <div className="font-medium">Lists</div>
            <div className="text-gray-600">- item, 1. numbered</div>
          </div>
          <div>
            <div className="font-medium">Code</div>
            <div className="text-gray-600">&lt;code&gt;, ```block```</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;
