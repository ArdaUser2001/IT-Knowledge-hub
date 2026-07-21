import { Article, Category, User, Stats, FilterOptions } from '../types';

const API_BASE = '/api';

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const createCategory = async (name: string): Promise<Category> => {
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create category');
  return response.json();
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (name: string, role: 'admin' | 'viewer' = 'viewer'): Promise<User> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, role }),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

// Articles
export const fetchArticles = async (filters?: FilterOptions): Promise<Article[]> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.tag) queryParams.append('tag', filters.tag);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.status) queryParams.append('status', filters.status);
  }
  
  const response = await fetch(`${API_BASE}/articles?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
};

export const fetchArticle = async (id: number): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch article');
  return response.json();
};

export const createArticle = async (article: {
  title: string;
  body: string;
  category: string;
  tags?: string[];
  status?: ArticleStatus;
  authorId: number;
}): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to create article');
  return response.json();
};

export const updateArticle = async (id: number, article: {
  title: string;
  body: string;
  category: string;
  tags?: string[];
  status?: ArticleStatus;
}): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to update article');
  return response.json();
};

export const deleteArticle = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete article');
};

// Stats
export const fetchStats = async (): Promise<Stats> => {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};
