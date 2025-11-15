import React from 'react';
import {ViewComponentProps} from '../types';
import {lastKey} from '../../utils';

/**
 * URL 视图组件
 * 专门处理普通 URL 的渲染和链接打开
 */
const UrlView: React.FC<ViewComponentProps> = ({
                                                   data,
                                                   path,
                                                   depth
                                               }) => {
    const keyName = lastKey(path);
    const url = data as string;

    const handleLinkOpen = () => {
        window.open(url, '_blank');
    };

    return (
        <div className="node" data-depth={depth}>
            <div className="value-container copyable">
                {keyName && path !== '$' && (
                    <span className="key">{keyName}: </span>
                )}
                <span className="str" onClick={handleLinkOpen} style={{cursor: 'pointer', textDecoration: 'underline'}}
                      title="点击打开链接">"{url}"</span>
                <span
                    className="copyBtn"
                    title="在新窗口打开"
                    onClick={handleLinkOpen}
                    style={{marginLeft: '4px'}}
                >
          🔗
        </span>
            </div>
        </div>
    );
};

export default UrlView;