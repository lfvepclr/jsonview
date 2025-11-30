/**
 * Viewer 组件 - 浏览器扩展详细视图
 *
 * 提供完整的 JSON/XML 数据查看功能：
 * 1. 从 URL 参数获取原始数据字符串
 * 2. 将原始数据传递给渲染组件
 * 3. 支持复制功能
 *
 * @component
 */
import React, {useCallback, useEffect, useState} from 'react';
import {ToastContainer} from 'react-toastify';
import "antd/dist/reset.css";
import 'react-toastify/dist/ReactToastify.css';
import {RenderNode} from '../views';
import {pdfjs} from 'react-pdf';
import '../../styles.css';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

/**
 * Viewer 组件
 *
 * 主要职责：
 * 1. 从 URL 获取原始 JSON/XML 数据字符串
 * 2. 将原始数据传递给渲染组件
 * 3. 管理组件状态
 */
const Viewer: React.FC = () => {
    /** 原始数据字符串 */
    const [rawData, setRawData] = useState<string | null>(null);

    /** 父路径 */
    const [parentPath, setParentPath] = useState('$');

    /**
     * 从 URL 参数获取原始数据字符串
     *
     * 从 URL 的 json/xml 参数中获取原始字符串数据
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const jsonStr = params.get('json');
        const xmlStr = params.get('xml');
        const path = params.get('path') || '$';

        setParentPath(path);

        if (jsonStr) {
            setRawData(jsonStr);
        } else if (xmlStr) {
            setRawData(xmlStr);
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
            {rawData && (
                <>
                    <div id="tree">
                        <RenderNode
                            data={rawData}
                            path={parentPath}
                            depth={0}
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