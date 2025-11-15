import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
import {lastKey} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';
import {InlineImagePreview} from '../../components/InlineImagePreview';

/**
 * Base64 图片视图组件
 * 支持层级显示、展开收缩和嵌入式图片预览
 */
export const Base64ImageView: React.FC<ViewComponentProps> = ({
                                                                  data,
                                                                  path,
                                                                  depth
                                                              }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (typeof data !== 'string') {
        return null;
    }

    const keyName = lastKey(path);

    // 提取图片类型和base64数据
    const match = data.match(/^data:image\/([^;]+);base64,/);
    const imageType = match ? match[1] : 'png';
    const cleanBase64 = data.replace(/^data:image\/[^;]+;base64,/, '');
    const fileSizeKB = Math.round(data.length / 1024);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 使用统一的复制功能Hook - 确保复制完整的原始字符串并保留转义字符
    const {handleCopy} = useCopy(copyPresets.base64(data));

    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                {/* 图片标题区域 */}
                <div className="key-container expandable-key" onClick={toggleExpand}>
                    <span className="expand-btn">{isExpanded ? '▼' : '▶'}</span>
                    <span className="key">
                        {path === '$' ? '' : keyName + ': '}
                        <span style={{color: '#7c3aed', fontWeight: 'bold'}}>
                            {imageType.toUpperCase()}
                        </span>
                        <span style={{color: '#6b7280', fontSize: '11px', marginLeft: '4px'}}>
                            ({fileSizeKB}KB)
                        </span>
                        <span style={{color: '#6b7280', marginLeft: '8px'}}>:</span>
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
                    {/* 图片预览 */}
                    <div style={{marginBottom: '12px'}}>
                        <InlineImagePreview
                            base64Data={cleanBase64}
                            imageType={imageType}
                            maxHeight={250}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Base64ImageView;