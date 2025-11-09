import React, {useState} from 'react';
import {JSONValue} from '../types';
import {classOf, lastKey, looksLikeJSON, looksLikeXML} from '../utils';
import {ImageFloat, JSONStringExpander, URLActionButton, XMLStringExpander} from '../core';

/**
 * LeafNode 组件 - 普通叶子节点渲染器
 *
 * 此组件专门负责渲染普通叶子节点（非 JSON/XML 字符串的原始值）。
 * 它实现了以下功能：
 * 1. 渲染基本数据类型（字符串、数字、布尔值、null）
 * 2. 处理 URL 检测和预览
 * 3. 为看起来像 JSON/XML 但未被专门处理的字符串提供展开功能
 *
 * @component
 */
interface LeafNodeProps {
    /** 要渲染的数据 */
    data: JSONValue;
    /** 当前节点的路径 */
    path: string;
    /** 当前节点的深度 */
    depth: number;
    /** 展开浮层时的回调函数 */
    onExpand?: (path: string, data: any, type: 'json' | 'xml') => void;
    /** 渲染子节点的函数 */
    renderSubNode: (data: JSONValue, path: string, depth: number) => React.ReactNode;
}

/**
 * LeafNode 组件
 *
 * 主要职责：
 * 1. 渲染基本数据类型的节点
 * 2. 处理 URL 预览和链接打开
 * 3. 处理 JSON/XML 字符串的展开功能
 */
const LeafNode: React.FC<LeafNodeProps> = ({
                                               data,
                                               path,
                                               depth,
                                               onExpand,
                                               renderSubNode
                                           }) => {
    /** 图片预览浮层状态 */
    const [imageFloat, setImageFloat] = useState<{ isVisible: boolean; imageUrl: string } | null>(null);

    /** 获取键名 */
    const keyName = lastKey(path);

    /** 获取数据类型 */
    const dataType = classOf(data);

    // JSON 和 XML 字符串展开组件已从 ReactComponents 导入

    /**
     * 处理图片预览请求
     *
     * @param imageUrl - 图片 URL
     */
    const handleImagePreview = (imageUrl: string) => {
        setImageFloat({isVisible: true, imageUrl});
    };

    /**
     * 处理链接打开请求
     *
     * @param url - 链接 URL
     */
    const handleLinkOpen = (url: string) => {
        window.open(url, '_blank');
    };

    /**
     * 处理浮层展开请求
     *
     * @param path - 数据路径
     * @param data - 要展开的数据
     * @param type - 数据类型
     */
    const handleExpand = (path: string, data: any, type: 'json' | 'xml') => {
        if (onExpand) {
            onExpand(path, data, type);
        }
    };

    return (
        <div className="node" data-depth={depth}>
            {/**
             * 值容器区域
             * 包含键名（如果有的话）和值本身
             */}
            <div className="value-container copyable">
                {keyName && path !== '$' && (
                    <span className="key">{keyName}: </span>
                )}

                <span className={dataType}>{JSON.stringify(data)}</span>

                {typeof data === 'string' && (
                    <>
                        {(looksLikeJSON(data) || looksLikeXML(data)) && (
                            <>
                                {looksLikeJSON(data) ? (
                                    <JSONStringExpander
                                        value={data}
                                        path={path}
                                        onExpand={handleExpand}
                                        renderSubNode={renderSubNode}
                                    />
                                ) : (
                                    <XMLStringExpander
                                        value={data}
                                        path={path}
                                        onExpand={handleExpand}
                                    />
                                )}
                            </>
                        )}

                        <URLActionButton
                            value={data}
                            onImagePreview={handleImagePreview}
                            onLinkOpen={handleLinkOpen}
                        />
                    </>
                )}
            </div>

            {/**
             * 图片预览浮层
             * 仅在需要时渲染
             */}
            {imageFloat && imageFloat.isVisible && (
                <ImageFloat
                    imageUrl={imageFloat.imageUrl}
                    onClose={() => setImageFloat(null)}
                />
            )}
        </div>
    );
};

export default LeafNode;