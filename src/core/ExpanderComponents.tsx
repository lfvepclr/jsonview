/**
 * React 组件用于处理展开功能
 *
 * 包含用于处理 JSON 和 XML 字符串展开的 React 组件
 */
import React, {useState} from 'react';
import {looksLikeJSON, looksLikeXML} from '../utils/helperUtils';
import XMLNode from './XMLNode';

interface XMLStringExpanderProps {
    value: string;
    path: string;
    onExpand: (path: string, data: any, type: 'json' | 'xml') => void;
}

interface JSONStringExpanderProps {
    value: string;
    path: string;
    onExpand: (path: string, data: any, type: 'json' | 'xml') => void;
    renderSubNode?: (data: any, path: string, depth: number) => React.ReactNode;
}

/**
 * 内嵌 JSON 渲染组件
 */
export const EmbeddedJSON: React.FC<{ content: string }> = ({content}) => {
    try {
        const jsonObj = JSON.parse(content);
        return (
            <div className="sub-json"
                 style={{margin: '8px 0 8px 20px', border: '1px solid #ddd', padding: '8px', background: '#f9f9f9'}}>
                <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                    内嵌JSON:
                </div>
                <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>
          {JSON.stringify(jsonObj, null, 2)}
        </pre>
            </div>
        );
    } catch (e) {
        return (
            <div style={{marginLeft: '16px'}}>
                <span className="str">{content}</span>
            </div>
        );
    }
};

/**
 * XML 字符串展开组件
 *
 * React 组件处理 XML 字符串的展开
 */
export const XMLStringExpander: React.FC<XMLStringExpanderProps> = ({
                                                                        value,
                                                                        path,
                                                                        onExpand
                                                                    }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (typeof value !== 'string' || !looksLikeXML(value)) {
        return null;
    }

    const handleToggle = () => {
        setIsVisible(!isVisible);
    };

    const handleFloatExpand = () => {
        onExpand(path, value, 'xml');
    };

    // 解析 XML
    let xmlDoc: Document | null = null;
    let parseError: Error | null = null;

    try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(value, "text/xml");

        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            parseError = new Error(parserError.textContent || 'XML 解析错误');
        }
    } catch (e) {
        parseError = e as Error;
    }

    return (
        <>
        <span
            className="expand-btn"
            onClick={handleToggle}
            title="展开子XML"
        >
          {isVisible ? '▼' : '▶'}
        </span>
            {isVisible && (
                <div className="sub-xml" style={{
                    marginLeft: '20px',
                    marginTop: '8px',
                    border: '1px solid #ddd',
                    padding: '8px',
                    background: '#f9f9f9'
                }}>
                    <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                        子XML完整路径: {path}
                    </div>
                    {parseError ? (
                        <div>XML 解析错误: {parseError.message}</div>
                    ) : xmlDoc ? (
                        <XMLNode 
                            data={value}
                            path={path}
                            depth={0}
                            renderSubNode={(data, _path, _depth) => (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            )}
                        />
                    ) : null}
                </div>
            )}
            <button
                className="copyBtn"
                onClick={handleFloatExpand}
                style={{marginLeft: '4px'}}
            >
                📄
            </button>
        </>
    );
};

/**
 * JSON 字符串展开组件
 *
 * React 组件处理 JSON 字符串的展开
 */
export const JSONStringExpander: React.FC<JSONStringExpanderProps> = ({
                                                                          value,
                                                                          path,
                                                                          onExpand,
                                                                          renderSubNode
                                                                      }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (typeof value !== 'string' || !looksLikeJSON(value)) {
        return null;
    }

    let jsonObj: any = null;
    let parseError: Error | null = null;

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
        jsonObj = JSON.parse(value);
    } catch (e) {
        parseError = e as Error;
    }

    // 如果解析失败，尝试修复常见的转义问题
    if (parseError && value) {
        try {
            // 尝试修复常见的转义问题
            let fixedValue = fixEscapedCharacters(value);
            jsonObj = JSON.parse(fixedValue);
            parseError = null;
        } catch (e1) {
            try {
                // 策略2: 更细致的处理方式
                let step1 = value.replace(/\\\\"/g, '\\"');  // 将四重反斜杠变为双重
                let step2 = step1.replace(/\\\\n/g, "\\n"); // 处理换行符
                let step3 = step2.replace(/\\\\r/g, "\\r"); // 处理回车符
                let step4 = step3.replace(/\\\\t/g, "\\t"); // 处理制表符

                jsonObj = JSON.parse(step4);
                parseError = null;
            } catch (e2) {
                // 策略3: 特殊处理XML中的CDATA部分
                try {
                    // 特别处理嵌套在XML中的JSON
                    let fixedValue = value.replace(/<!\[CDATA\[/g, '<![CDATA[')
                        .replace(/\]\]>/g, ']]>')
                        .replace(/\\"/g, '"');  // 修复转义引号

                    jsonObj = JSON.parse(fixedValue);
                    parseError = null;
                } catch (e3) {
                    // 策略4: 处理多层嵌套的转义
                    try {
                        // 逐步处理复杂的嵌套结构
                        let processed = value
                            .replace(/\\"/g, '"')             // 修复转义引号
                            .replace(/\\\\"/g, '"')           // 修复双重转义引号
                            .replace(/\\\\\\"/g, '"')         // 修复三重转义引号
                            .replace(/\\\\\\\\"/g, '"');      // 修复四重转义引号

                        jsonObj = JSON.parse(processed);
                        parseError = null;
                    } catch (e4) {
                        // 策略5: 特殊处理嵌套JSON的情况
                        try {
                            // 查找并处理嵌套在XML中的JSON
                            let fixedValue = value;
                            const cdataJsonRegex = /<!\[CDATA\[(\{[^}].*?\})\]\]>/g;
                            let match;
                            while ((match = cdataJsonRegex.exec(value)) !== null) {
                                const fullMatch = match[0];
                                const jsonContent = match[1];
                                try {
                                    // 验证这确实是一个有效的JSON
                                    JSON.parse(jsonContent);
                                    // 如果是有效的JSON，保持原样
                                } catch (jsonError) {
                                    // 如果不是有效的JSON，尝试修复
                                    const fixedJson = jsonContent.replace(/\\"/g, '"');
                                    fixedValue = fixedValue.replace(fullMatch, `<![CDATA[${fixedJson}]]>`);
                                }
                            }

                            jsonObj = JSON.parse(fixedValue);
                            parseError = null;
                        } catch (e5) {
                            // 如果修复后仍然失败，则保持原始错误
                        }
                    }
                }
            }
        }
    }

    const handleToggle = () => {
        setIsVisible(!isVisible);
    };

    const handleFloatExpand = () => {
        if (jsonObj) {
            onExpand(path, jsonObj, 'json');
        }
    };

    return (
        <>
        <span
            className="expand-btn"
            onClick={handleToggle}
            title="展开子JSON"
        >
          {isVisible ? '▼' : '▶'}
        </span>
            {isVisible && (
                <div className="sub-json" style={{
                    marginLeft: '20px',
                    marginTop: '8px',
                    border: '1px solid #ddd',
                    padding: '8px',
                    background: '#f9f9f9'
                }}>
                    <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                        子JSON完整路径: {path}
                    </div>
                    {parseError ? (
                        <div>JSON 解析错误: {parseError.message}</div>
                    ) : jsonObj ? (
                        renderSubNode ? (
                            renderSubNode(jsonObj, path, 0)
                        ) : (
                            <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>
                  {JSON.stringify(jsonObj, null, 2)}
                </pre>
                        )
                    ) : null}
                </div>
            )}
            <button
                className="copyBtn"
                onClick={handleFloatExpand}
                style={{marginLeft: '4px'}}
            >
                📄
            </button>
        </>
    );
};