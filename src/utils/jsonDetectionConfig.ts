/**
 * JSON检测配置文件
 *
 * 包含JSON检测相关的配置参数、策略设置和工具函数
 * 用于支持helperUtils.ts中的looksLikeJSON函数
 */

/**
 * JSON检测配置接口
 */
export interface JsonDetectionConfig {
    /** 是否启用缓存机制 */
    enableCache: boolean;
    /** 缓存最大条目数 */
    maxCacheSize: number;
    /** 最大字符串长度限制（超过此长度将进行性能优化） */
    maxStringLength: number;
    /** 快速检查的最小字符串长度 */
    minQuickCheckLength: number;
    /** 是否启用详细日志 */
    enableVerboseLogging: boolean;
    /** 检测策略配置 */
    strategies: JsonDetectionStrategies;
}

/**
 * JSON检测策略配置
 */
export interface JsonDetectionStrategies {
    /** 是否启用快速格式检查 */
    enableQuickFormatCheck: boolean;
    /** 是否启用JSON解析验证 */
    enableParseValidation: boolean;
    /** 是否启用容错检测 */
    enableFallbackValidation: boolean;
    /** 是否启用HTML实体解码 */
    enableHtmlEntityDecoding: boolean;
    /** 是否启用CDATA处理 */
    enableCdataProcessing: boolean;
    /** 是否启用正则表达式修复 */
    enableRegexFixes: boolean;
    /** 是否启用分段解析 */
    enableSegmentParsing: boolean;
}

/**
 * 默认JSON检测配置 - 优化版本，针对复杂JSON字符串
 */
export const JSON_DETECTION_CONFIG: JsonDetectionConfig = {
    enableCache: true,
    maxCacheSize: 1500, // 增加缓存大小以支持更多复杂字符串
    maxStringLength: 15000, // 增加最大字符串长度限制
    minQuickCheckLength: 2,
    enableVerboseLogging: false,
    strategies: {
        enableQuickFormatCheck: true,
        enableParseValidation: true,
        enableFallbackValidation: true,
        enableHtmlEntityDecoding: true, // 重要：支持HTML实体解码
        enableCdataProcessing: true,
        enableRegexFixes: true,
        enableSegmentParsing: true
    }
};

/**
 * 性能优化配置
 * 用于处理大型JSON字符串时的性能优化
 */
export const PERFORMANCE_CONFIG = {
    /** 大字符串阈值 */
    largeStringThreshold: 5000,
    /** 超大字符串阈值 */
    extraLargeStringThreshold: 20000,
    /** 快速检查采样长度 */
    quickCheckSampleLength: 500,
    /** 分段解析块大小 */
    segmentParseChunkSize: 1000
};

/**
 * HTML实体映射表
 * 用于HTML实体解码 - 增强版本，支持更多实体
 */
export const HTML_ENTITIES: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&#39;': "'",
    '&#34;': '"',
    '&#x27;': "'",
    '&#x22;': '"',
    '&#60;': '<',
    '&#62;': '>',
    '&#38;': '&',
    '&#x3C;': '<',
    '&#x3E;': '>',
    '&#x26;': '&'
};

/**
 * 常见JSON修复模式
 * 用于正则表达式修复策略
 */
export const JSON_FIX_PATTERNS = [
    {
        name: 'unquoted-keys',
        pattern: /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
        replacement: '$1"$2":'
    },
    {
        name: 'single-quotes',
        pattern: /:\s*'([^']*)'/g,
        replacement: ':"$1"'
    },
    {
        name: 'trailing-commas',
        pattern: /,(\s*[}\]])/g,
        replacement: '$1'
    },
    {
        name: 'missing-commas',
        pattern: /([}\]])(\s*)([{\[])/g,
        replacement: '$1,$2$3'
    }
];

/**
 * 转义字符修复配置
 */
export const ESCAPE_FIX_CONFIG = {
    /** 基本转义字符映射 */
    basicEscapes: {
        '\\"': '"',
        '\\\\': '\\',
        '\\n': '\n',
        '\\r': '\r',
        '\\t': '\t',
        '\\b': '\b',
        '\\f': '\f'
    },
    /** 多层转义修复模式 */
    multiLayerPatterns: [
        {pattern: /\\\\\\"/g, replacement: '\\"'},
        {pattern: /\\\\"/g, replacement: '"'},
        {pattern: /\\"/g, replacement: '"'},
        {pattern: /\\\\\\\\/g, replacement: '\\\\'},
        {pattern: /\\\\/g, replacement: '\\'}
    ]
};

/**
 * 缓存管理类
 */
export class JsonDetectionCache {
    private cache = new Map<string, boolean>();
    private maxSize: number;

    constructor(maxSize: number = JSON_DETECTION_CONFIG.maxCacheSize) {
        this.maxSize = maxSize;
    }

    /**
     * 获取缓存结果
     */
    get(key: string): boolean | undefined {
        return this.cache.get(key);
    }

    /**
     * 设置缓存结果
     */
    set(key: string, value: boolean): void {
        if (this.cache.size >= this.maxSize) {
            // 删除最旧的缓存项
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }

    /**
     * 清空缓存
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计信息
     */
    getStats(): { size: number; maxSize: number; hitRate?: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }
}

/**
 * 全局缓存实例
 */
export const globalJsonDetectionCache = new JsonDetectionCache();

/**
 * JSON检测工具函数
 */
export const JsonDetectionUtils = {
    /**
     * 检查字符串是否可能是JSON格式（快速检查）
     */
    quickFormatCheck(str: string): boolean {
        if (!str || str.length < JSON_DETECTION_CONFIG.minQuickCheckLength) {
            return false;
        }

        const trimmed = str.trim();
        const firstChar = trimmed.charAt(0);
        const lastChar = trimmed.charAt(trimmed.length - 1);

        // 检查是否以JSON的开始和结束字符开头/结尾
        return (
            (firstChar === '{' && lastChar === '}') ||
            (firstChar === '[' && lastChar === ']') ||
            (firstChar === '"' && lastChar === '"' && trimmed.length > 2)
        );
    },

    /**
     * 解码HTML实体
     */
    decodeHtmlEntities(str: string): string {
        let decoded = str;

        // 处理命名实体
        for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
            decoded = decoded.replace(new RegExp(entity, 'g'), char);
        }

        // 处理数字实体
        decoded = decoded.replace(/&#(\d+);/g, (_, num) =>
            String.fromCharCode(parseInt(num, 10))
        );

        // 处理十六进制实体
        decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );

        return decoded;
    },

    /**
     * 处理CDATA内容
     */
    processCdataContent(str: string): string {
        return str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, (_, content) => {
            return content
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .trim();
        });
    },

    /**
     * 应用JSON修复模式
     */
    applyFixPatterns(str: string): string {
        let fixed = str;

        for (const pattern of JSON_FIX_PATTERNS) {
            fixed = fixed.replace(pattern.pattern, pattern.replacement);
        }

        return fixed;
    },

    /**
     * 修复转义字符
     */
    fixEscapeCharacters(str: string): string {
        let fixed = str;

        // 应用多层转义修复
        for (const {pattern, replacement} of ESCAPE_FIX_CONFIG.multiLayerPatterns) {
            fixed = fixed.replace(pattern, replacement);
        }

        return fixed;
    },

    /**
     * 获取字符串的哈希值（用于缓存键）
     */
    getStringHash(str: string): string {
        let hash = 0;
        if (str.length === 0) return hash.toString();

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }

        return hash.toString();
    },

    /**
     * 检查字符串是否需要性能优化处理
     */
    needsPerformanceOptimization(str: string): boolean {
        return str.length > PERFORMANCE_CONFIG.largeStringThreshold;
    },

    /**
     * 获取字符串采样（用于大字符串的快速检查）
     */
    getStringSample(str: string, sampleLength: number = PERFORMANCE_CONFIG.quickCheckSampleLength): string {
        if (str.length <= sampleLength) {
            return str;
        }

        const start = str.substring(0, sampleLength / 2);
        const end = str.substring(str.length - sampleLength / 2);
        return start + end;
    }
};

/**
 * 创建自定义JSON检测配置
 */
export function createJsonDetectionConfig(overrides: Partial<JsonDetectionConfig>): JsonDetectionConfig {
    return {
        ...JSON_DETECTION_CONFIG,
        ...overrides,
        strategies: {
            ...JSON_DETECTION_CONFIG.strategies,
            ...overrides.strategies
        }
    };
}

/**
 * 预设配置
 */
export const JSON_DETECTION_PRESETS = {
    /** 高性能配置（适用于大量数据处理） */
    highPerformance: createJsonDetectionConfig({
        enableCache: true,
        maxCacheSize: 5000,
        enableVerboseLogging: false,
        strategies: {
            enableQuickFormatCheck: true,
            enableParseValidation: true,
            enableFallbackValidation: false,
            enableHtmlEntityDecoding: false,
            enableCdataProcessing: false,
            enableRegexFixes: false,
            enableSegmentParsing: false
        }
    }),

    /** 高准确性配置（适用于复杂JSON处理） - 针对XML嵌套JSON优化 */
    highAccuracy: createJsonDetectionConfig({
        enableCache: true,
        maxCacheSize: 3000, // 增加缓存以支持复杂场景
        maxStringLength: 25000, // 支持更长的复杂字符串
        enableVerboseLogging: true,
        strategies: {
            enableQuickFormatCheck: true,
            enableParseValidation: true,
            enableFallbackValidation: true,
            enableHtmlEntityDecoding: true, // 关键：支持HTML实体解码
            enableCdataProcessing: true,
            enableRegexFixes: true,
            enableSegmentParsing: true
        }
    }),

    /** 轻量级配置（适用于简单场景） */
    lightweight: createJsonDetectionConfig({
        enableCache: false,
        maxCacheSize: 100,
        enableVerboseLogging: false,
        strategies: {
            enableQuickFormatCheck: true,
            enableParseValidation: true,
            enableFallbackValidation: false,
            enableHtmlEntityDecoding: false,
            enableCdataProcessing: false,
            enableRegexFixes: false,
            enableSegmentParsing: false
        }
    })
};