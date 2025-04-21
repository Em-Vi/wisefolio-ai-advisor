import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface GeminiStockAnalysisRequest {
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  investmentAmount: number;
}

export interface GeminiStockRecommendation {
  symbol: string;
  name: string;
  price: number;
  recommendation: 'buy' | 'hold' | 'sell';
  riskLevel: 'low' | 'medium' | 'high';
  potentialReturn: number;
  timeFrame: 'short' | 'medium' | 'long';
  summary: string;
  allocation?: number;
  rationale?: string;
}

export interface GeminiAnalysisResult {
  analysis: {
    summary: string;
    marketOutlook: string;
    riskAssessment: string;
  };
  recommendations: GeminiStockRecommendation[];
}

export const useGeminiStockAnalysis = () => {
  return useMutation({
    mutationFn: async ({ symbols, riskLevel, investmentAmount }: GeminiStockAnalysisRequest): Promise<GeminiAnalysisResult> => {
      try {
        const { data, error } = await supabase.functions.invoke('stock-analyzer', {
          body: { symbols, riskLevel, investmentAmount },
        });

        if (error) throw new Error(error.message);
        
        // Validate the response structure
        if (!data || !data.analysis || !data.analysis.recommendations) {
          console.error('Invalid analysis data structure:', data);
          throw new Error('Failed to generate stock analysis');
        }
        
        // Ensure all fields are properly formatted
        const recommendations = data.analysis.recommendations.map((rec: any) => ({
          symbol: rec.symbol || 'Unknown',
          name: rec.name || 'Unknown Company',
          price: typeof rec.price === 'number' ? rec.price : 0,
          recommendation: ['buy', 'hold', 'sell'].includes(rec.recommendation) ? rec.recommendation : 'hold',
          riskLevel: ['low', 'medium', 'high'].includes(rec.riskLevel) ? rec.riskLevel : 'medium',
          potentialReturn: typeof rec.potentialReturn === 'number' ? rec.potentialReturn : 0,
          timeFrame: ['short', 'medium', 'long'].includes(rec.timeFrame) ? rec.timeFrame : 'medium',
          summary: rec.summary || `No detailed analysis available for ${rec.symbol}.`
        }));
        
        const analysisResult: GeminiAnalysisResult = {
          analysis: {
            summary: data.analysis.analysis?.summary || 'Analysis unavailable',
            marketOutlook: data.analysis.analysis?.marketOutlook || 'Market outlook unavailable',
            riskAssessment: data.analysis.analysis?.riskAssessment || 'Risk assessment unavailable'
          },
          recommendations
        };
        
        console.log('Validated stock analysis data:', analysisResult);
        return analysisResult;
      } catch (error: any) {
        console.error('Stock analysis error:', error);
        toast.error(`Stock analysis error: ${error.message}`);
        throw error;
      }
    }
  });
};