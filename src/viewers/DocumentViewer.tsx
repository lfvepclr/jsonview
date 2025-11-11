/**
 * Viewer 组件 - 独立查看器窗口
 *
 * 这是用于在新窗口中查看 JSON 数据的独立组件。
 * 它提供了以下功能：
 * 1. 从 URL 参数获取并渲染 JSON 数据
 * 2. 自动调整窗口宽度以适应内容
 * 3. 显示完整的数据路径
 * 4. 支持展开嵌套的 JSON/XML 字符串
 *
 * @component
 */
import React, {useCallback, useEffect, useState} from 'react';
import {RenderNode} from '../core/NodeRenderer';
import {getMaxValueLength} from '../utils/helperUtils';
import '../../styles.css';
import {JSONValue} from '../types';

/**
 * Viewer 组件
 *
 * 主要职责：
 * 1. 解析 URL 参数中的 JSON 数据
 * 2. 渲染完整的 JSON 结构
 * 3. 处理嵌套内容的展开操作
 */
const Viewer: React.FC = () => {
    /** 解析后的 JSON 数据 */
    const [treeData, setTreeData] = useState<JSONValue | null>(null);

    /** 父级路径 */
    const [parentPath, setParentPath] = useState('$');

    /**
     * 组件挂载时从 URL 参数获取数据
     *
     * 解析 URL 中的 json 和 path 参数，并设置相应的状态
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const jsonStr = params.get('json');
        const path = params.get('path') || '$';

        setParentPath(path);

        if (jsonStr) {
            try {
                const obj = JSON.parse(jsonStr);
                setTreeData(obj);

                // 动态宽度
                const width = Math.max(420, getMaxValueLength(obj) * 8 + 100);
                document.body.style.width = `${width}px`;
            } catch (e) {
                document.body.textContent = '解析失败：' + (e as Error).message;
            }
        }
    }, []);

    /**
     * 处理展开事件
     *
     * 在新窗口中显示展开的内容
     *
     * @param path - 数据路径
     * @param data - 要展开的数据
     * @param type - 数据类型 ('json' | 'xml')
     */
    const handleExpand = useCallback((_path: string, data: any, type: 'json' | 'xml') => {
        // 在新窗口中显示展开的内容
        if (type === 'json') {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
          <html>
            <head>
              <title>子JSON查看器</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; }
              </style>
            </head>
            <body>${JSON.stringify(data, null, 2)}</body>
          </html>
        `);
            }
        } else {
            // 对于XML，在新窗口中显示格式化内容
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
          <html>
            <head>
              <title>XML查看器</title>
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
                </>
            )}
        </div>
    );
};

export default Viewer;