'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { Card, CardBody } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Database } from '@/types/database.types';
import SupportArticleCard from './SupportArticleCard';
import debounce from 'lodash/debounce';

type SupportArticle = Database['public']['Tables']['support_articles']['Row'];

interface SupportSearchProps {
  initialArticles?: SupportArticle[];
  userIndustry?: string;
}

const categories = [
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'setup', label: 'Setup' },
  { key: 'troubleshooting', label: 'Troubleshooting' },
  { key: 'billing', label: 'Billing' },
  { key: 'api', label: 'API' },
  { key: 'industry-specific', label: 'Industry Specific' },
  { key: 'features', label: 'Features' },
];

const industries = [
  { key: 'all', label: 'All Industries' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'real_estate', label: 'Real Estate' },
  { key: 'legal', label: 'Legal' },
  { key: 'medical', label: 'Medical' },
  { key: 'sales', label: 'Sales' },
  { key: 'consulting', label: 'Consulting' },
  { key: 'general_services', label: 'General Services' },
];

export default function SupportSearch({
  initialArticles = [],
  userIndustry,
}: SupportSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(userIndustry || '');
  const [articles, setArticles] = useState<SupportArticle[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const searchArticles = useCallback(
    async (query: string, category: string, industry: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (category) params.append('category', category);
        if (industry) params.append('industry_type', industry);

        const response = await fetch(`/api/support/articles?${params}`);
        const data = await response.json();

        if (response.ok) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Error searching articles:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useCallback(
    debounce((query: string, category: string, industry: string) => {
      searchArticles(query, category, industry);
    }, 300),
    [searchArticles]
  );

  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory, selectedIndustry);

    // Update active filters
    const filters = [];
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    if (selectedCategory) {
      const categoryLabel = categories.find(
        (c) => c.key === selectedCategory
      )?.label;
      if (categoryLabel) filters.push(`Category: ${categoryLabel}`);
    }
    if (selectedIndustry && selectedIndustry !== 'all') {
      const industryLabel = industries.find(
        (i) => i.key === selectedIndustry
      )?.label;
      if (industryLabel) filters.push(`Industry: ${industryLabel}`);
    }
    setActiveFilters(filters);
  }, [searchQuery, selectedCategory, selectedIndustry, debouncedSearch]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedIndustry(userIndustry || '');
    setActiveFilters([]);
  };

  const removeFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith('Search:')) {
      setSearchQuery('');
    } else if (filterToRemove.startsWith('Category:')) {
      setSelectedCategory('');
    } else if (filterToRemove.startsWith('Industry:')) {
      setSelectedIndustry('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
                }
                isClearable
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="Category"
                selectedKeys={selectedCategory ? [selectedCategory] : []}
                onSelectionChange={(keys) =>
                  setSelectedCategory((Array.from(keys)[0] as string) || '')
                }
              >
                {categories.map((category) => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="Industry"
                selectedKeys={selectedIndustry ? [selectedIndustry] : []}
                onSelectionChange={(keys) =>
                  setSelectedIndustry((Array.from(keys)[0] as string) || '')
                }
              >
                {industries.map((industry) => (
                  <SelectItem key={industry.key} value={industry.key}>
                    {industry.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-default-600">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  onClose={() => removeFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
              <Button
                size="sm"
                variant="light"
                onClick={clearFilters}
                startContent={<XMarkIcon className="h-3 w-3" />}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-default-600 mt-2">Searching articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {articles.length} article{articles.length !== 1 ? 's' : ''}{' '}
                found
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <SupportArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-default-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-default-600 mb-2">
                No articles found
              </h3>
              <p className="text-default-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="flat" onClick={clearFilters}>
                Clear filters
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
