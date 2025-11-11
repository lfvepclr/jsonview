import {useCallback, useState} from 'react';
import {toast} from 'react-toastify';
import {copyToClipboard} from '../utils';

/**
 * 复制功能配置选项
 */
export interface UseCopyOptions {
    /** 要复制的数据 */
    data: any;
    /** 是否格式化JSON（带缩进） */
    formatJson?: boolean;
    /** 是否显示文字提示 */
    showToast?: boolean;
    /** 提示显示位置 */
    toastPosition?: 'mouse' | 'center' | 'top-right';
    /** 提示持续时间（毫秒） */
    toastDuration?: number;
    /** 复制成功回调 */
    onSuccess?: () => void;
    /** 复制失败回调 */
    onError?: (error: Error) => void;
    /** 视觉反馈持续时间（毫秒） */
    feedbackDuration?: number;
}

/**
 * 复制功能Hook返回值
 */
export interface UseCopyReturn {
    /** 复制处理函数 */
    handleCopy: (e: React.MouseEvent) => Promise<void>;
    /** 是否正在复制 */
    isCopying: boolean;
    /** 复制是否成功 */
    copySuccess: boolean;
    /** 是否显示提示 */
    showToast: boolean;
    /** 鼠标位置（用于提示定位） */
    mousePosition: { x: number; y: number } | null;
}

/**
 * 统一的复制功能Hook
 *
 * 提供统一的复制逻辑，支持不同数据类型的复制策略：
 * - 基础类型：直接复制JSON字符串值
 * - 对象/数组：复制格式化的JSON（可选带缩进）
 * - 字符串：复制原始字符串内容
 *
 * @param options - 复制配置选项
 * @returns 复制功能相关的状态和处理函数
 *
 * @example
 * // 基础用法
 * const { handleCopy } = useCopy({ data: someData });
 *
 * // 格式化JSON复制
 * const { handleCopy } = useCopy({
 *   data: objectData,
 *   formatJson: true
 * });
 *
 * // 带回调的复制
 * const { handleCopy, copySuccess } = useCopy({
 *   data: stringData,
 *   onSuccess: () => console.log('复制成功'),
 *   onError: (error) => console.error('复制失败', error)
 * });
 */
export const useCopy = (options: UseCopyOptions): UseCopyReturn => {
    const {
        data,
        formatJson = false,
        showToast = true,
        toastPosition = 'bottom-center',
        toastDuration = 2000,
        onSuccess,
        onError,
        feedbackDuration = 1000
    } = options;

    const [isCopying, setIsCopying] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showToastState, setShowToastState] = useState(false);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

    /**
     * 获取要复制的文本内容
     */
    const getCopyText = useCallback((data: any): string => {
        if (typeof data === 'string') {
            return data;
        }

        if (formatJson && (typeof data === 'object' && data !== null)) {
            return JSON.stringify(data, null, 2);
        }

        return JSON.stringify(data);
    }, [formatJson]);

    /**
     * 添加视觉反馈
     */
    const addVisualFeedback = useCallback((target: HTMLElement) => {
        if (!target) return;

        target.classList.add('copied');
        setTimeout(() => {
            if (target && target.classList) {
                target.classList.remove('copied');
            }
        }, feedbackDuration);
    }, [feedbackDuration]);

    /**
     * 复制处理函数
     */
    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isCopying) return;

        setIsCopying(true);
        setCopySuccess(false);
        setShowToastState(false);

        // 记录鼠标位置用于提示定位
        if (toastPosition === 'mouse') {
            setMousePosition({x: e.clientX, y: e.clientY});
        }

        try {
            const copyText = getCopyText(data);
            const success = await copyToClipboard(copyText);

            if (success) {
                setCopySuccess(true);

                // 添加视觉反馈
                const target = e.currentTarget as HTMLElement;
                if (target) {
                    addVisualFeedback(target);
                }

                // 显示文字提示
                if (showToast) {
                    toast.success('已复制到剪贴板', {
                        position: 'bottom-center',
                        autoClose: toastDuration,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'light',
                    });
                }

                onSuccess?.();
            } else {
                throw new Error('复制到剪贴板失败');
            }
        } catch (error) {
            setCopySuccess(false);
            const err = error instanceof Error ? error : new Error('未知复制错误');

            if (showToast) {
                toast.error('复制失败：' + err.message, {
                    position: 'bottom-center',
                    autoClose: toastDuration,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'light',
                });
            }

            onError?.(err);
            console.error('复制失败:', err.message);
        } finally {
            setIsCopying(false);

            // 重置成功状态
            setTimeout(() => {
                setCopySuccess(false);
            }, feedbackDuration);

            // 重置提示状态
            setTimeout(() => {
                setShowToastState(false);
                setMousePosition(null);
            }, toastDuration);
        }
    }, [data, isCopying, getCopyText, addVisualFeedback, onSuccess, onError, feedbackDuration, showToast, toastPosition, toastDuration]);

    return {
        handleCopy,
        isCopying,
        copySuccess,
        showToast: showToastState,
        mousePosition
    };
};

/**
 * 预设的复制配置
 */
export const copyPresets = {
    /** 基础类型复制配置 */
    primitive: (data: any): UseCopyOptions => ({
        data,
        formatJson: false
    }),

    /** 对象复制配置（格式化） */
    object: (data: any): UseCopyOptions => ({
        data,
        formatJson: true
    }),

    /** 数组复制配置（格式化） */
    array: (data: any): UseCopyOptions => ({
        data,
        formatJson: true
    }),

    /** 字符串复制配置 */
    string: (data: string): UseCopyOptions => ({
        data,
        formatJson: false
    })
};