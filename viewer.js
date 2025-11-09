// ========== viewer.js ==========
// 独立查看器 - 内联展开模式

const params = new URLSearchParams(location.search);
const jsonStr = params.get('json');
const parentPath = params.get('path') || '$';

try {
    const obj = JSON.parse(jsonStr);

    // 路径头
    const pathHeader = document.createElement('div');
    pathHeader.style.cssText = 'padding:10px;background:#f0f0f0;font:12px monospace;border-bottom:1px solid #ccc';
    pathHeader.textContent = `完整JSON路径: ${parentPath}`;
    document.body.insertBefore(pathHeader, document.getElementById('tree'));

    // 动态宽度
    document.body.style.width = Math.max(420, getMaxValueLength(obj) * 8 + 100) + 'px';

    const renderNode = createRenderNode(createJSONStringExpander(true), createXMLStringExpander(true), true);
    document.getElementById('tree').appendChild(renderNode(obj, parentPath, 0, true));
} catch (e) {
    document.body.textContent = '解析失败：' + e.message;
}

setupCopyableClickHandler();