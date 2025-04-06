
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  stocks: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  created_at: string;
  updated_at: string;
  ai_feedback: string | null;
}

interface CreateJournalEntryPayload {
  title: string;
  content: string;
  stocks: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export const useJournalEntries = () => {
  const queryClient = useQueryClient();

  const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`Error fetching journal entries: ${error.message}`);
      throw error;
    }

    return data;
  };

  const createJournalEntry = async (entry: CreateJournalEntryPayload): Promise<JournalEntry> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single();

    if (error) {
      toast.error(`Error creating journal entry: ${error.message}`);
      throw error;
    }

    toast.success('Journal entry created successfully');
    return data;
  };

  const updateJournalEntry = async (
    id: string, 
    updates: Partial<CreateJournalEntryPayload>
  ): Promise<JournalEntry> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error(`Error updating journal entry: ${error.message}`);
      throw error;
    }

    toast.success('Journal entry updated successfully');
    return data;
  };

  const deleteJournalEntry = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(`Error deleting journal entry: ${error.message}`);
      throw error;
    }

    toast.success('Journal entry deleted successfully');
  };

  const entriesQuery = useQuery({
    queryKey: ['journalEntries'],
    queryFn: fetchJournalEntries,
  });

  const createMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateJournalEntryPayload> }) => 
      updateJournalEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });

  return {
    entriesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
