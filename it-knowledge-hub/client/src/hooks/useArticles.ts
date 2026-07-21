import { useState, useEffect, useCallback } from 'react';
import { fetchArticles } from '../utils/api';
import { Article, FilterOptions } from '../types';

export const useArticles = (initialFilters?: FilterOptions) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchArticles(filters);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const refresh = useCallback(() => {
    loadArticles();
  }, [loadArticles]);

  return {
    articles,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
  };
};
