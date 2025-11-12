import React, {useState} from 'react';
import { Modal } from 'antd';
import {ViewComponentProps} from '../types';
import {lastKey} from '../../utils';



/**
 * 图片视图组件
 * 专门处理图片 URL 的渲染和预览
 */
const ImageView: React.FC<ViewComponentProps> = ({
                                                     data,
                                                     path,
                                                     depth
                                                 }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const keyName = lastKey(path);
    const imageUrl = data as string;

    const handleImagePreview = () => {
        setIsLoading(true);
        setHasError(false);
        setIsModalOpen(true);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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

            <Modal
                title="图片预览"
                open={isModalOpen}
                onCancel={closeModal}
                width={1024}
                style={{ top: 20 }}
                styles={{
                    body: {
                        maxHeight: 'calc(90vh - 110px)',
                        overflow: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }}
                footer={null}
                destroyOnHidden
            >
                {isLoading && <div style={{textAlign: 'center', padding: '20px'}}>正在加载图片...</div>}
                {hasError && <div style={{color: '#f44336', textAlign: 'center', padding: '20px'}}>图片加载失败</div>}
                <img
                    src={imageUrl}
                    alt="Preview"
                    style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(70vh)',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: isLoading || hasError ? 'none' : 'block'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
                <div style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#6b7280',
                    wordBreak: 'break-all',
                    textAlign: 'center',
                    maxWidth: '100%'
                }} title={imageUrl}>
                    {imageUrl}
                </div>
            </Modal>
        </div>
    );
};

export default ImageView;