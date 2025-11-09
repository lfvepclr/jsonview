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