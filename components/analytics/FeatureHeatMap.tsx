'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { 
  FireIcon,
  EyeIcon,
  UserGroupIcon,
  CursorArrowRippleIcon 
} from '@heroicons/react/24/outline';

interface FeatureUsageData {
  feature: string;
  totalUsage: number;
  uniqueUsers: number;
  adoptionRate: number;
  byIndustry: Record<string, number>;
  byTier: Record<string, number>;
}

interface FeatureHeatMapProps {
  data: FeatureUsageData[];
  heatMapData: Record<string, { intensity: number; users: number; usage: number }>;
  isLoading?: boolean;
  className?: string;
}

export default function FeatureHeatMap({ 
  data = [], 
  heatMapData = {},
  isLoading = false,
  className = '' 
}: FeatureHeatMapProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'usage' | 'users' | 'adoption'>('usage');

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.totalUsage - a.totalUsage;
      case 'users':
        return b.uniqueUsers - a.uniqueUsers;
      case 'adoption':
        return b.adoptionRate - a.adoptionRate;
      default:
        return 0;
    }
  });

  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 0.8) return 'bg-danger-500';
    if (intensity >= 0.6) return 'bg-warning-500';
    if (intensity >= 0.4) return 'bg-primary-500';
    if (intensity >= 0.2) return 'bg-secondary-500';
    return 'bg-default-300';
  };

  const getIntensityLabel = (intensity: number): string => {
    if (intensity >= 0.8) return 'Very High';
    if (intensity >= 0.6) return 'High';
    if (intensity >= 0.4) return 'Medium';
    if (intensity >= 0.2) return 'Low';
    return 'Minimal';
  };

  const formatFeatureName = (feature: string): string => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-default-200 rounded w-48"></div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-16 bg-default-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-warning-500" />
            Feature Usage Heat Map
          </h3>
          <p className="text-sm text-default-600">Visualize feature adoption and usage patterns</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select
            size="sm"
            placeholder="Sort By"
            selectedKeys={[sortBy]}
            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as 'usage' | 'users' | 'adoption')}
            className="w-32"
          >
            <SelectItem key="usage" value="usage">Usage</SelectItem>
            <SelectItem key="users" value="users">Users</SelectItem>
            <SelectItem key="adoption" value="adoption">Adoption</SelectItem>
          </Select>
          
          <div className="flex rounded-lg border border-default-200 overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'light'}
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CursorArrowRippleIcon className="h-12 w-12 text-default-300 mb-4" />
            <h4 className="text-lg font-semibold text-default-600 mb-2">No Feature Usage Data</h4>
            <p className="text-default-500">Start using features to see usage patterns here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Heat Map Grid View */}
            {viewMode === 'grid' && (
              <div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                  {sortedData.slice(0, 32).map((feature, index) => {
                    const heatData = heatMapData[feature.feature] || { intensity: 0, users: 0, usage: 0 };
                    return (
                      <div
                        key={feature.feature}
                        className={`
                          relative aspect-square rounded-lg p-2 text-white text-xs font-medium
                          flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform
                          ${getIntensityColor(heatData.intensity)}
                        `}
                        title={`${formatFeatureName(feature.feature)}: ${feature.totalUsage} uses by ${feature.uniqueUsers} users`}
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold text-xs leading-tight">
                            {formatFeatureName(feature.feature)}
                          </div>
                        </div>
                        <div className="text-xs opacity-90">
                          {feature.totalUsage}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-default-600">Intensity:</span>
                  {['Minimal', 'Low', 'Medium', 'High', 'Very High'].map((label, index) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded ${getIntensityColor(index * 0.2)}`}></div>
                      <span className="text-xs text-default-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {sortedData.map((feature, index) => (
                  <div key={feature.feature} className="flex items-center gap-4 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-sm font-semibold text-default-600">#{index + 1}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {formatFeatureName(feature.feature)}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-default-500">
                        <span className="flex items-center gap-1">
                          <CursorArrowRippleIcon className="h-3 w-3" />
                          {feature.totalUsage} uses
                        </span>
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="h-3 w-3" />
                          {feature.uniqueUsers} users
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="h-3 w-3" />
                          {feature.adoptionRate.toFixed(1)}% adoption
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          heatMapData[feature.feature]?.intensity >= 0.6 ? 'danger' :
                          heatMapData[feature.feature]?.intensity >= 0.3 ? 'warning' : 'default'
                        }
                      >
                        {getIntensityLabel(heatMapData[feature.feature]?.intensity || 0)}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-default-200">
              <div>
                <p className="text-xs text-default-500">Total Features</p>
                <p className="text-lg font-semibold">{data.length}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Most Used</p>
                <p className="text-sm font-medium">{formatFeatureName(sortedData[0]?.feature || 'N/A')}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Total Usage</p>
                <p className="text-lg font-semibold">{data.reduce((sum, f) => sum + f.totalUsage, 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Avg Adoption</p>
                <p className="text-lg font-semibold">
                  {data.length > 0 ? (data.reduce((sum, f) => sum + f.adoptionRate, 0) / data.length).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}