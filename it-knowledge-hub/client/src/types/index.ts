export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'viewer';
  created_at?: string;
}

export type ArticleStatus = 'draft' | 'published' | 'needs_review';

export interface Article {
  id: number;
  title: string;
  body: string;
  category_id: number;
  category_name: string;
  tags: string[];
  status: ArticleStatus;
  author_id: number;
  author_name: string;
  author_role?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface Stats {
  totalArticles: number;
  totalCategories: number;
  totalUsers: number;
  mostViewed: Array<{
    title: string;
    view_count: number;
    category: string;
  }>;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  tag?: string;
  sort?: 'updated' | 'views' | 'title';
  status?: ArticleStatus;
}
