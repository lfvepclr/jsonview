import {useCallback, useState} from 'react';
import {FloatData} from '../types';

/**
 * 自定义钩子用于处理浮层数据状态
 *
 * 提供统一的浮层数据管理功能
 */
export const useFloatData = () => {
    const [floatData, setFloatData] = useState<FloatData | null>(null);

    const showFloatData = useCallback((path: string, data: any, type: 'json' | 'xml') => {
        setFloatData({path, data, type});
    }, []);

    const hideFloatData = useCallback(() => {
        setFloatData(null);
    }, []);

    return {
        floatData,
        showFloatData,
        hideFloatData
    };
};