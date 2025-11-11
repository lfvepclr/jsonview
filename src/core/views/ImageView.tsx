import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
import {lastKey} from '../../utils';

interface ImageFloatProps {
    imageUrl: string;
    onClose: () => void;
}

/**
 * 图片预览浮层组件
 *
 * React 组件替代直接的 DOM 操作
 */
const ImageFloat: React.FC<ImageFloatProps> = ({
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
 * 图片视图组件
 * 专门处理图片 URL 的渲染和预览
 */
const ImageView: React.FC<ViewComponentProps> = ({
                                                     data,
                                                     path,
                                                     depth
                                                 }) => {
    const [imageFloat, setImageFloat] = useState<{ isVisible: boolean; imageUrl: string } | null>(null);

    const keyName = lastKey(path);
    const imageUrl = data as string;

    const handleImagePreview = () => {
        setImageFloat({isVisible: true, imageUrl});
    };

    return (
        <div className="node" data-depth={depth}>
            <div className="value-container copyable">
                {keyName && path !== '$' && (
                    <span className="key">{keyName}: </span>
                )}
                <span className="str" onClick={handleImagePreview}
                      style={{cursor: 'pointer', textDecoration: 'underline'}} title="点击查看图片">"{imageUrl}"</span>
                <span
                    className="copyBtn image-preview-btn"
                    title="查看图片"
                    onClick={handleImagePreview}
                    style={{marginLeft: '4px'}}
                >
          🖼️
        </span>
            </div>

            {imageFloat && imageFloat.isVisible && (
                <ImageFloat
                    imageUrl={imageFloat.imageUrl}
                    onClose={() => setImageFloat(null)}
                />
            )}
        </div>
    );
};

export default ImageView;