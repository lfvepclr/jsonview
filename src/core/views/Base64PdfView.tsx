import React, { useState } from 'react';
import { ViewComponentProps } from '../types';
import { lastKey } from '../../utils';
import { copyPresets, useCopy } from '../../hooks';
import { InlinePdfPreview } from '../../components/InlinePdfPreview';

/**
 * Base64 PDF 视图组件
 * 支持层级显示、展开收缩和嵌入式PDF预览
 */
export const Base64PdfView: React.FC<ViewComponentProps> = ({
    data,
    path,
    depth
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (typeof data !== 'string') {
        return null;
    }

    const keyName = lastKey(path);
    const cleanBase64 = data.replace(/^data:application\/pdf;base64,/, '');
    const fileSizeKB = Math.round(data.length / 1024);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 使用统一的复制功能Hook - 确保复制完整的原始字符串并保留转义字符
    const { handleCopy } = useCopy(copyPresets.base64(data));

    return (
        <div className="node" data-depth={depth}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* PDF标题区域 */}
                <div className="key-container expandable-key" onClick={toggleExpand}>
                    <span className="expand-btn">{isExpanded ? '▼' : '▶'}</span>
                    <span className="key">
                        {path === '$' ? '' : keyName + ': '}
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>PDF</span>
                        <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '4px' }}>
                            ({fileSizeKB}KB)
                        </span>
                        <span style={{ color: '#6b7280', marginLeft: '8px' }}>:</span>
                    </span>
                </div>

                {/* Value显示和复制区域 */}
                <div className="value-container copyable" onClick={handleCopy} style={{
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                }}>
                    <span style={{
                        color: '#374151',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                    }}>
                        {data.length > 50 ? data.substring(0, 50) + '...' : data}
                    </span>
                </div>
            </div>

            {/* 展开内容区域 */}
            {isExpanded && (
                <div className="children-wrapper">
                    {/* PDF预览 */}
                    <div style={{ marginBottom: '12px' }}>
                        <InlinePdfPreview base64Data={cleanBase64} maxHeight={300} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Base64PdfView;