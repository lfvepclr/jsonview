import React, {useEffect, useState} from 'react';

/**
 * 复制提示组件的配置选项
 */
export interface CopyToastOptions {
    /** 提示文本 */
    text?: string;
    /** 显示位置 */
    position?: 'mouse' | 'center' | 'top-right';
    /** 显示持续时间（毫秒） */
    duration?: number;
    /** 鼠标位置（当position为'mouse'时使用） */
    mousePosition?: { x: number; y: number };
}

/**
 * 复制提示组件的Props
 */
interface CopyToastProps extends CopyToastOptions {
    /** 是否显示 */
    show: boolean;
    /** 关闭回调 */
    onClose: () => void;
}

/**
 * 复制成功提示组件
 *
 * 提供轻量级的复制成功提示，支持多种显示位置和自定义样式
 *
 * @example
 * // 基础用法
 * <CopyToast show={showToast} onClose={() => setShowToast(false)} />
 *
 * // 自定义位置和文本
 * <CopyToast
 *   show={showToast}
 *   text="复制成功！"
 *   position="top-right"
 *   onClose={() => setShowToast(false)}
 * />
 *
 * // 鼠标位置显示
 * <CopyToast
 *   show={showToast}
 *   position="mouse"
 *   mousePosition={{ x: 100, y: 200 }}
 *   onClose={() => setShowToast(false)}
 * />
 */
const CopyToast: React.FC<CopyToastProps> = ({
                                                 show,
                                                 text = '已复制',
                                                 position = 'center',
                                                 duration = 1500,
                                                 mousePosition,
                                                 onClose
                                             }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // 等待淡出动画完成
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show && !isVisible) {
        return null;
    }

    /**
     * 获取提示框的样式
     */
    const getToastStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: 'fixed',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            zIndex: 10000,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isVisible ? 1 : 0,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        };

        switch (position) {
            case 'center':
                return {
                    ...baseStyle,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                };

            case 'top-right':
                return {
                    ...baseStyle,
                    top: '20px',
                    right: '20px'
                };

            case 'mouse':
                if (mousePosition) {
                    return {
                        ...baseStyle,
                        top: mousePosition.y - 40,
                        left: mousePosition.x - 30,
                        transform: 'translateX(-50%)'
                    };
                }
                // 如果没有鼠标位置，降级到中心显示
                return {
                    ...baseStyle,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                };

            default:
                return baseStyle;
        }
    };

    return (
        <div style={getToastStyle()}>
            {text}
        </div>
    );
};

export default CopyToast;