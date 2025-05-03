// React imports
import React, { useState, useEffect } from 'react';

// UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  BarChart2Icon, 
  DownloadIcon, 
  FileAudioIcon, 
  FileIcon, 
  FileImageIcon, 
  FileTextIcon, 
  ListIcon, 
  PauseIcon, 
  PlayIcon, 
  TagIcon, 
  ZoomInIcon, 
  ZoomOutIcon 
} from "lucide-react";

// Type for the uploaded file
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: "uploading" | "complete" | "error";
  url?: string;
  analysisReady?: boolean;
}

// Props for the FilePreview component
interface FilePreviewProps {
  file: UploadedFile | null;
  open: boolean;
  onClose: () => void;
  onAnalyze: (fileId: string, action: string) => void;
}

// Stub for document viewer - in a real app, you'd use a PDF library like pdf.js
const DocumentViewer = ({ url, fileName }: { url?: string; fileName: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // Mock value
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-slate-100 p-2 rounded-md mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            <ArrowRightIcon size={16} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
          >
            <ZoomOutIcon size={16} />
          </Button>
          <span className="text-sm">{zoomLevel}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}
          >
            <ZoomInIcon size={16} />
          </Button>
        </div>
        
        <Button variant="ghost" size="sm">
          <DownloadIcon size={16} className="mr-1" />
          Download
        </Button>
      </div>
      
      {/* Placeholder for document content */}
      <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-auto">
        <div 
          className="bg-white shadow-lg p-8 w-[80%] h-[90%] mx-auto relative"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <div className="text-center">
            <FileTextIcon size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 text-lg font-medium">{fileName}</h3>
            <p className="text-slate-500 text-sm mt-2">
              {fileName.endsWith('.pdf') ? 'PDF Document' : 'Document'} Preview
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Page {currentPage} of {totalPages}
            </p>
            <div className="mt-4 mx-auto w-full max-w-md">
              {/* Placeholder for document content */}
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-3 bg-slate-100 rounded-full mb-2 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audio player component
const AudioPlayer = ({ url, fileName }: { url?: string; fileName: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('durationchange', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('durationchange', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg p-6">
        <div className="w-40 h-40 rounded-full bg-slate-200 flex items-center justify-center mb-6">
          <FileAudioIcon size={48} className="text-slate-400" />
        </div>
        
        <h3 className="text-lg font-medium text-slate-700 mb-1">{fileName}</h3>
        <p className="text-sm text-slate-500 mb-6">Audio File</p>
        
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-500">{formatTime(currentTime)}</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-500">{formatTime(duration)}</span>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <PauseIcon size={20} />
              ) : (
                <PlayIcon size={20} />
              )}
            </Button>
          </div>
          
          {url && (
            <audio ref={audioRef} src={url} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
};

// Image viewer component
const ImageViewer = ({ url, fileName }: { url?: string; fileName: string }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-slate-50 rounded-lg flex items-center justify-center p-4 overflow-auto">
        {url ? (
          <img 
            src={url} 
            alt={fileName} 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <FileImageIcon size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700">Image preview not available</h3>
          </div>
        )}
      </div>
    </div>
  );
};

// Analysis results tab content
const AnalysisResults = ({ fileId, onAnalyze }: { fileId: string, onAnalyze: (fileId: string, action: string) => void }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="border border-slate-200 rounded-md p-4 bg-white">
        <h3 className="text-sm font-medium text-slate-800 mb-2 flex items-center gap-2">
          <BarChart2Icon size={16} className="text-blue-500" />
          Document Summary
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Generate a concise summary of the document with key points highlighted.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAnalyze(fileId, 'summarize')}
        >
          Generate Summary
        </Button>
      </div>
      
      <div className="border border-slate-200 rounded-md p-4 bg-white">
        <h3 className="text-sm font-medium text-slate-800 mb-2 flex items-center gap-2">
          <TagIcon size={16} className="text-green-500" />
          Entity Extraction
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Identify and categorize entities such as people, organizations, and locations.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAnalyze(fileId, 'analyze-entities')}
        >
          Extract Entities
        </Button>
      </div>
      
      <div className="border border-slate-200 rounded-md p-4 bg-white">
        <h3 className="text-sm font-medium text-slate-800 mb-2 flex items-center gap-2">
          <ListIcon size={16} className="text-purple-500" />
          Full Text Extraction
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Extract all text content from the document while preserving structure.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAnalyze(fileId, 'extract-text')}
        >
          Extract Text
        </Button>
      </div>
    </div>
  );
};

export function FilePreview({ file, open, onClose, onAnalyze }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState('preview');

  // Reset to preview tab when a new file is opened
  useEffect(() => {
    if (file) {
      setActiveTab('preview');
    }
  }, [file]);

  if (!file) return null;

  // Determine the file type and appropriate viewer
  const getViewer = () => {
    if (file.type.includes('image')) {
      return <ImageViewer url={file.url} fileName={file.name} />;
    } else if (file.type.includes('audio')) {
      return <AudioPlayer url={file.url} fileName={file.name} />;
    } else {
      return <DocumentViewer url={file.url} fileName={file.name} />;
    }
  };

  // Get the file icon based on type
  const getFileIcon = () => {
    if (file.type.includes('image')) {
      return <FileImageIcon className="h-5 w-5 text-purple-500" />;
    } else if (file.type.includes('audio')) {
      return <FileAudioIcon className="h-5 w-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="truncate">{file.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-2 p-1 mx-4 mt-3">
            <TabsTrigger value="preview">File Preview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 overflow-auto p-4">
            {getViewer()}
          </TabsContent>
          
          <TabsContent value="analysis" className="flex-1 overflow-auto">
            <AnalysisResults fileId={file.id} onAnalyze={onAnalyze} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {file.analysisReady && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Analyzed
              </Badge>
            )}
            <span className="text-xs text-slate-500">
              {formatFileSize(file.size)}
            </span>
          </div>
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
} 