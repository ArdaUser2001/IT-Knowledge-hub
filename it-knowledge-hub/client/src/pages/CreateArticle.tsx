import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, createArticle } from '../utils/api';
import { Category, User, ArticleStatus } from '../types';

interface CreateArticleProps {
  currentUser: User;
}

const CreateArticle: React.FC<CreateArticleProps> = ({ currentUser }) => {
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

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

      await createArticle({
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
        status,
        authorId: currentUser.id,
      });

      navigate('/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
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

  if (currentUser.role !== 'admin') {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission Denied</h3>
        <p className="text-gray-600 mb-4">Only admin users can create articles.</p>
        <button onClick={() => navigate('/articles')} className="btn btn-primary">
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-600 mt-1">Add a new knowledge base article</p>
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
                placeholder="Write your article content here...\n\nUse Markdown formatting:\n- # Heading 1\n- ## Heading 2\n- **bold**\n- *italic*\n- - List item\n- [Link](url)\n- \`code\`\n- \`\`\`code block\`\`\`"
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
            {saving ? 'Saving...' : 'Save Article'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
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

export default CreateArticle;
