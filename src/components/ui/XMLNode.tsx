/**
 * XML 节点渲染组件
 *
 * React 组件用于递归渲染 XML 节点
 */
import React from 'react';

interface XMLNodeProps {
    node: Node;
}

/**
 * XML 节点渲染组件
 *
 * React 组件替代直接的 DOM 操作
 */
export const XMLNode: React.FC<XMLNodeProps> = ({node}) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const attrs: string[] = [];
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs.push(`${attr.name}="${attr.value}"`);
        }

        const attrsStr = attrs.length ? ' ' + attrs.join(' ') : '';
        const hasChildren = element.children.length > 0;
        const textContent = element.textContent || '';

        if (hasChildren) {
            return (
                <div style={{marginLeft: '16px'}}>
                    <span className="key">&lt;{element.nodeName}{attrsStr}&gt;</span>
                    {Array.from(element.children).map((child, index) => (
                        <XMLNode key={index} node={child}/>
                    ))}
                    <div style={{marginLeft: '16px'}}>
                        <span className="key">&lt;/{element.nodeName}&gt;</span>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{marginLeft: '16px'}}>
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