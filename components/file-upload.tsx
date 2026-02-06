'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    for (let i = 0; i < files.length; i++) {
      await handleFileUpload(files[i])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        await handleFileUpload(files[i])
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploadedFiles((prev) => [...prev, file])
      await onFileUpload(file)
    } catch (error) {
      console.error('File upload failed:', error)
      setUploadedFiles((prev) => prev.filter((f) => f !== file))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {isLoading ? 'Uploading...' : 'Click or drag files here'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, Word, Images (Max 10MB)
            </p>
          </div>
        </button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files:
          </p>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
