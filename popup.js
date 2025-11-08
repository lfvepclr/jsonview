// ========== popup.js ==========
// 主窗口 - 浮动层模式

const $ = id => document.getElementById(id);
const floatLayer = $('floatLayer');
const floatPath = $('floatPath');
const floatBody = $('floatBody');
$('closeFloat').onclick = () => floatLayer.classList.add('hidden');

$('render').onclick = () => {
    try {
        const obj = JSON.parse($('input').value.trim());
        $('tree').replaceChildren(renderNode(obj));
    } catch (e) {
        $('tree').textContent = '❌ ' + e.message;
    }
};

$('renderNewWindow').onclick = () => {
    try {
        const jsonStr = $('input').value.trim();
        JSON.parse(jsonStr); // 验证
        window.open(`viewer.html?json=${encodeURIComponent(jsonStr)}&path=${encodeURIComponent('$')}`, '_blank');
    } catch (e) {
        alert('JSON解析错误: ' + e.message);
    }
};

// 浮动层显示
const showFloatLayer = (path, data) => {
    floatPath.textContent = `完整JSON路径: ${path}`;
    floatBody.replaceChildren(renderNode(data, path, 0));
    floatLayer.style.width = Math.max(640, getMaxValueLength(data) * 8 + 200) + 'px';
    floatLayer.classList.remove('hidden');

    const existingBtn = floatPath.parentNode.querySelector('.copy-all-btn');
    if (existingBtn) existingBtn.remove();

    const copyAllBtn = document.createElement('button');
    copyAllBtn.className = 'copy-all-btn';
    copyAllBtn.textContent = '复制全部';
    copyAllBtn.style.marginLeft = '10px';
    copyAllBtn.onclick = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        copyAllBtn.textContent = '已复制';
        setTimeout(() => copyAllBtn.textContent = '复制全部', 1200);
    };
    floatPath.parentNode.insertBefore(copyAllBtn, floatPath.nextSibling);
};

// 监听浮动层事件
document.addEventListener('showFloatLayer', e => showFloatLayer(e.detail.path, e.detail.data));

const renderNode = createRenderNode(createJSONStringExpander(false));
setupCopyableClickHandler();