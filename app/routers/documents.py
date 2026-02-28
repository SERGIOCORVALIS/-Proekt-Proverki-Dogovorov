from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentStatus, AnalysisResult, RiskLevel
from app.schemas.document import (
    Document as DocumentSchema, 
    DocumentUploadResponse,
    DocumentAnalysisResponse
)
from app.core.security import get_current_user
from app.core.config import settings
from app.services.document_processor import DocumentProcessor
from app.services.ai_analyzer import AIAnalyzer

router = APIRouter()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.allowed_file_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed. Allowed types: {settings.allowed_file_types}"
        )
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > settings.max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_file_size} bytes"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Create document record
    document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(file_content),
        user_id=current_user.id,
        status=DocumentStatus.UPLOADED
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Start processing in background (in real implementation, use Celery or similar)
    try:
        await process_document_async(document.id, db)
    except Exception as e:
        document.status = DocumentStatus.ERROR
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )
    
    return DocumentUploadResponse(
        document_id=document.id,
        message="Document uploaded successfully",
        status=document.status
    )

@router.get("/", response_model=List[DocumentSchema])
async def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@router.get("/{document_id}/analysis", response_model=DocumentAnalysisResponse)
async def get_document_analysis(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Count risks by level
    high_risks = len([r for r in document.analysis_results if r.risk_level == RiskLevel.HIGH])
    medium_risks = len([r for r in document.analysis_results if r.risk_level == RiskLevel.MEDIUM])
    low_risks = len([r for r in document.analysis_results if r.risk_level == RiskLevel.LOW])
    
    return DocumentAnalysisResponse(
        document=document,
        total_risks=len(document.analysis_results),
        high_risks=high_risks,
        medium_risks=medium_risks,
        low_risks=low_risks
    )

async def process_document_async(document_id: int, db: Session):
    """Process document asynchronously"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return
    
    try:
        # Update status to processing
        document.status = DocumentStatus.PROCESSING
        db.commit()
        
        # Extract text from document
        processor = DocumentProcessor()
        content = processor.extract_text(document.file_path)
        
        # Update document with content
        document.content = content
        db.commit()
        
        # Analyze with AI
        analyzer = AIAnalyzer()
        risks = analyzer.analyze_document(content)
        
        # Save analysis results
        for risk in risks:
            analysis_result = AnalysisResult(
                document_id=document.id,
                risk_level=risk["level"],
                text_fragment=risk["text"],
                explanation=risk["explanation"],
                start_position=risk.get("start_position"),
                end_position=risk.get("end_position"),
                confidence_score=risk.get("confidence", 0)
            )
            db.add(analysis_result)
        
        # Update status to analyzed
        document.status = DocumentStatus.ANALYZED
        db.commit()
        
    except Exception as e:
        document.status = DocumentStatus.ERROR
        db.commit()
        raise e
