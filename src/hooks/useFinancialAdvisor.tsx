
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface FinancialAdvisorRequest {
  query: string;
  userContext?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    investmentGoals?: string[];
    investmentHorizon?: 'short' | 'medium' | 'long';
    portfolioSize?: number;
    [key: string]: any;
  };
}

interface FinancialAdvisorResponse {
  response: string;
  error?: string;
}

export const useFinancialAdvisor = () => {
  return useMutation({
    mutationFn: async ({ query, userContext = {} }: FinancialAdvisorRequest): Promise<FinancialAdvisorResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke('financial-advisor', {
          body: { query, userContext },
        });

        if (error) throw new Error(error.message);
        return data;
      } catch (error: any) {
        toast.error(`AI Advisor error: ${error.message}`);
        throw error;
      }
    }
  });
};
