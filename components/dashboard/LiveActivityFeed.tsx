'use client'

import { useDashboardRealtime, RecentActivity } from '@/hooks/useDashboardRealtime'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Phone, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LiveActivityFeedProps {
  className?: string
  showHeader?: boolean
  maxItems?: number
}

export function LiveActivityFeed({ 
  className, 
  showHeader = true, 
  maxItems = 5 
}: LiveActivityFeedProps) {
  const {
    recentActivity,
    isConnected,
    error,
    refreshStats
  } = useDashboardRealtime()

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />
      case 'calendar_sync':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadgeColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'calendar_sync':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleActivityClick = (activity: RecentActivity) => {
    // Navigate to relevant page based on activity type
    if (activity.type === 'call' && activity.metadata?.callId) {
      window.open(`/calls/${activity.metadata.callId}`, '_blank')
    } else if (activity.type === 'event' && activity.metadata?.eventId) {
      window.open(`/events/${activity.metadata.eventId}`, '_blank')
    }
  }

  const displayedActivity = recentActivity.slice(0, maxItems)

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-700" />
              <span>Recent Activity</span>
              <div className="flex items-center ml-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="ml-1 text-xs text-gray-500">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStats}
              className="p-1 h-auto"
              title="Refresh activity"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-3">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Real-time updates unavailable</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {displayedActivity.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Activity will appear here as calls are processed
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${getActivityBadgeColor(activity.type)}`}
                      variant="secondary"
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 break-words leading-snug">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {activity.metadata?.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(activity.metadata.confidence * 100)}% confidence
                        </Badge>
                      )}
                      
                      {activity.metadata?.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      
                      {(activity.metadata?.callId || activity.metadata?.eventId) && (
                        <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentActivity.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/calls" className="text-xs">
                View all activity ({recentActivity.length} total)
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LiveActivityFeed