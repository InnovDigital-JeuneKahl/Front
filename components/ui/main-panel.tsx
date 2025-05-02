"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
import { FileText, Headphones, Info, MessageSquare, Mic, Send, Video, CheckCircle, AlertCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DetailsModal } from "./details-modal"
import {VoiceRecorder} from "@/components/ui/voice-recorder";
import{ AudioPlayer} from "@/components/ui/audio-player";

interface MainPanelProps {
  selectedHistoryId: string | null
  historyItems: Array<{
    id: string
    title: string
    date: string
    type: string
  }>
  uploadedFiles: Array<{
    id: string
    name: string
    type: string
    status: "pending" | "processing" | "ready"
    progress: number
  }>
  isProcessingRequest: boolean
  isTyping: boolean
  currentResponse: string
  fullResponse: string
  isVisible: boolean
  onSendMessage: (message: string) => void
  responseRef: React.RefObject<HTMLDivElement> | null
  onSendAudio?: (audioBlob: Blob) => void
}

export function MainPanel({
  selectedHistoryId,
  historyItems,
  uploadedFiles,
  isProcessingRequest,
  isTyping,
  currentResponse,
  fullResponse,
  onSendMessage,
  onSendAudio,
  responseRef,
  isVisible,
}: MainPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [reviewedInsights, setReviewedInsights] = useState<string[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
  };

  const selectedItem = historyItems.find((item) => item.id === selectedHistoryId);

  // Sample insights data
  const sampleInsights = [
    {
      id: "insight1",
      text: "12% increase in revenue compared to last year",
      confidence: "high",
      source: {
        type: "text",
        content:
          "The company reported a 12% increase in annual revenue, reaching $1.2 billion for the fiscal year 2023.",
        location: {
          page: 4,
          lineNumber: 127,
          boundingBox: { x1: 120, y1: 450, x2: 580, y2: 470 },
        },
      },
    },
    {
      id: "insight2",
      text: "Significant growth in the Asia-Pacific region",
      confidence: "medium",
      source: {
        type: "text",
        content:
          "The Asia-Pacific region showed the most significant growth at 24%, followed by Europe at 8% and North America at 6%.",
        location: {
          page: 7,
          lineNumber: 215,
          boundingBox: { x1: 150, y1: 320, x2: 610, y2: 340 },
        },
      },
    },
    {
      id: "insight3",
      text: "Management's focus on expanding digital initiatives",
      confidence: "high",
      source: {
        type: "audio",
        content:
          "We're doubling down on our digital transformation initiatives, which we believe will drive significant growth in the coming years.",
        location: {
          startTime: 725, // in seconds
          endTime: 742, // in seconds
        },
      },
    },
    {
      id: "insight4",
      text: "Increased consumer preference for online services",
      confidence: "medium",
      source: {
        type: "video",
        content:
          "Our market research indicates that 78% of consumers now prefer to access our services online, compared to 65% last year.",
        location: {
          startTime: 305, // in seconds
          endTime: 320, // in seconds
        },
      },
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage();
    }
  };

  const handleSendTextMessage = () => {
    if (inputValue.trim() && !isProcessingRequest && !isTyping) {
      onSendMessage(inputValue);
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url); // This sets the audio URL for the AudioPlayer
    if (onSendAudio) {
      onSendAudio(audioBlob); // Call the parent handler to process the audio
    }
  };

  const handleRemoveFile = (fileId: string) => {
    // Use the uploadedFiles prop directly and call the parent handler if needed
    const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);

    // Reset the audio player if the file being removed is associated with the current audio
    if (audioURL) {
      setAudioURL(null);
    }

    // If you need to notify the parent about the file removal, add a callback here
    console.log("Updated files:", updatedFiles);
  };

  const handleAudioRecorded = (audioBlob: Blob | null) => {
    setShowVoiceRecorder(false);
    if (audioBlob) {
      setRecordedAudio(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob));
    }
  };

  const handleSendAudioMessage = () => {
    if (recordedAudio && onSendAudio) {
      onSendAudio(recordedAudio);
      setRecordedAudio(null);
      setAudioURL(null);
    }
  };

  const toggleVoiceRecorder = () => {
    setShowVoiceRecorder(!showVoiceRecorder);
  };

  const openDetailsModal = (insightId: string) => {
    setSelectedInsight(insightId);
    setIsDetailsModalOpen(true);
    if (!reviewedInsights.includes(insightId)) {
      setReviewedInsights([...reviewedInsights, insightId]);
    }
  };

  // Function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Audio":
        return <Headphones className="h-5 w-5 text-blue-500" />;
      case "Video":
        return <Video className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-green-500" />;
    }
  };

  // Find the selected file for details
  const selectedFile = uploadedFiles.find(f => f.id === selectedFileId);
  
  // Check if any files are ready for analysis
  const hasReadyFiles = uploadedFiles.some(file => file.status === "ready");
  
  return (
    <>
      <div className="flex-1 overflow-auto p-4" ref={responseRef} style={{display: isVisible ? "block" : "none"}}>
        {/* Show file analysis UI when files are ready */}
        {hasReadyFiles && !selectedHistoryId && (
          <div className="max-w-3xl mx-auto">
            {!selectedFileId ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center">Files Ready for Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {uploadedFiles
                    .filter(file => file.status === "ready")
                    .map(file => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedFileId(file.id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Click to view analysis
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <Button 
                    variant="ghost" 
                    className="mb-4"
                    onClick={() => setSelectedFileId(null)}
                  >
                    ← Back to files
                  </Button>
                  
                  <h2 className="text-2xl font-semibold mb-2">The Results of your Analysis!</h2>
                  <p className="text-muted-foreground">File name: {selectedFile?.name}</p>
                </div>
                
                <Accordion type="single" collapsible className="mb-8">
                  {sampleInsights.map((insight) => (
                    <AccordionItem key={insight.id} value={insight.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          {insight.confidence === "high" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <div className="font-medium">{insight.text}</div>
                            <div className="text-xs text-muted-foreground">
                              {insight.confidence === "high" ? "High confidence" : "Medium confidence"}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          <p className="mb-2">{insight.source.content}</p>
                          <div className="text-xs text-muted-foreground">
                            {insight.source.type === "text" && (
                              <span>Page {insight.source.location.page}, Line {insight.source.location.lineNumber}</span>
                            )}
                            {(insight.source.type === "audio" || insight.source.type === "video") && (
                              <span>
                                {formatTime(insight.source.location.startTime)} - {formatTime(insight.source.location.endTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
          </div>
        )}
        
        {/* Show default UI or history item content */}
        {(!hasReadyFiles || selectedHistoryId) && (
          <>
            {selectedItem ? (
              <div>
                <h2 className="text-2xl font-semibold mb-2">{selectedItem.title}</h2>
                <p className="text-muted-foreground mb-6">{selectedItem.date}</p>
                {/* Existing history item content */}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>
                <p className="text-muted-foreground mb-4">
                  Upload files or ask a question to begin analyzing your data.
                </p>
              </div>
            )}
            
            {/* Show response if available */}
            {(currentResponse || fullResponse) && (
              <div className="p-4 rounded-lg bg-muted/30 mb-6">
                <p>{isTyping ? currentResponse : fullResponse}</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Message input area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your files..."
            className="w-full resize-none pr-20 pl-4 py-3 min-h-[52px] max-h-[200px] border rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
            rows={1}
            disabled={isProcessingRequest || isTyping}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Voice Recorder Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceRecorder}
              disabled={isProcessingRequest || isTyping}
              className="text-muted-foreground hover:text-foreground"
            >
              <Mic className="h-5 w-5" />
            </Button>
            {/* Send Button for Text */}
            <Button
              size="icon"
              onClick={handleSendTextMessage}
              disabled={!inputValue.trim() || isProcessingRequest || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Voice Recorder Modal */}
        {showVoiceRecorder && (
          <VoiceRecorder 
          onRecordingComplete={handleRecordingComplete}
        />
        )}
        {/* Audio Player and Send Button for Audio */}
        {audioBlob && (
        <AudioPlayer 
          audioBlob={audioBlob} 
          onRemove={handleRemoveAudio} 
        />
      )}
      </div>
    </>
  );
  
  // Helper function to format time
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}