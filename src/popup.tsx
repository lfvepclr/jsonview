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
import ReactDOM from 'react-dom/client';
import RenderNode from './core/RenderNode';
import '../styles.css';
import {FloatData, JSONValue} from './types';

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

    /** 浮层数据 */
    const [floatData, setFloatData] = useState<FloatData | null>(null);

    /**
     * 处理渲染按钮点击事件
     *
     * 解析输入的 JSON 字符串并渲染结果
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
            // JSON 解析失败，继续尝试其他格式
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

                // 如果成功解析为 XML，将其作为字符串传递给渲染器
                setTreeData(trimmedInput);
                setError(null);
                return;
            } catch (e) {
                setError((e as Error).message);
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

        // 首先尝试解析为 JSON
        try {
            JSON.parse(trimmedInput); // 验证
            window.open(`viewer.html?json=${encodeURIComponent(trimmedInput)}&path=${encodeURIComponent('$')}`, '_blank');
            return;
        } catch (e) {
            // JSON 解析失败，继续尝试其他格式
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

                // 如果成功解析为 XML，传递给查看器
                window.open(`viewer.html?json=${encodeURIComponent(JSON.stringify(trimmedInput))}&path=${encodeURIComponent('$')}`, '_blank');
                return;
            } catch (e) {
                alert('XML解析错误: ' + (e as Error).message);
                return;
            }
        }

        // 如果既不是有效的 JSON 也不是有效的 XML
        alert('输入既不是有效的 JSON 也不是有效的 XML');
    }, [inputValue]);

    /**
     * 处理展开浮层事件
     *
     * 显示指定路径的数据在浮层中
     *
     * @param path - 数据路径
     * @param data - 要显示的数据
     * @param type - 数据类型 ('json' | 'xml')
     */
    const handleExpand = useCallback((path: string, data: any, type: 'json' | 'xml') => {
        // 实现浮动层显示逻辑
        setFloatData({path, data, type});
    }, []);

    return (
        <div>
            <h3>输入 JSON</h3>
            <textarea
                id="input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="粘贴 JSON 字符串…"
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

            {treeData && (
                <div id="tree">
                    <RenderNode
                        data={treeData}
                        onExpand={handleExpand}
                    />
                </div>
            )}

            {floatData && (
                <div id="floatLayer" className="float-layer">
                    <div className="float-header">
                        <span id="floatPath">完整{floatData.type.toUpperCase()}路径: {floatData.path}</span>
                        <button id="closeFloat" onClick={() => setFloatData(null)}>×</button>
                    </div>
                    <div id="floatBody">
                        {floatData.type === 'json' ? (
                            <pre>{JSON.stringify(floatData.data, null, 2)}</pre>
                        ) : (
                            <pre>{floatData.data}</pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>,
);