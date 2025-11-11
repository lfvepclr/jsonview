/**
 * URL 操作按钮组件
 *
 * React 组件替代直接的 DOM 操作
 */
import React from 'react';

// URL 类型枚举
type URLType = 'image' | 'link' | 'none';

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

export default URLActionButton;