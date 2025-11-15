import React, {useState} from 'react';
import {ViewComponentProps} from '../types';
import {buildPath, lastKey} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';

/**
 * 数组视图组件
 * 处理数组类型的渲染，支持展开/收缩和递归渲染子元素
 */
const ArrayView: React.FC<ViewComponentProps> = ({
                                                     data,
                                                     path,
                                                     depth,
                                                     renderChild
                                                 }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const keyName = lastKey(path);
    const arrayData = data as any[];
    const keys = Object.keys(arrayData || {});

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 使用统一的复制功能Hook
    const {handleCopy} = useCopy(copyPresets.array(arrayData));

    return (
        <div className="node" data-depth={depth}>
            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                {/* 数组标题区域 */}
                <div className="key-container expandable-key" onClick={toggleExpand}>
                    <span className="expand-btn">{isExpanded ? '▼' : '▶'}</span>
                    <span className="key">
                        {(path === '$' ? '' : keyName + ': ') + '['}
                    </span>
                </div>

                {/* 复制按钮区域 - 放在value位置 */}
                <div className="value-container copyable" onClick={handleCopy}>
                    <span style={{opacity: 0, pointerEvents: 'none'}}>📋</span>
                </div>
            </div>

            {/* 子元素区域 */}
            {isExpanded && (
                <div className="children-wrapper">
                    {keys.map((key) => (
                        <div key={key}>
                            {renderChild(
                                arrayData[parseInt(key)],
                                buildPath(path, key, true),
                                depth + 1
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 数组结束符号 */}
            <div className="end-symbol" style={{marginLeft: '16px'}}>
                ]
            </div>
        </div>
    );
};

export default ArrayView;