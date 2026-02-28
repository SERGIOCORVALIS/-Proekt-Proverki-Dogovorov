from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn

from app.database import engine, Base
from app.routers import auth, documents
from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Document Analysis API",
    description="API для анализа юридических документов и выявления рисков",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])

@app.get("/")
async def root():
    return {"message": "Legal Document Analysis API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
