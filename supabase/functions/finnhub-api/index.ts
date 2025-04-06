
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not set');
    }

    const { endpoint, params } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Construct the query string
    const queryParams = new URLSearchParams({
      ...params,
      token: FINNHUB_API_KEY
    }).toString();

    // Make request to Finnhub API
    const response = await fetch(`https://finnhub.io/api/v1/${endpoint}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Finnhub API Error: ${JSON.stringify(data)}`);
    }

    return new Response(
      JSON.stringify({ data }),
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
