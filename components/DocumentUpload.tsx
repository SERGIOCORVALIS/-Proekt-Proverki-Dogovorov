'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { X, Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface DocumentUploadProps {
  onClose: () => void
  onUploaded: () => void
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    console.log('Selected file:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size)
    
    // Validate file type
    const allowedTypes = ['.docx', '.pdf', '.doc', '.rtf', '.txt']
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
    
    console.log('File extension:', fileExtension)
    console.log('Allowed types:', allowedTypes)
    
    if (!allowedTypes.includes(fileExtension)) {
      console.error('File type not supported:', fileExtension)
      toast.error('Поддерживаются файлы: .docx, .pdf, .doc, .rtf, .txt')
      return
    }

    // Validate file size (400MB)
    if (selectedFile.size > 400 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 400MB')
      return
    }

    setFile(selectedFile)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    console.log('Starting upload for file:', file.name, 'Type:', file.type, 'Size:', file.size)

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    console.log('Using token:', token ? 'Present' : 'Missing')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        toast.success('Документ успешно загружен')
        onUploaded()
      } else {
        const error = await response.json()
        console.error('Upload error:', error)
        toast.error(error.detail || 'Ошибка загрузки документа')
      }
    } catch (error) {
      console.error('Upload exception:', error)
      toast.error('Ошибка загрузки документа')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Загрузка документа</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-primary-600 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Удалить файл
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600">
                    Перетащите файл сюда или{' '}
                    <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
                      выберите файл
                      <input
                        type="file"
                        className="hidden"
                        accept=".docx,.pdf,.doc,.rtf,.txt"
                        onChange={handleFileInput}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Поддерживаются форматы: DOCX, PDF, DOC, RTF, TXT (макс. 400MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={!file}
            >
              Загрузить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
