'use client'

import { useEffect, useState } from 'react'
import { useDashboardRealtime, RecentActivity } from '@/hooks/useDashboardRealtime'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { X, Bell, AlertCircle, CheckCircle, Calendar, Phone, Wifi, WifiOff } from 'lucide-react'

interface RealtimeNotificationsProps {
  className?: string
}

export function RealtimeNotifications({ className }: RealtimeNotificationsProps) {
  const {
    notifications,
    isConnected,
    error,
    clearNotification,
    clearAllNotifications
  } = useDashboardRealtime()

  const [isVisible, setIsVisible] = useState(false)

  // Show notifications panel when there are unread notifications
  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true)
    }
  }, [notifications.length])

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
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-50 border-blue-200'
      case 'event':
        return 'bg-green-50 border-green-200'
      case 'calendar_sync':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (!isVisible || notifications.length === 0) {
    return (
      <div className={`fixed top-4 right-4 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {isConnected ? 'Real-time connected' : 'Connection lost'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed top-4 right-4 w-80 max-w-sm z-50 ${className}`}>
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Live Updates</h3>
              {!isConnected && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {notifications.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs px-2 py-1 h-auto"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {error}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getActivityColor(notification.type)} relative group`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearNotification(notification.id)}
                  className="absolute top-1 right-1 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex items-start space-x-3 pr-6">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                    
                    {notification.metadata?.urgent && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealtimeNotifications