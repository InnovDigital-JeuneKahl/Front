"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  FileSearchIcon,
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
} from "lucide-react"

export type AnalysisTopic = {
  id: string
  title: string
  content: string
  source: string
  timestamp?: string
  confidence: number
}

export type FileAnalysisDetailsProps = {
  fileId: string
  fileName: string
  fileType: "pdf" | "audio" | "text" | "image"
  topics: AnalysisTopic[]
  onValidate?: () => void
  onCheckDocument?: () => void
  onRedoAnalysis?: () => void
}

export function FileAnalysisDetails({
  fileId,
  fileName,
  fileType,
  topics,
  onValidate,
  onCheckDocument,
  onRedoAnalysis,
}: FileAnalysisDetailsProps) {
  const [activeTab, setActiveTab] = useState("topics")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [highlightedText, setHighlightedText] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  // Fix hydration issues by only rendering client-specific content after mounting
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleHighlightText = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (topic) {
      setHighlightedText(topic.content)
      setActiveTab("source")
    }
  }

  const handlePlaySegment = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (topic && topic.timestamp) {
      // Parse timestamp like "10:15 to 12:22"
      const times = topic.timestamp.split(" to ")
      if (times.length === 2) {
        const startParts = times[0].split(":")
        const startSeconds = Number.parseInt(startParts[0]) * 60 + Number.parseInt(startParts[1])
        setCurrentTime(startSeconds)
        setIsPlaying(true)
        setActiveTab("timeline")
      }
    }
  }

  // Mock document content for source view
  const documentContent = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
    
    Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
  `

  // If the component hasn't mounted yet, return a simpler placeholder
  if (!hasMounted) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center">
          <h2 className="text-xl font-semibold">
            <span className="text-muted-foreground mr-2">File:</span> {fileName}
          </h2>
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
        <h2 className="text-xl font-semibold">
          <span className="text-muted-foreground mr-2">File:</span> {fileName}
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="topics" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="topics" onClick={() => setActiveTab("topics")}>
                Topics
              </TabsTrigger>
              <TabsTrigger value="source" onClick={() => setActiveTab("source")}>
                Source View
              </TabsTrigger>
              {fileType === "audio" && (
                <TabsTrigger value="timeline" onClick={() => setActiveTab("timeline")}>
                  Timeline
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="topics" className="space-y-4">
              {topics.map((topic) => (
                <Card key={topic.id} className="bg-secondary/50">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{topic.title}</h3>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {topic.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{topic.content}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {topic.timestamp && (
                            <>
                              <ClockIcon size={12} className="mr-1" />
                              <span>{topic.timestamp}</span>
                              <span className="mx-2">•</span>
                            </>
                          )}
                          <FileTextIcon size={12} className="mr-1" />
                          <span>{topic.source}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {fileType === "audio" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handlePlaySegment(topic.id)}
                          >
                            <PlayIcon size={12} className="mr-1" /> Play Segment
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleHighlightText(topic.id)}
                          >
                            <FileSearchIcon size={12} className="mr-1" /> View Source
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="source" className="space-y-4">
              <Card className="bg-secondary/50 p-4">
                <div className="p-4 bg-background/50 rounded-md">
                  <h3 className="font-medium mb-2">Document Source View</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This view shows the original document with highlighted sections that were analyzed.
                  </p>
                  <div className="mt-4 p-4 bg-background rounded border border-border overflow-auto max-h-96">
                    {documentContent.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-sm mb-4">
                        {highlightedText && index === 1 ? (
                          <span className="bg-yellow-500/20 px-1 py-0.5 rounded">{paragraph}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {fileType === "audio" && (
              <TabsContent value="timeline" className="space-y-4">
                <Card className="bg-secondary/50 p-4">
                  <div className="p-4 bg-background/50 rounded-md">
                    <h3 className="font-medium mb-2">Audio Timeline</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This view shows the timeline of the audio file with highlighted sections that were analyzed.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handlePlayPause}>
                          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                        </Button>
                        <span className="text-sm">
                          {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")} /{" "}
                          {fileType === "audio" ? "20:00" : "00:00"}
                        </span>
                      </div>

                      <div className="relative h-12 bg-secondary rounded-md overflow-hidden">
                        <div
                          className="absolute h-full bg-primary/20 cursor-pointer"
                          style={{ left: "0%", width: `${(currentTime / 1200) * 100}%` }}
                        ></div>

                        {/* Highlighted segments */}
                        <div className="absolute left-[10%] w-[15%] h-full bg-blue-500/30 cursor-pointer"></div>
                        <div className="absolute left-[35%] w-[20%] h-full bg-green-500/30 cursor-pointer"></div>
                        <div className="absolute left-[65%] w-[25%] h-full bg-yellow-500/30 cursor-pointer"></div>

                        {/* Current position indicator */}
                        <div
                          className="absolute w-0.5 h-full bg-primary"
                          style={{ left: `${(currentTime / 1200) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>00:00</span>
                        <span>05:00</span>
                        <span>10:00</span>
                        <span>15:00</span>
                        <span>20:00</span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Detected Segments</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-blue-500/70"></div>
                            <span>Financial Projections (10:15 - 12:22)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                            <span>Market Analysis (05:30 - 07:45)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                            <span>Risk Assessment (15:10 - 18:30)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button className="gap-2" onClick={onValidate}>
              <CheckCircleIcon size={16} /> Validate
            </Button>
            <Button variant="outline" className="gap-2" onClick={onCheckDocument}>
              <FileSearchIcon size={16} /> Check Document
            </Button>
            <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600" onClick={onRedoAnalysis}>
              <RefreshCwIcon size={16} /> Redo Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
