"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, FileTextIcon, FileAudioIcon, FileImageIcon, Mic, MicOff, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UploadedFile } from "./file-upload-zone"
import { Progress } from "@/components/ui/progress"

interface RequestFrameProps {
  files: UploadedFile[]
  userQuery: string
  setUserQuery: (query: string) => void
  isProcessing: boolean
  onSubmit: (e: React.FormEvent) => void
  processingMessage: string
}

// Hook to safely use browser APIs and ensure hydration safety
function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}

export function RequestFrame({ files, userQuery, setUserQuery, isProcessing, onSubmit, processingMessage }: RequestFrameProps) {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const isHydrated = useHydration();

  const toggleAudioRecording = () => {
    setIsRecordingAudio(!isRecordingAudio)
    if (isRecordingAudio) {
      // Simulate ending recording and setting the query
      setUserQuery("Transcribed voice query: What financial projections are mentioned in these documents?")
    }
  }

  // Render file grid only post-mounting to avoid hydration issues
  const renderFileGrid = () => {
    if (!files || files.length === 0) return null;
    
    return (
      <div className="mt-4 bg-zinc-900 rounded-lg p-4">
        <div className="text-sm font-medium text-zinc-300 mb-3">Uploaded Files</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {files.map((file, index) => (
            <div key={file.id || `file-${index}`} className="bg-zinc-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon className="w-4 h-4 text-purple-500" />
                <div className="text-sm font-medium text-zinc-300 truncate" title={file.name}>
                  {file.name}
                </div>
              </div>
              
              {file.status === "uploading" ? (
                <div className="space-y-2">
                  <Progress value={file.progress} className="h-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">{file.progress}%</span>
                    <span className="text-xs text-zinc-400">{Math.round(file.size / 1024)} KB</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-400">
                  {Math.round(file.size / 1024)} KB • {file.status === "complete" ? "Uploaded" : "Error"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a loading/processing skeleton during server rendering and processing
  if (!isHydrated || isProcessing) {
    return (
      <div className="rounded-lg border p-6 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          {/* Always show a static spinner during SSR */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200">
              <div className="w-16 h-16 rounded-full border-t-4 border-purple-500"></div>
            </div>
          </div>
          
          {/* For client-side, we can show animations */}
          {isHydrated && (
            <div className="mt-6 text-center">
              <div className="text-lg font-medium">{processingMessage || "Processing..."}</div>
              <div className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                    {isHydrated && (
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
