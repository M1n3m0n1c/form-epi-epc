import imageCompression from 'browser-image-compression';

// Configurações de compressão
export const COMPRESSION_CONFIG = {
  maxSizeMB: 2, // Máximo 2MB
  maxWidthOrHeight: 1920, // Máximo 1920px
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  quality: 0.8, // 80% de qualidade
  initialQuality: 0.8,
  alwaysKeepResolution: false,
  preserveExif: false
};

// Tipos de arquivo aceitos
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// Interface para resultado de compressão
export interface CompressionResult {
  success: boolean;
  file?: File;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

// Interface para validação de arquivo
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

/**
 * Valida se o arquivo é uma imagem aceita
 */
export function validateImageFile(file: File): FileValidationResult {
  // Verificar se é um arquivo
  if (!file) {
    return {
      isValid: false,
      error: 'Nenhum arquivo fornecido'
    };
  }

  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado. Aceitos: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  // Verificar tamanho máximo (20MB antes da compressão)
  const MAX_SIZE_BEFORE_COMPRESSION = 20 * 1024 * 1024; // 20MB
  if (file.size > MAX_SIZE_BEFORE_COMPRESSION) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${formatFileSize(MAX_SIZE_BEFORE_COMPRESSION)}`
    };
  }

  // Verificar se o nome do arquivo é válido
  if (!file.name || file.name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Nome do arquivo inválido'
    };
  }

  return {
    isValid: true,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  };
}

/**
 * Comprime uma imagem para atender aos requisitos
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  try {
    // Validar arquivo primeiro
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        originalSize,
        error: validation.error
      };
    }

    // Se já está dentro do limite, não comprimir
    if (originalSize <= COMPRESSION_CONFIG.maxSizeMB * 1024 * 1024) {
      return {
        success: true,
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }

    // Comprimir imagem
    const compressedFile = await imageCompression(file, COMPRESSION_CONFIG);
    const compressedSize = compressedFile.size;

    // Verificar se a compressão foi efetiva
    if (compressedSize > COMPRESSION_CONFIG.maxSizeMB * 1024 * 1024) {
      // Tentar compressão mais agressiva
      const aggressiveConfig = {
        ...COMPRESSION_CONFIG,
        maxSizeMB: 1.5,
        quality: 0.6,
        maxWidthOrHeight: 1280
      };

      const recompressedFile = await imageCompression(file, aggressiveConfig);

      return {
        success: true,
        file: recompressedFile,
        originalSize,
        compressedSize: recompressedFile.size,
        compressionRatio: originalSize / recompressedFile.size
      };
    }

    return {
      success: true,
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize
    };

  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return {
      success: false,
      originalSize,
      error: error instanceof Error ? error.message : 'Erro desconhecido na compressão'
    };
  }
}

/**
 * Comprime múltiplas imagens
 */
export async function compressMultipleImages(files: File[]): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (const file of files) {
    const result = await compressImage(file);
    results.push(result);
  }

  return results;
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gera nome único para arquivo
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';

  const baseName = prefix ? `${prefix}_` : '';
  return `${baseName}${timestamp}_${random}.${extension}`;
}

/**
 * Cria URL de preview para arquivo
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Limpa URL de preview
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Converte File para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Erro ao converter arquivo para base64'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extrai metadados da imagem
 */
export async function extractImageMetadata(file: File): Promise<{
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileSize: number;
  fileName: string;
  mimeType: string;
  lastModified: Date;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = createPreviewUrl(file);

    img.onload = () => {
      const metadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        fileSize: file.size,
        fileName: file.name,
        mimeType: file.type,
        lastModified: new Date(file.lastModified)
      };

      revokePreviewUrl(url);
      resolve(metadata);
    };

    img.onerror = () => {
      revokePreviewUrl(url);
      resolve({
        fileSize: file.size,
        fileName: file.name,
        mimeType: file.type,
        lastModified: new Date(file.lastModified)
      });
    };

    img.src = url;
  });
}
