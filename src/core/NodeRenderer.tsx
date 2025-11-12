import React from 'react';
import {JSONValue} from '../types';
import {TypeDetector} from './types';
import {
    ArrayView,
    Base64ImageView,
    Base64PdfView,
    ImageView,
    JsonView,
    ObjectView,
    PrimitiveView,
    UrlView,
    XmlView
} from './views';

/**
 * 新的节点渲染器接口
 */
export interface NodeRendererProps {
    /** 要渲染的数据 */
    data: JSONValue;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
}

/**
 * 新的节点渲染器组件
 *
 * 统一的渲染入口，负责：
 * 1. 类型检测和分发
 * 2. 递归渲染子节点
 * 3. 委托给具体的视图组件
 */
const NodeRenderer: React.FC<NodeRendererProps> = ({
                                                       data,
                                                       path,
                                                       depth,
                                                       onExpand
                                                   }) => {
    /**
     * 渲染子节点的函数
     * 复合类型使用此函数递归渲染子元素
     */
    const renderChild = (childData: JSONValue, childPath: string, childDepth: number): React.ReactNode => {
        return (
            <NodeRenderer
                data={childData}
                path={childPath}
                depth={childDepth}
                onExpand={onExpand}
            />
        );
    };

    // 检测数据类型
    const nodeType = TypeDetector.detectNodeType(data);

    // 构建视图组件的通用属性
    const viewProps = {
        data,
        path,
        depth,
        onExpand,
        renderChild
    };

    // 根据类型分发到对应的视图组件
    switch (nodeType) {
        case 'json':
            return <JsonView {...viewProps} />;

        case 'xml':
            return <XmlView {...viewProps} />;

        case 'image':
            return <ImageView {...viewProps} />;

        case 'url':
            return <UrlView {...viewProps} />;

        case 'base64-image':
            return <Base64ImageView {...viewProps} />;

        case 'base64-pdf':
            return <Base64PdfView {...viewProps} />;

        case 'array':
            return <ArrayView {...viewProps} />;

        case 'object':
            return <ObjectView {...viewProps} />;

        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
        default:
            return <PrimitiveView {...viewProps} />;
    }
};

/**
 * 创建节点渲染器的工厂函数
 */
export const createNodeRenderer = (
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void
) => {
    return (data: JSONValue, path: string, depth: number) => (
        <NodeRenderer
            data={data}
            path={path}
            depth={depth}
            onExpand={onExpand}
        />
    );
};

/**
 * 智能节点渲染器
 * 提供更灵活的渲染配置
 */
export const smartRenderNode = (
    data: JSONValue,
    path: string,
    depth: number,
    context: {
        onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
        maxDepth?: number;
    }
): React.ReactNode => {
    const {onExpand, maxDepth = 50} = context;

    // 防止无限递归
    if (depth > maxDepth) {
        return (
            <div className="max-depth-reached" style={{color: '#999', fontStyle: 'italic'}}>
                已达到最大渲染深度 ({maxDepth})
            </div>
        );
    }

    return (
        <NodeRenderer
            data={data}
            path={path}
            depth={depth}
            onExpand={onExpand}
        />
    );
};

/**
 * RenderNode 组件接口 - 向后兼容性
 *
 * 这是原 RenderNode 组件的接口定义，现在作为 NodeRenderer 的别名
 */
export interface RenderNodeProps {
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
 * RenderNode 组件 - 向后兼容性别名
 *
 * 这是原 RenderNode 组件的实现，现在作为 NodeRenderer 的别名
 * 主要职责：
 * 1. 作为渲染系统的主入口（向后兼容）
 * 2. 将所有渲染任务委托给 NodeRenderer
 * 3. 支持复合类型的递归渲染
 * 4. 统一渲染流程：用户输入 -> NodeRenderer检查类型 -> 委托具体视图渲染
 */
export const RenderNode: React.FC<RenderNodeProps> = ({
                                                          data,
                                                          path = '$',
                                                          depth = 0,
                                                          onExpand
                                                      }) => {
    // 统一委托给 NodeRenderer 进行类型检测和渲染
    return (
        <NodeRenderer
            data={data}
            path={path}
            depth={depth}
            onExpand={onExpand}
        />
    );
};

export default NodeRenderer;