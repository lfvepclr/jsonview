import React from 'react'
import {Button, Modal} from 'antd'
import {DownloadOutlined} from '@ant-design/icons'
import {generatePdfFileName} from '../utils/fileNameGenerator'
import ReactPdfRenderer from './ReactPdfRenderer'

// 内联 pdfUtils 功能
const base64ToBlob = (base64: string, mimeType: string = 'application/pdf'): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], {type: mimeType})
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


export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    base64Data
                                                                }) => {
    // 清理base64数据，确保格式正确
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '')

    const handleDownload = () => {
        if (!cleanBase64) return

        const blob = base64ToBlob(cleanBase64)
        const filename = generatePdfFileName()
        downloadFile(blob, filename)
    }

    return (
        <Modal
            title="PDF 预览"
            open={isOpen}
            onCancel={onClose}
            width={1024}
            style={{top: 20}}
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
                    icon={<DownloadOutlined/>}
                    onClick={handleDownload}
                >
                    下载
                </Button>,
                <Button key="close" onClick={onClose}>
                    关闭
                </Button>
            ]}
            destroyOnHidden
        >
            <ReactPdfRenderer
                base64Data={cleanBase64}
                maxHeight={`${Math.min(600, window.innerHeight - 200)}px`}
                showControls={true}
                onError={(error) => {
                    console.error('PDF 渲染错误:', error)
                }}
            />
        </Modal>
    )
}