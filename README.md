# AI Avatar Chatbot

<div align="center">

**A modern, production-ready web application featuring an intelligent RAG-powered chatbot with real-time talking avatar capabilities**

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Contributing](#-contributing)

---

## 🎯 Overview

AI Avatar Chatbot is a comprehensive full-stack application that combines advanced natural language processing with real-time avatar animation. The system features:

- **Intelligent RAG System**: Document-based question answering powered by Google Gemini
- **Real-Time Avatar**: Sprite-based animated avatar with precise lip-sync capabilities
- **Modern UI/UX**: Smooth animations, particle effects, and glassmorphic design
- **Modular Architecture**: Scalable, maintainable codebase with clear separation of concerns
- **Production Ready**: Comprehensive error handling, logging, and monitoring capabilities

---

## ✨ Features

### Core Functionality

- **🤖 RAG-Powered Chatbot**
  - Document-based question answering using Retrieval-Augmented Generation
  - Support for multiple document formats (PDF, TXT, DOCX)
  - Vector-based semantic search with ChromaDB
  - Context-aware responses with source attribution

- **🎭 Talking Avatar**
  - Real-time sprite-based animation
  - Precise viseme-based lip synchronization
  - Audio-time synchronized playback
  - Multiple avatar options (Lateman, Old Man)
  - Smooth frame interpolation for natural movement

- **💬 Real-Time Communication**
  - WebSocket support for streaming responses
  - Low-latency message delivery
  - Bidirectional communication channels

### User Interface

- **🎨 Modern Design System**
  - Glassmorphic UI elements with backdrop blur effects
  - Gradient backgrounds and custom color schemes
  - Responsive layout optimized for all screen sizes
  - Dark theme with customizable color palette

- **✨ Rich Animations**
  - Framer Motion powered transitions
  - Interactive particle background system
  - Micro-interactions and hover effects
  - Smooth page transitions and component animations

- **📱 User Experience**
  - Icon-based action buttons for streamlined interface
  - Intuitive document upload system
  - Real-time status indicators
  - Comprehensive error handling and user feedback

---

## 🏗️ Architecture

### Project Structure

```
ai-avatar-chatbot/
├── backend/                      # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py              # Application entry point
│   │   ├── modules/
│   │   │   ├── chatbot/         # RAG Chatbot Module
│   │   │   │   ├── router.py    # API routes
│   │   │   │   ├── llm.py       # LLM integration
│   │   │   │   └── rag.py       # RAG implementation
│   │   │   ├── avatar/           # Avatar Module
│   │   │   │   ├── router.py    # Avatar API routes
│   │   │   │   ├── tts.py       # Text-to-Speech
│   │   │   │   └── lipsync.py   # Lip sync engine
│   │   │   └── shared/          # Shared utilities
│   │   │       └── config.py    # Configuration management
│   │   └── middleware/           # Custom middleware
│   ├── data/                     # Document storage for RAG
│   ├── chroma_db/                # Vector database storage
│   ├── pyproject.toml            # Python project configuration
│   ├── run.py                    # Server startup script
│   └── .env.example             # Environment variables template
│
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   └── ParticleBackground.jsx
│   │   ├── modules/
│   │   │   ├── chatbot/          # Chat module
│   │   │   │   └── ChatModule.jsx
│   │   │   ├── avatar/           # Avatar module
│   │   │   │   ├── AvatarModule.jsx
│   │   │   │   ├── LatemanAvatar.jsx
│   │   │   │   ├── OldManAvatar.jsx
│   │   │   │   └── utils/
│   │   │   │       └── lipsyncUtils.js
│   │   │   └── shared/           # Shared context
│   │   │       └── AppContext.jsx
│   │   ├── services/             # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Application entry
│   ├── public/
│   │   └── models/               # Avatar sprite assets
│   │       ├── Lateman/          # Lateman avatar frames
│   │       └── oldman/           # Old Man avatar frames
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml            # Docker orchestration
├── setup.sh                      # Automated setup script
├── start-dev.sh                  # Development startup script
└── README.md                     # This file
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Chat Module  │  │Avatar Module │  │  AppContext  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                            │                               │
│                    ┌───────▼────────┐                      │
│                    │  API Service   │                      │
│                    └───────┬────────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   FastAPI Backend│
                    │  ┌─────────────┐ │
                    │  │Chatbot Module│ │
                    │  │ Avatar Module│ │
                    │  └──────┬──────┘ │
                    └─────────┼────────┘
                              │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │ Gemini  │          │ Resemble.ai│        │ ChromaDB   │
   │   API   │          │    TTS     │        │  Vector DB │
   └─────────┘          └───────────┘        └────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | RESTful API framework | Latest |
| **Python** | Programming language | 3.11+ |
| **LangChain** | RAG orchestration | Latest |
| **ChromaDB** | Vector database | Latest |
| **Google Gemini** | Large Language Model | Latest |
| **Resemble.ai** | Text-to-Speech | API v2 |
| **uv** | Package manager | Latest |
| **Uvicorn** | ASGI server | Latest |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.x |
| **Material-UI** | Component library | 5.x |
| **Framer Motion** | Animation library | 12.x |
| **tsparticles** | Particle effects | 3.x |
| **Axios** | HTTP client | Latest |
| **Vite** | Build tool | 5.x |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.11 or higher (3.13+ recommended)
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **uv** package manager (recommended) or **pip**
- **Git** for version control

### API Keys Required

- **Google Gemini API Key**: [Get your key here](https://makersuite.google.com/app/apikey)
- **Resemble.ai API Key**: [Get your key here](https://www.resemble.ai/)

### Optional

- **Docker** and **Docker Compose** (for containerized deployment)
- **OpenAI API Key** (for alternative LLM provider)

---

## 🚀 Installation

### Method 1: Automated Setup (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd Avatar_Project

# Run automated setup script
chmod +x setup.sh
./setup.sh

# Configure environment variables
cp backend/.env.example backend/.env
nano backend/.env  # Add your API keys

# Start development servers
chmod +x start-dev.sh
./start-dev.sh
```

### Method 2: Docker Compose

For containerized deployment:

```bash
# Create environment file
cat > .env << EOF
GEMINI_API_KEY=your_gemini_key_here
RESEMBLE_API_KEY=your_resemble_key_here
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

Access the application:
- **Frontend**: http://localhost:5173 (development) or http://localhost:80 (production)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Method 3: Manual Installation

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env and add:
# GEMINI_API_KEY=your_key_here
# RESEMBLE_API_KEY=your_key_here

# Start the server
uv run python run.py
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
RESEMBLE_API_KEY=your_resemble_api_key_here

# Optional
OPENAI_API_KEY=your_openai_api_key_here  # Alternative LLM provider
LOG_LEVEL=INFO                            # Logging level (DEBUG, INFO, WARNING, ERROR)
```

### Resemble.ai Configuration

Configure your Resemble.ai project and voice UUIDs in `backend/app/modules/shared/config.py`:

```python
resemble_project_uuid: str = "your_project_uuid"
resemble_voice_uuid: str = "your_voice_uuid"
```

### Frontend Configuration

Frontend environment variables (optional, defaults provided):

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## 📖 Usage

### Starting the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   uv run python run.py
   ```

2. **Start Frontend Server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Open http://localhost:5173 in your browser
   - The chatbot interface will be available on the right panel
   - The avatar will be displayed on the left panel

### Uploading Documents

#### Via Web Interface

1. Click the upload icon in the chat interface
2. Select one or more documents (PDF, TXT, DOCX)
3. Documents will be automatically processed and indexed

#### Via API

```bash
# Upload single document
curl -X POST "http://localhost:8000/api/chatbot/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@document.pdf"

# Upload multiple documents
curl -X POST "http://localhost:8000/api/chatbot/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.txt"

# Load documents from directory
curl -X POST "http://localhost:8000/api/chatbot/documents/load-directory" \
  -H "Content-Type: application/json" \
  -d '{"directory": "data"}'
```

### Querying the Chatbot

#### Via Web Interface

1. Type your question in the chat input field
2. Press Enter or click the send button
3. The avatar will automatically speak the response if "Auto-speak" is enabled

#### Via API

```bash
curl -X POST "http://localhost:8000/api/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the uploaded documents?",
    "provider": "gemini",
    "use_rag": true
  }'
```

### Generating Avatar Speech

```bash
curl -X POST "http://localhost:8000/api/avatar/speak" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! How can I help you today?",
    "return_audio": true,
    "return_visemes": true
  }'
```

---

## 📚 API Reference

### Chatbot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chatbot/query` | Query the chatbot with optional RAG |
| `WS` | `/api/chatbot/stream` | WebSocket stream for real-time responses |
| `POST` | `/api/chatbot/documents/upload` | Upload documents for RAG |
| `POST` | `/api/chatbot/documents/load-directory` | Load documents from directory |
| `DELETE` | `/api/chatbot/documents/clear` | Clear all indexed documents |
| `GET` | `/api/chatbot/health` | Health check endpoint |

### Avatar Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/avatar/speak` | Generate speech with lip sync data |
| `POST` | `/api/avatar/speak-audio` | Generate audio only |
| `POST` | `/api/avatar/visemes` | Generate viseme sequence from text |
| `WS` | `/api/avatar/stream` | WebSocket stream for avatar data |
| `GET` | `/api/avatar/health` | Health check endpoint |

### Interactive API Documentation

Once the backend server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔧 Development

### Project Structure Guidelines

1. **Backend Modules**: Each module should be self-contained with:
   - `router.py`: FastAPI route definitions
   - Business logic files (e.g., `llm.py`, `tts.py`)
   - `__init__.py`: Module initialization

2. **Frontend Modules**: Follow the modular architecture:
   - Separate components for each feature
   - Shared context for state management
   - Service layer for API communication

### Adding a New Module

#### Backend Module

```bash
# Create module directory
mkdir -p backend/app/modules/my_module

# Create required files
touch backend/app/modules/my_module/__init__.py
touch backend/app/modules/my_module/router.py
touch backend/app/modules/my_module/logic.py

# Register in main.py
# Add: from app.modules.my_module.router import router as my_module_router
# Add: app.include_router(my_module_router, prefix="/api/my-module")
```

#### Frontend Module

```bash
# Create module directory
mkdir -p frontend/src/modules/my_module

# Create component
touch frontend/src/modules/my_module/MyModule.jsx

# Register in App.jsx
# Add: const MyModule = lazy(() => import('./modules/my_module/MyModule'));
```

### Avatar Implementation Details

#### Sprite-Based Animation

The avatar system uses sprite sheets with individual frames for each animation state:

- **Frame Selection**: Based on viseme index (0-7)
- **Synchronization**: Audio-time based for precise lip sync
- **Interpolation**: Smooth transitions between frames
- **Assets**: Located in `frontend/public/models/`

#### Viseme Mapping

| Viseme | Description | Phonemes |
|--------|-------------|----------|
| 0 | Silence | SIL, PAU, SP |
| 1 | Open | AA, AE, AH, AW, AY, EH, EY, ER |
| 2 | Smile | IH, IY, Y |
| 3 | Round | AO, OW, OY |
| 4 | Pursed | UH, UW, W |
| 5 | Closed | B, M, P |
| 6 | Teeth on Lip | F, V |
| 7 | Teeth Visible | TH, DH, S, Z, SH, ZH |

---

## 🐛 Troubleshooting

### Common Issues

#### TTS Not Working

**Symptoms**: Avatar doesn't speak or audio generation fails

**Solutions**:
1. Verify `RESEMBLE_API_KEY` is correctly set in `backend/.env`
2. Check that your Resemble.ai account has an active voice
3. Verify project and voice UUIDs in `backend/app/modules/shared/config.py`
4. Check backend logs for API error messages
5. Ensure your Resemble.ai plan supports the required features
6. Check for usage limit errors (may require plan upgrade)

#### RAG Not Finding Documents

**Symptoms**: Chatbot doesn't use document context in responses

**Solutions**:
1. Verify `GEMINI_API_KEY` is correctly set
2. Ensure documents are in supported formats (PDF, TXT, DOCX)
3. Check that ChromaDB directory has write permissions
4. Verify documents were successfully uploaded (check API response)
5. Try re-uploading documents if indexing failed

#### WebSocket Connection Issues

**Symptoms**: Real-time features not working, connection errors

**Solutions**:
1. Verify backend is running on port 8000
2. Check CORS settings in `backend/app/main.py`
3. Verify WebSocket URL in frontend configuration
4. Check firewall settings blocking WebSocket connections
5. Ensure both frontend and backend are on the same network

#### Build Errors

**Symptoms**: Frontend build fails or dependencies not installing

**Solutions**:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version: `node --version` (should be 18+)
4. Try using yarn instead: `yarn install`

#### Backend Dependency Issues

**Symptoms**: Python import errors or missing packages

**Solutions**:
1. Ensure you're using `uv` for package management
2. Run `uv sync` to reinstall all dependencies
3. Check Python version: `python --version` (should be 3.11+)
4. Verify virtual environment is activated (uv handles this automatically)

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review backend logs: `backend/logs/` (if logging is enabled)
3. Check browser console for frontend errors
4. Enable debug logging by setting `LOG_LEVEL=DEBUG` in `.env`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the code style guidelines
4. **Write or update tests** as needed
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- **Backend**: Follow PEP 8, use type hints, add docstrings
- **Frontend**: Follow ESLint rules, use functional components with hooks
- **Commits**: Use conventional commit messages
- **Documentation**: Update README and docstrings for new features

### Development Guidelines

- Write self-documenting code with clear variable names
- Add comments for complex logic
- Keep functions small and focused
- Write tests for new features
- Update documentation for API changes

---

<div align="center">

**Built with ❤️ using React, FastAPI, and modern web technologies**

[Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues) • [Documentation](https://github.com/your-repo/wiki)

</div>
