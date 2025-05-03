"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { FileIcon, PlusIcon, SearchIcon, ArrowLeftIcon, MessageSquareIcon, PaperclipIcon, SendIcon, X, FileTextIcon, FileAudioIcon, FileImageIcon, Mic, MicOff, PlayIcon, PauseIcon, StopCircleIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Message types
type MessageType = 'text' | 'file' | 'analysis-result' | 'system'

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  sender: 'user' | 'assistant'
  files?: UploadedFile[]
  analysisResults?: any
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "complete" | "error"
  url?: string
}

// Chat thread type
type ThreadType = {
  id: string
  title: string
  date: string
  lastMessage: string
  color: keyof typeof threadColors
}

// Predefined colors to avoid hydration issues with dynamic classname construction
const threadColors = {
  purple: "bg-purple-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
}

// Hook to safely use browser APIs and ensure hydration safety
function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}

export default function ChatDocumentAnalysis() {
  // Use hydration hook to safely detect client-side rendering
  const isHydrated = useHydration();
  
  // IMPORTANT: Initial messages with deterministic IDs for server rendering
  const initialMessages = [
    {
      id: "sys-msg-1", // Using stable IDs for initial server render
      type: "system" as MessageType,
      content: "Hello! I'm your document analysis assistant. Upload files or ask me questions about your documents.",
      timestamp: new Date('2023-05-01T12:00:00'), // Static date for SSR
      sender: 'assistant' as const
    }
  ];

  // Initial threads with stable IDs and static dates for server rendering
  const initialThreads = [
    {
      id: "thread-1",
      title: "Financial Report Analysis",
      date: "May 1, 2023",
      lastMessage: "Here's what I found in the financial report...",
      color: "purple" as const,
    },
    {
      id: "thread-2",
      title: "Sales Pitch Review",
      date: "April 28, 2023",
      lastMessage: "Your sales pitch has several key points that could be improved...",
      color: "red" as const,
    },
    {
      id: "thread-3",
      title: "Board Meeting Minutes",
      date: "April 15, 2023",
      lastMessage: "The board meeting minutes contain the following decisions...",
      color: "blue" as const,
    }
  ];
  
  // Chat threads state
  const [threads, setThreads] = useState<ThreadType[]>(initialThreads);
  
  // Active thread ID
  const [activeThreadId, setActiveThreadId] = useState<string | null>("thread-1");
  
  // Chat messages
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  
  // Current message input
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Files being uploaded in the current message
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([]);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  
  // Audio refs - Only used client-side
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Message container ref for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add drag and drop state variables
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Auto scroll to bottom of messages - Client side only
  useEffect(() => {
    if (isHydrated && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isHydrated]);

  // Generate an ID for messages - Safe for both SSR and CSR
  const generateId = useCallback(() => {
    if (!isHydrated) {
      // Server-side or during hydration, use a stable ID
      return `msg-static-id`;
    }
    // Client-side after hydration, use dynamic ID
    return `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }, [isHydrated]);
  
  // Format date safely for both server and client
  const formatDate = useCallback((date: Date) => {
    // Use fixed locale and format options for consistent server/client rendering
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);
  
  // Handle creating a new thread - Client-side only
  const handleNewThread = useCallback(() => {
    if (!isHydrated) return; // Only run on client
    
    const newThreadId = `thread-${Date.now()}`;
    const formattedDate = formatDate(new Date());
    
    const newThread: ThreadType = {
      id: newThreadId,
      title: `New Conversation`,
      date: formattedDate,
      lastMessage: "Start a new conversation",
      color: "purple",
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    setMessages([{
      id: "sys-welcome",
      type: "system",
      content: "Hello! I'm your document analysis assistant. Upload files or ask me questions about your documents.",
      timestamp: new Date(),
      sender: "assistant"
    }]);
    setCurrentFiles([]);
    setCurrentMessage("");
  }, [isHydrated, formatDate]);

  // Handle selecting a thread  
  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
    // In a real app, you would fetch the messages for this thread from your backend
    // For this demo, we'll reset to initial messages
    setMessages([{
      id: "sys-welcome",
      type: "system",
      content: "Hello! I'm your document analysis assistant. Upload files or ask me questions about your documents.",
      timestamp: new Date(),
      sender: "assistant"
    }])
    setCurrentFiles([])
    setCurrentMessage("")
  }, [])
  
  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
      }))
      
      setCurrentFiles(prev => [...prev, ...newFiles])
      
      // Simulate upload progress
      newFiles.forEach(file => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          if (progress >= 100) {
            clearInterval(interval)
            setCurrentFiles(prev => 
              prev.map(f => f.id === file.id ? { ...f, progress: 100, status: "complete" } : f)
            )
          } else {
            setCurrentFiles(prev => 
              prev.map(f => f.id === file.id ? { ...f, progress } : f)
            )
          }
        }, 300)
      })
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])
  
  // Handle removing a file
  const handleRemoveFile = useCallback((fileId: string) => {
    setCurrentFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])
  
  // Format recording time (mm:ss)
  const formatRecordingTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])
  
  // Modified startRecording to only work on client
  const startRecording = useCallback(async () => {
    // Only proceed if we're on the client side
    if (!isHydrated) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
        
        // Clean up the media stream tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setShowRecordingModal(true)
      setRecordingTime(0)
      
      // Start a timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive"
      })
    }
  }, [isHydrated])
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clear the recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }, [isRecording])
  
  // Cancel recording
  const cancelRecording = useCallback(() => {
    stopRecording()
    setAudioBlob(null)
    setAudioUrl(null)
    setShowRecordingModal(false)
  }, [stopRecording])
  
  // Attach the recorded audio to the message
  const attachRecordedAudio = useCallback(() => {
    if (audioBlob) {
      // Create a file from the blob
      const fileName = `voice-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`
      const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' })
      
      // Create an uploaded file object
      const newAudioFile: UploadedFile = {
        id: `audio-${Date.now()}`,
        name: fileName,
        size: audioBlob.size,
        type: 'audio/wav',
        progress: 100,
        status: 'complete',
        url: audioUrl || undefined
      }
      
      // Add to current files
      setCurrentFiles(prev => [...prev, newAudioFile])
      
      // Close the recording modal and reset recording state
      setShowRecordingModal(false)
      setAudioBlob(null)
      setAudioUrl(null)
    }
  }, [audioBlob, audioUrl])
  
  // Play/pause the recorded audio
  const toggleAudioPlayback = useCallback(() => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause()
      } else {
        audioPlayerRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])
  
  // Handle audio playback ended
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current
    
    const handleEnded = () => {
      setIsPlaying(false)
    }
    
    if (audioPlayer) {
      audioPlayer.addEventListener('ended', handleEnded)
    }
    
    return () => {
      if (audioPlayer) {
        audioPlayer.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioUrl])
  
  // Toggle recording modal
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])
  
  // Handle sending a message
  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Don't send empty messages unless files are attached
    if (!currentMessage.trim() && currentFiles.length === 0) return
    
    // Add user message to chat
    const newMessage: Message = {
      id: generateId(),
      type: currentFiles.length > 0 ? "file" : "text",
      content: currentMessage,
      timestamp: new Date(),
      sender: "user",
      files: currentFiles.length > 0 ? [...currentFiles] : undefined
    }
    
    setMessages(prev => [...prev, newMessage])
    setCurrentMessage("")
    setCurrentFiles([])
    setIsProcessing(true)
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        type: "text",
        content: currentFiles.length > 0 
          ? "I've analyzed your files and found some interesting insights. The financial report shows a 15% growth in Q3, and the market analysis indicates potential expansion opportunities in the Asian market."
          : "Based on the documents you've shared previously, I'd recommend focusing on the financial projections in section 3. The growth targets seem ambitious but achievable given the market conditions outlined in the report.",
        timestamp: new Date(),
        sender: "assistant",
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsProcessing(false)
      
      // Update thread title and last message if this is a new conversation
      if (threads.find(t => t.id === activeThreadId)?.title === "New Conversation") {
        setThreads(prev => prev.map(thread => 
          thread.id === activeThreadId 
            ? { 
                ...thread, 
                title: currentFiles.length > 0 
                  ? `Analysis of ${currentFiles.map(f => f.name).join(", ")}` 
                  : currentMessage.slice(0, 30) + (currentMessage.length > 30 ? "..." : ""),
                lastMessage: assistantMessage.content.slice(0, 60) + (assistantMessage.content.length > 60 ? "..." : "")
              } 
            : thread
        ))
      }
    }, 2000)
  }, [currentMessage, currentFiles, generateId, activeThreadId, threads])
  
  // Get file icon based on file type
  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileTextIcon className="text-red-500" size={16} />
    } else if (fileType.includes("audio")) {
      return <FileAudioIcon className="text-blue-500" size={16} />
    } else if (fileType.includes("image")) {
      return <FileImageIcon className="text-purple-500" size={16} />
    } else {
      return <FileIcon className="text-slate-500" size={16} />
    }
  }, [])
  
  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }, [])
  
  // Format timestamp - Ensure consistent formatting between server and client
  const formatTime = useCallback((date: Date) => {
    // Use fixed locale and format for consistent server/client rendering
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Handle drag events for the file upload zone
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  }, [isDraggingOver]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Process the dropped files
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
      }));
      
      setCurrentFiles(prev => [...prev, ...newFiles]);
      
      // Simulate upload progress
      newFiles.forEach(file => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            setCurrentFiles(prev => 
              prev.map(f => f.id === file.id ? { ...f, progress: 100, status: "complete" } : f)
            );
          } else {
            setCurrentFiles(prev => 
              prev.map(f => f.id === file.id ? { ...f, progress } : f)
            );
          }
        }, 300);
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-white text-slate-800">
      {/* Left Sidebar - Chat threads */}
      <div className="w-64 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4">
          <Button 
            variant="default" 
            className="w-full justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleNewThread}
          >
            <PlusIcon size={16} /> New Chat
          </Button>
        </div>
        
        <div className="p-2 mb-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-8 bg-white border-slate-200 rounded-sm text-sm h-9 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={cn(
                "flex items-start gap-2 p-3 rounded cursor-pointer mb-1 transition-colors hover:bg-slate-200",
                activeThreadId === thread.id ? "bg-slate-200" : ""
              )}
              onClick={() => handleSelectThread(thread.id)}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 ${threadColors[thread.color]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-slate-800">{thread.title}</div>
                <div className="text-xs truncate text-slate-500">{thread.lastMessage}</div>
                <div className="text-xs text-slate-400 mt-1">{thread.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-3 border-t border-slate-200">
          <Button 
            variant="outline" 
            className="w-full text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Main content area - Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center">
            <h1 className="font-medium text-slate-800">
              {threads.find(t => t.id === activeThreadId)?.title || "New Conversation"}
            </h1>
          </div>
          
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-500 hover:text-slate-700"
            >
              <MessageSquareIcon size={16} className="mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-lg p-4", 
                    message.sender === "user" 
                      ? "bg-purple-600 text-white" 
                      : message.type === "system"
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-white border border-slate-200 text-slate-800"
                  )}
                >
                  {message.content && (
                    <div className="mb-2">{message.content}</div>
                  )}
                  
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.files.map(file => (
                        <div key={file.id} className="flex items-center gap-2 bg-white/10 p-2 rounded text-sm">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{file.name}</div>
                            <div className="text-xs opacity-75">{formatFileSize(file.size)}</div>
                          </div>
                          
                          {/* Audio playback controls - Only rendered client-side after hydration */}
                          {file.type.includes('audio') && file.url && isHydrated && (
                            <button 
                              className="p-1 rounded-full hover:bg-white/20"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Client-only code
                                const audioElement = document.getElementById(`audio-${file.id}`) as HTMLAudioElement;
                                if (audioElement) {
                                  if (audioElement.paused) {
                                    audioElement.play();
                                  } else {
                                    audioElement.pause();
                                  }
                                }
                              }}
                            >
                              <PlayIcon size={16} />
                              {isHydrated && <audio id={`audio-${file.id}`} src={file.url} className="hidden" />}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={cn(
                    "text-xs mt-1", 
                    message.sender === "user" ? "text-purple-200" : "text-slate-400"
                  )}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Only render loading indicator on client */}
            {isProcessing && isHydrated && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Current files - Only render on client */}
        {currentFiles.length > 0 && isHydrated && (
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex flex-wrap gap-2">
              {currentFiles.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center bg-slate-100 rounded-full pl-2 pr-1 py-1 text-sm"
                >
                  {getFileIcon(file.type)}
                  <span className="mx-2 truncate max-w-[150px]">{file.name}</span>
                  
                  {file.status === "uploading" ? (
                    <div className="w-16 h-4 mr-1">
                      <Progress value={file.progress} className="h-1 w-full" />
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-slate-200"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Message input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperclipIcon size={20} />
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                multiple
              />
              
              <div className="relative flex-1">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="pr-10 py-6 text-base bg-white border-slate-300 rounded-full text-slate-800"
                />
                
                {/* Voice recording button - Safe client-side rendering */}
                {isHydrated && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                      isRecording ? "text-red-500" : "text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={handleToggleRecording}
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700"
                disabled={!currentMessage.trim() && currentFiles.length === 0}
              >
                <SendIcon size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right sidebar - Files overview with drag and drop */}
      <div 
        className={`w-72 border-l border-slate-200 flex flex-col bg-slate-50 overflow-hidden ${
          isDraggingOver ? 'bg-purple-50 border-purple-200' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`p-4 border-b ${isDraggingOver ? 'border-purple-200 bg-purple-50' : 'border-slate-200'}`}>
          <h3 className="font-medium text-slate-800">
            {isDraggingOver ? 'Drop Files Here' : 'Uploaded Files'}
          </h3>
        </div>
        
        <div className={`flex-1 overflow-auto p-3 transition-colors duration-200 ${
          isDraggingOver ? 'bg-purple-50' : ''
        }`}>
          {isDraggingOver ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-purple-300 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <PaperclipIcon size={24} className="text-purple-500" />
              </div>
              <h4 className="text-sm font-medium text-purple-700 mb-1">Drop your files here</h4>
              <p className="text-xs text-purple-600 max-w-[200px]">
                Files will be attached to your current message
              </p>
            </div>
          ) : messages.some(message => message.files && message.files.length > 0) ? (
            <div className="space-y-3">
              {messages
                .filter(message => message.files && message.files.length > 0)
                .flatMap(message => message.files || [])
                .map(file => (
                  <div key={file.id} className="bg-white rounded-md p-3 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      {file.type.includes("pdf") ? (
                        <FileTextIcon className="text-red-500" size={18} />
                      ) : file.type.includes("audio") ? (
                        <FileAudioIcon className="text-blue-500" size={18} />
                      ) : file.type.includes("image") ? (
                        <FileImageIcon className="text-purple-500" size={18} />
                      ) : (
                        <FileIcon className="text-slate-500" size={18} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Status</span>
                        <span className="text-green-600 font-medium">Analyzed</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileIcon size={24} className="text-slate-400" />
              </div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">No files yet</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Drag and drop files here or attach them to your messages.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperclipIcon size={14} className="mr-1" />
                Browse Files
              </Button>
            </div>
          )}
        </div>
        
        {isDraggingOver && (
          <div className="p-3 border-t border-purple-200 bg-purple-50">
            <div className="text-xs text-purple-600 text-center">
              Release to upload files
            </div>
          </div>
        )}
      </div>
      
      {/* Voice Recording Modal - Only shown after hydration */}
      {isHydrated && showRecordingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                {isRecording ? "Recording in progress..." : "Recording complete"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                onClick={cancelRecording}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center bg-slate-50 rounded-lg mb-4 space-y-4">
              {isRecording ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border-4 border-red-500 flex items-center justify-center animate-pulse">
                    <Mic size={32} className="text-red-500" />
                  </div>
                  <p className="text-2xl font-mono">{formatRecordingTime(recordingTime)}</p>
                </>
              ) : (
                <>
                  {audioUrl && (
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          onClick={toggleAudioPlayback}
                        >
                          {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                        </Button>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <audio 
                            ref={audioPlayerRef}
                            src={audioUrl} 
                            className="hidden"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                          />
                          {/* We'd need a more complex implementation for proper progress display */}
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: isPlaying ? '100%' : '0%', transition: 'width 0.2s' }}></div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-slate-500">
                        {formatRecordingTime(recordingTime)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {isRecording ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={stopRecording}
                >
                  <StopCircleIcon size={18} className="mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={cancelRecording}
                  >
                    <TrashIcon size={18} className="mr-2" />
                    Discard
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={attachRecordedAudio}
                  >
                    <PaperclipIcon size={18} className="mr-2" />
                    Attach
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
