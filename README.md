

---

# AI Stock Analyzer

A full-stack AI-powered web application that helps users make smarter investment decisions using real-time stock data, financial news, sentiment analysis, and an AI financial advisor chatbot.

---

## Features

- **Live Stock Feed**: Real-time stock prices and trends.
- **Financial News**: Latest market news based on selected stocks.
- **AI Financial Advisor**: Chatbot that offers investment guidance.
- **Stock Analyzer**: Personalized suggestions based on:
  - Stocks of interest
  - Investment amount
  - Risk level
- **BONUS Feature**: (Added by developer)

---

## Tech Stack

- **Frontend**: React / Next.js
- **Backend**: Node.js / Fastify / Supabase
- **AI Integration**: OpenAI API
- **Data Source**: [Finnhub.io](https://finnhub.io/)
- **Charting**: Chart.js / ApexCharts

---

## Setup Instructions

1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-username/ai-stock-analyzer.git
   cd ai-stock-analyzer

2. Install Dependencies

npm install


3. Add Environment Variables Create a .env file in the root and add your API keys:

FINNHUB_API_KEY=your_finnhub_api_key
OPENAI_API_KEY=your_openai_api_key


4. Run the App

npm run dev




---

API Endpoints Used

/api/quote - Real-time stock price

/api/news - Financial news

/api/metrics - Company fundamentals

/api/sentiment - News sentiment



---

License

This project is for educational and experimental purposes.

---
