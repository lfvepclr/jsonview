import {JSONValue} from '../../types';

/**
 * 节点类型枚举
 * 支持所有已知的数据类型
 */
export type NodeType =
    | 'json'      // JSON 字符串或对象
    | 'xml'       // XML 字符串
    | 'image'     // 图片 URL
    | 'url'       // 普通 URL
    | 'base64-image' // Base64 图片
    | 'base64-pdf'   // Base64 PDF
    | 'array'     // 数组
    | 'object'    // 对象
    | 'string'    // 字符串
    | 'number'    // 数值
    | 'boolean'   // 布尔值
    | 'null';     // null 值

/**
 * 复合类型和简单类型分类
 */
export type CompositeType = 'json' | 'xml' | 'array' | 'object';
export type SimpleType = 'image' | 'url' | 'base64-image' | 'base64-pdf' | 'string' | 'number' | 'boolean' | 'null';

/**
 * 视图组件基础接口
 * 所有类型视图组件都应该实现此接口
 */
export interface ViewComponentProps {
    /** 要渲染的数据 */
    data: JSONValue;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
    /** 渲染子节点的函数 - 复合类型使用此函数递归渲染子节点 */
    renderChild: (data: JSONValue, path: string, depth: number) => React.ReactNode;
}

/**
 * 类型检测函数接口
 */
export interface TypeDetector {
    (data: any): NodeType;
}

/**
 * 视图组件注册表接口
 */
export interface ViewRegistry {
    [key: string]: React.ComponentType<ViewComponentProps>;
}

/**
 * 渲染配置接口
 */
export interface RenderConfig {
    /** 最大渲染深度，防止无限递归 */
    maxDepth?: number;
    /** 是否默认展开容器节点 */
    defaultExpand?: boolean;
    /** 自定义类型检测器 */
    customDetectors?: TypeDetector[];
    /** 自定义视图组件 */
    customViews?: ViewRegistry;
}