import React from 'react';
import {JSONValue} from '../types';
import {looksLikeJSON, looksLikeXML} from '../utils';
import LeafNode from './LeafNode';
import ContainerNode from './ContainerNode';
import JsonStringNode from './JsonStringNode';
import XmlStringNode from './XmlStringNode';

/**
 * RenderNode 组件 - JSON/XML 数据渲染器的主入口组件
 *
 * 此组件是整个渲染系统的核心协调器，负责根据数据类型将渲染任务分发给相应的专用组件。
 * 它实现了以下功能：
 * 1. 判断节点类型（容器节点、JSON字符串节点、XML字符串节点、普通叶子节点）
 * 2. 将渲染任务分发给对应的专用组件
 * 3. 提供递归渲染子节点的能力
 *
 * @component
 * @example
 * // 渲染一个简单的对象
 * <RenderNode data={{name: "John", age: 30}} />
 *
 * // 渲染一个包含嵌套JSON字符串的对象
 * <RenderNode data={{user: "{\"name\":\"John\"}"}} />
 */
interface RenderNodeProps {
    /** 要渲染的数据 */
    data: JSONValue;
    /** 当前节点的路径，默认为 '$' */
    path?: string;
    /** 当前节点的深度，默认为 0 */
    depth?: number;
    /** 是否默认展开容器节点，默认为 false */
    defaultExpand?: boolean;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
}

/**
 * RenderNode 组件
 *
 * 主要职责：
 * 1. 类型判断 - 确定当前数据应该由哪个组件渲染
 * 2. 任务分发 - 将渲染任务委托给专用组件
 * 3. 提供子节点渲染函数 - 支持递归渲染
 */
const RenderNode: React.FC<RenderNodeProps> = ({
                                                   data,
                                                   path = '$',
                                                   depth = 0,
                                                   defaultExpand = false,
                                                   onExpand
                                               }) => {
    /**
     * 渲染子节点的函数
     *
     * 该函数用于递归渲染子节点，确保所有层级的节点都能正确渲染。
     *
     * @param subData - 子节点数据
     * @param subPath - 子节点路径
     * @param subDepth - 子节点深度
     * @returns React 节点
     */
    const renderSubNode = (subData: JSONValue, subPath: string, subDepth: number) => (
        <RenderNode
            data={subData}
            path={subPath}
            depth={subDepth}
            defaultExpand={true}
            onExpand={onExpand}
        />
    );

    // 处理叶子节点
    if (data === null || typeof data !== 'object') {
        // 特殊处理 JSON 字符串
        if (typeof data === 'string' && looksLikeJSON(data)) {
            return (
                <JsonStringNode
                    data={data}
                    path={path}
                    depth={depth}
                    onExpand={onExpand}
                    renderSubNode={renderSubNode}
                />
            );
        }

        // 特殊处理 XML 字符串
        if (typeof data === 'string' && looksLikeXML(data)) {
            return (
                <XmlStringNode
                    data={data}
                    path={path}
                    depth={depth}
                    onExpand={onExpand}
                    renderSubNode={renderSubNode}
                />
            );
        }

        // 处理普通叶子节点
        return (
            <LeafNode
                data={data}
                path={path}
                depth={depth}
                onExpand={onExpand}
                renderSubNode={renderSubNode}
            />
        );
    }

    // 处理容器节点（对象或数组）
    return (
        <ContainerNode
            data={data}
            path={path}
            depth={depth}
            defaultExpand={defaultExpand}
            onExpand={onExpand}
            renderSubNode={renderSubNode}
        />
    );
};

export default RenderNode;