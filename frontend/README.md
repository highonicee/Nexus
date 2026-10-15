# Nexus — AI-Powered Service Matching Agent

Nexus is an AI-powered service-matching assistant that helps users discover suitable service providers through natural-language conversations. Instead of manually searching through options, users can describe their requirements, budget, location, and preferences to receive relevant matches.

## Features

- **Conversational AI:** Understands service requests expressed in natural language.
- **Intelligent Provider Search:** Matches providers based on service type, location, budget, and preferences.
- **Tool-Calling Agent:** Uses provider-search functionality to retrieve matching results.
- **Conversation Memory:** Stores conversation history using SQLite.
- **Interactive Web Interface:** A responsive React frontend with a clean, minimal design.
- **REST API:** FastAPI endpoints for searching providers and interacting with the AI assistant.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| AI Model | Groq API |
| Agent Tools | Python |
| Database | SQLite |
| Data Storage | JSON-based provider dataset |

## Project Structure

```text
nexus/
├── app/
│   ├── main.py
│   ├── agent.py
│   ├── tools.py
│   ├── memory.py
│   └── providers.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   └── index.html
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- A Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/highonicee/nexus.git
cd nexus
```



### 2. Set Up the Backend

Create and activate a virtual environment on Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
```

Replace the placeholder with your actual API key. Never commit secrets to GitHub.

### 4. Run the Backend

From the project root, run:

```powershell
python -m uvicorn app.main:app --reload
```

The API will be available at:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

### 5. Run the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal, usually http://localhost:5173.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check whether the API is running |
| GET | `/search` | Search available service providers |
| POST | `/chat` | Send a message to the AI assistant |

Use `/docs` to inspect request parameters and test the endpoints.

## How It Works

1. The user describes the service they need.
2. The AI agent interprets the request and determines when to search for providers.
3. The provider-search tool filters the available dataset using relevant criteria.
4. The agent uses the search results to formulate a response.
5. Conversation history can be stored and retrieved to support continuity.

## Current Limitations

- The provider dataset is currently a demonstration dataset and does not represent verified real-world listings.
- Provider availability and pricing are not independently verified.
- SQLite persistence depends on the deployment environment and its storage configuration.
- AI responses depend on the configured model and available provider data.

## Future Improvements

- Integrate verified provider directories and live availability.
- Add user authentication and saved preferences.
- Support additional search filters and ranking strategies.
- Improve persistent memory and conversation management.
- Add automated tests, monitoring, and production deployment safeguards.

## Security

- Keep API keys in environment variables.
- Exclude `.env`, virtual environments, database files, and build artifacts from version control.
- Validate API inputs and configure CORS for trusted frontend origins.
- Do not treat demonstration provider information as verified business data.

## Author

**Ritika Yadav**

Built as a hands-on project to explore AI agents, tool calling, conversational interfaces, and full-stack application development.
