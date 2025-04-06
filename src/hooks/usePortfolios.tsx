
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PortfolioStock {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  shares: number;
  buy_price: number;
  created_at: string;
  updated_at: string;
}

interface CreatePortfolioPayload {
  name: string;
  description?: string;
}

interface CreatePortfolioStockPayload {
  portfolio_id: string;
  symbol: string;
  name: string;
  shares: number;
  buy_price: number;
}

export const usePortfolios = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchPortfolios = async (): Promise<Portfolio[]> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`Error fetching portfolios: ${error.message}`);
      throw error;
    }

    return data;
  };

  const fetchPortfolioStocks = async (portfolioId: string): Promise<PortfolioStock[]> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { data, error } = await supabase
      .from('portfolio_stocks')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('symbol');

    if (error) {
      toast.error(`Error fetching portfolio stocks: ${error.message}`);
      throw error;
    }

    return data;
  };

  const createPortfolio = async (portfolio: CreatePortfolioPayload): Promise<Portfolio> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ ...portfolio, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error(`Error creating portfolio: ${error.message}`);
      throw error;
    }

    toast.success('Portfolio created successfully');
    return data;
  };

  const addStock = async (stock: CreatePortfolioStockPayload): Promise<PortfolioStock> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { data, error } = await supabase
      .from('portfolio_stocks')
      .insert([stock])
      .select()
      .single();

    if (error) {
      toast.error(`Error adding stock: ${error.message}`);
      throw error;
    }

    toast.success('Stock added to portfolio');
    return data;
  };

  const updateStock = async (
    id: string, 
    updates: Partial<Omit<CreatePortfolioStockPayload, 'portfolio_id'>>
  ): Promise<PortfolioStock> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { data, error } = await supabase
      .from('portfolio_stocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error(`Error updating stock: ${error.message}`);
      throw error;
    }

    toast.success('Stock updated successfully');
    return data;
  };

  const removeStock = async (id: string): Promise<void> => {
    if (!user) throw new Error("User must be authenticated");
    
    const { error } = await supabase
      .from('portfolio_stocks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(`Error removing stock: ${error.message}`);
      throw error;
    }

    toast.success('Stock removed from portfolio');
  };

  const portfoliosQuery = useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    enabled: !!user,
  });

  const getPortfolioStocksQuery = (portfolioId: string) => useQuery({
    queryKey: ['portfolioStocks', portfolioId],
    queryFn: () => fetchPortfolioStocks(portfolioId),
    enabled: !!portfolioId && !!user,
  });

  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: addStock,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioStocks', data.portfolio_id] });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<CreatePortfolioStockPayload, 'portfolio_id'>> }) => 
      updateStock(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioStocks', data.portfolio_id] });
    },
  });

  const removeStockMutation = useMutation({
    mutationFn: removeStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioStocks'] });
    },
  });

  return {
    portfoliosQuery,
    getPortfolioStocksQuery,
    createPortfolioMutation,
    addStockMutation,
    updateStockMutation,
    removeStockMutation,
  };
};
