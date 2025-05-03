// Authentication utilities
import { fetchWithAuth } from './auth';

// Base URL for the file orchestration service
const BASE_URL = 'http://localhost:8000/api';

// Define API interfaces for the File Orchestration Service

/**
 * File metadata for uploads and processing
 */
export interface FileMetadata {
  source?: string;
  context?: string;
  username?: string;
  timestamp?: string;
  tags?: string[];
  additional_metadata?: Record<string, any>;
}

/**
 * Uploaded file information
 */
export interface UploadedFile {
  id: string;
  filename: string;
  filetype: string;
  size: number;
  url?: string;
  upload_date?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Response from the process file endpoint
 */
export interface ProcessFileResponse {
  status: "success" | "error";
  filename: string;
  filetype: string;
  size_bytes: number;
  processing_time_ms: number;
  chunks: number;
  error?: string;
}

/**
 * Question answer from RAG system
 */
export interface QuestionAnswer {
  response: string;
  confidence_score: number;
  processing_time_ms: number;
}

/**
 * Response from the ask question endpoint
 */
export interface QuestionResponse {
  status: "success" | "error";
  answer: string;
  sources: Array<{ text: string; document: string }>;
  processing_time_ms: number;
  model_used: string;
  error?: string;
}

/**
 * Response from the search endpoint
 */
export interface SearchResponse {
  status: "success" | "error";
  matches: Array<{ text: string; context: string }>;
  count: number;
  processing_time_ms: number;
  error?: string;
}

/**
 * Response from the RAG system
 */
export interface RagResponse {
  status: "success" | "error";
  chunk_ids: string[];
  embedding_model: string;
  processing_time_ms: number;
  error?: string;
}

// Interfaces for file orchestration service
export interface ProcessedFileInfo {
  chunk_count: number;
  processing_time_seconds: number;
  model_used: string;
  file_type: string;
  processed_at: number;
}

export interface ProcessedFilesResponse {
  files: Record<string, ProcessedFileInfo>;
}

export interface DocumentsResponse {
  count: number;
  filenames: string[];
}

export interface DeleteDocumentResponse {
  status: string;
  message: string;
}

export interface ResetSystemResponse {
  status: string;
  message: string;
}

export interface ServiceConfig {
  extensions: string[];
  service_endpoint: string;
  content_type: string;
}

export interface ServiceMappingConfig {
  [key: string]: ServiceConfig;
}

export interface ReloadConfigResponse {
  status: string;
  message: string;
}

export interface ModelsResponse {
  models: string[];
}

// File Processing Functions

/**
 * Process a file through the orchestration service
 */
export async function processFile(file: File, metadata?: FileMetadata): Promise<ProcessFileResponse> {
  // This would be an actual API call in production
  // Simulating the API call for development purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "success",
        filename: file.name,
        filetype: file.type,
        size_bytes: file.size,
        processing_time_ms: 2500,
        chunks: Math.floor(file.size / 1024) + 1
      });
    }, 1000);
  });
}

/**
 * Ask a question about a file using the RAG system
 */
export async function askQuestion(file: File, question: string, metadata?: FileMetadata): Promise<QuestionResponse> {
  // This would be an actual API call in production
  // Simulating the API call for development purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "success",
        answer: "This is a simulated answer to your question about " + file.name + ": " + question,
        sources: [
          {
            text: "Relevant passage from the document",
            document: file.name
          }
        ],
        processing_time_ms: 1500,
        model_used: "gpt-4"
      });
    }, 1000);
  });
}

/**
 * Search within a file for specific terms
 */
export async function searchWithinFile(file: File, searchTerms: string): Promise<SearchResponse> {
  // This would be an actual API call in production
  // Simulating the API call for development purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "success",
        matches: [
          {
            text: "Match for: " + searchTerms,
            context: "Surrounding context for the matched term in " + file.name
          }
        ],
        count: 1,
        processing_time_ms: 800
      });
    }, 1000);
  });
}

/**
 * Perform keyword search across all processed documents
 */
export async function keywordSearch(
  keywords: string[],
  query?: string,
  filters?: { department?: string; date_range?: [string, string] }
): Promise<SearchResponse> {
  // This would be an actual API call in production
  // Simulating the API call for development purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "success",
        matches: keywords.map(keyword => ({
          text: "Match for keyword: " + keyword,
          context: "Context around the keyword match" + (query ? " related to query: " + query : "")
        })),
        count: keywords.length,
        processing_time_ms: 1200
      });
    }, 1000);
  });
}

// Document Management Functions

/**
 * List all processed files
 */
export async function listProcessedFiles(): Promise<{ files: UploadedFile[] }> {
  // This would be an actual API call in production
  // Simulating the API call for development purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        files: [
          {
            id: "file-1",
            filename: "report.pdf",
            filetype: "application/pdf",
            size: 1024 * 1024 * 2.5,
            url: "/files/report.pdf",
            upload_date: new Date().toISOString()
          },
          {
            id: "file-2",
            filename: "presentation.pptx",
            filetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: 1024 * 1024 * 5.3,
            url: "/files/presentation.pptx",
            upload_date: new Date().toISOString()
          }
        ]
      });
    }, 1000);
  });
}

/**
 * Get detailed information about all documents
 */
export async function listAllDocuments(): Promise<DocumentsResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/documents`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to list documents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing documents:', error);
    throw error;
  }
}

/**
 * Delete a specific document and all its chunks
 */
export async function deleteDocument(filename: string): Promise<DeleteDocumentResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/documents/${filename}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete document');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting document ${filename}:`, error);
    throw error;
  }
}

/**
 * Reset the entire RAG system
 */
export async function resetRagSystem(): Promise<ResetSystemResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/system/reset?confirm=true`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reset RAG system');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting RAG system:', error);
    throw error;
  }
}

// Configuration Management Functions

/**
 * Get the current service mapping configuration
 */
export async function getServiceMapping(): Promise<ServiceMappingConfig> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/config/mapping`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get service mapping');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting service mapping:', error);
    throw error;
  }
}

/**
 * Reload the service mapping configuration from disk
 */
export async function reloadServiceMapping(): Promise<ReloadConfigResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/config/reload`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reload service mapping');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error reloading service mapping:', error);
    throw error;
  }
}

// Model Management Functions

/**
 * List all available language models
 */
export async function listAvailableModels(): Promise<ModelsResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/models`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to list available models');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing available models:', error);
    throw error;
  }
} 

/**
 * Response from the audio transcription endpoint - updated to match actual API response
 */
export interface TranscriptionResponse {
  transcription: string;
  language_probability: number;
  processing_time: number;
  
}

/**
 * Transcribe an audio recording
 * @param audioFile The audio file to transcribe
 * @param customMetadata Optional custom metadata to include with the transcription request
 * @returns Transcription response from the backend
 */
export async function transcribeAudioRecording(
  audioFile: File, 
  customMetadata?: {
    speaker?: string;
    meeting_id?: string;
  }
): Promise<TranscriptionResponse> {
  try {
    // Create form data to send the file and metadata
    const formData = new FormData();
    formData.append('file', audioFile);
    
    // Create default metadata that will be overridden by any custom values
    const metadata = {
      speaker: customMetadata?.speaker || "Unknown Speaker",
      meeting_id: customMetadata?.meeting_id || `meeting-${Date.now()}`,
    };
    
    // Add metadata as JSON string
    formData.append('metadata', JSON.stringify(metadata));
    
    // Send the request
    const response = await fetchWithAuth(`${BASE_URL}/audio/transcribe`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header as the browser will set it correctly with the boundary for multipart/form-data
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to transcribe audio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Response for the question endpoint that accepts file uploads
 */
export interface FileQuestionResponse {
  question: string;
  answer: {
    response: string;
    model: string;
    sources: Array<{
      id: number;
      chunk_id: string;
      content_snippet: string;
    }>;
  };
  file_info: {
    filename: string;
    file_type: string;
    size_bytes: number;
  };
  relevant_passages?: Array<{
    content: string;
    chunk_id: string;
    score: number;
  }>;
}

/**
 * Response for the keyword search endpoint
 */
export interface KeywordSearchResponse {
  query: string;
  results: Array<{
    content: string;
    chunk_id: string;
    metadata: Record<string, any>;
    score: number;
  }>;
  response: string;
  keywords: string[];
  model: string;
}

/**
 * Ask a question about uploaded files
 * @param files The files to ask a question about
 * @param question The question to ask
 * @param metadata Optional metadata to include with the request
 * @returns Response from the backend
 */
export async function askQuestionWithFiles(
  files: File[],
  question: string,
  metadata?: Record<string, any>
): Promise<FileQuestionResponse> {
  try {
    // Create form data for the multipart/form-data request
    const formData = new FormData();
    
    // Add each file to the FormData
    files.forEach(file => {
      formData.append('file', file);
    });
    
    // Add the question if provided
    if (question.trim()) {
      formData.append('question', question);
    }
    
    // Add metadata if provided
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    // Send the request to the question endpoint with files
    const response = await fetchWithAuth(`${BASE_URL}/question`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to process question (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error asking question with files:', error);
    throw error;
  }
}

/**
 * Perform keyword search with a query
 * @param query The query text
 * @param keywords Keywords to search for
 * @param filterMetadata Optional metadata filters
 * @param model Optional model to use for processing
 * @returns Keyword search results
 */
export async function keywordSearchWithQuery(
  query: string,
  keywords: string[],
  filterMetadata?: Record<string, any>,
  model: string = "qwen2.5:3b-instruct"
): Promise<KeywordSearchResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/keyword-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        keywords,
        filter_metadata: filterMetadata,
        model
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to perform keyword search (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error performing keyword search:', error);
    throw error;
  }
}