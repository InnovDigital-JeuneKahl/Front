"use client"

import { useState } from "react"
import { ArrowLeft, FileText, Headphones, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { AudioPlayer } from "./audio-player"

interface DetailsModalProps {
  isOpen: boolean
  onClose: () => void
  insight: {
    id: string
    text: string
    confidence: string
    source: {
      type: string
      content: string
      location: any
    }
  } | null
  formatTime: (seconds: number) => string
}

export function DetailsModal({ isOpen, onClose, insight, formatTime }: DetailsModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!insight) return null

  const renderSourceIcon = () => {
    switch (insight.source.type) {
      case "text":
        return <FileText className="h-5 w-5 text-red-500" />
      case "audio":
        return <Headphones className="h-5 w-5 text-blue-500" />
      case "video":
        return <Video className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-green-500" />
    }
  }

  const renderLocationInfo = () => {
    if (insight.source.type === "text") {
      return (
        <div className="text-sm">
          <p className="text-muted-foreground">Location:</p>
          <p>
            Page {insight.source.location.page}, Line {insight.source.location.lineNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Bounding Box: ({insight.source.location.boundingBox.x1}, {insight.source.location.boundingBox.y1}) - (
            {insight.source.location.boundingBox.x2}, {insight.source.location.boundingBox.y2})
          </p>
        </div>
      )
    } else if (insight.source.type === "audio" || insight.source.type === "video") {
      return (
        <div className="text-sm">
          <p className="text-muted-foreground">Timestamp:</p>
          <p>
            {formatTime(insight.source.location.startTime)} → {formatTime(insight.source.location.endTime)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderPreviewOrPlay = () => {
    if (insight.source.type === "text") {
      return (
        <Button variant="outline" size="sm" className="mt-2">
          Highlight in Document
        </Button>
      )
    } else if (insight.source.type === "audio" || insight.source.type === "video") {
      return (
        <div className="mt-2">
          <AudioPlayer
            type={insight.source.type}
            startTime={insight.source.location.startTime}
            endTime={insight.source.location.endTime}
            formatTime={formatTime}
          />
        </div>
      )
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Source Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                insight.confidence === "high"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              )}
            >
              {insight.confidence === "high" ? "High Confidence" : "Medium Confidence"}
            </div>
            <div className="text-xs text-muted-foreground">
              Source Type: {insight.source.type.charAt(0).toUpperCase() + insight.source.type.slice(1)}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Extracted Insight</h3>
            <p className="text-sm">{insight.text}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-md font-medium mb-4">Source Information</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4 border-l-2 pl-4 py-2 border-l-primary">
                <div className="mt-1">{renderSourceIcon()}</div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Original Content</p>
                    <div className="p-3 bg-muted/30 rounded-md text-sm">{insight.source.content}</div>
                  </div>

                  {renderLocationInfo()}
                  {renderPreviewOrPlay()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Validate Insight</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
