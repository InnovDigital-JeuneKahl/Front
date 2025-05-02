"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  FileAudioIcon, 
  PlayCircleIcon, 
  HighlighterIcon,
  RepeatIcon,
  MicIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ThreadViewFrameProps {
  threadId: string
  onBack: () => void
}

export function ThreadViewFrame({ threadId, onBack }: ThreadViewFrameProps) {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [hasMounted, setHasMounted] = useState(false)

  // Fix hydration issues by only rendering once the component has mounted
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Mock thread data
  const thread = {
    id: threadId,
    title: "Financial Analysis",
    date: "May 1, 2023",
    query: "Extract all financial projections and market analysis from these documents",
    responses: [
      {
        id: 1,
        file: "Financial Report.pdf",
        type: "pdf",
        summary:
          "Found financial projections for Q3 2023 showing 15% growth in revenue and 8% increase in profit margins.",
        details: "Page 12, Line 45",
      },
      {
        id: 2,
        file: "Board Meeting.mp3",
        type: "audio",
        summary:
          "Discussion about market expansion strategy with focus on Asian markets, projecting 22% market share by end of year.",
        details: "10:15 to 12:22",
      },
      {
        id: 3,
        file: "Strategic Plan.docx",
        type: "text",
        summary:
          "Five-year growth plan outlining key financial milestones and investment requirements for new product lines.",
        details: "Page 8, Section 3.2",
      },
    ],
  }

  const toggleAudioRecording = () => {
    setIsRecordingAudio(!isRecordingAudio)
    if (isRecordingAudio) {
      // Simulate ending recording and setting the query
      setUserQuery("Transcribed voice query: Can you elaborate on the growth projections?")
    }
  }

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the query to the backend
    setUserQuery("")
  }

  // If the component hasn't mounted yet, return a placeholder to prevent hydration errors
  if (!hasMounted) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
            <ArrowLeftIcon size={18} />
          </Button>
          <h1 className="text-xl font-semibold">Loading...</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-primary/30 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
          <ArrowLeftIcon size={18} />
        </Button>
        <h1 className="text-xl font-semibold">{thread.title}</h1>
        <span className="text-sm text-muted-foreground ml-2">{thread.date}</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-secondary/50 mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-muted-foreground text-sm mb-1">Original Query</h3>
              <p className="text-base">{thread.query}</p>
            </CardContent>
          </Card>

          <div className="space-y-6 my-8">
            {thread.responses.map((response) => (
              <div key={response.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {response.type === "pdf" ? (
                    <FileTextIcon size={20} className="text-primary" />
                  ) : response.type === "audio" ? (
                    <FileAudioIcon size={20} className="text-primary" />
                  ) : (
                    <FileTextIcon size={20} className="text-primary" />
                  )}
                </div>
                
                <div className="flex-1">
                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{response.file}</h3>
                          <p className="text-sm mb-2">{response.summary}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>Source: {response.details}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {response.type === "audio" && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <PlayCircleIcon size={14} /> Play Segment
                            </Button>
                          )}
                          {(response.type === "pdf" || response.type === "text") && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <HighlighterIcon size={14} /> Highlight Source
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4 mt-12">
            <Button className="gap-2">
              <RepeatIcon size={16} /> Run New Analysis
            </Button>
            <Button variant="outline" className="gap-2">
              Reuse This Query
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <form onSubmit={handleSendQuery}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${isRecordingAudio ? "text-red-500" : ""}`}
                onClick={toggleAudioRecording}
              >
                <MicIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button type="submit" disabled={!userQuery.trim()}>Send</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
