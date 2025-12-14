"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-context"
import { MoreVertical, Check, X, AlertCircle } from "lucide-react"
import Image from "next/image"

const notifications = [
  {
    id: 1,
    name: "Mary Pereira",
    message: "has invited you to access the project",
    time: "1h",
    hasActions: true,
  },
  {
    id: 2,
    name: "Mary Pereira",
    message: "changed status of task in the project",
    time: "1h",
    hasActions: false,
  },
  {
    id: 3,
    name: "Mary Pereira",
    message: "added new tasks to the project",
    time: "1h",
    hasActions: false,
  },
]

export function NotificationsPanel() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <Card className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Notifications
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Unread
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary)] text-white min-w-[24px] text-center">
            6
          </span>
        </div>
      </div>
      
      {/* Notifications List - Vertical Fill / Auto Spacing */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0 mb-6">
        {notifications.map((notif, index) => (
          <div key={notif.id}>
            <div className="flex flex-col gap-3 pb-4" role="article">
            <div className="flex gap-3 items-start">
              {/* Avatar */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/dff1d7255654f23e342cabe6f9ffcbfc8188a4c3.png"
                  alt={`${notif.name} profile picture`}
                  fill
                  className="object-cover object-top"
                  style={{ objectPosition: 'center top' }}
                  sizes="40px"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Name, Time, and Menu Row */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {notif.name}
                    </span>
                    <span className={isDark ? "text-white/30" : "text-gray-400"}>•</span>
                    <span className={`text-xs ${
                      isDark ? "text-white/60" : "text-gray-600"
                    }`}>
                      {notif.time}
                    </span>
                  </div>
                  <button
                    className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] flex-shrink-0 ${
                      isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
                    }`}
                    aria-label="More options"
                  >
                    <MoreVertical className={`w-4 h-4 ${
                      isDark ? "text-white/60" : "text-gray-600"
                    }`} />
                  </button>
                </div>
                
                {/* Message */}
                <p className={`text-sm mb-0 ${
                  isDark ? "text-white/70" : "text-gray-700"
                }`}>
                  {notif.message}
                </p>
              </div>
            </div>
            
            {/* Action Buttons (only for first notification) - Full Width */}
            {notif.hasActions && (
              <div className="flex gap-4 w-full">
                <Button 
                  size="sm" 
                  className="flex-1 h-8"
                  aria-label="Accept invitation"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  aria-label="Deny request"
                >
                  <X className="w-4 h-4" />
                  Deny request
                </Button>
              </div>
            )}
            </div>
            {index < notifications.length - 1 && (
              <div className={`border-b mb-4 ${
                isDark ? "border-white/10" : "border-gray-300"
              }`} />
            )}
          </div>
        ))}
        
        {/* System Notification Card */}
        <div className={`rounded-lg p-3 flex gap-3 items-start mt-auto ${
          isDark ? "bg-white/5" : "bg-blue-50"
        }`}>
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm flex-1 ${
            isDark ? "text-white/80" : "text-gray-900"
          }`}>
            We have updated our Terms and Condition. Please review
          </p>
        </div>
      </div>
      
      {/* Footer Action Buttons */}
      <div className={`flex gap-4 pt-4 border-t ${
        isDark ? "border-white/10" : "border-gray-300"
      }`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9"
        >
          Mark all as read
        </Button>
          <Button
            size="sm"
            className="flex-1 h-9"
          >
            View all
          </Button>
      </div>
    </Card>
  )
}
