/**
 * DOM 工具函数模块
 *
 * 包含项目中使用的各种 DOM 操作辅助函数
 */

/**
 * 检查元素是否在视口中
 *
 * @param element - 要检查的元素
 * @returns 如果元素在视口中则返回 true，否则返回 false
 */
export const isInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/**
 * 平滑滚动到元素
 *
 * @param element - 要滚动到的元素
 * @param offset - 偏移量
 */
export const smoothScrollTo = (element: HTMLElement, offset: number = 0): void => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = rect.top + scrollTop - offset;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
};

/**
 * 复制文本到剪贴板
 *
 * @param text - 要复制的文本
 * @returns Promise，成功时解析为 true，失败时解析为 false
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    }
};

/**
 * 创建并下载文件
 *
 * @param filename - 文件名
 * @param content - 文件内容
 * @param mimeType - MIME 类型
 */
export const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain'): void => {
    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * 防抖函数
 *
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout | null = null;
    return function (...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func.apply(this, args), wait);
    } as T;
};

/**
 * 节流函数
 *
 * @param func - 要节流的函数
 * @param limit - 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return function (...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    } as T;
};