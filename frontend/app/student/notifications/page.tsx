'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function ReviewNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetch(
      'http://localhost:5000/api/review-notifications/my',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
      .then(res => res.json())
      .then(data =>
        setNotifications(data.notifications || [])
      )
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(
      `http://localhost:5000/api/review-notifications/${id}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    setNotifications(prev =>
      prev.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      )
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Review Notifications
      </h1>

      {notifications.map(n => (
        <Card
          key={n._id}
          className={`p-4 flex justify-between ${
            !n.isRead ? 'bg-primary/5' : ''
          }`}
        >
          <div className="flex gap-3">
            <CheckCircle className="text-primary mt-1" />
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm">{n.message}</p>
            </div>
          </div>

          {!n.isRead && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAsRead(n._id)}
            >
              Mark read
            </Button>
          )}
        </Card>
      ))}
    </div>
  )
}