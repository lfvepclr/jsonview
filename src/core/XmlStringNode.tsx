import React, {useState} from 'react';
import {XMLStringExpander} from '../components/ui';
import {lastKey} from '../utils';
import {JSONValue} from '../types';

/**
 * XmlStringNode 组件 - XML 字符串节点渲染器
 *
 * 此组件专门负责渲染包含 XML 字符串的节点。
 * 它实现了以下功能：
 * 1. 显示 XML 字符串值
 * 2. 提供展开/收缩功能以查看解析后的 XML 结构
 * 3. 提供浮动层查看功能
 *
 * @component
 */
interface XmlStringNodeProps {
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
 * XmlStringNode 组件
 *
 * 主要职责：
 * 1. 渲染 XML 字符串节点
 * 2. 处理展开/收缩状态
 * 3. 提供浮动层查看功能
 */
const XmlStringNode: React.FC<XmlStringNodeProps> = ({
                                                         data,
                                                         path,
                                                         depth,
                                                         onExpand,
                                                         renderSubNode
                                                     }) => {
    // XML 字符串展开组件已从 ReactComponents 导入

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

    // 检查 XML 的值是否为 JSON
    let jsonInCDATA: any = null;
    if (data) {
        try {
            jsonInCDATA = JSON.parse(data);
        } catch (e) {
        }
    }

    // 递归渲染 XML 节点
    const renderXmlNode = (node: Node): React.ReactNode => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // 获取所有属性
            const attributes = Array.from(element.attributes).map((attr, index) => (
                <span key={index} className="str"> {attr.name}="{attr.value}"</span>
            ));

            // 获取直接的文本内容（不包括子元素的文本）
            const directTextContent = Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join('')
                .trim();

            // 特殊处理 json_data 节点
            if (element.nodeName === 'json_data') {
                // 查找 json_data 节点中的 CDATA
                const cdataNode = Array.from(element.childNodes).find(
                    node => node.nodeType === Node.CDATA_SECTION_NODE
                );
                
                if (cdataNode) {
                    const cdataContent = cdataNode.textContent || '';
                    let jsonInCDATA: any = null;
                    try {
                        jsonInCDATA = JSON.parse(cdataContent);
                    } catch (e) {
                        // 如果 JSON 解析失败，保持为 null
                    }
                    
                    if (jsonInCDATA) {
                        return (
                            <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                                {/* 开始标签 */}
                                <div style={{display: 'flex'}}>
                                    <span className="key">&lt;{element.nodeName}</span>
                                    {attributes}
                                    <span className="key">&gt;</span>
                                </div>

                                {/* json_data 节点的 JSON 子视图 */}
                                <div className="sub-json" style={{
                                    marginLeft: '16px',
                                    marginTop: '8px',
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    background: '#f9f9f9'
                                }}>
                                    {renderSubNode(jsonInCDATA, `${path}.${element.nodeName}`, depth + 1)}
                                </div>

                                {/* 结束标签 */}
                                <div style={{display: 'flex'}}>
                                    <span className="key">&lt;/{element.nodeName}&gt;</span>
                                </div>
                            </div>
                        );
                    } else {
                        // 如果不是有效的 JSON，按普通 CDATA 节点处理
                        return (
                            <div style={{display: 'flex', marginLeft: '16px'}}>
                                <span className="key">&lt;{element.nodeName}</span>
                                {attributes}
                                <span className="key">&gt;</span>
                                <span className="str">&lt;![CDATA[{cdataContent}]]&gt;</span>
                                <span className="key">&lt;/{element.nodeName}&gt;</span>
                            </div>
                        );
                    }
                } else {
                    // 如果没有 CDATA，按普通节点处理
                    const textContent = element.textContent || '';
                    return (
                        <div style={{display: 'flex', marginLeft: '16px'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                            <span className="str">{textContent}</span>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    );
                }
            }

            // 检查是否包含 CDATA
            const hasCDATA = Array.from(element.childNodes).some(
                node => node.nodeType === Node.CDATA_SECTION_NODE
            );

            if (hasCDATA) {
                // 处理包含 CDATA 的节点
                const cdataNode = Array.from(element.childNodes).find(
                    node => node.nodeType === Node.CDATA_SECTION_NODE
                );
                
                if (cdataNode) {
                    const cdataContent = cdataNode.textContent || '';
                    let jsonInCDATA: any = null;
                    try {
                        jsonInCDATA = JSON.parse(cdataContent);
                    } catch (e) {
                        // 如果 JSON 解析失败，保持为 null
                    }
                    
                    if (jsonInCDATA && element.nodeName !== 'json_data') {
                        // 如果 CDATA 内容是 JSON，显示为嵌套视图
                        return (
                            <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                                <div style={{display: 'flex'}}>
                                    <span className="key">&lt;{element.nodeName}</span>
                                    {attributes}
                                    <span className="key">&gt;</span>
                                </div>
                                <div className="sub-json" style={{
                                    marginLeft: '16px',
                                    marginTop: '8px',
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    background: '#f9f9f9'
                                }}>
                                    {renderSubNode(jsonInCDATA, `${path}.${element.nodeName}_cdata`, depth + 1)}
                                </div>
                                <div style={{display: 'flex'}}>
                                    <span className="key">&lt;/{element.nodeName}&gt;</span>
                                </div>
                            </div>
                        );
                    } else {
                        // 否则，将 CDATA 内容与标签显示在同一行
                        return (
                            <div style={{display: 'flex', marginLeft: '16px'}}>
                                <span className="key">&lt;{element.nodeName}</span>
                                {attributes}
                                <span className="key">&gt;</span>
                                <span className="str">&lt;![CDATA[{cdataContent}]]&gt;</span>
                                <span className="key">&lt;/{element.nodeName}&gt;</span>
                            </div>
                        );
                    }
                } else {
                    // 如果没有找到 CDATA 节点，按普通方式处理
                    return (
                        <div style={{display: 'flex', marginLeft: '16px'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                            {Array.from(element.childNodes).map((child, index) => {
                                if (child.nodeType === Node.TEXT_NODE) {
                                    const text = (child.textContent || '').trim();
                                    return text ? <span key={index} className="str">{text}</span> : null;
                                }
                                return null;
                            })}
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    );
                }
            }

            // 处理普通节点
            const hasChildElements = Array.from(element.childNodes).some(
                node => node.nodeType === Node.ELEMENT_NODE
            );

            // 特殊处理 metadata 节点，显示原值
            if (element.nodeName === 'metadata') {
                // 查找 metadata 节点中的 CDATA
                const cdataNode = Array.from(element.childNodes).find(
                    node => node.nodeType === Node.CDATA_SECTION_NODE
                );

                if (cdataNode) {
                    const cdataContent = cdataNode.textContent || '';
                    return (
                        <div style={{display: 'flex', marginLeft: '16px'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                            <span className="str">&lt;![CDATA[{cdataContent}]]&gt;</span>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    );
                } else {
                    // 即使没有CDATA也按正常方式处理
                    const textContent = element.textContent || '';
                    return (
                        <div style={{display: 'flex', marginLeft: '16px'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                            <span className="str">{textContent}</span>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    );
                }
            }

            // 处理有子元素的节点
            if (element.children.length > 0) {
                return (
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                        {/* 开始标签 */}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;{element.nodeName}</span>
                            {attributes}
                            <span className="key">&gt;</span>
                        </div>
                        
                        {/* 子元素 */}
                        {Array.from(element.childNodes).map((child, index) => (
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
                // 普通节点处理
                return (
                    <div style={{display: 'flex', marginLeft: '16px'}}>
                        <span className="key">&lt;{element.nodeName}</span>
                        {attributes}
                        <span className="key">&gt;</span>
                        {directTextContent && (
                            <span className="str">{directTextContent}</span>
                        )}
                        <span className="key">&lt;/{element.nodeName}&gt;</span>
                    </div>
                );
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = (node.textContent || '').trim();
            if (text) {
                return <span className="str">{text}</span>;
            }
        } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
            const cdataContent = node.textContent || '';
            // 如果是 JSON 字符串，则渲染为 JSON 子视图
            if (jsonInCDATA) {
                return (
                    <div className="sub-json" style={{
                        marginLeft: '16px',
                        marginTop: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        {renderSubNode(jsonInCDATA, `${path}.cdata`, depth + 1)}
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
                        onClick={() => handleExpand(path, data, 'xml')}
                        style={{marginLeft: '4px'}}
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
                            <>
                                {renderXmlNode(xmlDoc.documentElement)}
                            </>
                        ) : (
                            <div className="str">{data}</div> // 格式化错误的XML返回原字符串
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default XmlStringNode;