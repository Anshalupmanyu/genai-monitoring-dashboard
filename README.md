# 🤖 GenAI Monitoring Dashboard

A full-stack dashboard to monitor Generative AI model usage — **Angular** frontend with live charts, a **FastAPI** backend serving model metrics, and a local LLM (**Mistral via Ollama**) as the inference engine.

## ✨ Features

- **Prompt Console** — Send prompts to a local Mistral LLM and view responses in real-time
- **Token Usage Tracking** — Monitor input/output token consumption per prompt
- **Latency Visualization** — Live charts showing inference latency over time
- **Prompt Logging** — Full history of all prompts and responses with metadata
- **RBAC Access Control** — JWT-based authentication with role-based permissions (Admin/Viewer)
- **Dashboard Analytics** — Summary cards, line charts, bar charts, and pie charts

## 🏗️ Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Angular 17+, Chart.js, ng2-charts | Free |
| Backend | FastAPI, Python 3.10+, SQLAlchemy | Free |
| LLM Engine | Ollama + Mistral 7B | Free |
| Orchestration | LangChain (Community) | Free |
| Database | SQLite | Free |
| Auth | JWT (python-jose) + bcrypt | Free |
| Containerization | Docker + Docker Compose | Free |
| Gateway (Optional) | Spring Boot 3.x | Free |

## 📁 Project Structure

```
genai-monitoring-dashboard/
├── backend/          # FastAPI Python backend
├── frontend/         # Angular dashboard app
├── gateway/          # (Optional) Spring Boot API Gateway
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Ollama](https://ollama.ai/) with Mistral model 
  - **Important:** Ensure you have downloaded the model by running `ollama run mistral` in your terminal. If you see a `404 Not Found` error in the Prompt Console, it means this model has not been downloaded yet.
- Node.js 20+ (for backend/frontend local development)
- Python 3.10+ (for backend local development)

### Run with Docker Compose
```bash
docker-compose up --build
```

### Run Locally (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
ng serve --port 4200
```

**Ollama:**
```bash
ollama pull mistral
ollama serve
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/prompts/infer` | Send prompt to LLM |
| GET | `/api/prompts/` | Get prompt history |
| GET | `/api/metrics/summary` | Get aggregated metrics |
| GET | `/api/metrics/timeseries` | Get metrics over time |
| GET | `/api/users/` | Admin: manage users |

## 📅 Development Timeline

- **Day 1**: Project setup, FastAPI backend, Angular scaffold
- **Day 2**: LLM integration, charts, authentication & RBAC
- **Day 3**: Docker, Spring Boot gateway, polish & docs

## 📝 License

MIT — Free and open-source.
