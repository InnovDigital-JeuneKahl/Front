"use client"

import { FileText, Headphones, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProcessingFileProps {
  file: {
    id: string
    name: string
    type: string
    status: "pending" | "processing" | "ready"
    progress: number
  }
  onDelete: () => void
}

export function ProcessingFile({ file, onDelete }: ProcessingFileProps) {
  const getFileIcon = () => {
    switch (file.type) {
      case "PDF":
        return (
          <FileText className={cn("h-5 w-5", file.status === "ready" ? "text-red-500" : "text-muted-foreground")} />
        )
      case "Audio":
        return (
          <Headphones className={cn("h-5 w-5", file.status === "ready" ? "text-blue-500" : "text-muted-foreground")} />
        )
      case "Video":
        return (
          <Video className={cn("h-5 w-5", file.status === "ready" ? "text-purple-500" : "text-muted-foreground")} />
        )
      default:
        return (
          <FileText className={cn("h-5 w-5", file.status === "ready" ? "text-green-500" : "text-muted-foreground")} />
        )
    }
  }

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <div className="truncate max-w-[150px] text-sm">{file.name}</div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDelete}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {file.status === "pending" ? (
        <div className="text-xs text-muted-foreground">Waiting for analysis</div>
      ) : file.status === "processing" ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Preprocessing file...</span>
            <span className="font-medium">{Math.round(file.progress)}%</span>
          </div>
          <Progress value={file.progress} className="h-1" />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Ready for analysis</div>
      )}
    </div>
  )
}
