"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { FileUploader } from "@/components/ui/file-uploader"
import { HistoryItem } from "@/components/ui/history-item"
import { MainPanel } from "@/components/ui/main-panel"
import { MobileNav } from "@/components/ui/mobile-nav"
import { ProcessingFile } from "@/components/ui/processing-file"
import { logoutUser } from "../api/auth"
import { toast } from "@/components/ui/use-toast"
import VoiceRecorder from "@/components/ui/voice-recorder"
import AudioPlayer from "@/components/ui/audio-player"
import { SearchBar } from "@/components/search-bar"

export default function Home() {
  const router = useRouter()
  const [activePanel, setActivePanel] = useState<"history" | "main" | "upload">("main")
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string
      name: string
      type: string
      status: "pending" | "processing" | "ready"
      progress: number
    }>
  >([])
  const [isProcessingRequest, setIsProcessingRequest] = useState(false)
  const [currentResponse, setCurrentResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [fullResponse, setFullResponse] = useState("")  
  const [IsSearchBarVisible, setIsSearchBarVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      title: string
      date: string
      type: string
    }>
  >([])
  const [MainVis, setMainVis] = useState(true)

  const responseRef = useRef<HTMLDivElement>(null)
  // Sample history data
  const historyItems = [
    { id: "1", title: "Annual Report Analysis", date: "May 1, 2024", type: "PDF" },
    { id: "2", title: "Quarterly Earnings Call", date: "Apr 28, 2024", type: "Audio" },
    { id: "3", title: "Market Research Data", date: "Apr 25, 2024", type: "Text" },
    { id: "4", title: "Product Demo Video", date: "Apr 20, 2024", type: "Video" },
    { id: "5", title: "Customer Feedback Summary", date: "Apr 15, 2024", type: "PDF" },
    { id: "6", title: "Competitor Analysis", date: "Apr 10, 2024", type: "PDF" },
    { id: "7", title: "Team Meeting Recording", date: "Apr 5, 2024", type: "Audio" },
    { id: "8", title: "Project Timeline", date: "Apr 1, 2024", type: "Text" },
  ]

  let fileCounter = 0 // Place this at the top level of your component (not inside the function)
  const generateFileId = () => `file_${Date.now()}_${fileCounter++}`
  
  const handleFileUpload = (files: File[]) => {
    const newFiles = files.map((file) => {
      const fileType = getFileType(file)
      return {
        id: generateFileId(),
        name: file.name,
        type: fileType,
        status: "pending" as const, // Not processed yet
        progress: 0,
      }
    })
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const getFileType = (file: File): string => {
    const extension = file.name.split(".").pop()?.toLowerCase() || ""

    if (["pdf"].includes(extension)) return "PDF"
    if (["mp3", "wav", "ogg"].includes(extension)) return "Audio"
    if (["mp4", "mov", "avi", "webm"].includes(extension)) return "Video"
    if (["txt", "doc", "docx", "rtf"].includes(extension)) return "Text"

    return "Other"
  }

  const simulateFileProcessing = (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId ? { ...file, status: "processing", progress: 0 } : file
      )
    )
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId ? { ...file, status: "ready", progress: 100 } : file
          )
        )
      } else {
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId ? { ...file, progress } : file
          )
        )
      }
    }, 500)
  }

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleHistorySelect = (id: string) => {
    setSelectedHistory(id)
    if (window.innerWidth < 768) {
      setActivePanel("main")
    }
  }

  const handleSendMessage = (message: string) => {
    setIsProcessingRequest(true)

    // Simulate processing delay
    setTimeout(() => {
      setIsProcessingRequest(false)
      setIsTyping(true)

      // Example response
      const response =
        "Based on the analysis of your uploaded files, I've identified several key insights. The annual report shows a 12% increase in revenue compared to last year, with significant growth in the Asia-Pacific region. The quarterly earnings call transcript reveals management's focus on expanding digital initiatives, which aligns with the market research data showing increased consumer preference for online services. Would you like me to elaborate on any specific aspect of these findings?"

      setFullResponse(response)
      simulateTyping(response)
    }, 2000)
  }

  const simulateTyping = (text: string) => {
    let i = 0
    setCurrentResponse("")

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setCurrentResponse((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
      }
    }, 20)
  }

  // Scroll to bottom when new content is added
  useEffect(() => {
    if (responseRef.current && isTyping) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [currentResponse, isTyping])
  
  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  const handleNewAnalysis = () => {
    // Clear current state
    setSelectedHistory(null)
    setUploadedFiles([])
    setCurrentResponse("")
    setFullResponse("")
    setIsProcessingRequest(false)
    setIsTyping(false)
    
    // Switch to upload panel on mobile, or keep in main panel on desktop
    if (window.innerWidth < 768) {
      setActivePanel("upload")
    } else {
      setActivePanel("main")
    }
  }
  
  const handleSendAudio = async (audioBlob: Blob) => {
    setIsProcessingRequest(true)
    
    try {
      // Create a file from the blob
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm'
      })
      
      // Add the file to uploaded files
      const fileId = Math.random().toString(36).substring(2, 9)
      const newFile = {
        id: fileId,
        name: audioFile.name,
        type: "Audio",
        status: "processing" as const,
        progress: 0,
      }
      
      setUploadedFiles(prev => [...prev, newFile])
      
      // Simulate processing
      simulateFileProcessing(fileId)
      
      // After "processing" is complete, send the message
      setTimeout(() => {
        setIsProcessingRequest(false)
        setIsTyping(true)
        
        // Example response for voice message
        const response = 
          "I've analyzed your voice recording. Based on the audio content, I understand you're asking about market trends in the technology sector. The uploaded reports indicate a 15% growth in AI-related technologies, with significant investments in machine learning applications. Would you like me to provide more specific details about any particular technology area?"
        
        setFullResponse(response)
        simulateTyping(response)
        
        toast({
          title: "Voice message sent",
          description: "Your voice message has been processed successfully.",
        })
      }, 3000)
      
    } catch (error) {
      console.error('Error processing audio:', error)
      setIsProcessingRequest(false)
      
      toast({
        title: "Error",
        description: "Failed to process voice message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSend = async (formData: FormData) => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Your message has been sent successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send your message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      const results = historyItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }
  const handleSearchBarToggle = () => {
    setIsSearchBarVisible(!IsSearchBarVisible)
    setMainVis(!MainVis)
  }
  const handleSearchBarClose = () => {
    setIsSearchBarVisible(false)
    setSearchQuery("")
    setSearchResults([])
  }
  // Add this function to process all pending files
  const handleProcessFiles = () => {
    uploadedFiles
      .filter(file => file.status === "pending")
      .forEach(file => simulateFileProcessing(file.id))
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <MobileNav activePanel={activePanel} setActivePanel={setActivePanel} />
      </div>

      {/* Left Sidebar - History Panel */}
      <div
        className={cn(
          "w-64 border-r border-border bg-muted/30 flex flex-col h-full transition-all duration-300 ease-in-out",
          "fixed md:relative z-40 md:z-auto",
          "md:translate-x-0",
          activePanel === "history" ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleNewAnalysis}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Button className="pl-8 w-48 text-black" onFocus={handleSearchBarToggle}>
            Search analyses...
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-3 py-2">
          {historyItems.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isActive={selectedHistory === item.id}
              onClick={() => handleHistorySelect(item.id)}
            />
          ))}
        </div>

        <div className="p-3 border-t mt-auto">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Center Panel */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out",
          activePanel !== "main" && "hidden md:flex",
        )}
      >
        <MainPanel
          selectedHistoryId={selectedHistory}
          historyItems={historyItems}
          uploadedFiles={uploadedFiles.filter((file) => file.status === "ready")}
          isProcessingRequest={isProcessingRequest}
          isTyping={isTyping}
          currentResponse={currentResponse}
          fullResponse={fullResponse}
          onSendMessage={(message) => {
            if (message.trim() === "") return;
            handleSendMessage(message);
          }}
          onSendAudio={async (audioBlob) => {
            if (!audioBlob) return;
            await handleSendAudio(audioBlob);
          }}
          responseRef={responseRef}
          isVisible={MainVis}
          
        />
      {/* Mobile Search Bar */}
      {IsSearchBarVisible && (
        <div style={{height: "100vh"}} >
          <SearchBar
            query={searchQuery}
            onChange={handleSearch}
            onClose={handleSearchBarClose}
          />
        </div> 
      )}
      </div>

      {/* Right Sidebar - Voice Recorder */}

      {/* Right Sidebar - File Upload Panel */}
      <div
        className={cn(
          "w-64 border-l border-border bg-muted/30 flex flex-col h-full transition-all duration-300 ease-in-out",
          "fixed right-0 md:relative z-40 md:z-auto",
          "md:translate-x-0",
          activePanel === "upload" ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">File Upload</h2>
          {/* Added the description back */}
          <p className="text-sm text-muted-foreground">Drag & drop files to analyze them</p>
        </div>

        {/* Ensure FileUploader and the list are inside the scrollable area */}
        <div className="p-4 flex-1 overflow-auto">
          <FileUploader onFilesUploaded={handleFileUpload} />

          {/* Conditionally render the uploaded files section */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Uploaded Files</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <ProcessingFile
                    key={file.id}
                    file={file}
                    onDelete={() => handleDeleteFile(file.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            disabled={!uploadedFiles.some((file) => file.status === "pending")}
            onClick={handleProcessFiles}
          >
            Analyze Files
          </Button>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 md:hidden" />
      <div className="p-4">
      </div>
    </div>
  )
}

