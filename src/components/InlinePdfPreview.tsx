import React from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PDFPreview } from 'react-base64-to-pdf'
import { generatePdfFileName } from '../utils/fileNameGenerator'

interface InlinePdfPreviewProps {
  base64Data: string
  maxHeight?: number
}

export const InlinePdfPreview: React.FC<InlinePdfPreviewProps> = ({
  base64Data,
  maxHeight = 400
}) => {
  // 清理base64数据，确保格式正确
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '')

  const handleDownload = () => {
    if (!cleanBase64) return

    const filename = generatePdfFileName()
    // 创建下载链接
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${cleanBase64}`
    link.download = filename
    link.click()
  }

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
      backgroundColor: '#f9fafb'
    }}>
      {/* 工具栏 - 下载按钮在左侧 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Button
          size="small"
          type="text"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          style={{ fontSize: '12px' }}
        >
          下载
        </Button>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          PDF 预览
        </div>
      </div>

      {/* PDF 内容区域 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '12px',
        maxHeight: maxHeight,
        overflow: 'auto'
      }}>
        <div style={{ width: '100%' }}>
          <PDFPreview
            base64={cleanBase64}
            style={{
              width: '100%',
              height: `${maxHeight - 100}px`,
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      </div>
    </div>
  )
}
