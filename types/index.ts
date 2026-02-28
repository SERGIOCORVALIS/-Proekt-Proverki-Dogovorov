export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

export interface Document {
  id: number
  filename: string
  original_filename: string
  file_size: number
  status: 'uploaded' | 'processing' | 'analyzed' | 'error'
  created_at: string
  updated_at?: string
  analysis_results?: AnalysisResult[]
}

export interface AnalysisResult {
  id: number
  risk_level: 'high' | 'medium' | 'low'
  text_fragment: string
  explanation: string
  start_position?: number
  end_position?: number
  confidence_score?: number
  created_at: string
}

export interface DocumentAnalysisResponse {
  document: Document
  total_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
