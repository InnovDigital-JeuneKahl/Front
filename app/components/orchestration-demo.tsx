"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileIcon, UploadIcon, SearchIcon, KeyIcon, TrashIcon, RefreshCwIcon, SettingsIcon, ListIcon } from 'lucide-react';

import {
  processFile,
  askQuestion,
  searchWithinFile,
  keywordSearch,
  listProcessedFiles,
  listAllDocuments,
  deleteDocument,
  resetRagSystem,
  getServiceMapping,
  reloadServiceMapping,
  listAvailableModels,
  FileMetadata,
  ProcessFileResponse,
  QuestionResponse,
  SearchResponse,
  KeywordSearchResponse,
  ProcessedFilesResponse,
  DocumentsResponse,
  ServiceMappingConfig,
  ModelsResponse
} from '../api/orchestration';

export default function OrchestrationDemo() {
  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<string>('{}');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Processing states
  const [processResult, setProcessResult] = useState<ProcessFileResponse | null>(null);
  const [questionResult, setQuestionResult] = useState<QuestionResponse | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [keywordResult, setKeywordResult] = useState<KeywordSearchResponse | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFilesResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentsResponse | null>(null);
  const [serviceMapping, setServiceMapping] = useState<ServiceMappingConfig | null>(null);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  
  // Input states
  const [question, setQuestion] = useState<string>('');
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [filenameToDelete, setFilenameToDelete] = useState<string>('');
  
  // Result state
  const [resultJson, setResultJson] = useState<string>('');
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Parse metadata from JSON string
  const parseMetadata = (): FileMetadata | undefined => {
    try {
      return JSON.parse(fileMetadata) as FileMetadata;
    } catch (error) {
      console.error('Invalid metadata JSON:', error);
      return undefined;
    }
  };
  
  // Display results as formatted JSON
  const displayResult = (data: any) => {
    setResultJson(JSON.stringify(data, null, 2));
    return data;
  };
  
  // File processing handlers
  const handleProcessFile = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const metadata = parseMetadata();
      const result = await processFile(selectedFile, metadata);
      setProcessResult(result);
      displayResult(result);
    } catch (error) {
      console.error('Error processing file:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAskQuestion = async () => {
    if (!selectedFile || !question) return;
    
    setLoading(true);
    try {
      const metadata = parseMetadata();
      const result = await askQuestion(selectedFile, question, metadata);
      setQuestionResult(result);
      displayResult(result);
    } catch (error) {
      console.error('Error asking question:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchWithinFile = async () => {
    if (!selectedFile || !searchTerms) return;
    
    setLoading(true);
    try {
      const result = await searchWithinFile(selectedFile, searchTerms);
      setSearchResult(result);
      displayResult(result);
    } catch (error) {
      console.error('Error searching within file:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeywordSearch = async () => {
    if (!keywords) return;
    
    setLoading(true);
    try {
      const keywordsArray = keywords.split(',').map(k => k.trim());
      const filterMetadata = department ? { department } : undefined;
      
      const result = await keywordSearch(keywordsArray, searchQuery, filterMetadata);
      setKeywordResult(result);
      displayResult(result);
    } catch (error) {
      console.error('Error performing keyword search:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  // System management handlers
  const handleListProcessedFiles = async () => {
    setLoading(true);
    try {
      const result = await listProcessedFiles();
      setProcessedFiles(result);
      displayResult(result);
    } catch (error) {
      console.error('Error listing processed files:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleListDocuments = async () => {
    setLoading(true);
    try {
      const result = await listAllDocuments();
      setDocuments(result);
      displayResult(result);
    } catch (error) {
      console.error('Error listing documents:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDocument = async () => {
    if (!filenameToDelete) return;
    
    setLoading(true);
    try {
      const result = await deleteDocument(filenameToDelete);
      displayResult(result);
      // Refresh documents list after deletion
      await handleListDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSystem = async () => {
    if (!window.confirm('Are you sure you want to reset the entire RAG system? This will delete all documents.')) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await resetRagSystem();
      displayResult(result);
      // Refresh documents list after reset
      await handleListDocuments();
    } catch (error) {
      console.error('Error resetting system:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  // Configuration handlers
  const handleGetServiceMapping = async () => {
    setLoading(true);
    try {
      const result = await getServiceMapping();
      setServiceMapping(result);
      displayResult(result);
    } catch (error) {
      console.error('Error getting service mapping:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleReloadServiceMapping = async () => {
    setLoading(true);
    try {
      const result = await reloadServiceMapping();
      displayResult(result);
      // Refresh service mapping after reload
      await handleGetServiceMapping();
    } catch (error) {
      console.error('Error reloading service mapping:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleListModels = async () => {
    setLoading(true);
    try {
      const result = await listAvailableModels();
      setModels(result);
      displayResult(result);
    } catch (error) {
      console.error('Error listing models:', error);
      setResultJson(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">File Orchestration Service Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>File Selection</CardTitle>
              <CardDescription>Select a file to process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-input">File</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-2"
                    >
                      <UploadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm mt-2">
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="metadata"
                    placeholder='{"author": "Jane Smith", "additional_metadata": {"department": "Finance"}}'
                    value={fileMetadata}
                    onChange={(e) => setFileMetadata(e.target.value)}
                    className="mt-1"
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="process">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="process">File Processing</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="system">System Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Process File</CardTitle>
                  <CardDescription>Upload and process a file for the RAG system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleProcessFile} 
                    disabled={!selectedFile || loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Process File'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ask a Question</CardTitle>
                  <CardDescription>Upload a file and ask a question about it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      placeholder="What were the Q1 financial results?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAskQuestion} 
                    disabled={!selectedFile || !question || loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Ask Question'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Within File</CardTitle>
                  <CardDescription>Search for specific terms within a file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="search-terms">Search Terms</Label>
                    <Input
                      id="search-terms"
                      placeholder="revenue growth"
                      value={searchTerms}
                      onChange={(e) => setSearchTerms(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSearchWithinFile} 
                    disabled={!selectedFile || !searchTerms || loading}
                    className="w-full"
                  >
                    {loading ? 'Searching...' : 'Search File'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Search</CardTitle>
                  <CardDescription>Search across all processed documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="keywords">Keywords (comma separated)</Label>
                    <Input
                      id="keywords"
                      placeholder="revenue, growth, forecast"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="search-query">Query (optional)</Label>
                    <Input
                      id="search-query"
                      placeholder="What was our revenue growth compared to forecast?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department Filter (optional)</Label>
                    <Input
                      id="department"
                      placeholder="Finance"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleKeywordSearch} 
                    disabled={!keywords || loading}
                    className="w-full"
                  >
                    {loading ? 'Searching...' : 'Keyword Search'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>List Documents</CardTitle>
                    <CardDescription>View all documents in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleListProcessedFiles} 
                      disabled={loading}
                      className="w-full"
                    >
                      <ListIcon className="mr-2 h-4 w-4" />
                      List Processed Files
                    </Button>
                    
                    <Button 
                      onClick={handleListDocuments} 
                      disabled={loading}
                      className="w-full"
                    >
                      <FileIcon className="mr-2 h-4 w-4" />
                      List All Documents
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Delete Document</CardTitle>
                    <CardDescription>Delete a specific document</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="filename">Filename</Label>
                      <Input
                        id="filename"
                        placeholder="quarterly_report.pdf"
                        value={filenameToDelete}
                        onChange={(e) => setFilenameToDelete(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleDeleteDocument} 
                      disabled={!filenameToDelete || loading}
                      variant="destructive"
                      className="w-full"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete Document
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Manage service configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleGetServiceMapping} 
                      disabled={loading}
                      className="w-full"
                    >
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Get Service Mapping
                    </Button>
                    
                    <Button 
                      onClick={handleReloadServiceMapping} 
                      disabled={loading}
                      className="w-full"
                    >
                      <RefreshCwIcon className="mr-2 h-4 w-4" />
                      Reload Configuration
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Models & System</CardTitle>
                    <CardDescription>Manage models and system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleListModels} 
                      disabled={loading}
                      className="w-full"
                    >
                      <ListIcon className="mr-2 h-4 w-4" />
                      List Available Models
                    </Button>
                    
                    <Button 
                      onClick={handleResetSystem} 
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Reset RAG System
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Results panel */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>API response data</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm">
            {resultJson || 'No results yet. Use the controls above to make API calls.'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 