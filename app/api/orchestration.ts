import { fetchWithAuth } from './auth';

// Base URL for the file orchestration service
const BASE_URL = 'http://localhost:8000/api';

// Interfaces for file orchestration service
export interface UploadedFile {
  filename: string;
  file_type: string;
  size_bytes: number;
  transcription_length?: number;
}

export interface RagResponse {
  status: string;
  message: string;
  chunk_ids: string[];
  processing_time_seconds: number;
}

export interface ProcessFileResponse extends UploadedFile {
  rag_response: RagResponse;
}

export interface FileMetadata {
  author?: string;
  additional_metadata?: Record<string, any>;
}

export interface ResultSource {
  id: number;
  chunk_id: string;
  content_snippet: string;
}

export interface QuestionAnswer {
  response: string;
  model: string;
  sources: ResultSource[];
}

export interface RelevantPassage {
  content: string;
  chunk_id: string;
  score: number;
}

export interface FileInfo {
  filename: string;
  file_type: string;
  size_bytes: number;
}

export interface QuestionResponse {
  question: string;
  answer: QuestionAnswer;
  file_info: FileInfo;
  relevant_passages: RelevantPassage[];
}

export interface SearchResult {
  text: string;
  timestamp_start: number | null;
  timestamp_end: number | null;
  context: {
    before: string;
    current: string;
    after: string;
  };
}

export interface SearchResponse {
  filename: string;
  file_type: string;
  search_terms: string;
  results: SearchResult[];
  count: number;
}

export interface KeywordSearchResult {
  content: string;
  chunk_id: string;
  metadata: Record<string, any>;
  score: number;
}

export interface KeywordSearchResponse {
  query: string;
  results: KeywordSearchResult[];
  response: string;
  keywords: string[];
  model: string;
}

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
 * Process a file and add it to the RAG system
 */
export async function processFile(
  file: File, 
  metadata?: FileMetadata
): Promise<ProcessFileResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetchWithAuth(`${BASE_URL}/process`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

/**
 * Upload a file and ask a question about its content
 */
export async function askQuestion(
  file: File,
  question: string,
  metadata?: FileMetadata
): Promise<QuestionResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetchWithAuth(`${BASE_URL}/question`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process question');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
}

/**
 * Search for specific terms within a file
 */
export async function searchWithinFile(
  file: File,
  searchTerms: string
): Promise<SearchResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('search_terms', searchTerms);
    
    const response = await fetchWithAuth(`${BASE_URL}/search`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching file:', error);
    throw error;
  }
}

/**
 * Search across all processed documents using keywords
 */
export async function keywordSearch(
  keywords: string[],
  query?: string,
  filterMetadata?: Record<string, any>,
  model?: string,
  topK?: number
): Promise<KeywordSearchResponse> {
  try {
    const requestBody = {
      keywords,
      query,
      filter_metadata: filterMetadata,
      model,
      top_k: topK
    };
    
    const response = await fetchWithAuth(`${BASE_URL}/keyword-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to perform keyword search');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error performing keyword search:', error);
    throw error;
  }
}

// Document Management Functions

/**
 * Retrieve a list of all processed files
 */
export async function listProcessedFiles(): Promise<ProcessedFilesResponse> {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/processed-files`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to list processed files');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing processed files:', error);
    throw error;
  }
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