
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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

    const { query, userContext } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Construct the system prompt with financial expertise
    const systemPrompt = `You are Wisefolio's AI Financial Advisor, a sophisticated financial expert specializing in investment strategies, market analysis, and wealth management.
    
    Key responsibilities:
    - Provide personalized financial advice based on user's context
    - Explain complex financial concepts in simple terms
    - Analyze investment opportunities objectively
    - Educate users about different investment strategies
    - Help users understand market trends and economic indicators
    
    Importantly:
    - Always provide balanced perspectives on investments
    - Acknowledge the inherent risks in all investments
    - Never make specific price predictions or guarantees of returns
    - Clearly state that your advice is educational, not professional financial advice
    - Recommend diversification and risk management strategies
    
    If you don't know something, acknowledge it and suggest reliable sources for further information.`;

    // Combine user context with query
    const userMessage = `User context: ${JSON.stringify(userContext)}\n\nUser query: ${query}`;

    // Make request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: userMessage }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error from Gemini API');
    }

    // Extract the response text from Gemini
    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ response: generatedText }),
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
