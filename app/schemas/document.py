from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.document import DocumentStatus, RiskLevel

class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    pass

class AnalysisResultBase(BaseModel):
    risk_level: RiskLevel
    text_fragment: str
    explanation: str
    start_position: Optional[int] = None
    end_position: Optional[int] = None
    confidence_score: Optional[int] = None

class AnalysisResult(AnalysisResultBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Document(DocumentBase):
    id: int
    original_filename: str
    file_size: int
    status: DocumentStatus
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    analysis_results: List[AnalysisResult] = []

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    document_id: int
    message: str
    status: DocumentStatus

class DocumentAnalysisResponse(BaseModel):
    document: Document
    total_risks: int
    high_risks: int
    medium_risks: int
    low_risks: int
