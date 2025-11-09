import React, {useState} from 'react';
import {JSONValue} from '../types';
import {buildPath, lastKey} from '../utils';

/**
 * ContainerNode 组件 - 容器节点渲染器
 *
 * 此组件专门负责渲染对象和数组容器节点。
 * 它实现了以下功能：
 * 1. 渲染对象/数组的开始和结束符号
 * 2. 提供展开/收缩功能
 * 3. 渲染子节点列表
 *
 * @component
 */
interface ContainerNodeProps {
    /** 要渲染的数据（对象或数组） */
    data: JSONValue;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 是否默认展开 */
    defaultExpand: boolean;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
    /** 渲染子节点的函数 */
    renderSubNode: (data: JSONValue, path: string, depth: number) => React.ReactNode;
}

/**
 * ContainerNode 组件
 *
 * 主要职责：
 * 1. 渲染容器节点（对象或数组）
 * 2. 处理展开/收缩状态
 * 3. 渲染所有子节点
 */
const ContainerNode: React.FC<ContainerNodeProps> = ({
                                                         data,
                                                         path,
                                                         depth,
                                                         defaultExpand,
                                                         renderSubNode
                                                     }) => {
    /** 容器展开状态 */
    const [isExpanded, setIsExpanded] = useState(defaultExpand);

    /** 判断是否为数组 */
    const isArray = Array.isArray(data);

    /** 获取排序后的键列表 */
    const keys = isArray ? Object.keys(data || {}) : Object.keys(data || {}).sort();

    /**
     * 切换展开状态
     *
     * 点击容器标题时触发，切换子节点的可见性
     */
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="node" data-depth={depth}>
            {/**
             * 容器标题区域
             * 包含展开按钮和容器标识符
             */}
            <div className="key-container copyable expandable-key" onClick={toggleExpand}>
                <span className="expand-btn">{isExpanded ? '▼' : '▶'}</span>
                <span className="key">
          {(path === '$' ? '' : lastKey(path) + ': ') + (isArray ? '[' : '{')}
        </span>
            </div>

            {/**
             * 子节点区域
             * 仅在展开状态下渲染
             */}
            {isExpanded && (
                <div className="children-wrapper">
                    {keys.map((key) => (
                        <div key={key}>
                            {renderSubNode(
                                (data as any)[key],
                                buildPath(path, key, isArray),
                                depth + 1
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/**
             * 容器结束符号
             * 根据是否为数组显示 ']' 或 '}'
             */}
            <div className="end-symbol" style={{marginLeft: '16px'}}>
                {isArray ? ']' : '}'}
            </div>
        </div>
    );
};

export default ContainerNode;