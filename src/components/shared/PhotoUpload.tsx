import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { AlertCircle, Camera, CheckCircle, ChevronDown, ChevronUp, Eye, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
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
  const [photos, setPhotos] = useState<PhotoData[]>(Array.isArray(initialPhotos) ? initialPhotos : []);
  const [, setIsCapturing] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Ref para evitar loops no useEffect
  const previousPhotosRef = useRef<PhotoData[]>([]);

  // Notificar mudanças nas fotos - REMOVIDO onPhotosChange das dependências para evitar loop
  useEffect(() => {
    if (onPhotosChange && JSON.stringify(photos) !== JSON.stringify(previousPhotosRef.current)) {
      previousPhotosRef.current = photos;
      onPhotosChange(photos);
    }
  }, [photos]); // Removido onPhotosChange das dependências

  // Sincronizar estado interno com initialPhotos quando ela mudar
  useEffect(() => {
    if (Array.isArray(initialPhotos)) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  // Limpar URLs de preview ao desmontar
  useEffect(() => {
    return () => {
      if (Array.isArray(photos)) {
        photos.forEach(photo => {
          if (photo.previewUrl) {
            revokePreviewUrl(photo.previewUrl);
          }
        });
      }
    };
  }, []);

  /**
   * Adiciona novas fotos ao estado
   */
  const addPhotos = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Verificar limite de fotos
    if ((Array.isArray(photos) ? photos.length : 0) + fileArray.length > maxPhotos) {
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
  }, [Array.isArray(photos) ? photos.length : 0, maxPhotos, secao, onError]);

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

      // Atualizar estado com erro
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

    if (pendingPhotos.length === 0) return;

    setUploadingCount(pendingPhotos.length);

    try {
      const uploadPromises = pendingPhotos.map(photo => uploadPhoto(photo));
      const results = await Promise.allSettled(uploadPromises);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const errorCount = results.filter(r => r.status === 'rejected').length;

      if (errorCount > 0) {
        onError?.(`${errorCount} foto(s) falharam no upload`);
      }

      if (successCount > 0) {
        const uploadedPhotos = photos.filter(p => p.uploadStatus === 'uploaded');
        onUploadComplete?.(uploadedPhotos);
      }

    } finally {
      setUploadingCount(0);
    }
  }, [photos, uploadPhoto, onError, onUploadComplete]);

  /**
   * Handlers de input
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIsCapturing(true);
      addPhotos(files).finally(() => {
        setIsCapturing(false);
      });
    }
    // Limpar input
    e.target.value = '';
  }, [addPhotos]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  const hasPhotos = Array.isArray(photos) && photos.length > 0;
  const canAddMore = (Array.isArray(photos) ? photos.length : 0) < maxPhotos;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botão para mostrar/esconder área de upload */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUpload(!showUpload)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Fotos
          {showUpload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {hasPhotos && (
          <span className="text-sm text-gray-600">
            {photos.length}/{maxPhotos} fotos
          </span>
        )}
      </div>

      {/* Área de upload - só aparece quando showUpload é true */}
      {showUpload && (
        <Card>
          <CardContent className="p-4">
            {/* Inputs ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || !canAddMore}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              disabled={disabled || !canAddMore}
            />

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2 mb-4">
              {allowGallery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={disabled || !canAddMore}
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
                  onClick={openCameraDialog}
                  disabled={disabled || !canAddMore}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Câmera
                </Button>
              )}

              {hasPhotos && (
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
                  {uploadingCount > 0 ? `Enviando ${uploadingCount}...` : 'Enviar Todas'}
                </Button>
              )}
            </div>

            {/* Informações */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Máximo {maxPhotos} fotos por seção</p>
              <p>• Formatos aceitos: JPG, PNG, WEBP</p>
              <p>• Tamanho máximo: 10MB por foto</p>
              {!canAddMore && (
                <p className="text-orange-600 font-medium">
                  • Limite de fotos atingido
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de fotos */}
      {hasPhotos && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      {!hasPhotos && !showUpload && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Nenhuma foto adicionada ainda
          </p>
        </div>
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
  const [showPreview, setShowPreview] = useState(false);

  const getStatusIcon = () => {
    switch (photo.uploadStatus) {
      case 'pending':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'uploaded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (photo.uploadStatus) {
      case 'pending':
        return 'Pendente';
      case 'uploading':
        return `Enviando... ${photo.uploadProgress || 0}%`;
      case 'uploaded':
        return 'Enviado';
      case 'error':
        return photo.errorMessage || 'Erro';
      default:
        return '';
    }
  };

  return (
    <>
      <Card className="relative group overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={photo.previewUrl}
            alt={photo.metadata.fileName}
            className="w-full h-full object-cover"
          />

          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowPreview(true)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {photo.uploadStatus === 'error' && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onRetryUpload}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <Upload className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Status badge */}
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
            {getStatusIcon()}
          </div>
        </div>

        <CardContent className="p-2">
          <div className="space-y-1">
            <p className="text-xs font-medium truncate">
              {photo.metadata.fileName}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(photo.metadata.fileSize)}</span>
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de preview */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photo.previewUrl}
              alt={photo.metadata.fileName}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Componente simplificado para uso dentro das perguntas
interface QuestionPhotoUploadProps {
  questionKey: string;
  secao: string;
  formularioId?: string;
  photos: PhotoData[];
  onPhotosChange: (questionKey: string, photos: PhotoData[]) => void;
  maxPhotos?: number;
  required?: boolean;
  disabled?: boolean;
}

export function QuestionPhotoUpload({
  questionKey,
  secao,
  formularioId,
  photos,
  onPhotosChange,
  maxPhotos = 3,
  required = false,
  disabled = false
}: QuestionPhotoUploadProps) {

  const handlePhotosChange = useCallback((updatedPhotos: PhotoData[]) => {
    onPhotosChange(questionKey, updatedPhotos);
  }, [questionKey]); // Removido onPhotosChange das dependências para evitar loop

  return (
    <div className="space-y-2">
      {required && (
        <p className="text-sm text-red-600">
          * Pelo menos uma foto é obrigatória para esta pergunta
        </p>
      )}

      <PhotoUpload
        secao={secao}
        formularioId={formularioId}
        maxPhotos={maxPhotos}
        onPhotosChange={handlePhotosChange}
        initialPhotos={Array.isArray(photos) ? photos : []}
        disabled={disabled}
        className="border-l-4 border-blue-200 pl-4"
      />
    </div>
  );
}

export default PhotoUpload;
