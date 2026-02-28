import os
from typing import Optional
from docx import Document as DocxDocument
import PyPDF2
import pypdf

class DocumentProcessor:
    """Service for extracting text from various document formats"""
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from document based on file extension"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.docx':
            return self._extract_from_docx(file_path)
        elif file_extension == '.pdf':
            return self._extract_from_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = DocxDocument(file_path)
            text_parts = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text.strip())
            
            return '\n'.join(text_parts)
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {str(e)}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text_parts = []
            
            # Try with pypdf first (newer library)
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = pypdf.PdfReader(file)
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text.strip():
                            text_parts.append(text.strip())
            except Exception:
                # Fallback to PyPDF2
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text.strip():
                            text_parts.append(text.strip())
            
            return '\n'.join(text_parts)
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def get_document_info(self, file_path: str) -> dict:
        """Get basic information about the document"""
        file_size = os.path.getsize(file_path)
        file_extension = os.path.splitext(file_path)[1].lower()
        
        return {
            "file_size": file_size,
            "file_extension": file_extension,
            "file_path": file_path
        }
