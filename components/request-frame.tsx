"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, FileTextIcon, FileAudioIcon, FileImageIcon, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UploadedFile } from "./file-upload-zone"

interface RequestFrameProps {
  files: UploadedFile[]
  userQuery: string
  setUserQuery: (query: string) => void
  isProcessing: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function RequestFrame({ files, userQuery, setUserQuery, isProcessing, onSubmit }: RequestFrameProps) {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Fix hydration issues by only rendering client-specific content after mounting
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const toggleAudioRecording = () => {
    setIsRecordingAudio(!isRecordingAudio)
    if (isRecordingAudio) {
      // Simulate ending recording and setting the query
      setUserQuery("Transcribed voice query: What financial projections are mentioned in these documents?")
    }
  }

  // Safe presentation of file grid that won't cause hydration issues
  const renderFileGrid = () => {
    if (!hasMounted) return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-4 aspect-square shadow-sm"
          >
            {file.type.includes("pdf") ? (
              <FileTextIcon className="h-10 w-10 text-red-500" />
            ) : file.type.includes("audio") ? (
              <FileAudioIcon className="h-10 w-10 text-blue-500" />
            ) : file.type.includes("image") ? (
              <FileImageIcon className="h-10 w-10 text-purple-500" />
            ) : (
              <FileTextIcon className="h-10 w-10 text-green-500" />
            )}
            <p className="mt-2 text-sm font-medium text-center truncate max-w-full text-slate-700">{file.name}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-medium text-slate-800">Analysis Request</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-slate-200 animate-spin"></div>
              </div>
              <h2 className="text-xl font-medium mb-2 text-slate-800">Processing your request...</h2>
              <p className="text-slate-500 text-center max-w-md">
                Analyzing your files and extracting relevant information. This may take a moment.
              </p>
              
              {/* Animated typing indicator */}
              <div className="flex items-center justify-center mt-12">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-medium mb-6 text-slate-800">What would you like to know?</h1>
              <p className="text-slate-500 mb-6">
                Your files are ready. Enter your query below to start the analysis.
              </p>

              {renderFileGrid()}

              <form onSubmit={onSubmit} className="mt-8">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Ask a question about your files..."
                      className="pr-10 py-6 text-base bg-white border-slate-300 text-slate-800"
                    />
                    {hasMounted && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                          isRecordingAudio ? "text-red-500" : "text-slate-400 hover:text-slate-700"
                        }`}
                        onClick={toggleAudioRecording}
                      >
                        {isRecordingAudio ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="h-12 bg-purple-600 hover:bg-purple-700"
                    disabled={!userQuery.trim()}
                  >
                    Analyze
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {files.length} file{files.length !== 1 ? 's' : ''} ready for analysis
          </div>
          <Button 
            variant="outline" 
            className="text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800"
            onClick={() => window.history.back()}
          >
            Back to Upload
          </Button>
        </div>
      </div>
    </div>
  )
}
