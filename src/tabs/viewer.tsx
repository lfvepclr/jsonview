/**
 * Viewer 组件 - 浏览器扩展详细视图
 *
 * 提供完整的 JSON 数据查看功能：
 * 1. 从 URL 参数获取 JSON/XML 数据
 * 2. 渲染树形结构
 * 3. 支持复制功能
 * 4. 支持 JSON/XML 解析
 *
 * @component
 */
import React, {useCallback, useEffect, useState} from 'react';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {RenderNode} from '../core/NodeRenderer';
import {getMaxValueLength} from '../utils/helperUtils';
import '../../styles.css';
import {JSONValue} from '../types';

/**
 * Viewer 组件
 *
 * 主要职责：
 * 1. 从 URL 获取 JSON/XML 数据并解析
 * 2. 渲染树形结构
 * 3. 提供复制功能
 * 4. 管理组件状态
 */
const Viewer: React.FC = () => {
    /** 解析后的 JSON 数据 */
    const [treeData, setTreeData] = useState<JSONValue | null>(null);

    /** 父路径 */
    const [parentPath, setParentPath] = useState('$');

    /**
     * 从 URL 参数获取数据
     *
     * 从 URL 的 json/xml 参数中获取数据并解析
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const jsonStr = params.get('json');
        const xmlStr = params.get('xml');
        const path = params.get('path') || '$';

        setParentPath(path);

        if (jsonStr) {
            try {
                const obj = JSON.parse(jsonStr);
                setTreeData(obj);

                // 调整宽度
                const width = Math.max(420, getMaxValueLength(obj) * 8 + 100);
                document.body.style.width = `${width}px`;
            } catch (e) {
                document.body.textContent = '解析错误：' + (e as Error).message;
            }
        } else if (xmlStr) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

                // 检查解析错误
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error(parserError.textContent || 'XML 解析错误');
                }

                // 将 XML 转换为对象
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

                // 调整宽度
                const width = Math.max(420, getMaxValueLength(rootObj) * 8 + 100);
                document.body.style.width = `${width}px`;
            } catch (e) {
                document.body.textContent = 'XML解析错误：' + (e as Error).message;
            }
        }
    }, []);

    /**
     * 处理展开事件
     *
     * 在新窗口中打开指定路径的数据
     *
     * @param path - 数据路径
     * @param data - 要显示的数据
     * @param type - 数据类型 ('json' | 'xml')
     */
    const handleExpand = useCallback((_path: string, data: any, type: 'json' | 'xml') => {
        // 在新窗口中打开数据
        if (type === 'json') {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
          <html>
            <head>
              <title>JSON查看</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; }
              </style>
            </head>
            <body>${JSON.stringify(data, null, 2)}</body>
          </html>
        `);
            }
        } else {
            // XML数据在新窗口中打开
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
          <html>
            <head>
              <title>XML查看</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; }
              </style>
            </head>
            <body>${data}</body>
          </html>
        `);
            }
        }
    }, []);

    return (
        <div>
            {treeData && (
                <>
                    <div id="tree">
                        <RenderNode
                            data={treeData}
                            path={parentPath}
                            depth={0}
                            defaultExpand={true}
                            onExpand={handleExpand}
                        />
                    </div>
                    <ToastContainer
                        position="bottom-center"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </>
            )}
        </div>
    );
};

export default Viewer;