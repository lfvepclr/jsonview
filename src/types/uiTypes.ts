/**
 * 数据类型枚举
 *
 * 用于 CSS 类名和样式
 */
export type DataType = 'str' | 'num' | 'bool' | 'null' | '';

/**
 * 路径详情接口
 *
 * 包含路径、数据和类型信息
 */
export interface PathDetail {
    path: string;
    data: any; // JSONValue causes circular dependency
    type: 'json' | 'xml';
}

/**
 * 浮层数据接口
 *
 * 用于浮层显示的数据结构
 */
export interface FloatData {
    path: string;
    data: any;
    type: 'json' | 'xml';
}