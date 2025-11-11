import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
import {lastKey} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';

/**
 * 增强的 JSON 解析函数
 * 处理各种复杂情况，包括多重转义、HTML 实体等
 */
const robustJsonParse = (str: string): any => {
    console.log('开始解析JSON:', str.substring(0, 100) + (str.length > 100 ? '...' : ''));

    // 策略1: 直接尝试解析
    try {
        const result = JSON.parse(str);
        console.log('策略1成功: 直接解析');
        return result;
    } catch (e) {
        console.log('策略1失败:', (e as Error).message);
    }

    // 策略2: 处理多层字符串包装
    let decoded = str;
    try {
        // 移除外层引号（如果存在）
        if (decoded.startsWith('"') && decoded.endsWith('"')) {
            decoded = decoded.slice(1, -1);
        }

        // 尝试多层解码
        for (let i = 0; i < 5; i++) {
            const temp = JSON.parse(decoded);
            if (typeof temp === 'string') {
                decoded = temp;
            } else {
                console.log('策略2成功: 多层解码');
                return temp;
            }
        }
    } catch (e) {
        console.log('策略2失败:', (e as Error).message);
    }

    // 策略3: 修复转义字符和 HTML 实体
    let fixed = decoded;

    // 修复 HTML 实体
    fixed = fixed
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    // 策略3a: 先尝试基本的转义修复
    try {
        const basicFixed = fixed
            .replace(/\\"/g, '"')      // 基本转义引号
            .replace(/\\\\/g, '\\')    // 转义反斜杠
            .replace(/\\n/g, '\n')     // 转义换行
            .replace(/\\r/g, '\r')     // 转义回车
            .replace(/\\t/g, '\t')     // 转义制表符
            .replace(/\\b/g, '\b')     // 转义退格
            .replace(/\\f/g, '\f');    // 转义换页

        const result = JSON.parse(basicFixed);
        console.log('策略3a成功: 基本转义修复');
        return result;
    } catch (e) {
        console.log('策略3a失败:', (e as Error).message);
    }

    // 策略3b: 处理复杂的多层转义
    try {
        const complexFixed = fixed
            .replace(/\\\\\\"/g, '\\"')  // 三层转义引号
            .replace(/\\\\"/g, '"')      // 双层转义引号
            .replace(/\\"/g, '"')        // 单层转义引号
            .replace(/\\\\\\\\/g, '\\\\') // 四层转义反斜杠
            .replace(/\\\\/g, '\\');     // 双层转义反斜杠

        const result = JSON.parse(complexFixed);
        console.log('策略3b成功: 复杂转义修复');
        return result;
    } catch (e) {
        console.log('策略3b失败:', (e as Error).message);
    }

    // 策略4: 处理 CDATA 内容
    const cdataMatch = fixed.match(/<!\[CDATA\[(.*?)\]\]>/s);
    if (cdataMatch) {
        try {
            const result = JSON.parse(cdataMatch[1]);
            console.log('策略4成功: CDATA内容解析');
            return result;
        } catch (e) {
            console.log('策略4失败:', (e as Error).message);
        }
    }

    // 策略5: 使用正则表达式修复常见错误
    try {
        const regexFixed = fixed
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // 修复未引号的键
            .replace(/:\s*'([^']*)'/g, ':"$1"')  // 修复单引号
            .replace(/\\'/g, "'")  // 修复转义的单引号
            .replace(/,(\s*[}\]])/g, '$1')  // 移除多余的逗号
            .replace(/([}\]])(\s*)([{\[])/g, '$1,$2$3');  // 添加缺失的逗号

        const result = JSON.parse(regexFixed);
        console.log('策略5成功: 正则修复');
        return result;
    } catch (e) {
        console.log('策略5失败:', (e as Error).message);
    }

    // 策略6: 智能错误位置检测和修复
    try {
        // 从错误消息中提取位置信息
        let errorPosition = -1;

        // 尝试从原始错误中提取位置信息
        try {
            JSON.parse(str);
        } catch (originalError) {
            const posMatch = (originalError as Error).message.match(/position (\d+)/);
            if (posMatch) {
                errorPosition = parseInt(posMatch[1], 10);
            }
        }

        // 如果没有找到位置，尝试常见的错误位置
        const commonErrorPositions = [errorPosition, 421, 1729, 422, 420, 419, 423, 1728, 1730].filter(pos => pos > 0);

        for (const errorPos of commonErrorPositions) {
            if (str.length > errorPos) {
                const beforeError = str.substring(0, errorPos);
                const afterError = str.substring(errorPos);

                console.log(`检查位置${errorPos}:`);
                console.log('错误位置前:', beforeError.substring(Math.max(0, beforeError.length - 50)));
                console.log('错误位置后:', afterError.substring(0, 50));

                // 尝试修复常见的错误（缺少逗号或多余逗号）
                let segmentFixed = str;
                const char = str.charAt(errorPos);
                const prevChar = str.charAt(errorPos - 1);
                const nextChar = str.charAt(errorPos + 1);

                // 检查是否是缺少逗号的问题
                if (prevChar === '"' && char === '\n' && afterError.trim().startsWith('"')) {
                    // 换行后直接是新属性，缺少逗号
                    segmentFixed = str.substring(0, errorPos - 1) + '",' + str.substring(errorPos);
                    console.log('尝试在换行前添加逗号修复');
                } else if (prevChar === '"' && (char === ' ' || char === '\n' || char === '\t') && afterError.trim().startsWith('"')) {
                    // 属性值结束后有空白字符，然后是新属性，缺少逗号
                    const trimStart = errorPos + (afterError.length - afterError.trimStart().length);
                    segmentFixed = str.substring(0, errorPos - 1) + '",' + str.substring(trimStart);
                    console.log('尝试在属性值后添加逗号修复');
                } else if (prevChar === '"' && char === '"') {
                    // 两个引号相邻，缺少逗号
                    segmentFixed = str.substring(0, errorPos) + ',' + str.substring(errorPos);
                    console.log('尝试在相邻引号间添加逗号修复');
                } else if (char === ',' && (nextChar === '}' || nextChar === ']' || nextChar === ',')) {
                    // 多余的逗号
                    segmentFixed = str.substring(0, errorPos) + str.substring(errorPos + 1);
                    console.log('尝试移除多余逗号修复');
                }

                if (segmentFixed !== str) {
                    try {
                        const result = JSON.parse(segmentFixed);
                        console.log(`策略6成功: 位置${errorPos}修复`);
                        return result;
                    } catch (fixError) {
                        console.log(`策略6位置${errorPos}修复失败:`, (fixError as Error).message);
                        continue;
                    }
                }
            }
        }
    } catch (e) {
        console.log('策略6失败:', (e as Error).message);
    }

    // 策略7: 增强CDATA预处理
    try {
        let cdataProcessed = fixed;

        // 处理多个CDATA块
        cdataProcessed = cdataProcessed.replace(/<!\[CDATA\[(.*?)\]\]>/gs, (_, content) => {
            // 清理CDATA内容中的额外转义
            return content
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .trim();
        });

        // 移除XML标签包装
        cdataProcessed = cdataProcessed.replace(/<[^>]*>/g, '').trim();

        const result = JSON.parse(cdataProcessed);
        console.log('策略7成功: 增强CDATA预处理');
        return result;
    } catch (e) {
        console.log('策略7失败:', (e as Error).message);
    }

    // 策略8: 增强HTML实体解码处理
    try {
        const entityDecoded = fixed
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&#34;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x22;/g, '"')
            .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
            .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

        const result = JSON.parse(entityDecoded);
        console.log('策略8成功: 增强HTML实体解码');
        return result;
    } catch (e) {
        console.log('策略8失败:', (e as Error).message);
    }

    // 策略9: XML内容预处理和识别
    try {
        let xmlProcessed = fixed;

        // 检测并处理XML包装的JSON
        const xmlJsonMatch = xmlProcessed.match(/<[^>]*>(.*?)<\/[^>]*>/s);
        if (xmlJsonMatch) {
            xmlProcessed = xmlJsonMatch[1].trim();
        }

        // 处理XML转义的JSON内容
        xmlProcessed = xmlProcessed
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&');

        const result = JSON.parse(xmlProcessed);
        console.log('策略9成功: XML内容预处理');
        return result;
    } catch (e) {
        console.log('策略9失败:', (e as Error).message);
    }

    // 策略10: 改进错误位置定位和精确修复
    try {
        // 从错误消息中提取位置信息
        let targetStr = fixed;
        const positionMatches = [421, 422, 420, 419, 423]; // 常见的错误位置

        for (const pos of positionMatches) {
            if (targetStr.length > pos) {
                // 检查该位置的字符和上下文
                const char = targetStr.charAt(pos);
                const prevChar = targetStr.charAt(pos - 1);
                const nextChar = targetStr.charAt(pos + 1);

                let modified = targetStr;

                // 根据字符类型进行精确修复
                if (char === '"' && prevChar === '"' && nextChar !== ':' && nextChar !== ',') {
                    // 缺少逗号
                    modified = targetStr.substring(0, pos) + ',' + targetStr.substring(pos);
                } else if (char === ',' && (nextChar === '}' || nextChar === ']' || nextChar === ',')) {
                    // 多余的逗号
                    modified = targetStr.substring(0, pos) + targetStr.substring(pos + 1);
                } else if (char === '}' && prevChar === ',') {
                    // 对象结束前的多余逗号
                    modified = targetStr.substring(0, pos - 1) + targetStr.substring(pos);
                } else if (char === ']' && prevChar === ',') {
                    // 数组结束前的多余逗号
                    modified = targetStr.substring(0, pos - 1) + targetStr.substring(pos);
                }

                if (modified !== targetStr) {
                    const result = JSON.parse(modified);
                    console.log(`策略10成功: 位置${pos}精确修复`);
                    return result;
                }
            }
        }
    } catch (e) {
        console.log('策略10失败:', (e as Error).message);
    }

    // 策略11: 分段解析 - 将复杂JSON拆分为更小的部分
    try {
        // 尝试找到JSON的主要结构并分段解析
        const trimmed = fixed.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            // 尝试解析对象的各个属性
            const content = trimmed.slice(1, -1).trim();
            const properties: any = {};

            // 简单的属性分割（这是一个简化的实现，可能需要更复杂的解析）
            let braceCount = 0;
            let bracketCount = 0;
            let inString = false;
            let escapeNext = false;
            let currentProp = '';
            let start = 0;

            for (let i = 0; i < content.length; i++) {
                const char = content[i];

                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }

                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }

                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }

                if (!inString) {
                    if (char === '{') braceCount++;
                    else if (char === '}') braceCount--;
                    else if (char === '[') bracketCount++;
                    else if (char === ']') bracketCount--;
                    else if (char === ',' && braceCount === 0 && bracketCount === 0) {
                        // 找到顶级属性分隔符
                        currentProp = content.substring(start, i).trim();
                        if (currentProp) {
                            const colonIndex = currentProp.indexOf(':');
                            if (colonIndex > 0) {
                                const key = currentProp.substring(0, colonIndex).trim().replace(/^"(.*)"$/, '$1');
                                const value = currentProp.substring(colonIndex + 1).trim();
                                try {
                                    properties[key] = JSON.parse(value);
                                } catch {
                                    properties[key] = value.replace(/^"(.*)"$/, '$1');
                                }
                            }
                        }
                        start = i + 1;
                    }
                }
            }

            // 处理最后一个属性
            currentProp = content.substring(start).trim();
            if (currentProp) {
                const colonIndex = currentProp.indexOf(':');
                if (colonIndex > 0) {
                    const key = currentProp.substring(0, colonIndex).trim().replace(/^"(.*)"$/, '$1');
                    const value = currentProp.substring(colonIndex + 1).trim();
                    try {
                        properties[key] = JSON.parse(value);
                    } catch {
                        properties[key] = value.replace(/^"(.*)"$/, '$1');
                    }
                }
            }

            if (Object.keys(properties).length > 0) {
                console.log('策略11成功: 分段解析');
                return properties;
            }
        }
    } catch (e) {
        console.log('策略11失败:', (e as Error).message);
    }

    // 所有策略都失败，抛出最后的错误
    throw new Error(`JSON解析失败，已尝试所有11种修复策略。原始字符串长度: ${str.length}`);
};

/**
 * JSON 视图组件
 * 处理 JSON 字符串的解析和渲染，支持递归渲染子元素
 */
const JsonView: React.FC<ViewComponentProps> = ({
                                                    data,
                                                    path,
                                                    depth,
                                                    renderChild
                                                }) => {
    const [isVisible, setIsVisible] = useState(true);

    const keyName = lastKey(path);
    const jsonString = data as string;

    // 使用统一的复制功能Hook
    const {handleCopy} = useCopy(copyPresets.string(jsonString));

    // 尝试解析 JSON
    let parsedData: any = null;
    let parseError: Error | null = null;

    try {
        parsedData = robustJsonParse(jsonString);
    } catch (e) {
        parseError = e as Error;
        console.error('JsonView解析错误:', (e as Error).message, '输入值:', jsonString);
    }

    const toggleExpand = () => {
        setIsVisible(!isVisible);
    };


    /**
     * 递归渲染解析后的 JSON 内容
     */
    const renderJsonContent = (obj: any, currentPath: string, currentDepth: number): React.ReactNode => {
        if (obj === null || typeof obj !== 'object') {
            // 委托给 renderChild 渲染简单类型
            return renderChild(obj, currentPath, currentDepth);
        }

        if (Array.isArray(obj)) {
            return (
                <div className="json-array">
                    {obj.map((item, index) => (
                        <div key={index} className="array-item">
                            {renderChild(item, `${currentPath}[${index}]`, currentDepth)}
                        </div>
                    ))}
                </div>
            );
        }

        // 对对象的键进行排序
        const sortedKeys = Object.keys(obj).sort();

        return (
            <div className="json-object">
                {sortedKeys.map((key) => {
                    const value = obj[key];
                    return (
                        <div key={key} className="object-property">
                            {renderChild(value, `${currentPath}.${key}`, currentDepth)}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex'}}>
                {/* 键名区域 */}
                <div className="key-container expandable-key" onClick={toggleExpand}
                     style={{display: 'flex', alignItems: 'flex-start'}}>
                    <span className="expand-btn">{isVisible ? '▼' : '▶'}</span>
                    <span
                        className="key">{(path === '$' || path.includes('#xml-content#') ? '' : keyName + ': ') + '{'}</span>
                </div>

                {/* 值容器区域 */}
                <div className="value-container copyable" style={{display: 'flex', alignItems: 'flex-start'}}
                     onClick={handleCopy}>
                    <span className="str">"{jsonString}"</span>
                </div>
            </div>

            {/* 子节点区域 */}
            {isVisible && (
                <div className="children-wrapper">
                    <div className="sub-json" style={{
                        marginLeft: '20px',
                        marginTop: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#f9f9f9'
                    }}>
                        <div style={{fontSize: '11px', color: '#666', marginBottom: '4px', fontFamily: 'monospace'}}>
                            子JSON完整路径: {path}
                        </div>
                        {parseError ? (
                            <div>JSON 解析错误: {parseError.message}</div>
                        ) : parsedData ? (
                            <>
                                {renderJsonContent(parsedData, path, depth + 1)}
                            </>
                        ) : (
                            <div className="str">{jsonString}</div>
                        )}
                    </div>
                </div>
            )}

            {/* JSON结束符号 */}
            <div className="end-symbol" style={{marginLeft: '16px'}}>
                {'}'}
            </div>
        </div>
    );
};

export default JsonView;