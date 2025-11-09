import React from 'react';

/**
 * XmlRenderer 组件 - XML 数据渲染器
 *
 * 此组件专门负责解析和渲染 XML 数据。
 * 它实现了以下功能：
 * 1. 解析 XML 字符串
 * 2. 递归渲染 XML 节点树
 * 3. 处理 CDATA 部分，特别是其中嵌套的 JSON 数据
 * 4. 错误处理和显示
 *
 * @component
 */
interface XmlRendererProps {
    /** 要渲染的 XML 字符串 */
    xmlString: string;
    /** 渲染子节点的函数 */
    renderSubNode?: (data: any, path: string, depth: number) => React.ReactNode;
}

/**
 * XmlRenderer 组件
 *
 * 主要职责：
 * 1. 解析 XML 字符串
 * 2. 递归渲染 XML 节点
 * 3. 处理特殊内容（如 CDATA 中的 JSON）
 */
const XmlRenderer: React.FC<XmlRendererProps> = ({xmlString, renderSubNode}) => {
    /**
     * 渲染 XML 节点
     *
     * 递归处理 XML 节点树，为每个节点生成相应的 React 元素。
     *
     * @param node - 要渲染的 XML 节点
     * @returns React 节点
     */
    const renderXmlNode = (node: Node): React.ReactNode => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const attrs: string[] = [];
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                attrs.push(`${attr.name}="${attr.value}"`);
            }

            const attrsStr = attrs.length ? ' ' + attrs.join(' ') : '';
            const hasChildren = element.children.length > 0;

            // 处理 CDATA 部分
            let cdataContent = '';
            for (let i = 0; i < element.childNodes.length; i++) {
                const childNode = element.childNodes[i];
                if (childNode.nodeType === Node.CDATA_SECTION_NODE) {
                    cdataContent = childNode.textContent || '';
                    break;
                }
            }

            const textContent = element.textContent || '';
            if (hasChildren || cdataContent) {
                // 处理有子元素的节点
                return (
                    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '16px'}}>
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;{element.nodeName}{attrsStr}&gt;</span>
                            {cdataContent && (
                                <span>
                                    {renderCDataContent(cdataContent)}
                                </span>
                            )}
                        </div>
                        {Array.from(element.children).map((child, index) => (
                            <div key={index} style={{marginLeft: '16px'}}>
                                {renderXmlNode(child)}
                            </div>
                        ))}
                        <div style={{display: 'flex'}}>
                            <span className="key">&lt;/{element.nodeName}&gt;</span>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div style={{display: 'flex', marginLeft: '16px'}}>
                        <span className="key">&lt;{element.nodeName}{attrsStr}&gt;</span>
                        <span className="str">{textContent}</span>
                        <span className="key">&lt;/{element.nodeName}&gt;</span>
                    </div>
                );
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = (node.textContent || '').trim();
            if (text) {
                return (
                    <div style={{marginLeft: '16px'}}>
                        <span className="str">{text}</span>
                    </div>
                );
            }
        }

        return null;
    };

    /**
     * 处理 CDATA 内容
     *
     * 特别处理包含在 CDATA 部分中的内容，如果内容是有效的 JSON，
     * 则将其渲染为嵌套的 JSON 视图。
     *
     * @param content - CDATA 内容
     * @returns React 节点
     */
    const renderCDataContent = (content: string): React.ReactNode => {
        // 尝试解析 JSON
        try {
            const jsonObj = JSON.parse(content);
            // 如果有 renderSubNode 函数，使用它来渲染 JSON
            if (renderSubNode) {
                return (
                    <div className="sub-json" style={{
                        margin: '8px 0 8px 20px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                            内嵌JSON:
                        </div>
                        {renderSubNode(jsonObj, '$', 0)}
                    </div>
                );
            } else {
                // 否则简单地显示 JSON 字符串
                return (
                    <div className="sub-json" style={{
                        margin: '8px 0 8px 20px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                            内嵌JSON:
                        </div>
                        <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(jsonObj, null, 2)}
            </pre>
                    </div>
                );
            }
        } catch (e) {
            // 如果不是有效的 JSON，直接显示内容
            return (
                <div style={{marginLeft: '16px'}}>
                    <span className="str">{content}</span>
                </div>
            );
        }
    };

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            return <div>XML 解析错误: {parserError.textContent}</div>;
        }

        return (
            <div>
                {renderXmlNode(xmlDoc.documentElement)}
            </div>
        );
    } catch (error) {
        return <div>XML 渲染错误: {(error as Error).message}</div>;
    }
};

export default XmlRenderer;