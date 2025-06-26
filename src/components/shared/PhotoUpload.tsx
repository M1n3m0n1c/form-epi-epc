import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import {
    compressImage,
    createPreviewUrl,
    extractImageMetadata,
    formatFileSize,
    generateUniqueFileName,
    revokePreviewUrl,
    validateImageFile,
    type CompressionResult
} from '@/lib/utils/photoCompression';
import { AlertCircle, Camera, CheckCircle, Eye, Loader2, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Tipos para o componente
export interface PhotoData {
  id: string;
  file: File;
  previewUrl: string;
  metadata: {
    width?: number;
    height?: number;
    aspectRatio?: number;
    fileSize: number;
    fileName: string;
    mimeType: string;
    lastModified: Date;
  };
  compressionResult?: CompressionResult;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  uploadProgress?: number;
  errorMessage?: string;
  storageUrl?: string;
}

export interface PhotoUploadProps {
  // Identificação da seção
  secao: string;
  formularioId?: string;

  // Configurações
  maxPhotos?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;

  // Callbacks
  onPhotosChange?: (photos: PhotoData[]) => void;
  onUploadComplete?: (photos: PhotoData[]) => void;
  onError?: (error: string) => void;

  // Estado inicial
  initialPhotos?: PhotoData[];

  // UI
  className?: string;
  disabled?: boolean;
}

export function PhotoUpload({
  secao,
  formularioId,
  maxPhotos = 10,
  allowCamera = true,
  allowGallery = true,
  onPhotosChange,
  onUploadComplete,
  onError,
  initialPhotos = [],
  className,
  disabled = false
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoData[]>(initialPhotos);
  const [, setIsCapturing] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Notificar mudanças nas fotos
  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  // Limpar URLs de preview ao desmontar
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.previewUrl) {
          revokePreviewUrl(photo.previewUrl);
        }
      });
    };
  }, []);

  /**
   * Adiciona novas fotos ao estado
   */
  const addPhotos = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Verificar limite de fotos
    if (photos.length + fileArray.length > maxPhotos) {
      onError?.(`Máximo ${maxPhotos} fotos permitidas por seção`);
      return;
    }

    const newPhotos: PhotoData[] = [];

    for (const file of fileArray) {
      try {
        // Validar arquivo
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          onError?.(validation.error || 'Arquivo inválido');
          continue;
        }

        // Extrair metadados
        const metadata = await extractImageMetadata(file);

        // Criar preview
        const previewUrl = createPreviewUrl(file);

        // Comprimir imagem
        const compressionResult = await compressImage(file);

        if (!compressionResult.success) {
          onError?.(compressionResult.error || 'Erro na compressão');
          revokePreviewUrl(previewUrl);
          continue;
        }

        const photoData: PhotoData = {
          id: generateUniqueFileName(file.name, secao),
          file: compressionResult.file || file,
          previewUrl,
          metadata,
          compressionResult,
          uploadStatus: 'pending'
        };

        newPhotos.push(photoData);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        onError?.(error instanceof Error ? error.message : 'Erro ao processar arquivo');
      }
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  }, [photos.length, maxPhotos, secao, onError]);

  /**
   * Remove uma foto
   */
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove?.previewUrl) {
        revokePreviewUrl(photoToRemove.previewUrl);
      }
      return prev.filter(p => p.id !== photoId);
    });
  }, []);

  /**
   * Upload para Supabase Storage
   */
  const uploadPhoto = useCallback(async (photo: PhotoData): Promise<PhotoData> => {
    if (!formularioId) {
      throw new Error('ID do formulário necessário para upload');
    }

    try {
      // Atualizar status
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? { ...p, uploadStatus: 'uploading', uploadProgress: 0 }
          : p
      ));

      // Caminho no storage: /formularios/{formulario_id}/{secao}/
      const storagePath = `formularios/${formularioId}/${secao}/${photo.id}`;

      // Upload para Supabase Storage
      const { error } = await supabase.storage
        .from('fotos')
        .upload(storagePath, photo.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(storagePath);

      const updatedPhoto: PhotoData = {
        ...photo,
        uploadStatus: 'uploaded',
        uploadProgress: 100,
        storageUrl: urlData.publicUrl
      };

      // Atualizar estado
      setPhotos(prev => prev.map(p =>
        p.id === photo.id ? updatedPhoto : p
      ));

      return updatedPhoto;

    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';

      // Atualizar status de erro
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? { ...p, uploadStatus: 'error', errorMessage }
          : p
      ));

      throw error;
    }
  }, [formularioId, secao]);

  /**
   * Upload de todas as fotos pendentes
   */
  const uploadAllPhotos = useCallback(async () => {
    const pendingPhotos = photos.filter(p => p.uploadStatus === 'pending');

    if (pendingPhotos.length === 0) {
      return;
    }

    setUploadingCount(pendingPhotos.length);

    const uploadedPhotos: PhotoData[] = [];

    try {
      // Upload sequencial para evitar sobrecarga
      for (const photo of pendingPhotos) {
        try {
          const uploadedPhoto = await uploadPhoto(photo);
          uploadedPhotos.push(uploadedPhoto);
        } catch (error) {
          console.error(`Erro no upload da foto ${photo.id}:`, error);
        }
      }

      onUploadComplete?.(uploadedPhotos);
    } finally {
      setUploadingCount(0);
    }
  }, [photos, uploadPhoto, onUploadComplete]);

  // Handlers para inputs
  const handleGallerySelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addPhotos(files);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  }, [addPhotos]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addPhotos(files);
    }
    // Limpar input
    e.target.value = '';
    setIsCapturing(false);
  }, [addPhotos]);

  // Estatísticas
  const pendingCount = photos.filter(p => p.uploadStatus === 'pending').length;
  const uploadedCount = photos.filter(p => p.uploadStatus === 'uploaded').length;
  const errorCount = photos.filter(p => p.uploadStatus === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          📸 Fotos - {secao.charAt(0).toUpperCase() + secao.slice(1)}
        </Label>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{photos.length}/{maxPhotos}</span>
          {uploadingCount > 0 && (
            <span className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando {uploadingCount}
            </span>
          )}
        </div>
      </div>

      {/* Status summary */}
      {photos.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
          {uploadedCount > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              {uploadedCount} enviada{uploadedCount !== 1 ? 's' : ''}
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <X className="w-4 h-4" />
              {errorCount} erro{errorCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-2">
        {allowGallery && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || photos.length >= maxPhotos}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Galeria
          </Button>
        )}

        {allowCamera && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCapturing(true);
              cameraInputRef.current?.click();
            }}
            disabled={disabled || photos.length >= maxPhotos}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Câmera
          </Button>
        )}

        {pendingCount > 0 && formularioId && (
          <Button
            type="button"
            onClick={uploadAllPhotos}
            disabled={disabled || uploadingCount > 0}
            className="flex items-center gap-2"
          >
            {uploadingCount > 0 ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Enviar Todas
          </Button>
        )}
      </div>

      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGallerySelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <PhotoPreview
              key={photo.id}
              photo={photo}
              onRemove={() => removePhoto(photo.id)}
              onRetryUpload={() => uploadPhoto(photo)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {photos.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Nenhuma foto adicionada ainda
            </p>
            <p className="text-sm text-gray-400 text-center">
              Use os botões acima para adicionar fotos via câmera ou galeria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para preview individual de foto
interface PhotoPreviewProps {
  photo: PhotoData;
  onRemove: () => void;
  onRetryUpload: () => void;
  disabled: boolean;
}

function PhotoPreview({ photo, onRemove, onRetryUpload, disabled }: PhotoPreviewProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);

  const getStatusIcon = () => {
    switch (photo.uploadStatus) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'uploaded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (photo.uploadStatus) {
      case 'pending':
        return 'Pendente';
      case 'uploading':
        return `Enviando... ${photo.uploadProgress || 0}%`;
      case 'uploaded':
        return 'Enviada';
      case 'error':
        return photo.errorMessage || 'Erro';
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-gray-100">
          <img
            src={photo.previewUrl}
            alt={photo.metadata.fileName}
            className="w-full h-full object-cover"
          />

          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowFullscreen(true)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onRemove}
                disabled={disabled}
                className="bg-red-500 bg-opacity-90 hover:bg-opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
            {getStatusIcon()}
          </div>
        </div>

        <CardContent className="p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium truncate">
                {photo.metadata.fileName}
              </span>
              {photo.uploadStatus === 'error' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetryUpload}
                  disabled={disabled}
                  className="text-xs h-6 px-2"
                >
                  Tentar novamente
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(photo.metadata.fileSize)}</span>
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>

            {photo.compressionResult && photo.compressionResult.compressionRatio && photo.compressionResult.compressionRatio > 1 && (
              <div className="text-xs text-green-600">
                Comprimida {Math.round((1 - 1/photo.compressionResult.compressionRatio) * 100)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal fullscreen */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photo.previewUrl}
              alt={photo.metadata.fileName}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              className="absolute top-4 right-4"
              variant="secondary"
              size="sm"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoUpload;
