"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { FileUp } from "lucide-react"

import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
}

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesUploaded(files)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesUploaded(Array.from(files))
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300",
        isDragging
          ? "border-primary bg-primary/5 scale-105 shadow-lg"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
        accept=".pdf,.mp3,.wav,.txt,.docx,.mp4,.mov"
      />
      <FileUp
        className={cn(
          "h-10 w-10 mx-auto mb-3 transition-transform duration-300",
          isDragging ? "text-primary scale-110" : "text-muted-foreground",
        )}
      />
      <p className="text-sm font-medium mb-1">Drag & drop files here</p>
      <p className="text-xs text-muted-foreground">Supports PDF, Audio, Video, and Text files</p>
    </div>
  )
}
