import {
  // API functions
  processFile,
  askQuestion,
  searchWithinFile,
  keywordSearch,
  listProcessedFiles,
  
  // Types/interfaces
  FileMetadata,
  UploadedFile as OrchestrationFile,
  ProcessFileResponse,
  QuestionResponse,
  SearchResponse
} from '../api/orchestration';

// List of file extensions supported by the orchestration service
const SUPPORTED_FILE_EXTENSIONS = [
  // Documents
  '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
  // Spreadsheets
  '.xls', '.xlsx', '.csv',
  // Presentations
  '.ppt', '.pptx',
  // Audio
  '.mp3', '.wav', '.m4a', '.flac', '.ogg',
  // Images (for OCR)
  '.jpg', '.jpeg', '.png',
  // Code
  '.py', '.js', '.java', '.cpp', '.c', '.h', '.cs', '.html', '.css'
];

// Local interface for files
interface LocalFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  analysisReady?: boolean;
  orchestrationId?: string;
}

/**
 * Converts an orchestration file to local file format
 */
export function convertOrchestrationFileToLocalFile(file: OrchestrationFile): LocalFile {
  return {
    id: crypto.randomUUID(),
    name: file.filename,
    type: file.filetype,
    size: file.size,
    url: file.url || '',
    analysisReady: true,
    orchestrationId: file.id
  };
}

/**
 * Process files with orchestration service
 * @param files Files to process
 * @param metadata Optional metadata
 * @returns Summary of processing
 */
export async function processFilesWithOrchestration(files: File[], metadata?: FileMetadata): Promise<{
  filesProcessed: number;
  textChunks: number;
  filesWithErrors: string[];
  summary: string;
}> {
  if (!files.length) {
    throw new Error('No files to process');
  }

  try {
    // Process each file
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await processFile(file, metadata);
          return { success: true, result, filename: file.name };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return { success: false, filename: file.name };
        }
      })
    );

    const successfulFiles = results.filter(r => r.success);
    const failedFiles = results.filter(r => !r.success);

    // Generate summary
    const summary = `Processed ${successfulFiles.length} files successfully. ${
      failedFiles.length > 0 ? `Failed to process ${failedFiles.length} files.` : ''
    }`;

    return {
      filesProcessed: successfulFiles.length,
      textChunks: successfulFiles.reduce((sum, file) => sum + ((file as any).result?.chunks || 0), 0),
      filesWithErrors: failedFiles.map(f => f.filename),
      summary
    };
  } catch (error) {
    console.error('Error in processFilesWithOrchestration:', error);
    throw new Error('Failed to process files: ' + (error as Error).message);
  }
}

/**
 * Ask a question about a file
 * @param file File to ask question about
 * @param question Question text
 * @returns Answer and sources
 */
export async function askQuestionWithOrchestration(file: File, question: string): Promise<{
  answer: string;
  sources: Array<{ text: string; document: string }>;
}> {
  try {
    const response = await askQuestion(file, question);
    
    return {
      answer: response.answer,
      sources: response.sources
    };
  } catch (error) {
    console.error('Error in askQuestionWithOrchestration:', error);
    throw new Error('Failed to get answer: ' + (error as Error).message);
  }
}

/**
 * Search within a file for specific terms
 * @param file File to search
 * @param searchTerms Search terms
 * @returns Search matches
 */
export async function searchWithinFileUsingOrchestration(file: File, searchTerms: string): Promise<{
  matches: Array<{ text: string; context: string }>;
}> {
  try {
    const response = await searchWithinFile(file, searchTerms);
    
    return {
      matches: response.matches
    };
  } catch (error) {
    console.error('Error in searchWithinFileUsingOrchestration:', error);
    throw new Error('Failed to search within file: ' + (error as Error).message);
  }
}

/**
 * Generate a summary of a file highlighting key points
 * @param file File to summarize
 * @returns Summary and key points
 */
export async function generateFileSummary(file: File): Promise<{
  summary: string;
  keyPoints: string[];
}> {
  try {
    // This would use askQuestion with a specific summarization prompt
    const response = await askQuestion(file, "Generate a comprehensive summary of this document and list the key points");
    
    // Parse the response to extract key points
    // This is a simplified version - in a real implementation you might want to 
    // structure the prompt to get more structured data
    const responseText = response.answer;
    const keyPointsMatch = responseText.match(/key points:(.+)/i);
    let keyPoints: string[] = [];
    
    if (keyPointsMatch && keyPointsMatch[1]) {
      // Try to extract bullet points
      keyPoints = keyPointsMatch[1]
        .split(/[•\-*]/)
        .map((point: string) => point.trim())
        .filter((point: string) => point.length > 0);
    }
    
    // If no key points were found in the expected format, try to generate some
    if (keyPoints.length === 0) {
      // Use the first few sentences as a basic summary
      const sentences = responseText.split(/[.!?]/).filter((s: string) => s.trim().length > 0);
      const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
      
      // Generate some key points by asking a follow-up question
      const keyPointsResponse = await askQuestion(
        file, 
        "List the 5 most important points from this document in bullet point format"
      );
      
      keyPoints = keyPointsResponse.answer
        .split(/\n/)
        .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim())
        .filter((line: string) => line.length > 0);
        
      return {
        summary,
        keyPoints: keyPoints.slice(0, 5) // Limit to 5 key points
      };
    }
    
    // Extract summary (everything before key points)
    const summary = responseText.split(/key points:/i)[0].trim();
    
    return {
      summary,
      keyPoints
    };
  } catch (error) {
    console.error('Error in generateFileSummary:', error);
    throw new Error('Failed to summarize file: ' + (error as Error).message);
  }
}

/**
 * Extract entities from a document
 * @param file File to analyze
 * @returns Object containing categorized entities
 */
export async function extractEntitiesFromDocument(file: File): Promise<{
  people: string[];
  organizations: string[];
  locations: string[];
  dates: string[];
  products: string[];
  misc: string[];
}> {
  try {
    // Use a specific prompt to extract entities
    const response = await askQuestion(
      file,
      "Extract and categorize all named entities in this document. List all people, organizations, locations, dates, and products mentioned. Format the response as JSON with these categories as keys."
    );
    
    // Attempt to parse JSON from the response
    let entities;
    try {
      // Look for JSON-like structure in the response
      const responseText = response.answer;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        entities = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from entity extraction:', jsonError);
      
      // Fallback: parse the text response to extract entities
      const responseText = response.answer;
      const people = extractCategoryItems(responseText, 'people', 'organizations');
      const organizations = extractCategoryItems(responseText, 'organizations', 'locations');
      const locations = extractCategoryItems(responseText, 'locations', 'dates');
      const dates = extractCategoryItems(responseText, 'dates', 'products');
      const products = extractCategoryItems(responseText, 'products', null);
      
      entities = {
        people,
        organizations,
        locations,
        dates,
        products,
        misc: []
      };
    }
    
    // Ensure all required categories exist
    const result = {
      people: entities.people || [],
      organizations: entities.organizations || [],
      locations: entities.locations || [],
      dates: entities.dates || [],
      products: entities.products || [],
      misc: entities.misc || []
    };
    
    return result;
  } catch (error) {
    console.error('Error in extractEntitiesFromDocument:', error);
    throw new Error('Failed to extract entities: ' + (error as Error).message);
  }
}

/**
 * Helper function to extract items from a specific category in text
 */
function extractCategoryItems(text: string, categoryName: string, nextCategoryName: string | null): string[] {
  const regex = new RegExp(`${categoryName}[:\\s]+(.*?)${nextCategoryName ? `(?=${nextCategoryName})` : '$'}`, 'is');
  const match = text.match(regex);
  
  if (match && match[1]) {
    return match[1]
      .split(/[\n,]/)
      .map(item => item.replace(/^[-•*]\s*/, '').trim())
      .filter(item => item.length > 0);
  }
  
  return [];
}

/**
 * Check if a file type is supported by the orchestration service
 * @param filename Filename to check
 * @returns Boolean indicating if file type is supported
 */
export function isFileTypeSupported(filename: string): boolean {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_FILE_EXTENSIONS.includes(extension);
}

/**
 * Extract text content from a file while preserving structure
 * @param file File to extract text from
 * @returns Extracted text
 */
export async function extractTextFromFile(file: File): Promise<{
  text: string;
  paragraphs: number;
  characters: number;
}> {
  try {
    // This would use a custom endpoint on your orchestration service
    // For now, we'll use the askQuestion endpoint with a specific prompt
    const response = await askQuestion(
      file,
      "Extract and return the full text content of this document while preserving the structure. Do not summarize or analyze the content."
    );
    
    const responseText = response.answer;
    
    // Count paragraphs and characters
    const paragraphs = responseText.split(/\n\s*\n/).length;
    const characters = responseText.length;
    
    return {
      text: responseText,
      paragraphs,
      characters
    };
  } catch (error) {
    console.error('Error in extractTextFromFile:', error);
    throw new Error('Failed to extract text: ' + (error as Error).message);
  }
}

/**
 * Create metadata from chat context
 * @param threadTitle Thread title
 * @param username Optional username
 * @returns Metadata object
 */
export function createMetadataFromChatContext(threadTitle: string, username?: string): FileMetadata {
  return {
    source: 'chat',
    context: threadTitle,
    username: username || 'user',
    timestamp: new Date().toISOString()
  };
} 