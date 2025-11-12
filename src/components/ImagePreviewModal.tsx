import React from 'react'
import { Modal, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import {generateImageFileName} from '../utils/fileNameGenerator'

// 内联 base64ToBlob 功能
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], {type: mimeType})
}

interface ImagePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    imageData: string
    imageType?: string
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        imageData,
                                                                        imageType = 'png'
                                                                    }) => {

    const handleDownload = () => {
        if (!imageData) return

        const blob = base64ToBlob(imageData, `image/${imageType}`)
        const filename = generateImageFileName(imageType)

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const imageUrl = `data:image/${imageType};base64,${imageData}`

    return (
        <Modal
            title="图片预览"
            open={isOpen}
            onCancel={onClose}
            width={1024}
            style={{ top: 20 }}
            styles={{
                body: {
                    maxHeight: 'calc(90vh - 110px)',
                    overflow: 'auto',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }}
            footer={[
                <Button
                    key="download"
                    type="primary"
                    icon={<DownloadOutlined />}
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
            <img
                src={imageUrl}
                alt="Preview"
                style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(70vh)',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
            />
        </Modal>
    )
}