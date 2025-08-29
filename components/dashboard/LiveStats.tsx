'use client'

import { useState, useEffect } from 'react'
import { useDashboardRealtime, DashboardStats } from '@/hooks/useDashboardRealtime'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Calendar, 
  Clock, 
  Sync,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2
} from 'lucide-react'

interface LiveStatsProps {
  className?: string
}

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    label: string
  }
  isLoading?: boolean
}

export function LiveStats({ className }: LiveStatsProps) {
  const { stats, isConnected } = useDashboardRealtime()
  const [previousStats, setPreviousStats] = useState<DashboardStats>(stats)
  const [isUpdating, setIsUpdating] = useState(false)

  // Track stats changes for animations
  useEffect(() => {
    if (JSON.stringify(stats) !== JSON.stringify(previousStats)) {
      setIsUpdating(true)
      const timeout = setTimeout(() => {
        setPreviousStats(stats)
        setIsUpdating(false)
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [stats, previousStats])

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      subtitle: 'This month',
      icon: <Phone className="h-5 w-5 text-blue-500" />,
      trend: {
        direction: stats.totalCalls > previousStats.totalCalls ? 'up' : 'neutral',
        value: '+23%',
        label: 'vs last month'
      },
      isLoading: isUpdating
    },
    {
      title: 'Events Extracted',
      value: stats.eventsExtracted,
      subtitle: 'AI accuracy: 92%',
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      trend: {
        direction: stats.eventsExtracted > previousStats.eventsExtracted ? 'up' : 'neutral',
        value: '+5.2%',
        label: 'accuracy improved'
      },
      isLoading: isUpdating
    },
    {
      title: 'Avg Response Time',
      value: `${stats.avgResponseTime}m`,
      subtitle: 'Call to email',
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      trend: {
        direction: stats.avgResponseTime < previousStats.avgResponseTime ? 'up' : 'neutral',
        value: '-15s',
        label: 'faster than target'
      },
      isLoading: isUpdating
    },
    {
      title: 'Calendar Synced',
      value: `${stats.calendarSyncRate}%`,
      subtitle: 'Success rate',
      icon: <Sync className="h-5 w-5 text-indigo-500" />,
      trend: {
        direction: stats.calendarSyncRate > previousStats.calendarSyncRate ? 'up' : 'neutral',
        value: '+2.1%',
        label: 'vs last week'
      },
      isLoading: isUpdating
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((card, index) => (
        <Card 
          key={card.title}
          className={`relative overflow-hidden transition-all duration-300 ${
            card.isLoading ? 'ring-2 ring-blue-200 bg-blue-50/30' : 'hover:shadow-md'
          }`}
        >
          <CardContent className="p-6">
            {/* Connection status indicator */}
            {!isConnected && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {card.icon}
                  <div className="flex items-center space-x-1">
                    {card.trend && getTrendIcon(card.trend.direction)}
                    <span className={`text-sm ${
                      card.trend?.direction === 'up' ? 'text-green-600' : 
                      card.trend?.direction === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {card.trend?.value}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {card.isLoading ? (
                        <span className="flex items-center space-x-1">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-gray-400">Updating...</span>
                        </span>
                      ) : (
                        card.value
                      )}
                    </h3>
                    
                    {!card.isLoading && isConnected && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Live
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
                  
                  {card.trend && (
                    <p className="text-xs text-gray-500 mt-2">{card.trend.label}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          
          {/* Loading overlay */}
          {card.isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
          )}
        </Card>
      ))}
    </div>
  )
}

export default LiveStats