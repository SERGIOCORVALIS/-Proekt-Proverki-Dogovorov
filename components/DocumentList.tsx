'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Calendar,
  X,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

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

interface DocumentListProps {
  documents: Document[]
  onRefresh: () => void
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onRefresh }) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) {
      return
    }

    setDeleting(documentId)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Документ успешно удален')
        onRefresh()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Ошибка удаления документа')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка удаления документа')
    } finally {
      setDeleting(null)
    }
  }

  const getRiskCounts = (document: Document) => {
    if (!document.analysis_results) return { high: 0, medium: 0, low: 0 }
    
    return document.analysis_results.reduce((acc, result) => {
      acc[result.risk_level]++
      return acc
    }, { high: 0, medium: 0, low: 0 })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Документы не найдены
          </h3>
          <p className="text-gray-500">
            Загрузите первый документ для анализа
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Документы ({documents.length})
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
        >
          Обновить
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => {
          const riskCounts = getRiskCounts(document)
          const totalRisks = riskCounts.high + riskCounts.medium + riskCounts.low

          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {document.original_filename}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(document.created_at)}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(document.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {getStatusText(document.status)}
                      </span>
                    </div>

                    {/* Risk Summary */}
                    {document.status === 'analyzed' && totalRisks > 0 && (
                      <div className="flex items-center space-x-2">
                        {riskCounts.high > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {riskCounts.high} высоких
                          </span>
                        )}
                        {riskCounts.medium > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {riskCounts.medium} средних
                          </span>
                        )}
                        {riskCounts.low > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {riskCounts.low} низких
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {document.status === 'analyzed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={deleting === document.id}
                        className="flex items-center border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white"
                      >
                        {deleting === document.id ? (
                          <Clock className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {deleting === document.id ? 'Удаление...' : 'Удалить'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Document Analysis Modal */}
      {selectedDocument && (
        <DocumentAnalysisModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  )
}

interface DocumentAnalysisModalProps {
  document: Document
  onClose: () => void
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({ document, onClose }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getRiskText = (level: string) => {
    switch (level) {
      case 'high':
        return 'Высокий риск'
      case 'medium':
        return 'Средний риск'
      case 'low':
        return 'Низкий риск'
      default:
        return level
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Анализ документа: {document.original_filename}
            </h3>
            <p className="text-sm text-gray-500">
              Найдено рисков: {document.analysis_results?.length || 0}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {document.analysis_results && document.analysis_results.length > 0 ? (
            <div className="space-y-4">
              {document.analysis_results.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-4 rounded-lg border ${getRiskColor(risk.risk_level)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">
                      {getRiskText(risk.risk_level)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Уверенность: {risk.confidence_score}%
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Найденный текст:
                    </p>
                    <p className="text-sm bg-white p-2 rounded border">
                      "{risk.text_fragment}"
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Объяснение:
                    </p>
                    <p className="text-sm text-gray-700">
                      {risk.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Риски не найдены
              </h3>
              <p className="text-gray-500">
                Документ не содержит выявленных рисков
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
