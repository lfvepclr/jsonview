import React, { useState, useRef, useEffect } from 'react';
import './popup.css';

const Popup: React.FC = () => {
  const [text, setText] = useState('');
  const [type, setType] = useState<'json' | 'xml' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 使用 ref 存储最新状态，避免闭包陷阱
  const stateRef = useRef({ text, valid, type });
  useEffect(() => {
    stateRef.current = { text, valid, type };
  });

  // 验证器
  const validate = (value: string) => {
    if (!value.trim()) return { type: null, valid: false, error: null };

    const trimmed = value.trim();

    // JSON检测
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return { type: 'json' as const, valid: true, error: null };
      } catch (e) {
        return { type: 'json' as const, valid: false, error: (e as Error).message.replace(/^JSON\.parse: /, '') };
      }
    }

    // XML检测
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      try {
        const doc = new DOMParser().parseFromString(trimmed, 'text/xml');
        const error = doc.querySelector('parsererror');
        if (error) {
          const msg = error.textContent || 'XML格式错误';
          const match = msg.match(/line (\d+).*?: (.+)/);
          return { type: 'xml' as const, valid: false, error: match ? `第${match[1]}行: ${match[2]}` : msg };
        }
        return { type: 'xml' as const, valid: true, error: null };
      } catch (e) {
        return { type: 'xml' as const, valid: false, error: (e as Error).message };
      }
    }

    return { type: null, valid: false, error: null };
  };

  // 实时检测
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    const result = validate(value);
    setType(result.type);
    setValid(result.valid);
    setError(result.error);
  };

  // 渲染
  const handleRender = () => {
    const { text, valid, type } = stateRef.current;
    if (!text.trim() || !valid) return;
    const dataType = type || 'json';
    chrome.tabs.create({
      url: chrome.runtime.getURL(`tabs/viewer.html?${dataType}=${encodeURIComponent(text)}&path=$`)
    });
  };

  // 复制
  const handleCopy = () => navigator.clipboard.writeText(text);

  // 清空
  const handleClear = () => {
    setText('');
    setType(null);
    setValid(false);
    setError(null);
  };

  // 快捷键 - 支持 Mac 和 Windows 快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { valid } = stateRef.current;
      const isModifier = e.ctrlKey || e.metaKey; // 支持 Ctrl (Windows) 和 Cmd (Mac)

      if (isModifier && e.key === 'Enter' && valid) handleRender();
      if (isModifier && e.key.toLowerCase() === 'l') handleClear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // 空依赖，只设置一次

  // 自动聚焦
  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const badge = type ? (valid ? `${type.toUpperCase()} ✓` : `${type.toUpperCase()} ✗`) : '待检测';
  const badgeClass = `badge ${type || ''} ${valid ? 'valid' : error ? 'invalid' : ''}`;

  return (
    <div className="popup-container">
      <div className="header">
        <div className="title">嵌套数据查看器</div>
        <div className={badgeClass}>{badge}</div>
      </div>

      <div className="input-section">
        <div className="label">支持 JSON/XML 互嵌</div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder='{"name": "示例"} 或 <root><item>1</item></root>'
          rows={8}
          className="input-textarea"
        />
      </div>

      <div className="controls">
        <button className="btn primary" onClick={handleRender} disabled={!text.trim() || !valid}>渲染</button>
        <button className="btn" onClick={handleCopy} disabled={!text.trim()}>复制</button>
        <button className="btn danger" onClick={handleClear} disabled={!text.trim()}>清空</button>
      </div>

      <div className="char-count">{text.length} 字符</div>

      {valid && type && <div className="notification success">✓ {type.toUpperCase()} 格式正确</div>}
      {error && <div className="notification error">✗ {error}</div>}

      <div className="tips">快捷键: Ctrl/Cmd+Enter 渲染 | Ctrl/Cmd+L 清空</div>
    </div>
  );
};

export default Popup;