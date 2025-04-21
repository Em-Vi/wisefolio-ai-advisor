import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');

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
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    if (!ALPHA_VANTAGE_API_KEY && !FINNHUB_API_KEY) {
      throw new Error('Neither ALPHA_VANTAGE_API_KEY nor FINNHUB_API_KEY is set');
    }

    const { symbols, riskLevel, investmentAmount } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid stock symbols array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch current stock price data - trying Finnhub first, then Alpha Vantage as fallback
    const stockData = await Promise.all(
      symbols.slice(0, 5).map(async (symbol) => {
        try {
          // Try Finnhub first if available
          if (FINNHUB_API_KEY) {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            const data = await response.json();
            
            if (data && data.c) {
              // Get company name from Finnhub
              const profileResponse = await fetch(
                `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
              );
              const profileData = await profileResponse.json();
              
              return { 
                symbol, 
                data: {
                  price: data.c,
                  change: data.d,
                  percentChange: data.dp,
                  high: data.h,
                  low: data.l,
                  previousClose: data.pc,
                  companyName: profileData?.name || symbol
                }
              };
            }
          }
          
          // Fallback to Alpha Vantage
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          );
          const data = await response.json();
          
          if (data && data['Global Quote']) {
            const quote = data['Global Quote'];
            
            // Get the company name from Alpha Vantage
            const companyResponse = await fetch(
              `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            const companyData = await companyResponse.json();
            
            return { 
              symbol, 
              data: {
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                percentChange: parseFloat(quote['10. change percent'].replace('%', '')),
                high: parseFloat(quote['03. high']),
                low: parseFloat(quote['04. low']),
                previousClose: parseFloat(quote['08. previous close']),
                companyName: companyData?.Name || symbol
              }
            };
          }
          
          throw new Error(`No data available for ${symbol}`);
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

    // Construct the prompt for Gemini AI
    const prompt = `
    As a sophisticated financial analyst, provide a detailed stock analysis and investment recommendations for the following stocks:

    ${validStocks.map(stock => 
      `${stock.symbol} (${stock.data.companyName}): Current price $${stock.data.price}, Change: ${stock.data.percentChange}%`
    ).join('\n')}

    Investment parameters:
    - Risk level: ${riskLevel} (low, medium, or high)
    - Investment amount: $${investmentAmount}

    IMPORTANT: Use EXACTLY the following structured format for your response with these exact section headers:

    ### SUMMARY
    [Your overall investment opportunity summary]

    ### MARKET OUTLOOK
    [Your market outlook analysis]

    ### RISK ASSESSMENT
    [Your risk assessment]

    ### STOCK RECOMMENDATIONS

    ${validStocks.map(stock => `#### ${stock.symbol}
    - Name: [company name]
    - Current Price: [price]
    - Recommendation: [buy/hold/sell]
    - Risk Level: [low/medium/high]
    - Potential Return: [X]%
    - Time Frame: [short/medium/long]
    - Summary: [brief justification]
    `).join('\n')}

    Make your analysis balanced, realistic, and based on current market conditions as of April 2025.
    `;

    // Call Gemini API for analysis
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Parse the AI text response into structured format
    const analysisResult = processGeminiResponse(aiResponse, validStocks);

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

/**
 * Process the text response from Gemini AI into a structured format matching our frontend requirements
 */
function processGeminiResponse(response: string, stockData: any[]): any {
  try {
    // Extract main sections using the structured format headers
    const summaryMatch = response.match(/###\s*SUMMARY\s*([\s\S]*?)(?=###\s*MARKET OUTLOOK|$)/i);
    const marketOutlookMatch = response.match(/###\s*MARKET OUTLOOK\s*([\s\S]*?)(?=###\s*RISK ASSESSMENT|$)/i);
    const riskAssessmentMatch = response.match(/###\s*RISK ASSESSMENT\s*([\s\S]*?)(?=###\s*STOCK RECOMMENDATIONS|$)/i);
    
    // Clean up the extracted text and use fallbacks if sections aren't found
    const summary = summaryMatch && summaryMatch[1] ? summaryMatch[1].trim() : "Analysis unavailable";
    const marketOutlook = marketOutlookMatch && marketOutlookMatch[1] ? marketOutlookMatch[1].trim() : "Market outlook unavailable";
    const riskAssessment = riskAssessmentMatch && riskAssessmentMatch[1] ? riskAssessmentMatch[1].trim() : "Risk assessment unavailable";
    
    // Extract recommendations for each stock
    const recommendations = stockData.map(stock => {
      const symbol = stock.symbol;
      const stockPrice = stock.data.price;
      
      // Find the section about this stock using the structured header format
      const stockSectionRegex = new RegExp(`####\\s*${symbol}\\s*([\\s\\S]*?)(?=####|$)`, 'i');
      const stockMatch = response.match(stockSectionRegex);
      const stockText = stockMatch && stockMatch[1] ? stockMatch[1].trim() : '';
      
      if (!stockText) {
        // Fallback if no stock section found
        return {
          symbol,
          name: stock.data.companyName || symbol,
          price: stockPrice,
          recommendation: 'hold',
          riskLevel: 'medium',
          potentialReturn: 7.5,
          timeFrame: 'medium',
          summary: `No detailed analysis available for ${symbol}. Please try again.`
        };
      }
      
      // Extract each field from the structured format
      const nameMatch = stockText.match(/Name:\s*([^\n]+)/i);
      const priceMatch = stockText.match(/Current Price:\s*\$?(\d+(?:\.\d+)?)/i);
      const recommendationMatch = stockText.match(/Recommendation:\s*(buy|hold|sell)/i);
      const riskLevelMatch = stockText.match(/Risk Level:\s*(low|medium|high)/i);
      const potentialReturnMatch = stockText.match(/Potential Return:\s*(\d+(?:\.\d+)?)/i);
      const timeFrameMatch = stockText.match(/Time Frame:\s*(short|medium|long)/i);
      const summaryMatch = stockText.match(/Summary:\s*([^\n]+(?:\n[^\n-]+)*)/i);
      
      // Use the extracted values or fallbacks
      const name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : stock.data.companyName || symbol;
      const recommendation = recommendationMatch && recommendationMatch[1] ? recommendationMatch[1].toLowerCase() : 'hold';
      const riskLevel = riskLevelMatch && riskLevelMatch[1] ? riskLevelMatch[1].toLowerCase() : 'medium';
      const potentialReturn = potentialReturnMatch && potentialReturnMatch[1] ? parseFloat(potentialReturnMatch[1]) : 7.5;
      const timeFrame = timeFrameMatch && timeFrameMatch[1] ? timeFrameMatch[1].toLowerCase() : 'medium';
      
      let summary = '';
      if (summaryMatch && summaryMatch[1]) {
        summary = summaryMatch[1].trim();
      } else {
        summary = `${recommendation === 'buy' ? 'Consider adding' : recommendation === 'sell' ? 'Consider reducing' : 'Hold'} ${symbol} based on current market conditions and your risk profile.`;
      }
      
      return {
        symbol,
        name,
        price: stockPrice,
        recommendation,
        riskLevel,
        potentialReturn,
        timeFrame,
        summary: summary.substring(0, 200) // Truncate if too long
      };
    });
    
    return {
      analysis: {
        summary,
        marketOutlook,
        riskAssessment
      },
      recommendations
    };
  } catch (error) {
    console.error('Error processing Gemini response:', error);
    
    // If parsing fails, return a basic structure with the stocks
    return {
      analysis: {
        summary: "Analysis could not be generated properly. Please try again.",
        marketOutlook: "Market outlook data unavailable.",
        riskAssessment: "Risk assessment unavailable."
      },
      recommendations: stockData.map(stock => ({
        symbol: stock.symbol,
        name: stock.data.companyName || stock.symbol,
        price: stock.data.price,
        recommendation: 'hold',
        riskLevel: 'medium',
        potentialReturn: 7.5,
        timeFrame: 'medium',
        summary: `No detailed analysis available for ${stock.symbol}. Please try again.`
      }))
    };
  }
}
