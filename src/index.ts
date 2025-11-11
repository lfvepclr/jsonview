// 核心渲染组件
export {default as NodeRenderer, RenderNode, createNodeRenderer, smartRenderNode} from './core/NodeRenderer';
// 以下组件在重组后不再存在，已合并到新的架构中
// export {default as ContainerNode} from './core/ContainerNode';
// export {default as LeafNode} from './core/LeafNode';
// export {default as JsonStringNode} from './core/JsonStringNode';
// export {default as XmlStringNode} from './core/XmlStringNode';
// export {default as XmlRenderer} from './core/XmlRenderer';

// 查看器组件
export {default as PopupViewer} from './viewers/PopupViewer';
export {default as DocumentViewer} from './viewers/DocumentViewer';

// UI组件
export {default as URLActionButton} from './components/URLActionButton';
// ImageFloat 现在在 ImageView 中
// XMLStringExpander, JSONStringExpander 需要检查是否存在

// 工具函数
export {
    classOf,
    looksLikeJSON,
    looksLikeXML,
    buildPath,
    lastKey,
    getMaxValueLength
} from './utils/helperUtils';

export {
    isInViewport,
    smoothScrollTo,
    copyToClipboard,
    downloadFile,
    debounce,
    throttle
} from './utils/domUtils';

// 钩子
export {useExpand} from './hooks/useExpand';
export {useFloatData} from './hooks/useFloatData';

// 类型定义
export type {JSONValue, JSONObject, JSONArray} from './types/jsonTypes';
export type {DataType, PathDetail, FloatData} from './types/uiTypes';