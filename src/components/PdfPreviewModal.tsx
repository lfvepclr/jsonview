import React, { useState } from 'react'
import { Modal, Button, Spin, Alert } from 'antd'
import { DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Document, Page, pdfjs } from 'react-pdf'
import { generatePdfFileName } from '../utils/fileNameGenerator'

// 配置PDF.js worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

// 内联 pdfUtils 功能
const base64ToBlob = (base64: string, mimeType: string = 'application/pdf'): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
}

const downloadFile = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  base64Data: string
}

interface PdfError {
  type: 'validation' | 'render' | 'network'
  message: string
  details: string
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  base64Data
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<PdfError | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)

  // react-pdf事件处理函数
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setCurrentPage(1)
    setIsLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 加载错误:', error)
    let errorMessage = 'PDF 加载失败'
    let errorDetails = error.message || '未知错误'

    // 提供更具体的错误信息
    if (error.message.includes('Invalid PDF')) {
      errorMessage = 'PDF 文件格式无效'
      errorDetails = '请确认提供的是有效的PDF文件'
    } else if (error.message.includes('Missing PDF')) {
      errorMessage = 'PDF 数据缺失'
      errorDetails = '未找到有效的PDF数据'
    } else if (error.message.includes('password')) {
      errorMessage = 'PDF 文件受密码保护'
      errorDetails = '无法预览受密码保护的PDF文件'
    }

    setError({
      type: 'render',
      message: errorMessage,
      details: errorDetails
    })
    setIsLoading(false)
  }

  // 构建PDF文件URL
  const pdfFile = `data:application/pdf;base64,${base64Data}`

  const handleDownload = () => {
    if (!base64Data) return
    
    const blob = base64ToBlob(base64Data)
    const filename = generatePdfFileName()
    downloadFile(blob, filename)
  }

  const ErrorDisplay: React.FC<{ error: PdfError }> = ({ error }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center'
    }}>
      <Alert
        message={error.message}
        description={error.details}
        type="error"
        icon={<ExclamationCircleOutlined />}
        showIcon
        style={{ marginBottom: '16px' }}
      />
      <Button type="primary" onClick={onClose}>
        关闭
      </Button>
    </div>
  )

  const LoadingDisplay: React.FC = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <Spin size="large" />
      <p style={{color: '#6b7280', marginTop: '16px'}}>正在加载 PDF...</p>
    </div>
  )

  return (
    <Modal
      title="PDF 预览"
      open={isOpen}
      onCancel={onClose}
      width={1024}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: 'calc(90vh - 110px)',
          overflow: 'auto',
          padding: '16px'
        }
      }}
      footer={[
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={isLoading || !!error}
        >
          下载
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      destroyOnHidden
    >
      {isLoading && <LoadingDisplay />}
      {error && <ErrorDisplay error={error} />}
      {!error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<LoadingDisplay />}
          >
            {numPages > 0 && (
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <Page
                  pageNumber={currentPage}
                  width={Math.min(900, window.innerWidth - 200)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            )}
          </Document>
          {numPages > 1 && (
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              第 {currentPage} 页 / 共 {numPages} 页
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}