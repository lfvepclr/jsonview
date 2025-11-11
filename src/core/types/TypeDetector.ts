import {looksLikeJSON, looksLikeXML} from '../../utils';
import {CompositeType, NodeType, SimpleType} from './ViewTypes';

/**
 * 核心类型检测器
 * 统一的类型检测逻辑，所有渲染都通过此处进行类型判断
 */
export class TypeDetector {
    /**
     * 检测数据的具体类型
     * @param data 要检测的数据
     * @returns 数据的具体类型
     */
    static detectNodeType(data: any): NodeType {
        // null 值检测
        if (data === null) {
            return 'null';
        }

        // 基础类型检测
        if (typeof data === 'boolean') {
            return 'boolean';
        }

        if (typeof data === 'number') {
            return 'number';
        }

        // 字符串类型的细分检测
        if (typeof data === 'string') {
            // 检查是否为图片 URL
            if (this.isImageUrl(data)) {
                return 'image';
            }

            // 检查是否为普通 URL
            if (this.isUrl(data)) {
                return 'url';
            }

            // 检查是否为 JSON 字符串
            if (looksLikeJSON(data)) {
                return 'json';
            }

            // 检查是否为 XML 字符串
            if (looksLikeXML(data)) {
                return 'xml';
            }

            // 普通字符串
            return 'string';
        }

        // 对象类型检测
        if (typeof data === 'object') {
            // 数组类型
            if (Array.isArray(data)) {
                return 'array';
            }

            // 普通对象
            return 'object';
        }

        // 默认返回字符串类型
        return 'string';
    }

    /**
     * 判断是否为复合类型
     * 复合类型需要递归渲染子元素
     */
    static isCompositeType(nodeType: NodeType): nodeType is CompositeType {
        return ['json', 'xml', 'array', 'object'].includes(nodeType);
    }

    /**
     * 判断是否为简单类型
     * 简单类型为叶子节点，不需要递归
     */
    static isSimpleType(nodeType: NodeType): nodeType is SimpleType {
        return ['image', 'url', 'string', 'number', 'boolean', 'null'].includes(nodeType);
    }

    /**
     * 检查字符串是否为图片 URL
     */
    private static isImageUrl(str: string): boolean {
        if (typeof str !== 'string') return false;

        // 检查文件扩展名
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
        if (imageExtensions.test(str)) {
            return true;
        }

        // 检查 data URL
        if (str.startsWith('data:image/')) {
            return true;
        }

        return false;
    }

    /**
     * 检查字符串是否为 URL
     */
    private static isUrl(str: string): boolean {
        if (typeof str !== 'string') return false;

        try {
            new URL(str);
            return true;
        } catch {
            // 检查相对 URL 或简单的 URL 模式
            const urlPattern = /^(https?:\/\/|\/\/|\/|\w+:)/i;
            return urlPattern.test(str);
        }
    }

    /**
     * 获取类型的显示名称
     */
    static getTypeDisplayName(nodeType: NodeType): string {
        const displayNames: Record<NodeType, string> = {
            'json': 'JSON',
            'xml': 'XML',
            'image': 'Image',
            'url': 'URL',
            'array': 'Array',
            'object': 'Object',
            'string': 'String',
            'number': 'Number',
            'boolean': 'Boolean',
            'null': 'Null'
        };

        return displayNames[nodeType] || 'Unknown';
    }
}