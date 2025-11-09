import {useCallback, useState} from 'react';

/**
 * 自定义钩子用于处理展开状态
 *
 * 提供统一的展开状态管理功能
 */
export const useExpand = (initialState: boolean = false) => {
    const [isExpanded, setIsExpanded] = useState(initialState);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const expand = useCallback(() => {
        setIsExpanded(true);
    }, []);

    const collapse = useCallback(() => {
        setIsExpanded(false);
    }, []);

    return {
        isExpanded,
        toggleExpand,
        expand,
        collapse
    };
};