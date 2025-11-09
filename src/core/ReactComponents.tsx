/**
 * React 组件用于替代直接 DOM 操作
 *
 * 包含用于处理 UI 交互的 React 组件
 */
import React, {useState} from 'react';

// URL 类型枚举
type URLType = 'image' | 'link' | 'none';

interface ImageFloatProps {
    imageUrl: string;
    onClose: () => void;
}

interface URLActionButtonProps {
    value: any;
    onImagePreview: (imageUrl: string) => void;
    onLinkOpen: (url: string) => void;
}

/**
 * 检查 URL 类型
 *
 * @param value - 要检查的值
 * @returns URL 类型
 */
const checkURLType = (value: any): URLType => {
    if (typeof value !== 'string' || !/^https?:\/\//.test(value)) return 'none';

    const fileExtension = value.split('.').pop()?.split(/#|\?/)[0] || '';
    const isImage = /jpg|jpeg|png|gif|webp|svg|bmp|ico/.test(fileExtension);

    return isImage ? 'image' : 'link';
};

/**
 * 图片预览浮层组件
 *
 * React 组件替代直接的 DOM 操作
 */
export const ImageFloat: React.FC<ImageFloatProps> = ({
                                                          imageUrl,
                                                          onClose
                                                      }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div
            className="image-float-layer"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="image-float-header">
                <span>图片预览</span>
                <button
                    className="image-close-btn"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
            <div className="image-float-body">
                {isLoading && <div style={{textAlign: 'center', padding: '20px'}}>正在加载图片...</div>}
                {hasError && <div style={{color: '#f44336', textAlign: 'center', padding: '20px'}}>图片加载失败</div>}
                <img
                    src={imageUrl}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        display: isLoading || hasError ? 'none' : 'block'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>
            <div className="image-url-display" title={imageUrl}>
                {imageUrl}
            </div>
        </div>
    );
};

/**
 * URL 操作按钮组件
 *
 * React 组件替代直接的 DOM 操作
 */
export const URLActionButton: React.FC<URLActionButtonProps> = ({value, onImagePreview, onLinkOpen}) => {
    const urlType = checkURLType(value);

    if (urlType === 'none') return null;

    const isImage = urlType === 'image';

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isImage) {
            onImagePreview(value);
        } else {
            onLinkOpen(value);
        }
    };

    return (
        <span
            className={isImage ? 'copyBtn image-preview-btn' : 'copyBtn'}
            title={isImage ? '查看图片' : '在新窗口打开'}
            onClick={handleClick}
        >
      {isImage ? '🖼️' : '🔗'}
    </span>
    );
};

// 从单独的文件导入展开组件
export {XMLStringExpander, JSONStringExpander, EmbeddedJSON} from './ExpanderComponents';