/**
 * 工具函数模块
 *
 * 包含项目中使用的各种辅助函数
 */

/**
 * 获取值的类型
 *
 * @param v - 要检查的值
 * @returns 类型字符串 ('null' | 'str' | 'num' | 'bool' | '')
 */
export const classOf = (v: any): string => {
    if (v === null) return 'null';
    switch (typeof v) {
        case 'string':
            return 'str';
        case 'number':
            return 'num';
        case 'boolean':
            return 'bool';
        default:
            return '';
    }
};

/**
 * 检查字符串是否看起来像 JSON
 *
 * 通过检查字符串是否以 '{' 或 '[' 开头并以对应的 '}' 或 ']' 结尾来判断
 *
 * @param str - 要检查的字符串
 * @returns 如果字符串看起来像 JSON 则返回 true，否则返回 false
 */
export const looksLikeJSON = (str: string): boolean => {
    str = str.trim();
    return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'));
};

/**
 * 检查字符串是否看起来像 XML
 *
 * 通过检查字符串是否以 '<' 开头并以 '>' 结尾且包含 '</' 来判断
 *
 * @param str - 要检查的字符串
 * @returns 如果字符串看起来像 XML 则返回 true，否则返回 false
 */
export const looksLikeXML = (str: string): boolean => {
    str = str.trim();
    return str.startsWith('<') && str.endsWith('>') && str.includes('</');
};

/**
 * 构建路径
 *
 * 根据当前路径、键和是否为数组来构建新的路径
 *
 * @param currentPath - 当前路径
 * @param key - 键
 * @param isArray - 是否为数组
 * @returns 新的路径字符串
 */
export const buildPath = (currentPath: string, key: string, isArray: boolean): string => {
    if (currentPath === '$') {
        return isArray ? `$[${key}]` : `$.${key}`;
    } else {
        return isArray ? `${currentPath}[${key}]` : `${currentPath}.${key}`;
    }
};

/**
 * 获取路径中的最后一个键
 *
 * @param path - 路径字符串
 * @returns 最后一个键
 */
export const lastKey = (path: string): string => {
    const parts = path.split(/[.\[]/);
    const lastPart = parts.pop();
    return lastPart ? lastPart.replace(']', '') : '';
};

/**
 * 获取对象中值的最大长度
 *
 * 用于计算显示宽度
 *
 * @param obj - 要检查的对象
 * @returns 最大值的字符串长度
 */
export const getMaxValueLength = (obj: any): number => {
    let maxLength = 0;

    const traverse = (data: any) => {
        if (data === null || typeof data !== 'object') {
            maxLength = Math.max(maxLength, JSON.stringify(data).length);
        } else {
            Object.values(data).forEach(traverse);
        }
    };

    traverse(obj);
    return maxLength;
};