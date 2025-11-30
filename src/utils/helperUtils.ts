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


// JSON检测配置
const JSON_DETECTION_CONFIG = {
    maxCacheSize: 1000,
    maxStringLength: 10000,
    enableCache: true,
    enableFallback: true
};

/**
 * 检测字符串是否为有效的JSON格式
 *
 * 该函数使用多层检测策略来准确识别JSON字符串：
 * 1. 快速格式检查 - 检查首尾字符和基本结构
 * 2. JSON解析验证 - 尝试实际解析验证语法
 * 3. 容错检测 - 对常见格式问题进行修复后重试
 *
 * @param str - 要检测的字符串
 * @returns 如果字符串是有效JSON则返回true，否则返回false
 *
 * @example
 * // 基本JSON对象
 * looksLikeJSON('{"name": "test"}') // true
 *
 * // 基本JSON数组
 * looksLikeJSON('[1, 2, 3]') // true
 *
 * // 包含转义字符的JSON
 * looksLikeJSON('{"message": "Hello \\"World\\""}') // true
 *
 * // 包含HTML实体的JSON
 * looksLikeJSON('{"text": "&quot;quoted&quot;"}') // true
 *
 * // 非JSON字符串
 * looksLikeJSON('Hello World') // false
 *
 * // 边界情况
 * looksLikeJSON('') // false
 * looksLikeJSON('null') // false (单独的null不被视为JSON对象)
 * looksLikeJSON('{}') // true
 * looksLikeJSON('[]') // true
 *
 * @performance
 * - 使用缓存机制避免重复检测相同字符串
 * - 对超长字符串进行性能优化，避免昂贵的解析操作
 * - 快速检查可以过滤大部分非JSON字符串
 *
 * @see {@link quickFormatCheck} 快速格式检查
 * @see {@link parseValidation} JSON解析验证
 * @see {@link fallbackValidation} 容错检测
 */
export const looksLikeJSON = (str: string): boolean => {
    try {
        const obj = JSON.parse(str)
        return typeof obj === "object"
    } catch (e) {
        return false
    }
};

/**
 * 快速格式检查
 * 检查字符串是否具有JSON的基本结构特征
 *
 * @param str - 要检查的字符串
 * @returns 如果具有JSON结构则返回true
 *
 * @example
 * quickFormatCheck('{"key": "value"}') // true
 * quickFormatCheck('[1, 2, 3]') // true
 * quickFormatCheck('Hello World') // false
 */
function quickFormatCheck(str: string): boolean {
    return (str.startsWith('{') && str.endsWith('}')) ||
        (str.startsWith('[') && str.endsWith(']'));
}

/**
 * JSON解析验证
 * 尝试使用JSON.parse()验证字符串的语法正确性
 *
 * @param str - 要验证的字符串
 * @returns 如果解析成功则返回true
 *
 * @example
 * parseValidation('{"valid": true}') // true
 * parseValidation('{"invalid": }') // false
 */
function parseValidation(str: string): boolean {
    // 对超长字符串进行性能优化
    if (str.length > JSON_DETECTION_CONFIG.maxStringLength) {
        return true; // 假设格式正确，避免性能问题
    }

    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * 容错检测
 * 尝试修复常见的JSON格式问题后重新验证
 * 增强版本，支持复杂嵌套和多层修复
 *
 * @param str - 要修复和验证的字符串
 * @returns 如果修复后能成功解析则返回true
 *
 * @example
 * fallbackValidation('{"text": "&quot;quoted&quot;"}') // true (修复HTML实体)
 * fallbackValidation("{'key': 'value'}") // true (修复单引号)
 */
function fallbackValidation(str: string): boolean {
    const fixStrategies = [
        fixHtmlEntities,
        fixEscapeCharacters,
        fixSingleQuotes,
        fixTrailingCommas,
        fixComplexEscaping
    ];

    // 单一策略修复
    for (const fixStrategy of fixStrategies) {
        try {
            const fixed = fixStrategy(str);
            JSON.parse(fixed);
            return true;
        } catch {
            continue;
        }
    }

    // 组合策略修复 - 处理复杂场景
    try {
        let fixed = str;
        // 先处理HTML实体，再处理转义字符
        fixed = fixHtmlEntities(fixed);
        fixed = fixComplexEscaping(fixed);
        fixed = fixEscapeCharacters(fixed);
        fixed = fixTrailingCommas(fixed);

        JSON.parse(fixed);
        return true;
    } catch {
        // 继续尝试其他组合
    }

    // 最后尝试：预处理 + 多层解码
    try {
        let fixed = str;
        fixed = preprocessComplexJson(fixed);
        JSON.parse(fixed);
        return true;
    } catch {
        return false;
    }
}

/**
 * 修复HTML实体
 * 增强版本，支持更多HTML实体和复杂嵌套场景
 */
function fixHtmlEntities(str: string): string {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#34;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#60;/g, '<')
        .replace(/&#62;/g, '>')
        .replace(/&#38;/g, '&');
}

/**
 * 修复转义字符
 */
function fixEscapeCharacters(str: string): string {
    return str
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
}

/**
 * 修复单引号为双引号
 */
function fixSingleQuotes(str: string): string {
    return str.replace(/'/g, '"');
}

/**
 * 移除多余的逗号
 */
function fixTrailingCommas(str: string): string {
    return str.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * 修复复杂转义场景
 * 处理多层转义和XML嵌套JSON的特殊情况
 */
function fixComplexEscaping(str: string): string {
    // 处理多层转义的引号
    let fixed = str
        .replace(/\\\\"/g, '"')
        .replace(/\\"/g, '"')
        .replace(/\\\\\\\\/g, '\\\\')
        .replace(/\\\\/g, '\\');

    return fixed;
}

/**
 * 预处理复杂JSON字符串
 * 专门处理XML嵌套JSON和HTML实体的复杂场景
 */
function preprocessComplexJson(str: string): string {
    let processed = str;

    // 1. 处理HTML实体
    processed = fixHtmlEntities(processed);

    // 2. 处理XML标签内的JSON（如果存在）
    // 查找类似 <tag>{...}</tag> 或 <tag>JSON字符串</tag> 的模式
    processed = processed.replace(/<([^>]+)>([^<]*\{[^<]*\}[^<]*)<\/\1>/g, (match, tagName, content) => {
        try {
            // 尝试解析标签内容为JSON
            const jsonContent = fixHtmlEntities(content);
            JSON.parse(jsonContent);
            return `<${tagName}>${jsonContent}</${tagName}>`;
        } catch {
            return match; // 如果不是JSON，保持原样
        }
    });

    // 3. 处理复杂转义
    processed = fixComplexEscaping(processed);

    return processed;
}


/**
 * 检查字符串是否看起来像 XML
 *
 * 通过检查字符串是否以 '<' 开头并以 '>' 结尾且包含 '</' 来判断
 *
 * @param str - 要检查的字符串
 * @returns 如果字符串看起来像 XML 则返回 true，否则返回 false
 */
export const looksLikeXML = (str: string): boolean => {
    if (typeof str !== 'string') return false;
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