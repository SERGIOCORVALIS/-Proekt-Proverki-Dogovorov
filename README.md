Legal Document Analysis System
MVP for automatic analysis of legal documents, identifying risks and non-standard wording.

Tech Stack
Frontend: Next.js + TypeScript + Tailwind CSS
Backend: FastAPI + Python
Database: PostgreSQL
AI/NLP: Hugging Face Transformers + spaCy
Infrastructure: Docker
Key MVP Features
Registration and Authentication - Create a lawyer account
Document Upload - Support for .docx and .pdf formats
Analysis and Report - Automatic analysis with risk highlighting
Control Panel - List of analyzed documents
Project Structure
├── frontend/ # Next.js application
│ ├── app/ # App Router pages
│ ├── components/ # React components
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Utilities and API
│ └── types/ # TypeScript types
├── backend/ # FastAPI server
│ ├── app/ # Main application
│ │ ├── core/ # Configuration and security
│ │ ├── models/ # SQLAlchemy models
│ │ ├── schemas/ # Pydantic schemas
│ │ ├── routers/ # API routers
│ │ └── services/ # Business logic
│ └── requirements.txt
├── docker-compose.yml # Docker configuration
├── start_local.bat # Local run (Windows)
├── mock_backend.py # Mock backend for demonstration
└── README.md
Quick Start
Option 1: Local run (recommended for demonstration)
Make sure you have:

Python 3.11+
Node.js 18+
Run the project with a single command:

# Windows
start_local.bat
Open a browser: http://localhost:3000

Log in with test credentials:

Email: test@example.com
Password: password123
Option 2: Run with Docker
Make sure Docker Desktop is running

Run the project:

# Windows
start.bat

# Linux/Mac
./start.sh
Option 3: Manual run
1. Cloning and setup
# Clone the
git repository clone <repository-url>
cd legal-document-analyzer
2. Run with Docker
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
3. Run in development mode
Backend:
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
Frontend:
cd frontend
npm install
npm run dev
Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
Database: localhost:5432
API Endpoints
Authentication
POST /auth/register - user registration
POST /auth/login - login
GET /auth/me - current user information
Documents
POST /documents/upload - document upload
GET /documents - user document list
GET /documents/{id} - document information
GET /documents/{id}/analysis - document analysis results
Functionality
1. Registration and Login
Lawyer Account Creation
JWT Authentication
Secure Routes
2. Document Upload
Supported Format: .docx, .pdf
Maximum Size: 10MB
Drag & Drop Interface
File Validation
3. Document Analysis
Text Extraction from Documents
Rule-Based Analysis (Playbook)
Risk Identification by Level:
High Risk: Critical Statements
Medium Risk: Potential Issues
Low Risk: Recommendations for improvement
4. Control Panel
List of all documents
Processing statuses
Risk statistics
Detailed results view
Analysis rules (Playbook)
The system analyzes documents based on built-in rules:

High risks:
Non-refundable clauses
Unilateral termination of the contract
High penalties (>10%)
Unlimited liability
Medium risks:
Indefinite contract term
Change of terms without consent
Unlimited confidentiality
Low risks:
Absence of force majeure
Unilateral dispute resolution
Development
Backend structure:
app/core/ - configuration, security
app/models/ - SQLAlchemy database models
app/schemas/ - Pydantic schemas for validation
app/routers/ - API endpoints
app/services/ - business logic
Frontend structure:
app/ - pages (App) Router)
components/ - reusable components
hooks/ - custom React hooks
lib/ - utilities and API client
types/ - TypeScript types
Deployment
Production settings:
Change SECRET_KEY in .env
Configure PostgreSQL for production
Use reverse proxy (nginx)
Configure SSL certificates
Use Docker for containerization
License
MIT License

Support
For questions and suggestions, create issues in the repository.
