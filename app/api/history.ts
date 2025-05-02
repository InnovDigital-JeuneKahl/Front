import { fetchWithAuth } from './auth';

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  type: string;
  content?: string;
}

// Fetch all history items for the current user
export async function fetchHistoryItems(): Promise<HistoryItem[]> {
  try {
    const response = await fetchWithAuth('http://127.0.0.1:5000/api/history');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

// Fetch a single history item by ID
export async function fetchHistoryItemById(id: string): Promise<HistoryItem> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/history/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch history item');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching history item ${id}:`, error);
    throw error;
  }
}

// Delete a history item
export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/history/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete history item');
    }
  } catch (error) {
    console.error(`Error deleting history item ${id}:`, error);
    throw error;
  }
}

// Search history items
export async function searchHistory(query: string): Promise<HistoryItem[]> {
  try {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/api/history/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching history:', error);
    throw error;
  }
}