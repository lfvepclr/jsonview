// Base64 相关的类型定义

export type Base64DataType = 'image' | 'pdf' | 'unknown'

export type ImageType = 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'bmp' | 'svg'

export interface Base64DetectionResult {
  type: Base64DataType
  imageType?: ImageType
  isValid: boolean
  confidence: number
  details?: string
}

export interface Base64ValidationResult {
  isValid: boolean
  error?: string
  details?: string
  type?: Base64DataType
}

export interface Base64PreviewProps {
  base64Data: string
  className?: string
  onPreview?: () => void
  onDownload?: () => void
}

export interface Base64ImagePreviewProps extends Base64PreviewProps {
  imageType?: ImageType
}

export interface Base64PdfPreviewProps extends Base64PreviewProps {
  // PDF特有的属性可以在这里扩展
}

// Base64数据检测工具函数的类型
export interface Base64Detector {
  detectType: (data: string) => Base64DetectionResult
  isImage: (data: string) => boolean
  isPdf: (data: string) => boolean
  getImageType: (data: string) => ImageType | null
}

// 预览组件的通用接口
export interface PreviewComponentProps {
  isOpen: boolean
  onClose: () => void
}

export interface ImagePreviewComponentProps extends PreviewComponentProps {
  imageData: string
  imageType?: ImageType
}

export interface PdfPreviewComponentProps extends PreviewComponentProps {
  base64Data: string
}

// Hook返回值类型
export interface UseImagePreviewReturn {
  isModalOpen: boolean
  imageData: string
  imageType: string
  openImageModal: (base64Data: string, type?: string) => void
  closeImageModal: () => void
}

export interface UsePdfPreviewReturn {
  isModalOpen: boolean
  pdfData: string
  openPdfModal: (base64Data: string) => void
  closePdfModal: () => void
  error: string | null
}

// 文件下载相关类型
export interface DownloadOptions {
  filename?: string
  mimeType?: string
}

export interface Base64DownloadHandler {
  downloadImage: (base64Data: string, imageType: ImageType, options?: DownloadOptions) => void
  downloadPdf: (base64Data: string, options?: DownloadOptions) => void
}

// 错误处理类型
export interface Base64Error {
  type: 'validation' | 'render' | 'download' | 'network'
  message: string
  details?: string
  code?: string
}

// Base64工具类型
export interface Base64Utils {
  isValidBase64: (data: string) => boolean
  cleanBase64Data: (data: string) => string
  addDataPrefix: (data: string, mimeType: string) => string
  removeDataPrefix: (data: string) => string
  getDataUrlMimeType: (dataUrl: string) => string | null
}
