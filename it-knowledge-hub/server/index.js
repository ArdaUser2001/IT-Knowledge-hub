const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'knowledge-hub.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
  CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles(tags);
  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
  CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
  CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
`);

// Seed default categories
const seedCategories = db.prepare(`
  INSERT OR IGNORE INTO categories (name) VALUES (?)
`);

const defaultCategories = [
  'Hardware',
  'Network',
  'Software',
  'Access & Accounts',
  'Troubleshooting',
  'Onboarding/Offboarding',
  'Other'
];

defaultCategories.forEach(cat => seedCategories.run(cat));

// Seed admin user if not exists
const seedAdmin = db.prepare(`
  INSERT OR IGNORE INTO users (name, role) VALUES (?, ?)
`);
seedAdmin.run('Admin', 'admin');

// Helper functions
const parseTags = (tagsStr) => {
  try {
    return JSON.parse(tagsStr || '[]');
  } catch {
    return [];
  }
};

const stringifyTags = (tagsArr) => {
  return JSON.stringify(tagsArr || []);
};

// API Routes

// Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const result = stmt.run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY name').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, role = 'viewer' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const stmt = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
    const result = stmt.run(name, role);
    res.json({ id: result.lastInsertRowid, name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Articles
app.get('/api/articles', (req, res) => {
  try {
    const { search, category, tag, sort = 'updated', status } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name, u.name as author_name, u.role as author_role
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (a.title LIKE ? OR a.body LIKE ? OR a.tags LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (category) {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    if (tag) {
      query += ` AND a.tags LIKE ?`;
      params.push(`%"${tag}"%`);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    // Sort
    const orderBy = sort === 'views' ? 'a.view_count DESC' : 
                    sort === 'title' ? 'a.title ASC' : 
                    'a.updated_at DESC';
    query += ` ORDER BY ${orderBy}`;

    const articles = db.prepare(query).all(...params);
    
    // Parse tags for each article
    const result = articles.map(article => ({
      ...article,
      tags: parseTags(article.tags)
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(id);
    
    const article = db.prepare(`
      SELECT a.*, c.name as category_name, u.name as author_name, u.role as author_role
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `).get(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ ...article, tags: parseTags(article.tags) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles', (req, res) => {
  try {
    const { title, body, category, tags = [], status = 'draft', authorId } = req.body;
    
    if (!title || !body || !category || !authorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get category ID
    const categoryRow = db.prepare('SELECT id FROM categories WHERE name = ?').get(category);
    if (!categoryRow) {
      return res.status(400).json({ error: 'Category not found' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO articles (title, body, category_id, tags, status, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      title,
      body,
      categoryRow.id,
      stringifyTags(tags),
      status,
      authorId
    );
    
    const newArticle = db.prepare(`
      SELECT a.*, c.name as category_name, u.name as author_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);
    
    res.json({ ...newArticle, tags: parseTags(newArticle.tags) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, category, tags = [], status } = req.body;
    
    if (!title || !body || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get category ID
    const categoryRow = db.prepare('SELECT id FROM categories WHERE name = ?').get(category);
    if (!categoryRow) {
      return res.status(400).json({ error: 'Category not found' });
    }
    
    const stmt = db.prepare(`
      UPDATE articles 
      SET title = ?, body = ?, category_id = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(title, body, categoryRow.id, stringifyTags(tags), status, id);
    
    const updatedArticle = db.prepare(`
      SELECT a.*, c.name as category_name, u.name as author_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `).get(id);
    
    if (!updatedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ ...updatedArticle, tags: parseTags(updatedArticle.tags) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats
app.get('/api/stats', (req, res) => {
  try {
    const totalArticles = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const mostViewed = db.prepare(`
      SELECT a.title, a.view_count, c.name as category
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      ORDER BY a.view_count DESC
      LIMIT 5
    `).all();
    
    res.json({
      totalArticles,
      totalCategories,
      totalUsers,
      mostViewed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
