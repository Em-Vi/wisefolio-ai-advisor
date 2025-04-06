
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface StockAnalyzerRequest {
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  investmentAmount: number;
}

export const useStockAnalyzer = () => {
  return useMutation({
    queryKey: ['stockAnalyzer'],
    mutationFn: async ({ symbols, riskLevel, investmentAmount }: StockAnalyzerRequest) => {
      try {
        const { data, error } = await supabase.functions.invoke('stock-analyzer', {
          body: { symbols, riskLevel, investmentAmount },
        });

        if (error) throw new Error(error.message);
        return data;
      } catch (error: any) {
        toast.error(`Stock analysis error: ${error.message}`);
        throw error;
      }
    }
  });
};
