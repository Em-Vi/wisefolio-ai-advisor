

---

# AI Stock Analyzer

An AI-powered web app that helps users make smarter investment decisions with real-time stock data, financial news, sentiment analysis, and a Gemini-powered financial advisor chatbot.

---

## Features

- **Live Stock Feed** – Real-time data for selected stocks
- **Financial News** – Latest updates on stock-related events
- **AI Financial Advisor** – Chatbot powered by Gemini AI for smart investment tips
- **Stock Analyzer** – Personalized suggestions based on:
  - Selected stocks
  - Investment amount
  - Risk preference
- **Bonus Feature** – Added by the AI agent

---

## Tech Stack

- **Frontend**: React.js
- **Backend**: Supabase (Database + Auth)
- **AI Integration**: Google Gemini API
- **Stock Data Source**: [Finnhub.io](https://finnhub.io/)
- **Charting**: Chart.js / ApexCharts

---

## Getting Started

1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-username/ai-stock-analyzer.git
   cd ai-stock-analyzer

2. Install Dependencies

npm install


3. Add Environment Variables Create a .env file and add:

VITE_FINNHUB_API_KEY=your_finnhub_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key


4. Run Locally

npm run dev




---

API Endpoints Used (Finnhub)

/quote – Real-time stock prices

/news – Latest stock news

/metric – Key financial metrics

/news-sentiment – Sentiment analysis of stock news



---

License

This project is for personal, educational, and experimental use.

---


