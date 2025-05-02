import { fetchWithAuth } from './auth';

export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface AnalysisRequest {
  title?: string;
  message?: string;
  fileIds: string[];
}

export interface AnalysisResponse {
  id: string;
  content: string;
  createdAt: string;
  files: FileMetadata[];
}

// Upload a file and get metadata
export async function uploadFile(file: File): Promise<FileMetadata> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetchWithAuth('http://127.0.0.1:5000/api/files/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header when using FormData
      // The browser will set it with the correct boundary
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get file metadata
export async function getFileMetadata(fileId: string): Promise<FileMetadata> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/files/${fileId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get file metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting file metadata for ${fileId}:`, error);
    throw error;
  }
}

// Delete a file
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/files/${fileId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete file');
    }
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    throw error;
  }
}

// Create a new analysis
export async function createAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const response = await fetchWithAuth('http://127.0.0.1:5000/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create analysis');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating analysis:', error);
    throw error;
  }
}

// Send a follow-up message to an existing analysis
export async function sendFollowUpMessage(analysisId: string, message: string): Promise<AnalysisResponse> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/analysis/${analysisId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send follow-up message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending follow-up message:', error);
    throw error;
  }
}