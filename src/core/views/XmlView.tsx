import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {lastKey, looksLikeJSON} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';

/**
 * 判断内容是否为简单文本（非JSON格式）
 */
const isSimpleText = (content: string): boolean => {
    return !looksLikeJSON(content) && !content.includes('<');
};

/**
 * 递归渲染 XML 节点
 */
const renderXmlNode = (
    node: Node,
    basePath: string,
    baseDepth: number,
    renderChild: (data: any, path: string, depth: number) => React.ReactNode
): React.ReactNode => {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // 获取所有属性
        const attributes = Array.from(element.attributes).map((attr, index) => (
            <span key={index} className="xml-attribute" style={{color: '#d73a49'}}>
        {' '}{attr.name}="{attr.value}"
      </span>
        ));

        // 获取子节点（只包含元素节点）
        const childElements = Array.from(element.children);

        // 获取直接文本内容（不包含子元素的文本）
        let directTextContent = '';
        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent?.trim();
                if (text) {
                    directTextContent += text;
                }
            } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
                // 处理 CDATA 节点
                const cdataContent = child.textContent || '';
                directTextContent += cdataContent;
            }
        }

        // 检查是否为自闭合标签
        const isSelfClosing = childElements.length === 0 && !directTextContent;

        return (
            <div className="xml-element" style={{marginLeft: '16px', marginTop: '4px'}}>
                {/* 开始标签 */}
                <div style={{display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline'}}>
          <span className="xml-tag" style={{color: '#22863a'}}>
            &lt;{element.nodeName}
          </span>
                    {attributes}
                    <span className="xml-tag" style={{color: '#22863a'}}>
            {isSelfClosing ? ' />' : '>'}
          </span>

                    {/* 如果有直接文本内容且没有子元素，在同一行显示 */}
                    {!isSelfClosing && childElements.length === 0 && directTextContent && (
                        <>
              <span className="xml-text-wrapper">
                {isSimpleText(directTextContent) ? (
                    <span className="xml-text">{directTextContent}</span>
                ) : (
                    renderChild(directTextContent, `${basePath}#xml-content#${element.nodeName}`, baseDepth + 1)
                )}
              </span>
                            <span className="xml-tag" style={{color: '#22863a'}}>
                &lt;/{element.nodeName}&gt;
              </span>
                        </>
                    )}
                </div>

                {/* 如果有子元素，分行显示 */}
                {childElements.length > 0 && (
                    <>
                        <div style={{marginLeft: '16px'}}>
                            {/* 处理直接文本内容（如果有子元素的话） */}
                            {directTextContent && (
                                <div className="xml-text-content" style={{marginTop: '4px'}}>
                  <span className="xml-text-wrapper">
                    {isSimpleText(directTextContent) ? (
                        <span className="xml-text">{directTextContent}</span>
                    ) : (
                        renderChild(directTextContent, `${basePath}#xml-content#${element.nodeName}`, baseDepth + 1)
                    )}
                  </span>
                                </div>
                            )}

                            {/* 子元素节点 */}
                            {childElements.map((child, index) => (
                                <div key={index}>
                                    {renderXmlNode(child, `${basePath}.${element.nodeName}`, baseDepth + 1, renderChild)}
                                </div>
                            ))}
                        </div>

                        {/* 结束标签 */}
                        <div style={{display: 'flex'}}>
              <span className="xml-tag" style={{color: '#22863a'}}>
                &lt;/{element.nodeName}&gt;
              </span>
                        </div>
                    </>
                )}
            </div>
        );
    } else if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent?.trim();
        if (textContent) {
            return renderChild(textContent, basePath, baseDepth);
        }
    } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
        const cdataContent = node.textContent || '';
        return renderChild(cdataContent, basePath, baseDepth);
    }

    return null;
};

/**
 * XML 视图组件
 * 处理 XML 字符串的解析和渲染，支持递归渲染子元素
 */
const XmlView: React.FC<ViewComponentProps> = ({
                                                   data,
                                                   path,
                                                   depth,
                                                   renderChild
                                               }) => {
    const [isVisible, setIsVisible] = useState(true);

    const keyName = lastKey(path);
    const xmlString = data as string;

    // 使用统一的复制功能Hook
    const {handleCopy} = useCopy(copyPresets.string(xmlString));

    // 尝试解析 XML
    let xmlDoc: Document | null = null;
    let parseError: Error | null = null;

    try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            parseError = new Error(parserError.textContent || 'XML 解析错误');
        }
    } catch (e) {
        parseError = e as Error;
        console.error('XmlView解析错误:', (e as Error).message, '输入值:', xmlString);
    }

    const toggleExpand = () => {
        setIsVisible(!isVisible);
    };


    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex'}}>
                {/* 键名区域 */}
                <div className="key-container copyable expandable-key" onClick={toggleExpand}
                     style={{display: 'flex', alignItems: 'flex-start'}}>
                    <span className="expand-btn">{isVisible ? '▼' : '▶'}</span>
                    <span className="key">{keyName}: </span>
                </div>

                {/* 值容器区域 */}
                <div className="value-container copyable" style={{display: 'flex', alignItems: 'flex-start'}}
                     onClick={handleCopy}>
                    <span className="str">"{xmlString}"</span>
                </div>
            </div>

            {/* 子节点区域 */}
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
                            renderXmlNode(xmlDoc.documentElement, path, depth + 1, renderChild)
                        ) : (
                            <div className="str">{xmlString}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default XmlView;