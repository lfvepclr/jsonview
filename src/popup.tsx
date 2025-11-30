import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button, Input, Space, Card, Tag, Typography } from 'antd';
import {
    EyeOutlined,
    ClearOutlined,
    CopyOutlined,
    CodeOutlined,
    FileTextOutlined,  // ✅ 修正
    CheckCircleOutlined,
    CloseCircleOutlined, // ✅ 新增
    InfoCircleOutlined
} from '@ant-design/icons';
import "antd/dist/reset.css";
import './popup.css';

const { TextArea } = Input;
const { Text } = Typography;

const Popup: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [detectedType, setDetectedType] = useState<'json' | 'xml' | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const inputRef = useRef<any>(null);

    // 提示状态管理
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

    // 验证JSON格式并返回验证结果
    const validateJson = useCallback((value: string): { isValid: boolean; error?: string } => {
        try {
            JSON.parse(value);
            return { isValid: true };
        } catch (e) {
            return { isValid: false, error: (e as Error).message };
        }
    }, []);

    // 验证XML格式并返回验证结果
    const validateXml = useCallback((value: string): { isValid: boolean; error?: string } => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(value, "text/xml");
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                return { isValid: false, error: parserError.textContent || 'XML 格式错误' };
            }
            return { isValid: true };
        } catch (e) {
            return { isValid: false, error: (e as Error).message };
        }
    }, []);
    // 防抖处理的数据类型检测和格式验证
    const detectDataType = useCallback((value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setDetectedType(null);
            setIsDetecting(false);
            // 清空输入时隐藏提示
            setNotification(prev => ({ ...prev, visible: false }));
            return;
        }

        setIsDetecting(true);

        let detectedDataType: 'json' | 'xml' | null = null;

        // 检测数据类型
        if (trimmed.startsWith('<') && trimmed.includes('>')) {
            detectedDataType = 'xml';
        } else if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            detectedDataType = 'json';
        }

        setDetectedType(detectedDataType);

        // 如果检测到数据类型，进行格式验证
        if (detectedDataType) {
            let validationResult: { isValid: boolean; error?: string };

            if (detectedDataType === 'json') {
                validationResult = validateJson(trimmed);
            } else {
                validationResult = validateXml(trimmed);
            }

            setIsDetecting(false);

            // 显示验证结果提示
            if (validationResult.isValid) {
                setNotification({
                    type: 'success',
                    message: `${detectedDataType.toUpperCase()} 格式正确 ✓`,
                    visible: true
                });
                // 成功提示2秒后自动隐藏
                setTimeout(() => {
                    setNotification(prev => ({ ...prev, visible: false }));
                }, 2000);
            } else {
                setNotification({
                    type: 'error',
                    message: `${detectedDataType.toUpperCase()} 格式错误 ✗`,
                    visible: true
                });
                // 错误提示3秒后自动隐藏
                setTimeout(() => {
                    setNotification(prev => ({ ...prev, visible: false }));
                }, 3000);
            }
        } else if (trimmed.length > 0) {
            setIsDetecting(false);
            // 非JSON/XML格式内容，提供明确提示
            setNotification({
                type: 'warning',
                message: '检测到文本内容，但格式不是标准JSON或XML ⚠',
                visible: true
            });
            // 警告提示2秒后自动隐藏
            setTimeout(() => {
                setNotification(prev => ({ ...prev, visible: false }));
            }, 2000);
        } else {
            setIsDetecting(false);
        }
    }, [validateJson, validateXml]);

    // 防抖处理的数据类型检测
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // 清除之前的定时器
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // 立即进行快速类型检测（不进行格式验证，避免频繁验证）
        const trimmed = value.trim();
        if (!trimmed) {
            setDetectedType(null);
            setNotification(prev => ({ ...prev, visible: false }));
            return;
        }

        // 快速类型检测
        if (trimmed.startsWith('<') && trimmed.includes('>')) {
            setDetectedType('xml');
        } else if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            setDetectedType('json');
        } else {
            setDetectedType(null);
        }

        // 设置防抖定时器，300ms后进行完整的格式验证
        debounceTimerRef.current = setTimeout(() => {
            detectDataType(value);
        }, 300);
    }, [detectDataType]);



    // 处理渲染
    const handleRenderNewWindow = useCallback(() => {
        const trimmedInput = inputValue.trim();

        if (!trimmedInput) {
            setNotification({
                type: 'warning',
                message: '请先粘贴 JSON 或 XML 内容',
                visible: true
            });

            // 2秒后自动隐藏警告提示
            setTimeout(() => {
                setNotification(prev => ({ ...prev, visible: false }));
            }, 2000);
            return;
        }

        let dataType: 'json' | 'xml' = detectedType || 'json';

        if (!detectedType) {
            try {
                JSON.parse(trimmedInput);
                dataType = 'json';
            } catch {
                dataType = 'xml';
            }
        }

        setIsParsing(true);

        try {
            if (dataType === 'json') {
                JSON.parse(trimmedInput);
                setNotification({
                    type: 'success',
                    message: 'JSON 格式验证通过！正在打开查看器...',
                    visible: true
                });

                // 2秒后自动隐藏成功提示
                setTimeout(() => {
                    setNotification(prev => ({ ...prev, visible: false }));
                }, 2000);
            } else {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(trimmedInput, "text/xml");
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error(parserError.textContent || 'XML 格式错误');
                }
                setNotification({
                    type: 'success',
                    message: 'XML 格式验证通过！正在打开查看器...',
                    visible: true
                });

                // 2秒后自动隐藏成功提示
                setTimeout(() => {
                    setNotification(prev => ({ ...prev, visible: false }));
                }, 2000);
            }

            chrome.tabs.create({
                url: chrome.runtime.getURL(`tabs/viewer.html?${dataType}=${encodeURIComponent(trimmedInput)}&path=${encodeURIComponent('$')}`)
            });
            setIsParsing(false);

        } catch (e) {
            setIsParsing(false);
            setNotification({
                type: 'error',
                message: `${dataType.toUpperCase()} 解析错误: ${(e as Error).message}`,
                visible: true
            });

            // 3秒后自动隐藏错误提示
            setTimeout(() => {
                setNotification(prev => ({ ...prev, visible: false }));
            }, 3000);
        }
    }, [inputValue, detectedType]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setNotification({
            type: 'info',
            message: '内容已清空',
            visible: true
        });

        // 1.5秒后自动隐藏信息提示
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 1500);
    }, []);

    const handleCopy = useCallback(async () => {
        if (!inputValue) {
            setNotification({
                type: 'warning',
                message: '没有可复制的内容',
                visible: true
            });

            // 2秒后自动隐藏警告提示
            setTimeout(() => {
                setNotification(prev => ({ ...prev, visible: false }));
            }, 2000);
            return;
        }
        try {
            await navigator.clipboard.writeText(inputValue);
            setNotification({
                type: 'success',
                message: '已复制到剪贴板！',
                visible: true
            });
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = inputValue;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setNotification({
                type: 'success',
                message: '已复制到剪贴板！',
                visible: true
            });
        }
    }, [inputValue]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputValue) {
                e.preventDefault();
                handleRenderNewWindow();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRenderNewWindow, handleClear, inputValue]);

    // 自动聚焦到输入框
    useEffect(() => {
        // 使用setTimeout确保DOM完全渲染后再聚焦
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, []);

    const charCount = inputValue.length;

    return (
        <div className="popup-container">
            <Card
                title={
                    <Space align="center">
                        <CodeOutlined style={{ color: '#1677ff' }} />
                        <Text strong style={{ fontSize: '16px' }}>嵌套数据查看器</Text>
                    </Space>
                }
                extra={
                    <Space size="small">
                        {isDetecting && (
                            <Tag color="processing" style={{ fontSize: '12px' }}>
                                检测中...
                            </Tag>
                        )}
                        {detectedType && !isDetecting && (
                            <Tag
                                icon={detectedType === 'json' ? <CodeOutlined /> : <FileTextOutlined />}
                                color={detectedType === 'json' ? 'blue' : 'green'}
                                style={{ fontSize: '12px' }}
                            >
                                {detectedType.toUpperCase()}
                            </Tag>
                        )}
                    </Space>
                }
                variant="borderless"
                style={{ width: '100%' }}
                styles={{
                    body: { padding: '16px', paddingBottom: '12px' },
                    header: { padding: '12px 16px' }
                }}
            >
                <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                            支持 JSON（可内嵌 XML）或 XML（可内嵌 JSON）
                        </Text>

                        <TextArea
                            id="input"
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={`{
  "name": "示例数据",
  "nestedXML": "<user><name>张三</name></user>",
  "array": [1, 2, 3]
}

或

<root>
  <jsonData>{"key": "value"}</jsonData>
</root>`}
                            autoSize={{ minRows: 8, maxRows: 15 }}
                            showCount

                            status={detectedType ? 'warning' : ''}
                            disabled={isParsing}
                            style={{ fontFamily: 'Monaco, Menlo, Consolas, monospace', fontSize: '13px' }}
                        />
                    </div>

                    <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={handleRenderNewWindow}
                                disabled={!inputValue || isParsing}
                                loading={isParsing}
                                size="middle"
                                style={{ minWidth: '110px' }}
                            >
                                渲染
                            </Button>

                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopy}
                                disabled={!inputValue || isParsing}
                                size="middle"
                                style={{ minWidth: '90px' }}
                            >
                                复制
                            </Button>

                            <Button
                                danger
                                icon={<ClearOutlined />}
                                onClick={handleClear}
                                disabled={!inputValue || isParsing}
                                size="middle"
                                style={{ minWidth: '90px' }}
                            >
                                清空
                            </Button>
                        </Space>

                        {charCount > 0 && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {charCount.toLocaleString()} 字符
                            </Text>
                        )}
                    </Space>

                    <div style={{
                        fontSize: '11px',
                        color: '#8c8c8c',
                        textAlign: 'right',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '8px',
                        marginTop: '4px'
                    }}>
                        <Space size="small">
                            <InfoCircleOutlined />
                            <Text type="secondary">快捷键: Ctrl+Enter 渲染 | Ctrl+L 清空</Text>
                        </Space>
                    </div>
                </Space>
            </Card>

            {/* 提示显示区域 */}
            {notification.visible && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'Monaco, Menlo, Consolas, monospace',
                        backgroundColor: notification.type === 'error' ? '#fff2f0' :
                                       notification.type === 'warning' ? '#fffbe6' :
                                       notification.type === 'success' ? '#f6ffed' : '#e6f7ff',
                        border: `1px solid ${
                            notification.type === 'error' ? '#ffccc7' : 
                            notification.type === 'warning' ? '#ffe58f' :
                            notification.type === 'success' ? '#b7eb8f' : '#91d5ff'
                        }`,
                        color: notification.type === 'error' ? '#ff4d4f' :
                               notification.type === 'warning' ? '#faad14' :
                               notification.type === 'success' ? '#52c41a' : '#1677ff',
                        animation: 'slideInUp 0.3s ease-out'
                    }}
                >
                    <Space size="small" align="center">
                        {notification.type === 'error' && <CloseCircleOutlined />}
                        {notification.type === 'warning' && <InfoCircleOutlined />}
                        {notification.type === 'success' && <CheckCircleOutlined />}
                        {notification.type === 'info' && <InfoCircleOutlined />}
                        <Text style={{
                            color: 'inherit',
                            fontSize: 'inherit',
                            margin: 0
                        }}>
                            {notification.message}
                        </Text>
                    </Space>
                </div>
            )}
        </div>
    );
};

export default Popup;