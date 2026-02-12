# MAD-CTI: Multi-Agent Dark Web Threat Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Overview

MAD-CTI (Multi-Agent Dark Web Cyber Threat Intelligence) is an AI-powered threat intelligence platform that leverages advanced NLP and machine learning to detect, classify, and analyze emerging cyber threats in real-time. The system processes threat intelligence from multiple sources including CERT-EU reports and NVD CVE databases to provide actionable security insights.

## ✨ Key Features

### 🔍 Intelligent Threat Detection
- **Multi-source Intelligence**: Processes CERT-EU bulletins and NVD CVE data
- **Real-time Classification**: Categorizes threats including ransomware, phishing, zero-days, malware, and data breaches
- **ML-Powered Analysis**: Uses trained models for threat prediction and severity assessment

### 🤖 Multi-Agent Architecture
- **Scraper Agent**: Collects threat intelligence from configured sources
- **Translation Agent**: Normalizes and translates threat data
- **Classification Agent**: Categorizes threats using ML models
- **Analysis Agent**: Performs deep threat analysis
- **Priority Agent**: Assigns risk scores and prioritization
- **Aggregation Agent**: Consolidates findings across agents
- **Prediction Agent**: Forecasts threat trends

### 📊 Interactive Dashboard
- Real-time threat severity distribution
- Temporal trend analysis
- Organization-specific threat tracking
- Confidence scoring and risk metrics
- Advanced filtering and search capabilities

### 🔌 LLM Integration
- Support for OpenAI and Groq providers
- Intelligent routing for optimal performance
- Configurable model selection

## 🏗️ Architecture

```
┌─────────────────────┐
│  Threat Sources     │
│  (CERT-EU, NVD)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Backend (Python)  │
│  ┌───────────────┐  │
│  │ Multi-Agent   │  │
│  │ Orchestrator  │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ ML Models     │  │
│  │ (PyTorch)     │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ FastAPI       │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Frontend (React)   │
│  ┌───────────────┐  │
│  │ Dashboard     │  │
│  │ Components    │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Recharts      │  │
│  └───────────────┘  │
└─────────────────────┘
```

## 📁 Project Structure

```
MAD-CTI/
├── backend/                    # Python backend
│   ├── app/
│   │   ├── agents/            # Multi-agent system
│   │   │   ├── scraper_agent.py
│   │   │   ├── translation_agent.py
│   │   │   ├── classification_agent.py
│   │   │   ├── analysis_agent.py
│   │   │   ├── priority_agent.py
│   │   │   ├── aggregation_agent.py
│   │   │   └── prediction_agent.py
│   │   ├── ml/                # Machine learning
│   │   │   ├── trainer.py
│   │   │   ├── predictor.py
│   │   │   ├── feature_builder.py
│   │   │   └── nvd_parser.py
│   │   ├── models/            # Trained ML models
│   │   ├── providers/         # LLM providers
│   │   ├── orchestrator.py    # Agent coordination
│   │   ├── main.py           # FastAPI application
│   │   └── config.py         # Configuration
│   ├── data/
│   │   ├── cert-eu/          # CERT-EU reports
│   │   ├── nvd/              # NVD CVE data
│   │   └── processed/        # Processed threats
│   └── requirements.txt
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThreatDashboard.js
│   │   │   ├── Charts.js
│   │   │   ├── ThreatTable.js
│   │   │   ├── FilterBar.js
│   │   │   ├── SearchBar.js
│   │   │   ├── StatsCards.js
│   │   │   └── Login.js
│   │   ├── App.js
│   │   └── index.js
│   ├── server.js             # Express backend
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **ML/AI**: PyTorch, Scikit-learn, NumPy, Pandas
- **LLM**: OpenAI, Groq
- **Utilities**: Pydantic, python-dotenv, httpx, tenacity

### Frontend
- **Framework**: React 18.2
- **Visualization**: Recharts
- **UI**: Lucide React (icons)
- **Backend**: Express.js, CORS
- **Auth**: JWT, bcryptjs

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- 8GB RAM (16GB recommended)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (OpenAI/Groq)

# Run the backend
python app/main.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm start

# In another terminal, start Express backend
npm run start-server
```

## 🔑 Configuration

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
LLM_PROVIDER=openai  # or groq
MODEL_NAME=gpt-4
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## 📊 Usage

1. **Access Dashboard**: Navigate to `http://localhost:3000`
2. **Login**: Use credentials from `frontend/users.json`
3. **View Threats**: Monitor real-time threat intelligence
4. **Filter & Search**: Use advanced filtering options
5. **Analyze Trends**: Review temporal and severity distributions

## 🔬 Machine Learning Models

The system includes pre-trained models for:
- Threat type classification
- Severity prediction
- Risk scoring

Models are stored in `backend/app/models/` and can be retrained using:
```bash
cd backend/app/ml
python trainer.py
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sarathy** - [GitHub](https://github.com/Sarathy055)

## 🙏 Acknowledgments

- CERT-EU for threat intelligence bulletins
- NVD for CVE database
- Open-source community for tools and libraries

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This tool is for educational and research purposes. Always comply with applicable laws and regulations when conducting security research.
