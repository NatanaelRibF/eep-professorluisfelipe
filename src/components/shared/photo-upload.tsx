'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Camera, Upload, X, Loader2, RefreshCw, Check, FlipHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PhotoUploadProps {
  value?: string
  onChange: (url: string) => void
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Web Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start Camera Stream
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setIsCameraLoading(true)
    setCapturedBlob(null)
    setCapturedPreview(null)

    // Stop existing stream if any
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Seu navegador não suporta acesso à câmera.')
        setIsCameraLoading(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      })

      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err: any) {
      console.error('Erro ao acessar a câmera:', err)
      toast.error('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    } finally {
      setIsCameraLoading(false)
    }
  }

  // Stop Camera Stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCapturedBlob(null)
    setCapturedPreview(null)
  }

  const handleOpenLiveCamera = async () => {
    setIsCameraOpen(true)
    setTimeout(() => {
      startCamera('user')
    }, 200)
  }

  const handleCloseLiveCamera = () => {
    stopCamera()
    setIsCameraOpen(false)
  }

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user'
    setCameraFacing(nextFacing)
    startCamera(nextFacing)
  }

  // Snap photo from live video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const size = Math.min(video.videoWidth, video.videoHeight) || 400

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Crop center square
    const startX = (video.videoWidth - size) / 2
    const startY = (video.videoHeight - size) / 2

    // Mirror if selfie camera
    if (cameraFacing === 'user') {
      ctx.translate(size, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob)
          const previewUrl = URL.createObjectURL(blob)
          setCapturedPreview(previewUrl)
        }
      },
      'image/jpeg',
      0.9
    )
  }

  const handleRetake = () => {
    setCapturedBlob(null)
    setCapturedPreview(null)
    if (videoRef.current && cameraStream) {
      videoRef.current.play().catch(() => {})
    }
  }

  // Upload captured photo
  const handleConfirmCapturedPhoto = async () => {
    if (!capturedBlob) return

    setIsUploading(true)
    handleCloseLiveCamera()

    try {
      const formData = new FormData()
      formData.append('file', capturedBlob, `camera-${Date.now()}.jpg`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Falha no upload da foto')
      }

      const data = await response.json()
      onChange(data.url)
      toast.success('Foto capturada e salva com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar foto capturada:', error)
      toast.error('Erro ao fazer upload da foto. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  // Upload from file picker
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
      toast.success('Foto carregada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      toast.error('Erro ao fazer upload da foto. Tente novamente.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    toast.info('Foto removida.')
  }

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      {/* Avatar Preview Box */}
      <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-100 transition-colors hover:border-slate-400 shadow-sm">
        {value ? (
          <>
            <img
              src={value}
              alt="Foto do perfil"
              className="h-full w-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            ) : (
              <Camera className="h-8 w-8 opacity-60" />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1.5 pt-1 text-center sm:text-left">
        <h4 className="text-sm font-bold text-slate-800">Foto de Perfil</h4>
        <p className="text-xs text-slate-500 max-w-[280px]">
          Tire uma foto agora com a câmera do celular/computador ou escolha um arquivo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start mt-2">
          {/* Button 1: Tirar Foto com a Câmera */}
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            onClick={handleOpenLiveCamera}
            className="bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-sm"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" />
            Tirar Foto
          </Button>

          {/* Button 2: Fazer Upload / Galeria */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold h-9"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {value ? 'Trocar Arquivo' : 'Fazer Upload'}
          </Button>

          {/* Button 3: Remover Foto */}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs h-9"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Remover
            </Button>
          )}
        </div>

        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* LIVE CAMERA MODAL (Works on both Phone and Desktop) */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && handleCloseLiveCamera()}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900 text-base sm:text-lg">
              <Camera className="h-5 w-5 text-blue-600" />
              Câmera ao Vivo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enquadre o rosto no centro e clique para capturar a foto.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center my-3 relative">
            {/* Live Video or Captured Snapshot View */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-lg flex items-center justify-center">
              {capturedPreview ? (
                // Captured Preview
                <img
                  src={capturedPreview}
                  alt="Foto Capturada"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Live Video
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  {isCameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <span className="text-xs font-medium">Iniciando câmera...</span>
                    </div>
                  )}
                  {/* Visual Portrait Guide Overlay */}
                  <div className="absolute inset-4 rounded-full border-2 border-white/30 pointer-events-none" />
                </>
              )}

              {/* Hidden Canvas for capture rendering */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Switch Camera Button (Frontal / Traseira) */}
            {!capturedPreview && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleFlipCamera}
                className="mt-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                <FlipHorizontal className="mr-1.5 h-3.5 w-3.5" />
                {cameraFacing === 'user' ? 'Usar Câmera Traseira' : 'Usar Câmera Frontal'}
              </Button>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            {capturedPreview ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  className="w-full sm:w-auto text-xs"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Tirar Novamente
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmCapturedPhoto}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Usar Esta Foto
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseLiveCamera}
                  className="w-full sm:w-auto text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={isCameraLoading}
                  className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold shadow-sm h-10"
                >
                  <Camera className="mr-1.5 h-4 w-4" />
                  Capturar Foto
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
