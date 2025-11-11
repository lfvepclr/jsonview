import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
import {buildPath, lastKey} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';

/**
 * 对象视图组件
 * 处理对象类型的渲染，支持展开/收缩和递归渲染子元素
 */
const ObjectView: React.FC<ViewComponentProps> = ({
                                                      data,
                                                      path,
                                                      depth,
                                                      renderChild
                                                  }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const keyName = lastKey(path);
    const objectData = data as Record<string, any>;
    const keys = Object.keys(objectData || {}).sort();

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 使用统一的复制功能Hook
    const {handleCopy} = useCopy(copyPresets.object(objectData));

    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                {/* 对象标题区域 */}
                <div className="key-container expandable-key" onClick={toggleExpand}>
                    <span className="expand-btn">{isExpanded ? '▼' : '▶'}</span>
                    <span className="key">
            {(path === '$' ? '' : keyName + ': ') + '{'}
          </span>
                </div>

                {/* 复制按钮区域 - 放在value位置 */}
                <div className="value-container copyable" onClick={handleCopy}>
                    <span style={{opacity: 0, pointerEvents: 'none'}}>📋</span>
                </div>
            </div>

            {/* 子属性区域 */}
            {isExpanded && (
                <div className="children-wrapper">
                    {keys.map((key) => (
                        <div key={key}>
                            {renderChild(
                                objectData[key],
                                buildPath(path, key, false),
                                depth + 1
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 对象结束符号 */}
            <div className="end-symbol" style={{marginLeft: '16px'}}>
                {'}'}
            </div>
        </div>
    );
};

export default ObjectView;