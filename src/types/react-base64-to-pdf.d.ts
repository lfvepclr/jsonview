declare module 'react-base64-to-pdf' {
  import { CSSProperties } from 'react'

  export interface PDFPreviewProps {
    base64: string
    style?: CSSProperties
    width?: string | number
    height?: string | number
  }

  export interface PDFDownloadButtonProps {
    base64: string
    downloadFileName?: string
    children?: React.ReactNode
  }

  export interface PDFInfoProps {
    base64: string
  }

  export const PDFPreview: React.FC<PDFPreviewProps>
  export const PDFDownloadButton: React.FC<PDFDownloadButtonProps>
  export const PDFInfo: React.FC<PDFInfoProps>
}
