import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const BASE_URL = 'https://www.alphavantage.co/query';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlphaVantageRequest {
  function: string;
  symbol: string;
  interval?: string;
  outputsize?: string;
  datatype?: string;
  time_period?: number;
  series_type?: string;
  additional_params?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not set');
    }

    const requestData = await req.json() as AlphaVantageRequest;
    
    if (!requestData.function) {
      return new Response(
        JSON.stringify({ error: 'Function is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!requestData.symbol && !['TIME_SERIES_DAILY', 'TIME_SERIES_INTRADAY', 'TIME_SERIES_WEEKLY', 'TIME_SERIES_MONTHLY'].includes(requestData.function)) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Build query params
    const queryParams = new URLSearchParams({
      function: requestData.function,
      apikey: ALPHA_VANTAGE_API_KEY,
      datatype: requestData.datatype || 'json',
    });
    
    if (requestData.symbol) {
      queryParams.append('symbol', requestData.symbol);
    }
    
    if (requestData.interval) {
      queryParams.append('interval', requestData.interval);
    }
    
    if (requestData.outputsize) {
      queryParams.append('outputsize', requestData.outputsize);
    }
    
    if (requestData.time_period) {
      queryParams.append('time_period', requestData.time_period.toString());
    }
    
    if (requestData.series_type) {
      queryParams.append('series_type', requestData.series_type);
    }
    
    // Add any additional params
    if (requestData.additional_params) {
      Object.entries(requestData.additional_params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    
    // Make request to Alpha Vantage API
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if Alpha Vantage returned an error
    if (data && data.Note) {
      console.warn('Alpha Vantage API limit note:', data.Note);
      // We'll still return the data so the front-end can handle the limit message
    }
    
    if (data && data['Error Message']) {
      throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
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