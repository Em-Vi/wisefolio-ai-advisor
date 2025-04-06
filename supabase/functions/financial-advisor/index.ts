
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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

    const { query, userContext } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Construct the system prompt with financial expertise
    const systemPrompt = `You are WisePortfolio's AI Financial Advisor, a sophisticated financial expert specializing in investment strategies, market analysis, and wealth management.
    
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

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User context: ${JSON.stringify(userContext)}\n\nUser query: ${query}` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error from OpenAI API');
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
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
