import React from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { generateImageFileName } from '../utils/fileNameGenerator'

// 内联 imageUtils 功能
const base64ToBlob = (base64: string, mimeType: string): Blob => {
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

interface InlineImagePreviewProps {
  base64Data: string
  imageType: string
  maxHeight?: number
}

export const InlineImagePreview: React.FC<InlineImagePreviewProps> = ({
  base64Data,
  imageType,
  maxHeight = 300
}) => {
  const handleDownload = () => {
    if (!base64Data) return
    
    const mimeType = `image/${imageType}`
    const blob = base64ToBlob(base64Data, mimeType)
    const filename = generateImageFileName(imageType)
    downloadFile(blob, filename)
  }

  const dataUrl = `data:image/${imageType};base64,${base64Data}`

  return (
    <div style={{
      overflow: 'hidden'
    }}>
      {/* 工具栏 - 下载按钮在左侧 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0px',
        marginBottom: '8px'
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
          {imageType.toUpperCase()} 图片预览
        </div>
      </div>

      {/* 图片内容 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        maxHeight: maxHeight,
        overflow: 'auto'
      }}>
        <img
          src={dataUrl}
          alt="Base64 预览"
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={(e) => {
            console.error('图片加载失败:', e)
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}
