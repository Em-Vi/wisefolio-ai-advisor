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

    const { journalContent, sentiment, stocks } = await req.json();

    if (!journalContent) {
      return new Response(
        JSON.stringify({ error: 'Journal content is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Construct the system prompt for journal analysis
    const systemPrompt = `You are WiseAdvisor's Investment Journal AI assistant. Analyze the user's investment journal entry and provide constructive feedback.
    
    Guidelines:
    - Identify cognitive biases or emotional patterns in the user's thinking
    - Offer balanced perspective on their analysis
    - Suggest areas they might have overlooked
    - Provide educational insights relevant to their investment approach
    - Keep responses concise (3-4 sentences)
    - Be supportive but direct in your feedback
    
    Always stay educational and analytical without making specific investment recommendations.`;

    // Combine journal entry with metadata
    const userMessage = `
    Journal entry: ${journalContent}
    Sentiment: ${sentiment || 'unspecified'}
    Related stocks: ${stocks ? stocks.join(', ') : 'none mentioned'}
    
    Please analyze this investment journal entry and provide helpful feedback.`;

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
          maxOutputTokens: 256,
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error from Gemini API');
    }

    // Extract the response text from Gemini
    const aiFeedback = data.candidates[0].content.parts[0].text;
    
    // Identify potential cognitive biases (simplified version)
    const biases = identifyPotentialBiases(journalContent, sentiment);

    return new Response(
      JSON.stringify({ 
        aiFeedback,
        biases
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

// Simple logic to identify potential biases based on content
function identifyPotentialBiases(content: string, sentiment: string): Array<{name: string, description: string}> {
  const biases = [];
  const contentLower = content.toLowerCase();
  
  // Check for confirmation bias
  if (
    contentLower.includes('confirm') || 
    contentLower.includes('prove') || 
    contentLower.includes('sure') ||
    contentLower.includes('certain')
  ) {
    biases.push({
      name: 'Confirmation Bias',
      description: 'You may be seeking information that confirms your existing beliefs.'
    });
  }
  
  // Check for recency bias
  if (
    contentLower.includes('recent') || 
    contentLower.includes('latest') || 
    contentLower.includes('today') ||
    contentLower.includes('yesterday') ||
    contentLower.includes('week')
  ) {
    biases.push({
      name: 'Recency Bias',
      description: 'Your analysis might be overly influenced by recent market events.'
    });
  }
  
  // Check for emotional bias based on sentiment
  if (sentiment === 'bullish' && contentLower.includes('exciting')) {
    biases.push({
      name: 'Emotional Bias',
      description: 'Your excitement may be influencing your objective analysis.'
    });
  }
  
  if (sentiment === 'bearish' && (contentLower.includes('worry') || contentLower.includes('fear'))) {
    biases.push({
      name: 'Fear-Driven Decision Making',
      description: 'Your concerns may be causing you to overestimate risks.'
    });
  }
  
  // Add FOMO if content suggests that
  if (
    contentLower.includes('missing out') || 
    contentLower.includes('everyone') || 
    contentLower.includes('opportunity') ||
    contentLower.includes('chance')
  ) {
    biases.push({
      name: 'FOMO (Fear of Missing Out)',
      description: 'You may be rushing into an investment because others are participating.'
    });
  }
  
  // Return 2 biases at most
  return biases.slice(0, 2);
}