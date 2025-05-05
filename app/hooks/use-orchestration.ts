import { useState, useCallback } from 'react';
import { FileMetadata } from '../api/orchestration';
import { 
  processFilesWithOrchestration, 
  askQuestionWithOrchestration, 
  searchWithinFileUsingOrchestration,
  generateFileSummary,
  extractEntitiesFromDocument,
  extractTextFromFile,
  createMetadataFromChatContext
} from '../utils/orchestration-service';

// Interface for files in the orchestration service
export interface OrchestrationFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  analysisReady?: boolean;
  orchestrationId?: string;
}

// Interface for analysis results
export interface AnalysisResult {
  type: 'summary' | 'entities' | 'text' | 'search';
  content: string;
  keyPoints?: string[];
  entities?: {
    people?: string[];
    organizations?: string[];
    locations?: string[];
    dates?: string[];
    products?: string[];
    [key: string]: string[] | undefined;
  };
  confidence?: number;
  sentiment?: string;
  matches?: Array<{ text: string; context: string }>;
}

/**
 * Hook to manage interactions with the orchestration service
 */
export function useOrchestration() {
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Progress tracking (0-100)
  const [progress, setProgress] = useState(0);
  
  // Store results of the most recent operation
  const [results, setResults] = useState<any>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setResults(null);
    setError(null);
  }, []);
  
  /**
   * Process files with the orchestration service
   */
  const processFiles = useCallback(async (files: File[], threadTitle: string, username?: string) => {
    setLoading(true);
    setProgress(10);
    setError(null);
    
    try {
      // Create metadata from chat context
      const metadata = createMetadataFromChatContext(threadTitle, username);
      
      // Start processing
      setProgress(30);
      
      // Process files with orchestration service
      const result = await processFilesWithOrchestration(files, metadata);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Ask a question about a file
   */
  const askQuestion = useCallback(async (file: File, question: string) => {
    setLoading(true);
    setProgress(20);
    setError(null);
    
    try {
      // Ask question via orchestration service
      const result = await askQuestionWithOrchestration(file, question);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Search within a file for specific terms
   */
  const searchWithinFile = useCallback(async (file: File, searchTerms: string) => {
    setLoading(true);
    setProgress(20);
    setError(null);
    
    try {
      // Search within file via orchestration service
      const result = await searchWithinFileUsingOrchestration(file, searchTerms);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Generate a summary of a file
   */
  const summarizeFile = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(20);
    setError(null);
    
    try {
      // Generate summary via orchestration service
      const result = await generateFileSummary(file);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Extract entities from a document
   */
  const extractEntities = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(20);
    setError(null);
    
    try {
      // Extract entities via orchestration service
      const result = await extractEntitiesFromDocument(file);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Extract text from a file
   */
  const extractText = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(20);
    setError(null);
    
    try {
      // Extract text via orchestration service
      const result = await extractTextFromFile(file);
      
      setProgress(100);
      setResults(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  return {
    loading,
    progress,
    results,
    error,
    reset,
    processFiles,
    askQuestion,
    searchWithinFile,
    summarizeFile,
    extractEntities,
    extractText
  };
}

// Helper function to generate mock analysis content based on file types
function generateMockAnalysisContent(files: File[]): string {
  const fileTypes = files.map(f => f.type);
  const containsPdf = fileTypes.some(type => type.includes('pdf'));
  const containsAudio = fileTypes.some(type => type.includes('audio'));
  
  if (containsPdf) {
    return "I've analyzed your PDF files and found some interesting insights. The financial report shows a 15% growth in Q3, and the market analysis indicates potential expansion opportunities in the Asian market.";
  } else if (containsAudio) {
    return "I've transcribed and analyzed your audio files. The meeting recording contains important discussions about the upcoming product launch timeline and marketing strategy adjustments based on last quarter's results.";
  } else {
    return "I've processed your files and extracted the key information. The documents contain details about project timelines, resource allocation, and strategic goals for the next fiscal year.";
  }
} 