import React, { useState } from 'react';
import { JSONValue } from '../types';
import { lastKey, looksLikeJSON, looksLikeXML } from '../utils';
import LeafNode from './LeafNode';
import XMLNode from './XMLNode';

/**
 * StringNode 组件 - 统一处理 JSON 和 XML 字符串的节点渲染器
 *
 * 此组件专门负责渲染包含 JSON 或 XML 字符串的节点。
 * 它实现了以下功能：
 * 1. 自动识别字符串内容是 JSON 还是 XML
 * 2. 根据内容类型选择合适的渲染组件
 * 3. 提供展开/收缩功能以查看解析后的内容结构
 * 4. 提供浮动层查看功能
 *
 * @component
 */
interface StringNodeProps {
    /** 字符串数据 */
    data: string;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
    /** 渲染子节点的函数 */
    renderSubNode: (data: JSONValue, path: string, depth: number) => React.ReactNode;
}

/**
 * StringNode 组件
 *
 * 主要职责：
 * 1. 渲染 JSON 或 XML 字符串节点
 * 2. 处理展开/收缩状态
 * 3. 提供浮动层查看功能
 */
const StringNode: React.FC<StringNodeProps> = ({
    data,
    path,
    depth,
    onExpand,
    renderSubNode
}) => {
    /** 展开状态 */
    const [isVisible, setIsVisible] = useState(false);

    /**
     * 处理浮层展开请求
     *
     * @param path - 数据路径
     * @param data - 要展开的数据
     * @param type - 数据类型
     */
    const handleExpand = (path: string, data: any, type: 'json' | 'xml') => {
        if (onExpand) {
            onExpand(path, data, type);
        }
    };

    /** 获取键名 */
    const keyName = lastKey(path);

    /** 切换展开状态 */
    const toggleExpand = () => {
        setIsVisible(!isVisible);
    };

    // 检查是否为 JSON 字符串
    const isJsonString = looksLikeJSON(data);
    
    // 检查是否为 XML 字符串
    const isXmlString = looksLikeXML(data);

    // 尝试解析 JSON 数据
    let parsedJsonData: any = null;
    let jsonParseError: Error | null = null;

    if (isJsonString) {
        // 递归修复转义字符的函数
        const fixEscapedCharacters = (str: string): string => {
            let fixedStr = str;
            
            // 逐步处理各种转义
            // 处理最外层的引号包裹
            if (fixedStr.startsWith('"') && fixedStr.endsWith('"')) {
                try {
                    // 尝试解析最外层引号
                    fixedStr = JSON.parse(fixedStr);
                } catch (e) {
                    // 如果失败，继续处理内部转义
                }
            }
            
            // 处理多层转义，从最外层开始
            fixedStr = fixedStr
                .replace(/\\\\\\\\"/g, '\\\\"')  // 四个反斜杠+引号 -> 两个反斜杠+引号
                .replace(/\\\\"/g, '"')         // 两个反斜杠+引号 -> 引号
                .replace(/\\\"/g, '"')           // 一个反斜杠+引号 -> 引号
                .replace(/&quot;/g, '"')          // HTML实体
                .replace(/&apos;/g, "'")          // HTML实体
                .replace(/&lt;/g, '<')             // HTML实体
                .replace(/&gt;/g, '>')             // HTML实体
                .replace(/&amp;/g, '&');           // HTML实体
            
            return fixedStr;
        };

        try {
            parsedJsonData = JSON.parse(data);
        } catch (e) {
            jsonParseError = e as Error;
        }

        // 如果解析失败，尝试修复常见的转义问题
        if (jsonParseError && data) {
            try {
                // 尝试多种修复策略

                // 策略1: 直接修复转义字符
                let fixedData = fixEscapedCharacters(data);
                parsedJsonData = JSON.parse(fixedData);
                jsonParseError = null;
            } catch (e1) {
                try {
                    // 策略2: 先尝试解码整个字符串，然后再修复
                    let decodedData = data;
                    try {
                        decodedData = JSON.parse(data); // 解码外层的转义
                    } catch (innerError) {
                        // 如果不能直接解析，就用原数据
                    }

                    // 再次尝试修复转义字符
                    let fixedData = fixEscapedCharacters(decodedData);
                    parsedJsonData = JSON.parse(fixedData);
                    jsonParseError = null;
                } catch (e2) {
                    // 策略3: 尝试逐步清理转义字符
                    try {
                        let cleanedData = data
                            .replace(/^"/, '')                      // 移除外层开头引号
                            .replace(/"$/, '')                      // 移除外层结尾引号
                            .replace(/\\"/g, '"')                   // 处理转义引号
                            .replace(/\\\\/g, '\\')                 // 处理双反斜杠
                            .replace(/\\n/g, '')                    // 移除意外的换行符转义
                            .replace(/\\r/g, '')                    // 移除意外的回车符转义
                            .replace(/\\t/g, '')                    // 移除意外的制表符转义
                            .replace(/\\b/g, '')                    // 移除退格符转义
                            .replace(/\\f/g, '');                   // 移除换页符转义

                        parsedJsonData = JSON.parse(cleanedData);
                        jsonParseError = null;
                    } catch (e3) {
                        // 策略4: 更细致的处理方式
                        try {
                            // 分步骤处理转义
                            let step1 = data.replace(/\\\\"/g, '\\"');  // 将四重反斜杠变为双重
                            let step2 = step1.replace(/\\\\n/g, "\\n"); // 处理换行符
                            let step3 = step2.replace(/\\\\r/g, "\\r"); // 处理回车符
                            let step4 = step3.replace(/\\\\t/g, "\\t"); // 处理制表符

                            parsedJsonData = JSON.parse(step4);
                            jsonParseError = null;
                        } catch (e4) {
                            // 策略5: 特殊处理XML中的CDATA部分
                            try {
                                // 特别处理嵌套在XML中的JSON
                                let fixedData = data.replace(/<!\[CDATA\[/g, '<![CDATA[')
                                    .replace(/\]\]>/g, ']]>')
                                    .replace(/\\"/g, '"');  // 修复转义引号

                                parsedJsonData = JSON.parse(fixedData);
                                jsonParseError = null;
                            } catch (e5) {
                                // 策略6: 处理多层嵌套的转义
                                try {
                                    // 逐步处理复杂的嵌套结构
                                    let processed = data
                                        .replace(/\\"/g, '"')             // 修复转义引号
                                        .replace(/\\\\"/g, '"')           // 修复双重转义引号
                                        .replace(/\\\\\\"/g, '"')         // 修复三重转义引号
                                        .replace(/\\\\\\\\"/g, '"');      // 修复四重转义引号

                                    parsedJsonData = JSON.parse(processed);
                                    jsonParseError = null;
                                } catch (e6) {
                                    // 策略7: 特殊处理嵌套JSON的情况
                                    try {
                                        // 查找并处理嵌套在XML中的JSON
                                        let fixedData = data;
                                        const cdataJsonRegex = /<!\[CDATA\[(\{[^}].*?\})\]\]>/g;
                                        let match;
                                        while ((match = cdataJsonRegex.exec(data)) !== null) {
                                            const fullMatch = match[0];
                                            const jsonContent = match[1];
                                            try {
                                                // 验证这确实是一个有效的JSON
                                                JSON.parse(jsonContent);
                                                // 如果是有效的JSON，保持原样
                                            } catch (jsonError) {
                                                // 如果不是有效的JSON，尝试修复
                                                const fixedJson = jsonContent.replace(/\\"/g, '"');
                                                fixedData = fixedData.replace(fullMatch, `<![CDATA[${fixedJson}]]>`);
                                            }
                                        }

                                        parsedJsonData = JSON.parse(fixedData);
                                        jsonParseError = null;
                                    } catch (e7) {
                                        // 如果所有策略都失败了，保留原始错误
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 尝试解析 XML 数据
    let parsedXmlData: Document | null = null;
    let xmlParseError: Error | null = null;

    if (isXmlString) {
        try {
            const parser = new DOMParser();
            parsedXmlData = parser.parseFromString(data, "text/xml");

            // 检查解析错误
            const parserError = parsedXmlData.querySelector('parsererror');
            if (parserError) {
                xmlParseError = new Error(parserError.textContent || 'XML 解析错误');
            }
        } catch (e) {
            xmlParseError = e as Error;
        }
    }

    return (
        <div className="node" data-depth={depth}>
            <div style={{ display: 'flex' }}>
                {/**
                 * 键名区域
                 * 显示键名和展开按钮
                 */}
                <div className="key-container copyable expandable-key" onClick={toggleExpand}
                     style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span className="expand-btn">{isVisible ? '▼' : '▶'}</span>
                    <span className="key">{keyName}: </span>
                </div>

                {/**
                 * 值容器区域
                 * 包含展开按钮、字符串值和浮动层按钮
                 */}
                <div className="value-container copyable" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span className="str">"{data}"</span>
                    <button
                        className="copyBtn"
                        onClick={() => {
                            if (isJsonString && parsedJsonData) {
                                handleExpand(path, parsedJsonData, 'json');
                            } else if (isXmlString && parsedXmlData) {
                                handleExpand(path, data, 'xml');
                            }
                        }}
                        style={{ marginLeft: '4px' }}
                        disabled={!(isJsonString && parsedJsonData) && !(isXmlString && parsedXmlData)}
                    >
                        📄
                    </button>
                </div>
            </div>

            {/**
             * 子节点区域
             * 仅在展开状态下渲染
             */}
            {isVisible && (
                <div className="children-wrapper">
                    <div className={isJsonString ? "sub-json" : "sub-xml"} style={{
                        marginLeft: '20px',
                        marginTop: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace' }}>
                            子{isJsonString ? 'JSON' : 'XML'}完整路径: {path}
                        </div>
                        {isJsonString ? (
                            jsonParseError ? (
                                <div>JSON 解析错误: {jsonParseError.message}</div>
                            ) : (
                                parsedJsonData && renderSubNode(parsedJsonData, path, depth + 1)
                            )
                        ) : isXmlString ? (
                            xmlParseError ? (
                                <div>XML 解析错误: {xmlParseError.message}</div>
                            ) : parsedXmlData ? (
                                <XMLNode
                                    data={data}
                                    path={path}
                                    depth={depth + 1}
                                    onExpand={onExpand}
                                    renderSubNode={renderSubNode}
                                />
                            ) : (
                                <div className="str">{data}</div>
                            )
                        ) : (
                            <LeafNode
                                data={data}
                                path={path}
                                depth={depth + 1}
                                onExpand={onExpand}
                                renderSubNode={renderSubNode}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StringNode;