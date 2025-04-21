import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Lightbulb, PencilLine, BookOpen, Plus, Calendar, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useAuth } from '@/hooks/useAuth';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const InvestorJournal = () => {
  const { user } = useAuth();
  const { 
    journalEntries, 
    isLoading, 
    createJournalEntry, 
    isCreating,
    deleteJournalEntry,
    isDeleting
  } = useJournalEntries(user?.id || null);
  
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [newEntryMode, setNewEntryMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    stocks: '',
    sentiment: 'neutral',
  });
  
  // Set the first entry as active when data loads
  useEffect(() => {
    if (journalEntries && journalEntries.length > 0 && !activeEntry && !newEntryMode) {
      setActiveEntry(journalEntries[0].id);
    }
  }, [journalEntries, activeEntry, newEntryMode]);
  
  const handleNewEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please provide both a title and content for your journal entry');
      return;
    }
    
    try {
      const stocksArray = newEntry.stocks
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      const entry = await createJournalEntry({
        title: newEntry.title,
        content: newEntry.content,
        stocks: stocksArray,
        sentiment: newEntry.sentiment as 'bullish' | 'bearish' | 'neutral',
      });
      
      setActiveEntry(entry.id);
      setNewEntryMode(false);
      
      // Reset new entry form
      setNewEntry({
        title: '',
        content: '',
        stocks: '',
        sentiment: 'neutral',
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };
  
  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    
    try {
      await deleteJournalEntry(entryToDelete);
      
      // Set the first available entry as active after deletion
      if (journalEntries && journalEntries.length > 1) {
        const nextEntry = journalEntries.find(entry => entry.id !== entryToDelete);
        setActiveEntry(nextEntry?.id || null);
      } else {
        setActiveEntry(null);
      }
      
      setEntryToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };
  
  const confirmDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Add null/undefined check before using find()
  const selectedEntry = journalEntries && journalEntries.length > 0 
    ? journalEntries.find(entry => entry.id === activeEntry) 
    : undefined;
  
  const renderSentimentBadge = (sentiment: string) => {
    const badgeColors = {
      bullish: 'bg-finance-green-100 text-finance-green-800 border-finance-green-200',
      bearish: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs border ${badgeColors[sentiment as keyof typeof badgeColors]}`}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Investor Journal</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen size={18} className="mr-2" />
                  Your Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Investor Journal</h1>
        <Button 
          onClick={() => setNewEntryMode(true)}
          disabled={newEntryMode || isCreating}
        >
          <Plus size={16} className="mr-2" />
          New Entry
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen size={18} className="mr-2" />
                Your Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto pr-2">
                {journalEntries && journalEntries.length > 0 ? (
                  journalEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setActiveEntry(entry.id);
                        setNewEntryMode(false);
                      }}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${
                        activeEntry === entry.id && !newEntryMode ? 'bg-muted border-muted-foreground/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium line-clamp-1">{entry.title}</h3>
                        {renderSentimentBadge(entry.sentiment)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar size={12} className="mr-1" />
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </div>
                      <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">{entry.content}</p>
                      
                      {entry.stocks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.stocks.map((stock) => (
                            <span 
                              key={stock} 
                              className="text-xs bg-muted px-1.5 py-0.5 rounded"
                            >
                              {stock}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No journal entries yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {newEntryMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PencilLine size={18} className="mr-2" />
                  Create New Journal Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="entry-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="entry-title"
                    placeholder="Entry title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="entry-content" className="text-sm font-medium">
                    Your Thoughts
                  </label>
                  <Textarea
                    id="entry-content"
                    placeholder="Write about your investment decisions, market analysis, or trading ideas..."
                    rows={8}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="entry-stocks" className="text-sm font-medium">
                      Related Stocks
                    </label>
                    <Input
                      id="entry-stocks"
                      placeholder="Stock symbols, comma separated..."
                      value={newEntry.stocks}
                      onChange={(e) => setNewEntry({ ...newEntry, stocks: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: AAPL, MSFT, GOOGL
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="entry-sentiment" className="text-sm font-medium">
                      Overall Sentiment
                    </label>
                    <Select
                      value={newEntry.sentiment}
                      onValueChange={(value) => setNewEntry({ ...newEntry, sentiment: value })}
                    >
                      <SelectTrigger id="entry-sentiment">
                        <SelectValue placeholder="Select sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">Bullish</SelectItem>
                        <SelectItem value="bearish">Bearish</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewEntryMode(false);
                      if (journalEntries && journalEntries.length > 0) {
                        setActiveEntry(journalEntries[0].id);
                      }
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleNewEntry}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Entry'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedEntry ? (
            <Tabs defaultValue="entry">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="entry">Journal Entry</TabsTrigger>
                  <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedEntry.date), 'MMMM d, yyyy')}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => confirmDeleteEntry(selectedEntry.id)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <Card>
                <TabsContent value="entry" className="mt-0">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{selectedEntry.title}</CardTitle>
                      {renderSentimentBadge(selectedEntry.sentiment)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                    
                    {selectedEntry.stocks.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Related Stocks</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.stocks.map((stock) => (
                            <div 
                              key={stock} 
                              className="px-3 py-1 bg-muted rounded-full text-sm"
                            >
                              {stock}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="feedback" className="mt-0">
                  <CardHeader>
                    <div className="flex items-start">
                      <Lightbulb size={20} className="mr-2 text-yellow-500 mt-0.5" />
                      <CardTitle>AI Analysis & Feedback</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedEntry.aiFeedback ? (
                      <p className="mb-4">
                        {selectedEntry.aiFeedback}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center p-6 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Generating AI feedback...</span>
                      </div>
                    )}
                    
                    {selectedEntry.cognitivebiases && selectedEntry.cognitivebiases.length > 0 && (
                      <div className="border-t pt-4 mt-6">
                        <h4 className="text-sm font-medium mb-2">Potential Cognitive Biases</h4>
                        <ul className="space-y-2">
                          {selectedEntry.cognitivebiases.map((bias, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mt-0.5">
                                {bias.name}
                              </span>
                              <span className="text-sm">{bias.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <BookOpen size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Entry Selected</h3>
                <p className="text-sm text-muted-foreground">
                  {!journalEntries || journalEntries.length === 0 
                    ? "You haven't created any journal entries yet."
                    : "Select an existing journal entry from the sidebar or create a new one."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setNewEntryMode(true)}
                  className="mt-4"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Entry
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEntry} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvestorJournal;
