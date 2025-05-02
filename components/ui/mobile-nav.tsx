"use client"

import { FileUp, History, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"

interface MobileNavProps {
  activePanel: "history" | "main" | "upload"
  setActivePanel: (panel: "history" | "main" | "upload") => void
}

export function MobileNav({ activePanel, setActivePanel }: MobileNavProps) {
  return (
    <div className="flex items-center justify-around h-16 px-4">
      <button
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16",
          activePanel === "history" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActivePanel("history")}
      >
        <History className="h-6 w-6" />
        <span className="text-xs mt-1">History</span>
      </button>
      <button
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16",
          activePanel === "main" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActivePanel("main")}
      >
        <MessageSquare className="h-6 w-6" />
        <span className="text-xs mt-1">Chat</span>
      </button>
      <button
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16",
          activePanel === "upload" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActivePanel("upload")}
      >
        <FileUp className="h-6 w-6" />
        <span className="text-xs mt-1">Upload</span>
      </button>
    </div>
  )
}
