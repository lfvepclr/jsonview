/**
 * XML 节点渲染组件
 *
 * React 组件用于递归渲染 XML 节点
 */
import React, {useState} from 'react';
import {lastKey, looksLikeJSON, looksLikeXML} from '../utils';

interface XMLNodeProps {
    /** XML 字符串数据 */
    data: string;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
    /** 渲染子节点的函数 */
    renderSubNode: (data: any, path: string, depth: number) => React.ReactNode;
}

/**
 * XMLNode 组件 - XML 数据节点渲染器
 *
 * 此组件专门负责渲染 XML 数据节点。
 * 它实现了以下功能：
 * 1. 显示 XML 数据
 * 2. 提供展开/收缩功能以查看解析后的 XML 结构
 * 3. 识别并渲染 XML 内部的 JSON 字段
 */
const XMLNode: React.FC<XMLNodeProps> = ({
                                             data,
                                             path,
                                             depth,
                                             onExpand,
                                             renderSubNode
                                         }) => {
    /** 展开状态 */
    const [isVisible, setIsVisible] = useState(true);

    /** 获取键名 */
    const keyName = lastKey(path);

    /** 切换展开状态 */
    const toggleExpand = () => {
        setIsVisible(!isVisible);
    };

    /** 处理浮层展开请求 */
    const handleExpand = () => {
        if (onExpand) {
            onExpand(path, data, 'xml');
        }
    };

    // 解析 XML
    let xmlDoc: Document | null = null;
    let parseError: Error | null = null;

    try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, "text/xml");

        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            parseError = new Error(parserError.textContent || 'XML 解析错误');
        }
    } catch (e) {
        parseError = e as Error;
    }

    // 递归渲染 XML 节点
    const renderXmlNode = (node: Node): React.ReactNode => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // 获取所有属性
            const attributes = Array.from(element.attributes).map((attr, index) => (
                <span key={index} className="str"> {attr.name}="{attr.value}"</span>
            ));

            // 获取子节点
            const childNodes = Array.from(element.childNodes);

            // 检查是否有子元素节点
            const hasElementChildren = childNodes.some(child => child.nodeType === Node.ELEMENT_NODE);
            
            // 获取直接的文本内容（不包括子元素的文本）
            // 注意：对于包含JSON的元素，XML解析器可能会错误地将其解析为包含子元素
            // 因此我们需要获取所有子节点的文本内容
            let directTextContent = '';
            if (element.childNodes.length > 0) {
                // 合并所有子节点的文本内容
                directTextContent = Array.from(element.childNodes)
                    .map(node => {
                        // 特别处理 CDATA 节点
                        if (node.nodeType === Node.CDATA_SECTION_NODE) {
                            return `<![CDATA[${node.textContent || ''}]]>`;
                        }
                        return node.textContent || '';
                    })
                    .join('')
                    .trim();
            }

            // 处理文本内容中的 JSON
            let jsonContent: any = null;
            if (directTextContent) {
                let processedText = directTextContent.trim();
                
                // 处理HTML实体和转义字符
                processedText = processedText
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                
                // 处理双重转义的引号
                processedText = processedText.replace(/\\"/g, '"');
                
                // 检查是否为 JSON 字符串
                if ((processedText.startsWith('{') && processedText.endsWith('}')) || 
                    (processedText.startsWith('[') && processedText.endsWith(']'))) {
                    try {
                        jsonContent = JSON.parse(processedText);
                    } catch (e) {
                        // 如果 JSON 解析失败，保持为 null
                    }
                }
            }

            // 优先检查是否有可解析的JSON内容
            if (jsonContent) {
                // 如果有可解析的JSON，水平布局显示JSON视图
                return (
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                        {/* 显示键名 */}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                        </div>
                        
                        {/* 显示JSON内容 */}
                        <div className="sub-json" style={{
                            marginLeft: '16px',
                            marginTop: '8px',
                            border: '1px solid #ddd',
                            padding: '8px',
                            background: '#f9f9f9'
                        }}>
                            {renderSubNode(jsonContent, `${path}.${element.nodeName}`, depth + 1)}
                        </div>
                        
                        {/* 结束标签 */}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    </div>
                );
            } else if (hasElementChildren) {
                // 如果有子元素节点但没有可解析的JSON，垂直布局显示
                return (
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                        {/* 开始标签 */}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                        </div>

                        {/* 子节点 */}
                        {childNodes.map((child, index) => (
                            <div key={index}>
                                {renderXmlNode(child)}
                            </div>
                        ))}

                        {/* 结束标签 */}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    </div>
                );
            } else {
                // 如果只有文本节点，水平布局显示
                // 修复空白问题：移除多余的空格
                const displayText = directTextContent || element.textContent || '';
                
                // 检查文本内容中是否包含嵌套的 JSON 或 XML 字符串
                let nestedContent: React.ReactNode = null;
                if (displayText) {
                    // 尝试识别嵌套的 JSON 字符串
                    if (looksLikeJSON(displayText)) {
                        try {
                            const parsed = JSON.parse(displayText);
                            nestedContent = (
                                <div className="sub-json" style={{
                                    marginLeft: '16px',
                                    marginTop: '8px',
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    background: '#f9f9f9'
                                }}>
                                    {renderSubNode(parsed, `${path}.${element.nodeName}`, depth + 1)}
                                </div>
                            );
                        } catch (e) {
                            // 解析失败，保持为普通文本
                        }
                    } 
                    // 尝试识别嵌套的 XML 字符串
                    else if (looksLikeXML(displayText)) {
                        nestedContent = (
                            <div className="sub-xml" style={{
                                marginLeft: '16px',
                                marginTop: '8px',
                                border: '1px solid #ddd',
                                padding: '8px',
                                background: '#f9f9f9'
                            }}>
                                {renderSubNode(displayText, `${path}.${element.nodeName}`, depth + 1)}
                            </div>
                        );
                    }
                }
                
                return (
                    <div style={{display: 'flex', marginLeft: '16px'}}>
                        <span className="key">&lt;{element.nodeName}</span>
                        {attributes}
                        <span className="key">&gt;</span>
                        {nestedContent ? (
                            nestedContent
                        ) : (
                            displayText && <span className="str">{displayText}</span>
                        )}
                        <span className="key">&lt;/{element.nodeName}&gt;</span>
                    </div>
                );
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = (node.textContent || '').trim();
            if (text) {
                // 检查文本节点中是否包含 JSON
                let jsonContent: any = null;
                
                if (text) {
                    let processedText = text.trim();
                    
                    // 处理HTML实体和转义字符
                    processedText = processedText
                        .replace(/&quot;/g, '"')
                        .replace(/&apos;/g, "'")
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&');
                    
                    // 处理双重转义的引号
                    processedText = processedText.replace(/\\"/g, '"');
                    
                    if ((processedText.startsWith('{') && processedText.endsWith('}')) || 
                        (processedText.startsWith('[') && processedText.endsWith(']'))) {
                        try {
                            jsonContent = JSON.parse(processedText);
                        } catch (e) {
                            // 如果 JSON 解析失败，保持为 null
                            console.log('TEXT节点JSON解析失败:', processedText, e);
                        }
                    }
                }
                
                if (jsonContent) {
                    return (
                        <div className="sub-json" style={{
                            marginLeft: '16px',
                            marginTop: '8px',
                            border: '1px solid #ddd',
                            padding: '8px',
                            background: '#f9f9f9'
                        }}>
                            {renderSubNode(jsonContent, `${path}.text`, depth + 1)}
                        </div>
                    );
                } else {
                    return <span className="str">{text}</span>;
                }
            }
        } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
            // 处理 CDATA 节点
            const cdataContent = node.textContent || '';
            let jsonContent: any = null;
            
            // 尝试解析 CDATA 中的 JSON
            try {
                jsonContent = JSON.parse(cdataContent);
            } catch (e) {
                // 如果 JSON 解析失败，保持为 null
            }
            
            if (jsonContent) {
                return (
                    <div className="sub-json" style={{
                        marginLeft: '16px',
                        marginTop: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        {renderSubNode(jsonContent, `${path}.cdata`, depth + 1)}
                    </div>
                );
            } else {
                return <span className="str">&lt;![CDATA[{cdataContent}]]&gt;</span>;
            }
        }

        return null;
    };

    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex'}}>
                {/**
                 * 键名区域
                 * 显示键名和展开按钮
                 */}
                <div className="key-container copyable expandable-key" onClick={toggleExpand}
                     style={{display: 'flex', alignItems: 'flex-start'}}>
                    <span className="expand-btn">{isVisible ? '▼' : '▶'}</span>
                    <span className="key">{keyName}: </span>
                </div>

                {/**
                 * 值容器区域
                 * 包含展开按钮、XML 字符串值和浮动层按钮
                 */}
                <div className="value-container copyable" style={{display: 'flex', alignItems: 'flex-start'}}>
                    <span className="str">"{data}"</span>
                    <button
                        className="copyBtn"
                        onClick={handleExpand}
                        style={{marginLeft: '4px'}}
                    >
                        📄
                    </button>
                </div>
            </div>

            {/**
             * 子节点区域
             * 仅在展开状态下渲染
             * 修改：直接显示 XML 内容，而不是包装在子 XML 容器中
             * 并且直接在顶层渲染，而不是作为子视图
             */}
            {isVisible && (
                <div className="children-wrapper">
                    <div style={{
                        marginTop: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        {parseError ? (
                            <div>XML 解析错误: {parseError.message}</div>
                        ) : xmlDoc ? (
                            <>
                                {renderXmlNode(xmlDoc.documentElement)}
                            </>
                        ) : (
                            <div className="str">{data}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default XMLNode;