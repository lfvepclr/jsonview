import React from 'react';
import {ViewComponentProps} from '../types';
import {classOf, lastKey} from '../../utils';
import {copyPresets, useCopy} from '../../hooks';

/**
 * 基础类型视图组件
 * 处理字符串、数值、布尔值、null 等简单类型的渲染
 */
const PrimitiveView: React.FC<ViewComponentProps> = ({
                                                         data,
                                                         path,
                                                         depth
                                                     }) => {
    const keyName = lastKey(path);
    const dataType = classOf(data);

    // 使用统一的复制功能Hook
    const {handleCopy} = useCopy(copyPresets.primitive(data));

    /**
     * 判断是否应该显示key
     * 需要区分XML元素名和JSON属性key
     */
    const shouldShowKey = (path: string, keyName: string): boolean => {
        // 如果路径包含#xml-content#，说明是XML委托渲染
        if (path.includes('#xml-content#')) {
            // 检查keyName是否是XML元素名
            // XML元素名通常出现在路径的最后部分，格式如：request#xml-content#url
            const xmlContentIndex = path.lastIndexOf('#xml-content#');
            if (xmlContentIndex !== -1) {
                const xmlElementName = path.substring(xmlContentIndex + '#xml-content#'.length);
                // 如果keyName等于XML元素名，则不显示（这是XML元素名，不是JSON属性key）
                if (keyName === xmlElementName) {
                    return false;
                }
            }
            // 其他情况下，如果是XML内容中的JSON属性，则显示key
            return true;
        }

        // 非XML委托的情况，正常显示key
        return true;
    };

    return (
        <div className="node" data-depth={depth}>
            <div className="value-container copyable" onClick={handleCopy}>
                {keyName && path !== '$' && shouldShowKey(path, keyName) && (
                    <span className="key">{keyName}: </span>
                )}
                <span className={dataType}>{JSON.stringify(data)}</span>
            </div>
        </div>
    );
};

export default PrimitiveView;