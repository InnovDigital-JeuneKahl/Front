"use client"

// Type imports
import type React from "react"

// React hooks
import { useState, useCallback, useEffect, useRef, memo } from "react"

// UI Components
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Progress } from "../../components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { FilePreview } from "../components/file-preview"
import { cn } from "../../lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { SearchBar } from "../../components/search-bar"

// Icons
import { 
  AlertTriangleIcon,
  ArrowLeftIcon, 
  BarChartIcon, 
  FileAudioIcon, 
  FileCheckIcon, 
  FileIcon, 
  FileImageIcon, 
  FileTextIcon, 
  Loader2,
  Mic, 
  MicIcon,
  MicOff, 
  MessageSquareIcon, 
  PaperclipIcon, 
  PauseIcon, 
  PlayIcon, 
  PlusIcon, 
  SearchIcon, 
  SendIcon, 
  Sparkles, 
  StopCircleIcon,
  TrashIcon, 
  UserCircle, 
  X 
} from "lucide-react"

// Hooks
import { toast } from "../../hooks/use-toast"
import { useOrchestration } from "../hooks/use-orchestration"

// Services
import {
  processFilesWithOrchestration,
  askQuestionWithOrchestration,
  searchWithinFileUsingOrchestration,
  generateFileSummary,
  isFileTypeSupported,
  extractTextFromFile,
  createMetadataFromChatContext,
} from "../utils/orchestration-service"
import { FileMetadata } from "../api/orchestration"

// Message types
type MessageType = 'text' | 'file' | 'analysis-result' | 'system'

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  sender: 'user' | 'assistant'
  files?: UploadedFile[]
  analysisResults?: {
    keyPoints?: string[]
    sentiment?: string
    confidence?: number
    entities?: {
      people?: string[]
      organizations?: string[]
      locations?: string[]
      dates?: string[]
      products?: string[]
      [key: string]: string[] | undefined
    }
  }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "complete" | "error"
  url?: string
  analysisReady?: boolean
}

// Props for MessageItem component
interface MessageItemProps {
  message: Message
  onAudioPlay: (fileId: string, url?: string) => void
  playingAudioId: string | null
  isHydrated: boolean
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

// Format utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

// Hook to safely use browser APIs and ensure hydration safety
function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}

// Update the MessageItem component to display analysis results
const MessageItem = memo(({ message, onAudioPlay, playingAudioId, isHydrated }: MessageItemProps) => {
  const isUser = message.sender === "user"
  const messageRef = useRef<HTMLDivElement>(null)
  
  // Scroll to the latest message
  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])
  
  // Format analysis results display if present
  const renderAnalysisResults = () => {
    if (!message.analysisResults) return null
    
    return (
      <div className="mt-3 pt-3 border-t border-slate-200">
        {message.analysisResults.keyPoints && (
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">Key Points</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {message.analysisResults.keyPoints.map((point: string, idx: number) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        
        {message.analysisResults.entities && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">Entities</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(message.analysisResults.entities).map(([category, items]) => (
                <div key={category} className="bg-slate-50 p-2 rounded">
                  <span className="font-medium capitalize">{category}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {items && items.slice(0, 3).map((item: string, idx: number) => (
                      <span key={idx} className="bg-slate-200 px-1.5 py-0.5 text-xs rounded text-slate-700">
                        {item}
                      </span>
                    ))}
                    {items && items.length > 3 && (
                      <span className="text-xs text-slate-500">+{items.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {message.analysisResults.sentiment && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Sentiment:</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              message.analysisResults.sentiment === "positive" ? "bg-green-100 text-green-700" :
              message.analysisResults.sentiment === "negative" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-700"
            }`}>
              {message.analysisResults.sentiment.charAt(0).toUpperCase() + message.analysisResults.sentiment.slice(1)}
            </span>
            
            {message.analysisResults.confidence && (
              <span className="text-xs text-slate-500">
                Confidence: {(message.analysisResults.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div 
      ref={messageRef}
      className={cn(
        "py-3 px-4 rounded-md mb-3",
        isUser ? "bg-primary text-primary-foreground ml-10" : "bg-slate-100 mr-10",
        message.type === "system" && "bg-amber-100 text-amber-900 border border-amber-200",
        message.type === "analysis-result" && "bg-sky-50 border border-sky-100"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {isUser ? (
            <UserCircle className="w-4 h-4" />
          ) : message.type === "system" ? (
            <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
          ) : message.type === "analysis-result" ? (
            <BarChartIcon className="w-4 h-4 text-sky-500" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {isUser ? "You" : message.type === "system" ? "System" : message.type === "analysis-result" ? "Analysis Results" : "Assistant"}
          </span>
        </div>
        <span className="text-xs opacity-70">
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      {/* Audio message */}
      {message.files && message.files.some(file => file.type.includes("audio")) && (
        <div className="mb-3">
          {message.files.filter(file => file.type.includes("audio")).map(file => (
            <div key={file.id} className="flex items-center gap-2 my-1 p-2 rounded-md bg-white bg-opacity-10">
              {isHydrated && (
                <Button 
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => onAudioPlay(file.id, file.url)}
                >
                  {playingAudioId === file.id ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs opacity-70">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* File attachments (non-audio) */}
      {message.files && message.files.some(file => !file.type.includes("audio")) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {message.files.filter(file => !file.type.includes("audio")).map(file => (
            <div key={file.id} className="flex items-center gap-2 bg-white bg-opacity-10 p-2 rounded-md">
              {file.type.includes("image") ? (
                <FileImageIcon className="h-4 w-4" />
              ) : file.type.includes("pdf") ? (
                <FileTextIcon className="h-4 w-4" />
              ) : (
                <FileIcon className="h-4 w-4" />
              )}
              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              {file.analysisReady && (
                <FileCheckIcon className="h-4 w-4 text-green-400" />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Message text content */}
      <div className="whitespace-pre-wrap">{message.content}</div>
      
      {/* Analysis results */}
      {renderAnalysisResults()}
    </div>
  )
})

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

  // Add state for file preview in the ChatDocumentAnalysis component
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Add state for search dialog
  const [showSearchDialog, setShowSearchDialog] = useState(false);

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
  
  // Update the handleFileSelect function to check for supported file types
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files)
      
      // Check for unsupported files
      const unsupportedFiles = fileList.filter(file => !isFileTypeSupported(file.name))
      
      if (unsupportedFiles.length > 0) {
        // Show toast notification for unsupported files
        toast({
          title: "Unsupported file type",
          description: `${unsupportedFiles.length > 1 ? 'Some files are' : 'This file is'} not supported: ${unsupportedFiles.map(f => f.name).join(', ')}`,
          variant: "destructive",
        })
        
        // Filter out unsupported files
        const supportedFiles = fileList.filter(file => isFileTypeSupported(file.name))
        
        if (supportedFiles.length === 0) {
          // Reset the file input if all files are unsupported
          e.target.value = ""
          return
        }
        
        // Continue with supported files
        const newFiles: UploadedFile[] = supportedFiles.map(file => ({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 100,
          status: "complete",
          url: URL.createObjectURL(file)
        }))
        
        setCurrentFiles(prevFiles => [...prevFiles, ...newFiles])
      } else {
        // All files are supported, proceed normally
        const newFiles: UploadedFile[] = fileList.map(file => ({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 100,
          status: "complete",
          url: URL.createObjectURL(file)
        }))
        
        setCurrentFiles(prevFiles => [...prevFiles, ...newFiles])
      }
      
      // Reset the file input
      e.target.value = ""
    }
  }, [generateId])
  
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
  
  // Add the orchestration hook to the ChatDocumentAnalysis component
  const {
    loading: orchestrationLoading,
    progress: uploadProgress,
    processFiles,
    askQuestion: askQuestionOrchestration,
    summarizeFile,
    extractEntities,
    extractText
  } = useOrchestration();

  // Update the handleSendMessage function to use the orchestration hook
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Get the message text directly from the input field
    const messageText = e?.target && (e.target as HTMLFormElement).querySelector('input')?.value || '';
    
    // Don't send empty messages unless files are attached
    if (!messageText.trim() && currentFiles.length === 0) return
    
    // Add user message to chat
    const newMessage: Message = {
      id: generateId(),
      type: currentFiles.length > 0 ? "file" : "text",
      content: messageText,
      timestamp: new Date(),
      sender: "user",
      files: currentFiles.length > 0 ? [...currentFiles] : undefined
    }
    
    setMessages(prev => [...prev, newMessage])
    setCurrentMessage("")  // Keep this for state consistency, although we're not using it for the input
    setCurrentFiles([])
    setIsProcessing(true)
    
    // Get the current thread title for metadata
    const currentThreadTitle = threads.find(t => t.id === activeThreadId)?.title || "New Conversation"
    
    try {
      // Check if files are attached - process them with orchestration service
      if (newMessage.files && newMessage.files.length > 0) {
        // In a real implementation, you would have actual File objects
        // For this simulation, we'll create dummy File objects based on our UploadedFile objects
        const dummyFiles: File[] = newMessage.files.map(file => {
          // This is a simplified mock - in a real app, you'd use actual File objects
          return new File(
            [new Blob([''], { type: file.type })], // Empty content for simulation
            file.name,
            { type: file.type }
          );
        });
        
        // For simulation purposes, we'll delay to simulate processing
        setTimeout(async () => {
          // In a real implementation, this would process actual files
          // const result = await processFiles(dummyFiles, currentThreadTitle);
          
          // For simulation, we'll generate a response based on file types
          const fileTypes = newMessage.files?.map(f => f.type) || [];
          const containsPdf = fileTypes.some(type => type.includes('pdf'));
          const containsAudio = fileTypes.some(type => type.includes('audio'));
          
          let analysisContent = "";
          
          if (containsPdf) {
            analysisContent = "I've analyzed your PDF files and found some interesting insights. The financial report shows a 15% growth in Q3, and the market analysis indicates potential expansion opportunities in the Asian market.";
          } else if (containsAudio) {
            analysisContent = "I've transcribed and analyzed your audio files. The meeting recording contains important discussions about the upcoming product launch timeline and marketing strategy adjustments based on last quarter's results.";
          } else {
            analysisContent = "I've processed your files and extracted the key information. The documents contain details about project timelines, resource allocation, and strategic goals for the next fiscal year.";
          }
          
          // Add insights to the relevant files
          const updatedFiles = newMessage.files?.map(file => ({
            ...file,
            analysisReady: true
          }));
          
          // Update the message with processed files
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, files: updatedFiles }
                : msg
            )
          );
          
          // Add assistant response
          const assistantMessage: Message = {
            id: generateId(),
            type: "analysis-result",
            content: analysisContent,
            timestamp: new Date(),
            sender: "assistant",
            analysisResults: {
              keyPoints: [
                "Revenue increased by 15% compared to previous quarter",
                "Market expansion opportunities identified in Asian markets",
                "Product line diversification recommended for Q4",
                "Cost reduction initiatives showing positive results"
              ],
              sentiment: "positive",
              confidence: 0.92
            }
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          
          // Update thread title and last message if this is a new conversation
          if (threads.find(t => t.id === activeThreadId)?.title === "New Conversation") {
            const fileNames = newMessage.files?.map(f => f.name).join(", ") || "";
            const truncatedTitle = fileNames.length > 30 
              ? fileNames.slice(0, 30) + "..."
              : fileNames;
            
            setThreads(prev => prev.map(thread => 
              thread.id === activeThreadId 
                ? { 
                    ...thread, 
                    title: `Analysis of ${truncatedTitle}`,
                    lastMessage: assistantMessage.content.slice(0, 60) + (assistantMessage.content.length > 60 ? "..." : "")
                  } 
                : thread
            ));
          }
        }, 2000);
      } else {
        // For text questions, we would use askQuestionOrchestration, but here we'll simulate
        setTimeout(() => {
          const assistantMessage: Message = {
            id: generateId(),
            type: "text",
            content: "Based on the documents you've shared previously, I'd recommend focusing on the financial projections in section 3. The growth targets seem ambitious but achievable given the market conditions outlined in the report.",
            timestamp: new Date(),
            sender: "assistant",
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          
          // Update thread title and last message if this is a new conversation
          if (threads.find(t => t.id === activeThreadId)?.title === "New Conversation") {
            setThreads(prev => prev.map(thread => 
              thread.id === activeThreadId 
                ? { 
                    ...thread, 
                    title: messageText.slice(0, 30) + (messageText.length > 30 ? "..." : ""),
                    lastMessage: assistantMessage.content.slice(0, 60) + (assistantMessage.content.length > 60 ? "..." : "")
                  } 
                : thread
            ));
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing message with orchestration service:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        type: "system",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
        sender: "assistant",
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      
      // Show toast notification
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
    }
  }, [currentFiles, generateId, activeThreadId, threads]);
  
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

  // Update the handleFileAction function to use the orchestration hook
  const handleFileAction = useCallback((fileId: string, action: string) => {
    // Find the file in messages
    const fileMessage = messages.find(message => 
      message.files?.some(file => file.id === fileId)
    );
    
    const file = fileMessage?.files?.find(f => f.id === fileId);
    
    if (!file) return;
    
    setIsProcessing(true);
    
    // Process different file analysis actions
    switch (action) {
      case 'summarize':
        // In a real implementation, this would call summarizeFile from the hook
        setTimeout(() => {
          const summaryMessage: Message = {
            id: generateId(),
            type: "analysis-result",
            content: `Summary of ${file.name}: This document contains key financial projections for Q3, showing a 15% increase in revenue and plans for market expansion in Asia. Key stakeholders include the finance and marketing teams, with implementation scheduled for next quarter.`,
            timestamp: new Date(),
            sender: "assistant",
            analysisResults: {
              keyPoints: [
                "Revenue increased by 15% compared to previous quarter",
                "Asian markets showed strongest growth at 35%",
                "New product line launch scheduled for Q4 2024",
                "Marketing budget increased by 12% for upcoming campaigns",
                "Cost reduction initiatives resulted in 8% operational savings"
              ],
              sentiment: "positive",
              confidence: 0.92
            }
          };
          
          setMessages(prev => [...prev, summaryMessage]);
          setIsProcessing(false);
          
          toast({
            title: "Summary generated",
            description: `Summary of ${file.name} has been generated`,
          });
        }, 1500);
        break;
        
      case 'extract-text':
        // In a real implementation, this would call extractText from the hook
        setTimeout(() => {
          const textMessage: Message = {
            id: generateId(),
            type: "analysis-result",
            content: `Extracted text from ${file.name}:\n\nFINANCIAL PROJECTIONS Q3 2024\n\nRevenue: $10.2M (15% YoY increase)\nExpenses: $7.8M (5% YoY increase)\nProfit: $2.4M (45% YoY increase)\n\nKey Growth Areas:\n- Product A: 22% growth\n- Service B: 18% growth\n- Region C: 35% growth\n\nMarket Expansion Strategy:\n1. Target Asian markets in Q4\n2. Launch product line extensions\n3. Increase marketing spend by 12%`,
            timestamp: new Date(),
            sender: "assistant",
          };
          
          setMessages(prev => [...prev, textMessage]);
          setIsProcessing(false);
          
          toast({
            title: "Text extracted",
            description: `Text extracted from ${file.name}`,
          });
        }, 1500);
        break;
        
      case 'analyze-entities':
        // In a real implementation, this would call extractEntities from the hook
        setTimeout(() => {
          const entityMessage: Message = {
            id: generateId(),
            type: "analysis-result",
            content: `Entity analysis for ${file.name}:`,
            timestamp: new Date(),
            sender: "assistant",
            analysisResults: {
              entities: {
                people: ["John Smith (CEO)", "Sarah Johnson (CFO)", "Michael Wong (CMO)"],
                organizations: ["XYZ Corp", "ABC Partners", "Global Ventures"],
                locations: ["New York", "Singapore", "London"],
                dates: ["October 15, 2024", "Q4 2024", "January 2025"],
                products: ["Product Line A", "Service Suite B", "Enterprise Solution C"]
              }
            }
          };
          
          setMessages(prev => [...prev, entityMessage]);
          setIsProcessing(false);
          
          toast({
            title: "Entities analyzed",
            description: `Entities in ${file.name} have been analyzed`,
          });
        }, 1500);
        break;
        
      default:
        setIsProcessing(false);
        break;
    }
  }, [messages, generateId]);

  // Add a function to handle file preview
  const handleFilePreview = useCallback((fileId: string) => {
    // Find the file in messages
    const fileMessage = messages.find(message => 
      message.files?.some(file => file.id === fileId)
    );
    
    const file = fileMessage?.files?.find(f => f.id === fileId);
    
    if (file) {
      setPreviewFile(file);
      setShowFilePreview(true);
    }
  }, [messages]);

  // Add a function to close file preview
  const handleCloseFilePreview = useCallback(() => {
    setShowFilePreview(false);
    setPreviewFile(null);
  }, []);

  // Replace the entire MessageInput component with this new version
  const MessageInput = () => {
    // Use a ref instead of state for the input field
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Add a state for file upload progress
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    
    // Handle the form submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Get the value directly from the input element
      const message = inputRef.current?.value || "";
      
      // Don't send empty messages unless files are attached
      if (!message.trim() && currentFiles.length === 0) return;
      
      // Call the send message handler with the current input value
      handleSendMessage(e);
      
      // Clear the input field directly
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };
    
    // Simulate file upload progress
    useEffect(() => {
      if (currentFiles.length > 0) {
        // Create initial progress state for each file
        const initialProgress: Record<string, number> = {};
        currentFiles.forEach(file => {
          initialProgress[file.id] = 0;
        });
        setUploadProgress(initialProgress);
        
        // Simulate progress updates
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            let allComplete = true;
            
            Object.keys(newProgress).forEach(fileId => {
              if (newProgress[fileId] < 100) {
                newProgress[fileId] += Math.floor(Math.random() * 10) + 5;
                if (newProgress[fileId] > 100) newProgress[fileId] = 100;
                if (newProgress[fileId] < 100) allComplete = false;
              }
            });
            
            if (allComplete) {
              clearInterval(interval);
            }
            
            return newProgress;
          });
        }, 500);
        
        return () => clearInterval(interval);
      }
    }, [currentFiles]);
    
    // Helper to get file processing stage based on progress
    const getFileStage = (progress: number): string => {
      if (progress < 25) return "Preparing";
      if (progress < 50) return "Uploading";
      if (progress < 75) return "Validating";
      if (progress < 100) return "Processing";
      return "Ready";
    };
    
    return (
      <div className="border-t border-slate-200 px-4 py-4">
        {/* File preview */}
        {currentFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {currentFiles.map(file => (
              <div key={file.id} className="bg-white rounded-md p-2 shadow-sm border border-slate-200 flex items-center gap-3">
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate text-slate-700">{file.name}</p>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 justify-between">
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    <p className="text-xs font-medium text-slate-600">
                      {getFileStage(uploadProgress[file.id] || 0)}
                    </p>
                  </div>
                  <div className="mt-1 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress[file.id] || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Message input form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder={isRecording ? "Recording... click stop when done" : "Type your message..."}
                defaultValue=""
                disabled={isRecording || isProcessing}
                className="pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isHydrated && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            onClick={handleToggleRecording}
                            disabled={isRecording || isProcessing}
                          >
                            <MicIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Record voice message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRecording || isProcessing}
                      >
                        <PaperclipIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attach file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isRecording || isProcessing}
                  multiple
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="icon"
              disabled={isRecording || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Add function to toggle search dialog
  const toggleSearchDialog = useCallback(() => {
    setShowSearchDialog(prev => !prev);
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
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={toggleSearchDialog}
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search</span>
          </Button>
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
              <MessageItem
                key={message.id}
                message={message}
                onAudioPlay={(fileId, url) => {
                  // Implementation of onAudioPlay
                }}
                playingAudioId={null}
                isHydrated={isHydrated}
              />
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
        
        {/* File Preview */}
        <FilePreview 
          file={previewFile}
          open={showFilePreview}
          onClose={handleCloseFilePreview}
          onAnalyze={handleFileAction}
        />
        
        {/* Message input */}
        <MessageInput />
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
                  <div 
                    key={file.id} 
                    className="bg-white rounded-md p-3 shadow-sm border border-slate-200 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleFilePreview(file.id)}
                  >
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
                      
                      {/* File actions */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileAction(file.id, 'summarize');
                                }}>
                                Summarize
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generate a summary of this document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileAction(file.id, 'extract-text');
                                }}>
                                Extract Text
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Extract all text from this document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileAction(file.id, 'analyze-entities');
                                }}>
                                Entities
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Analyze entities (people, places, organizations)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SearchBar />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
