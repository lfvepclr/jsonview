/**
 * Popup 组件 - 浏览器扩展弹出窗口主界面
 *
 * 这是浏览器扩展的主界面，用户可以在此输入 JSON 数据并查看渲染结果。
 * 它提供了以下功能：
 * 1. JSON 输入和验证
 * 2. JSON 数据渲染
 * 3. 新窗口查看功能
 * 4. 浮动层展示功能
 *
 * @component
 */
import React, {useCallback, useState} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import '../styles.css';
import {JSONValue} from './types';

/**
 * Popup 组件
 *
 * 主要职责：
 * 1. 提供用户界面用于输入和渲染 JSON 数据
 * 2. 处理用户交互（渲染、新窗口查看等）
 * 3. 管理组件状态（输入值、渲染数据、错误信息等）
 */
const Popup: React.FC = () => {
    /** 用户输入的 JSON 字符串 */
    const [inputValue, setInputValue] = useState('');

    /** 解析后的 JSON 数据 */
    const [treeData, setTreeData] = useState<JSONValue | null>(null);

    /** 错误信息 */
    const [error, setError] = useState<string | null>(null);

    /**
     * 处理渲染按钮点击事件
     *
     * 解析输入的 JSON 或 XML 字符串并渲染结果
     */
    const handleRender = useCallback(() => {
        const trimmedInput = inputValue.trim();

        // 首先尝试解析为 JSON
        try {
            const obj = JSON.parse(trimmedInput);
            setTreeData(obj);
            setError(null);
            return;
        } catch (e) {
            console.error('JSON解析错误:', (e as Error).message);
        }

        // 检查是否为 XML
        if (trimmedInput.startsWith('<') && trimmedInput.endsWith('>')) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(trimmedInput, "text/xml");

                // 检查解析错误
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error(parserError.textContent || 'XML 解析错误');
                }

                // 将 XML 转换为可渲染的对象
                const xmlToObject = (node: Node): any => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent?.trim();
                        return text || null;
                    }

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        const obj: any = {};

                        // 处理属性
                        if (element.attributes.length > 0) {
                            obj['@attributes'] = {};
                            for (let i = 0; i < element.attributes.length; i++) {
                                const attr = element.attributes[i];
                                obj['@attributes'][attr.name] = attr.value;
                            }
                        }

                        // 处理子节点
                        const children = Array.from(element.childNodes);
                        const childElements = children.filter(child => child.nodeType === Node.ELEMENT_NODE);
                        const textContent = children
                            .filter(child => child.nodeType === Node.TEXT_NODE)
                            .map(child => child.textContent?.trim())
                            .filter(text => text && text.length > 0)
                            .join('');

                        if (childElements.length === 0) {
                            // 只有文本内容
                            if (textContent) {
                                return textContent;
                            }
                        } else {
                            // 有子元素
                            childElements.forEach(child => {
                                const childElement = child as Element;
                                const childName = childElement.tagName;
                                const childValue = xmlToObject(childElement);

                                if (obj[childName]) {
                                    // 处理同名元素
                                    if (!Array.isArray(obj[childName])) {
                                        obj[childName] = [obj[childName]];
                                    }
                                    obj[childName].push(childValue);
                                } else {
                                    obj[childName] = childValue;
                                }
                            });
                        }

                        return obj;
                    }

                    return null;
                };

                const rootObj = xmlToObject(xmlDoc.documentElement);
                setTreeData(rootObj);
                setError(null);
                return;
            } catch (e) {
                setError('XML解析错误: ' + (e as Error).message);
                return;
            }
        }

        // 如果既不是有效的 JSON 也不是有效的 XML
        setError('输入既不是有效的 JSON 也不是有效的 XML');
    }, [inputValue]);

    /**
     * 处理新窗口查看按钮点击事件
     *
     * 在新窗口中打开详细视图
     */
    const handleRenderNewWindow = useCallback(() => {
        const trimmedInput = inputValue.trim();

        // 检测数据类型
        let dataType: 'json' | 'xml' = 'json';
        let dataStr = trimmedInput;

        // 检查是否为 XML
        if (trimmedInput.startsWith('<') && trimmedInput.endsWith('>')) {
            dataType = 'xml';
        }

        try {
            if (dataType === 'json') {
                JSON.parse(trimmedInput); // 验证 JSON
            } else {
                // 验证 XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(trimmedInput, "text/xml");
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error(parserError.textContent || 'XML 解析错误');
                }
            }

            // 使用 Chrome 扩展 API 创建新标签页
            chrome.tabs.create({
                url: chrome.runtime.getURL(`tabs/viewer.html?${dataType}=${encodeURIComponent(dataStr)}&path=${encodeURIComponent('$')}`)
            });
        } catch (e) {
            alert(`${dataType.toUpperCase()}解析错误: ` + (e as Error).message);
        }
    }, [inputValue]);


    return (
        <div>
            <h3>输入 JSON(支持内嵌XML) 或XML(支持内嵌JSON)</h3>
            <textarea
                id="input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="粘贴 JSON or XML 字符串…"
            />
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                <button
                    id="render"
                    onClick={handleRender}
                    style={{display: treeData ? 'inline-block' : 'none'}}
                >
                    渲染
                </button>
                <button id="renderNewWindow" onClick={handleRenderNewWindow}>
                    渲染(窗口)
                </button>
            </div>

            {error && (
                <div id="tree">❌ {error}</div>
            )}

        </div>
    );
};

export default Popup;