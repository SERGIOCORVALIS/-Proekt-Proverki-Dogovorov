'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { DocumentUpload } from '@/components/DocumentUpload'
import { DocumentList } from '@/components/DocumentList'
import { LogOut, Upload, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { LogoWithText } from '@/components/ui/Logo'

interface Document {
  id: number
  filename: string
  original_filename: string
  file_size: number
  status: 'uploaded' | 'processing' | 'analyzed' | 'error'
  created_at: string
  analysis_results?: Array<{
    id: number
    risk_level: 'high' | 'medium' | 'low'
    text_fragment: string
    explanation: string
    confidence_score: number
  }>
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      // Проверяем, что мы на клиенте
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }
      
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      // Убеждаемся, что data является массивом
      setDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([]) // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUploaded = () => {
    setShowUpload(false)
    fetchDocuments()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Загружен'
      case 'processing':
        return 'Анализируется'
      case 'analyzed':
        return 'Проанализирован'
      case 'error':
        return 'Ошибка'
      default:
        return status
    }
  }

  const getRiskCounts = (document: Document) => {
    if (!document.analysis_results) return { high: 0, medium: 0, low: 0 }
    
    return document.analysis_results.reduce((acc, result) => {
      acc[result.risk_level]++
      return acc
    }, { high: 0, medium: 0, low: 0 })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <LogoWithText size="md" textClassName="text-2xl" />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Добро пожаловать, {user?.full_name}
              </span>
              <Button
                variant="secondary"
                onClick={logout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего документов</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Проанализировано</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents?.filter(d => d.status === 'analyzed')?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Высокие риски</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents.reduce((acc, doc) => {
                      const risks = getRiskCounts(doc)
                      return acc + risks.high
                    }, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">В обработке</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents?.filter(d => d.status === 'processing')?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Button */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowUpload(true)}
            className="flex items-center"
          >
            <Upload className="h-5 w-5 mr-2" />
            Загрузить документ
          </Button>
        </div>

        {/* Document List */}
        <DocumentList 
          documents={documents} 
          onRefresh={fetchDocuments}
        />

        {/* Upload Modal */}
        {showUpload && (
          <DocumentUpload
            onClose={() => setShowUpload(false)}
            onUploaded={handleDocumentUploaded}
          />
        )}
      </main>
    </div>
  )
}
