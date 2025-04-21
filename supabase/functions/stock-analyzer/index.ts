
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not set');
    }

    const { symbols, riskLevel, investmentAmount } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid stock symbols array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch stock data for the provided symbols
    const stockData = await Promise.all(
      symbols.slice(0, 5).map(async (symbol) => {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          );
          const data = await response.json();
          return { symbol, data: data['Global Quote'] || null };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return { symbol, data: null, error: error.message };
        }
      })
    );

    // Filter out stocks with errors or no data
    const validStocks = stockData.filter(stock => stock.data);

    // If no valid stock data was retrieved, return an error
    if (validStocks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not retrieve valid data for any of the provided symbols',
          details: stockData.map(s => ({ symbol: s.symbol, error: s.error }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Construct the system prompt for the AI
    const systemPrompt = `You are Wisefolio's Stock Analysis AI, a sophisticated financial expert specializing in stock analysis and investment recommendations.

    Based on the provided stock data, risk level (${riskLevel}), and investment amount ($${investmentAmount}), provide a detailed analysis and recommendations.
    
    Your response should be structured as JSON with the following format:
    {
      "analysis": {
        "summary": "Overall market and selected stocks analysis",
        "marketOutlook": "Brief market outlook",
        "riskAssessment": "Assessment based on the selected risk level"
      },
      "recommendations": [
        {
          "symbol": "Stock symbol",
          "name": "Company name",
          "action": "buy" or "hold" or "sell",
          "allocation": Percentage of investment amount (number),
          "rationale": "Brief explanation",
          "riskLevel": "low" or "medium" or "high",
          "timeFrame": "short" or "medium" or "long",
          "potentialReturn": Estimated annual return percentage (number)
        }
      ]
    }
    
    Important:
    - Make sure your response is valid JSON
    - Return 3-5 recommendations
    - Allocations should add up to 100%
    - Recommendations should align with the specified risk level
    - Give realistic potential returns based on historical performance and risk level
    - Do not make specific price predictions`;

    // Make request to OpenAI for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Stock data: ${JSON.stringify(validStocks)}\nRisk level: ${riskLevel}\nInvestment amount: $${investmentAmount}` 
          }
        ],
        temperature: 0.5,
      }),
    });

    const aiData = await openAIResponse.json();

    if (aiData.error) {
      throw new Error(aiData.error.message || 'Error from OpenAI API');
    }

    // Parse the AI response to ensure it's valid JSON
    let analysisResult;
    try {
      const content = aiData.choices[0].message.content;
      // Extract JSON if it's wrapped in code blocks
      const jsonContent = content.includes('```json')
        ? content.split('```json')[1].split('```')[0].trim()
        : content.includes('```')
          ? content.split('```')[1].split('```')[0].trim()
          : content;
      
      analysisResult = JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse analysis results');
    }

    return new Response(
      JSON.stringify({ 
        stockData: validStocks,
        analysis: analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
