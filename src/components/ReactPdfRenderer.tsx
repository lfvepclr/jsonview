import React, {useCallback, useState} from 'react';
import {Alert, Button, Space, Spin} from 'antd';
import {FullscreenOutlined, LeftOutlined, MinusOutlined, PlusOutlined, RightOutlined} from '@ant-design/icons';
import {Document, Page} from 'react-pdf';
// 引入 react-pdf 所需的样式文件，解决 TextLayer 和 AnnotationLayer 警告
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface ReactPdfRendererProps {
    base64Data: string;
    maxHeight?: string;
    showControls?: boolean;
    onError?: (error: Error) => void;
}

const ReactPdfRenderer: React.FC<ReactPdfRendererProps> = ({
                                                               base64Data,
                                                               maxHeight = '700px',
                                                               showControls = true,
                                                               onError
                                                           }) => {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [scale, setScale] = useState(1.0);



    // 清理base64数据，确保格式正确
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const dataUrl = `data:application/pdf;base64,${cleanBase64}`;

    const onDocumentLoadSuccess = useCallback(({numPages}: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError('');
    }, []);

    const onDocumentLoadError = useCallback((error: Error) => {
        const errorMessage = error.message || 'Failed to load PDF document';
        setError(errorMessage);
        setLoading(false);
        onError?.(new Error(errorMessage));
    }, [onError]);

    const handleReload = useCallback(() => {
        setLoading(true);
        setError('');
        setPageNumber(1);
        setNumPages(undefined);
    }, []);

    const handleFullscreen = useCallback(() => {
        // 创建新窗口预览，复用原有的Blob URL逻辑
        try {
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], {type: 'application/pdf'});
            const blobUrl = URL.createObjectURL(blob);

            const newWindow = window.open(blobUrl, '_blank');
            if (newWindow) {
                newWindow.addEventListener('beforeunload', () => {
                    URL.revokeObjectURL(blobUrl);
                });
            }
        } catch (error) {
            console.error('全屏预览失败:', error);
            onError?.(new Error('全屏预览失败'));
        }
    }, [cleanBase64, onError]);

    const goToPrevPage = useCallback(() => {
        setPageNumber(page => Math.max(1, page - 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber(page => Math.min(numPages || 1, page + 1));
    }, [numPages]);

    const zoomIn = useCallback(() => {
        setScale(scale => Math.min(2.0, scale + 0.2));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(scale => Math.max(0.5, scale - 0.2));
    }, []);

    if (error) {
        return (
            <div style={{padding: '16px'}}>
                <Alert
                    message="PDF 预览失败"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={handleReload}>
                            重试
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div >
            {showControls && (
                <div style={{
                    padding: '8px',
                    borderBottom: '1px solid #d9d9d9',
                    background: '#fafafa'
                }}>
                    <Space>
                        <Button
                            size="small"
                            icon={<FullscreenOutlined/>}
                            onClick={handleFullscreen}
                            disabled={loading}
                        >
                            全屏
                        </Button>
                        {numPages && numPages > 1 && (
                            <>
                                <Button
                                    size="small"
                                    icon={<LeftOutlined/>}
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                >
                                    上一页
                                </Button>
                                <span style={{fontSize: '12px', margin: '0 8px'}}>
                  {pageNumber} / {numPages}
                </span>
                                <Button
                                    size="small"
                                    icon={<RightOutlined/>}
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                >
                                    下一页
                                </Button>
                            </>
                        )}
                        <Button size="small" icon={<MinusOutlined/>} onClick={zoomOut} disabled={scale <= 0.5}>
                            缩小
                        </Button>
                        <span style={{fontSize: '12px', margin: '0 4px'}}>
              {Math.round(scale * 100)}%
            </span>
                        <Button size="small" icon={<PlusOutlined/>} onClick={zoomIn} disabled={scale >= 2.0}>
                            放大
                        </Button>
                    </Space>
                </div>
            )}

            <div style={{
                position: 'relative',
                maxHeight: maxHeight,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'flex-start',
                padding: '16px',
                backgroundColor: '#f5f5f5',
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        // left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    }}>
                        <Spin size="large"/>
                    </div>
                )}

                <Document
                    file={dataUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<Spin size="large"/>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>
        </div>
    );
};

export default ReactPdfRenderer;