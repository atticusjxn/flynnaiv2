'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';
import { Link } from '@nextui-org/link';
import { Badge } from '@nextui-org/badge';
import { CalendarIcon, EyeIcon, ThumbUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Database } from '@/types/database.types';

type SupportArticle = Database['public']['Tables']['support_articles']['Row'];

interface SupportArticleCardProps {
  article: SupportArticle;
}

const categoryColors = {
  'getting-started': 'success',
  'setup': 'primary',
  'troubleshooting': 'warning',
  'billing': 'secondary',
  'api': 'default',
  'industry-specific': 'success',
  'features': 'primary',
} as const;

const industryLabels = {
  'plumbing': 'Plumbing',
  'real_estate': 'Real Estate',
  'legal': 'Legal',
  'medical': 'Medical',
  'sales': 'Sales',
  'consulting': 'Consulting',
  'general_services': 'General Services',
  'all': 'All Industries',
} as const;

export default function SupportArticleCard({ article }: SupportArticleCardProps) {
  const categoryLabel = article.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const industryLabel = article.industry_type ? industryLabels[article.industry_type as keyof typeof industryLabels] : null;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
      isPressable
      as={Link}
      href={`/support/articles/${article.slug}`}
    >
      <CardHeader className="flex gap-3 pb-2">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Chip
              color={categoryColors[article.category as keyof typeof categoryColors]}
              size="sm"
              variant="flat"
            >
              {categoryLabel}
            </Chip>
            {industryLabel && (
              <Chip
                color="default"
                size="sm"
                variant="bordered"
              >
                {industryLabel}
              </Chip>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {article.title}
          </h3>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="mb-4">
          <p className="text-default-600 text-sm line-clamp-3">
            {truncateContent(article.content.replace(/<[^>]*>/g, ''))}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-default-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <EyeIcon className="h-3 w-3" />
              <span>{article.view_count || 0} views</span>
            </div>
            
            {(article.helpful_count || 0) > 0 && (
              <div className="flex items-center gap-1">
                <ThumbUpIcon className="h-3 w-3" />
                <span>{article.helpful_count}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                color="default"
                className="text-xs"
              >
                {tag}
              </Chip>
            ))}
            {article.tags.length > 3 && (
              <Chip
                size="sm"
                variant="flat"
                color="default"
                className="text-xs"
              >
                +{article.tags.length - 3}
              </Chip>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}