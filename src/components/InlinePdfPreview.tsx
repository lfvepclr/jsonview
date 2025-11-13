import React from 'react'
import {Button} from 'antd'
import {DownloadOutlined} from '@ant-design/icons'
import {generatePdfFileName} from '../utils/fileNameGenerator'
import ReactPdfRenderer from './ReactPdfRenderer'

interface InlinePdfPreviewProps {
    base64Data: string
    maxHeight?: number
}

export const InlinePdfPreview: React.FC<InlinePdfPreviewProps> = ({
                                                                      base64Data,
                                                                      maxHeight = 500
                                                                  }) => {
    // 清理base64数据，确保格式正确
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '')
    const dataUrl = `data:application\/pdf;base64,${cleanBase64}`

    const handleDownload = () => {
        if (!cleanBase64) return

        const filename = generatePdfFileName()
        // 创建下载链接
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = filename
        link.click()
    }

    return (
        <div>
            {/* 工具栏 - 下载按钮在左侧 */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0px',
                marginBottom: '8px',
                borderBottom: '1px solid #d9d9d9',
            }}>
                <Button
                    size="small"
                    type="text"
                    icon={<DownloadOutlined/>}
                    onClick={handleDownload}
                    style={{fontSize: '12px'}}
                >
                    下载
                </Button>
                {/*<Button
                    size="small"
                    type="text"
                    icon={<EyeOutlined/>}
                    onClick={handlePreview}
                    style={{fontSize: '12px'}}
                >
                    新窗口预览
                </Button>*/}
                <div style={{fontSize: '12px', color: '#6b7280'}}>
                    PDF 文档
                </div>
            </div>

            {/* 内嵌PDF预览区域 - 默认展示 */}
            <div style={{
                marginTop: '8px'
            }}>
                <ReactPdfRenderer
                    base64Data={cleanBase64}
                    maxHeight={`${maxHeight}px`}
                    onError={(error) => {
                        console.error('PDF 渲染错误:', error)
                    }}
                />
            </div>
        </div>
    )
}