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
 * 应用程序的类型定义
 */

/**
 * JSON 值类型
 *
 * 表示任何有效的 JSON 值
 */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | JSONArray;

/**
 * JSON 对象类型
 *
 * 表示一个键值对对象，值可以是任何 JSON 值
 */
export interface JSONObject {
    [key: string]: JSONValue;
}

/**
 * JSON 数组类型
 *
 * 表示一个 JSON 值的数组
 */
export interface JSONArray extends Array<JSONValue> {
}

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