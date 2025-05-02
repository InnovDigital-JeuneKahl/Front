"use client"

import { FileText, Headphones, MessageSquare, Video } from "lucide-react"

import { cn } from "@/lib/utils"

interface HistoryItemProps {
  item: {
    id: string
    title: string
    date: string
    type: string
  }
  isActive: boolean
  onClick: () => void
}

export function HistoryItem({ item, isActive, onClick }: HistoryItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case "PDF":
        return <FileText className="h-4 w-4" />
      case "Audio":
        return <Headphones className="h-4 w-4" />
      case "Video":
        return <Video className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md p-3 text-sm transition-colors cursor-pointer",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <div className="mt-px">{getIcon()}</div>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium leading-none truncate">{item.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
      </div>
    </div>
  )
}
