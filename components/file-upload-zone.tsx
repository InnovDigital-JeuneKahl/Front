"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { FileIcon, FileTextIcon, FileAudioIcon, FileImageIcon, X, AlertCircle, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "complete" | "error"
  file: File
  url?: string
}

interface FileUploadZoneProps {
  onFilesUploaded?: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
}

export function FileUploadZone({
  onFilesUploaded,
  maxFiles = 10,
  acceptedFileTypes = ["application/pdf", "audio/*", "text/*", "image/*"],
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(
    (files: FileList) => {
      setError(null)

      if (uploadedFiles.length + files.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files.`)
        return
      }

      const newFiles: UploadedFile[] = []

      Array.from(files).forEach((file) => {
        // Check if file type is accepted
        if (!acceptedFileTypes.some((type) => file.type.match(type))) {
          setError(`File type ${file.type} is not supported.`)
          return
        }

        // Check if file already exists
        if (uploadedFiles.some((f) => f.name === file.name && f.size === file.size)) {
          setError(`File ${file.name} already exists.`)
          return
        }

        const newFile: UploadedFile = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "uploading",
          file,
        }

        newFiles.push(newFile)
      })

      if (newFiles.length === 0) return

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Simulate file upload progress
      newFiles.forEach((file) => {
        simulateFileUpload(file)
      })
    },
    [acceptedFileTypes, maxFiles, uploadedFiles],
  )

  const simulateFileUpload = useCallback(
    (file: UploadedFile) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    progress: 100,
                    status: "complete",
                    url: URL.createObjectURL(f.file),
                  }
                : f,
            ),
          )

          // Notify parent component
          const updatedFiles = uploadedFiles.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress: 100,
                  status: "complete",
                  url: URL.createObjectURL(f.file),
                }
              : f,
          )
          onFilesUploaded?.(updatedFiles)
        } else {
          setUploadedFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress } : f)))
        }
      }, 200)
    },
    [onFilesUploaded, uploadedFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
    },
    [processFiles],
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeFile = useCallback(
    (id: string) => {
      setUploadedFiles((prev) => {
        const updatedFiles = prev.filter((f) => f.id !== id)
        onFilesUploaded?.(updatedFiles)
        return updatedFiles
      })
    },
    [onFilesUploaded],
  )

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileTextIcon className="text-red-500" size={20} />
    } else if (fileType.includes("audio")) {
      return <FileAudioIcon className="text-blue-500" size={20} />
    } else if (fileType.includes("image")) {
      return <FileImageIcon className="text-purple-500" size={20} />
    } else if (fileType.includes("text") || fileType.includes("document")) {
      return <FileTextIcon className="text-green-500" size={20} />
    } else {
      return <FileIcon className="text-zinc-500" size={20} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors p-8",
          isDragging ? "border-purple-500 bg-slate-50" : "border-slate-300 bg-white",
          uploadedFiles.length > 0 ? "h-32" : "h-64",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInputChange}
        />
        <div className="mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-slate-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-800 mb-1">Drag & drop files here</p>
        <p className="text-xs text-slate-500">Supports PDF, Audio, Video, and Text files (max {maxFiles} files)</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-md p-3 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <h3 className="text-sm font-medium text-slate-700">Uploaded Files ({uploadedFiles.length})</h3>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-white border border-slate-200 rounded-md p-3 flex items-center gap-3 shadow-sm">
              <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-700">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.status === "complete" ? "Uploaded" : "Uploading..."}</span>
                </div>
                {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-2 bg-slate-200" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(file.id)
                }}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
          
          <div className="pt-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleBrowseClick}>
              <PlusIcon size={16} className="mr-2" /> Add More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
