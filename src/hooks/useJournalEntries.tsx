import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { JournalEntry } from '@/data/mockStockData';

// Type for journal entries stored in Supabase
export interface SupabaseJournalEntry {
  id: string;
  created_at: string;
  title: string;
  content: string;
  stocks: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  user_id: string;
  ai_feedback?: string;
}

// Create JournalEntry type without id/date for creation
export type CreateJournalEntryInput = Omit<JournalEntry, 'id' | 'date'>;

// Convert Supabase journal entry to our application format
const mapSupabaseEntryToJournalEntry = (entry: any): JournalEntry => {
  // Ensure sentiment is one of the valid values
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (entry.sentiment === 'bullish' || entry.sentiment === 'bearish' || entry.sentiment === 'neutral') {
    sentiment = entry.sentiment;
  }
  
  return {
    id: entry.id,
    date: entry.created_at,
    title: entry.title,
    content: entry.content,
    stocks: entry.stocks || [],
    sentiment: sentiment,
    aiFeedback: entry.ai_feedback,
    cognitivebiases: [] // Initialize as empty array since column might not exist
  };
};

export const useJournalEntries = (userId: string | null) => {
  // Query for fetching journal entries
  const getJournalEntriesQuery = useQuery({
    queryKey: ['journalEntries', userId],
    queryFn: async (): Promise<JournalEntry[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Error fetching journal entries: ${error.message}`);
        throw error;
      }

      return (data || []).map(mapSupabaseEntryToJournalEntry);
    },
    enabled: !!userId,
  });

  const queryClient = useQueryClient();

  // Mutation for creating a new journal entry
  const createJournalEntryMutation = useMutation({
    mutationFn: async ({ title, content, stocks, sentiment }: CreateJournalEntryInput): Promise<JournalEntry> => {
      if (!userId) {
        throw new Error('User must be logged in to create journal entries');
      }

      // First save the journal entry to Supabase
      const { data: entryData, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          title,
          content,
          stocks,
          sentiment,
          user_id: userId
        })
        .select('*')
        .single();

      if (entryError) {
        toast.error(`Error creating journal entry: ${entryError.message}`);
        throw entryError;
      }

      // Get AI feedback for the entry
      try {
        const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('journal-ai-feedback', {
          body: {
            journalContent: content,
            sentiment,
            stocks
          }
        });

        if (feedbackError) {
          console.error('Error getting AI feedback:', feedbackError);
        } else if (feedbackData) {
          // Update the entry with AI feedback only
          const { error: updateError } = await supabase
            .from('journal_entries')
            .update({
              ai_feedback: feedbackData.aiFeedback
            })
            .eq('id', entryData.id);

          if (updateError) {
            console.error('Error saving AI feedback:', updateError);
          } else {
            // Update the entry data with the feedback
            entryData.ai_feedback = feedbackData.aiFeedback;
            
            // Create a mapped entry with feedback
            const mappedEntry = mapSupabaseEntryToJournalEntry(entryData);
            mappedEntry.cognitivebiases = feedbackData.biases || [];
            return mappedEntry;
          }
        }
      } catch (feedbackErr) {
        console.error('Error invoking AI feedback function:', feedbackErr);
      }

      const mappedEntry = mapSupabaseEntryToJournalEntry(entryData);
      return mappedEntry;
    },
    onSuccess: () => {
      // Invalidate the journal entries query to refetch data
      queryClient.invalidateQueries({ queryKey: ['journalEntries', userId] });
      toast.success('Journal entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  // Mutation for deleting a journal entry
  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (entryId: string): Promise<void> => {
      if (!userId) {
        throw new Error('User must be logged in to delete journal entries');
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        toast.error(`Error deleting journal entry: ${error.message}`);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the journal entries query to refetch data
      queryClient.invalidateQueries({ queryKey: ['journalEntries', userId] });
      toast.success('Journal entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete journal entry: ${error.message}`);
    },
  });

  return {
    journalEntries: getJournalEntriesQuery.data || [],
    isLoading: getJournalEntriesQuery.isLoading,
    isError: getJournalEntriesQuery.isError,
    error: getJournalEntriesQuery.error,
    createJournalEntry: createJournalEntryMutation.mutateAsync,
    isCreating: createJournalEntryMutation.isPending,
    deleteJournalEntry: deleteJournalEntryMutation.mutateAsync,
    isDeleting: deleteJournalEntryMutation.isPending,
  };
};
