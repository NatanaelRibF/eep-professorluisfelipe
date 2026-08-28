'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoUploadProps {
  value?: string
  onChange: (url: string) => void
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Falha no upload')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      alert('Erro ao fazer upload da foto. Tente novamente.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-slate-400">
        {value ? (
          <>
            <Image
              src={value}
              alt="Foto do aluno"
              fill
              className="object-cover"
              sizes="(max-width: 128px) 100vw, 128px"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Camera className="h-8 w-8 mb-1 opacity-50" />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 text-center sm:text-left">
        <h4 className="text-sm font-medium text-slate-900">Foto de Perfil</h4>
        <p className="text-xs text-slate-500 max-w-[200px]">
          JPG, GIF ou PNG. Tamanho máximo de 5MB.
        </p>

        <div className="flex items-center justify-center gap-2 sm:justify-start mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {value ? 'Trocar Foto' : 'Fazer Upload'}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
