import '@ant-design/v5-patch-for-react-19';
import React, { useCallback, useState, useEffect } from 'react';
import { Button, Input, Space, Card, Tag, Typography, message } from 'antd';
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

    // 智能检测数据类型
    useEffect(() => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            setDetectedType(null);
            return;
        }

        if (trimmed.startsWith('<') && trimmed.includes('>')) {
            setDetectedType('xml');
        } else if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            setDetectedType('json');
        } else {
            setDetectedType(null);
        }
    }, [inputValue]);

    // 显示格式化错误
    const showParseError = useCallback((type: 'json' | 'xml', errorMsg: string) => {
        message.open({
            type: 'error',
            content: (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        <Text strong>{type.toUpperCase()} 解析错误</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        {errorMsg}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        提示：检查括号匹配、引号、标签闭合等语法
                    </Text>
                </Space>
            ),
            duration: 6,
            style: { marginTop: '20px' },
        });
    }, []);

    // 处理渲染
    const handleRenderNewWindow = useCallback(() => {
        const trimmedInput = inputValue.trim();

        if (!trimmedInput) {
            message.warning({
                content: '请先粘贴 JSON 或 XML 内容',
                icon: <InfoCircleOutlined />,
            });
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
                message.success({
                    content: (
                        <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text>JSON 格式验证通过！正在打开查看器...</Text>
                        </Space>
                    ),
                    duration: 2,
                });
            } else {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(trimmedInput, "text/xml");
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error(parserError.textContent || 'XML 格式错误');
                }
                message.success({
                    content: (
                        <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text>XML 格式验证通过！正在打开查看器...</Text>
                        </Space>
                    ),
                    duration: 2,
                });
            }

            setTimeout(() => {
                chrome.tabs.create({
                    url: chrome.runtime.getURL(`tabs/viewer.html?${dataType}=${encodeURIComponent(trimmedInput)}&path=${encodeURIComponent('$')}`)
                });
                setIsParsing(false);
            }, 500);

        } catch (e) {
            setIsParsing(false);
            showParseError(dataType, (e as Error).message);
        }
    }, [inputValue, detectedType, showParseError]);

    const handleClear = useCallback(() => {
        setInputValue('');
        message.info({
            content: '内容已清空',
            icon: <InfoCircleOutlined />,
            duration: 1.5,
        });
    }, []);

    const handleCopy = useCallback(async () => {
        if (!inputValue) {
            message.warning('没有可复制的内容');
            return;
        }
        try {
            await navigator.clipboard.writeText(inputValue);
            message.success({
                content: '已复制到剪贴板！',
                duration: 1.5,
                icon: <CheckCircleOutlined />,
            });
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = inputValue;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            message.success({
                content: '已复制到剪贴板！',
                duration: 1.5,
                icon: <CheckCircleOutlined />,
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

    const charCount = inputValue.length;
    const isValidLength = charCount > 0 && charCount < 50000;

    return (
        <div className="popup-container">
            <Card
                title={
                    <Space align="center">
                        <CodeOutlined style={{ color: '#1677ff' }} />
                        <Text strong style={{ fontSize: '16px' }}>嵌套数据查看器</Text>
                    </Space>
                }
                extra={        // ✅ 位于此处的 extra 属性已修复
                    detectedType && (
                        <Tag
                            icon={detectedType === 'json' ? <CodeOutlined /> : <FileTextOutlined />}
                            color={detectedType === 'json' ? 'blue' : 'green'}
                            style={{ fontSize: '12px' }}
                        >
                            {detectedType.toUpperCase()}
                        </Tag>
                    )
                }
                variant="borderless"
                style={{ width: '100%' }}
                styles={{
                    body: { padding: '16px', paddingBottom: '12px' },
                    header: { padding: '12px 16px' }
                }}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                            支持 JSON（可内嵌 XML）或 XML（可内嵌 JSON）
                        </Text>

                        <TextArea
                            id="input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
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
                            maxLength={100000}
                            status={!isValidLength && inputValue ? 'error' : detectedType ? 'warning' : ''}
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
                                disabled={!isValidLength || isParsing}
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
        </div>
    );
};

export default Popup;