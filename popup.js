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
const showFloatLayer = (path, data, type = 'json') => {
    floatPath.textContent = `完整${type.toUpperCase()}路径: ${path}`;
    if (type === 'json') {
        floatBody.replaceChildren(renderNode(data, path, 0, true));
    } else if (type === 'xml') {
        // 简单的XML渲染
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        
        const container = document.createElement('div');
        const renderXMLNode = (node) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.style.marginLeft = '16px';
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const attrs = [];
                for (let attr of node.attributes || []) {
                    attrs.push(`${attr.name}="${attr.value}"`);
                }
                
                const attrsStr = attrs.length ? ' ' + attrs.join(' ') : '';
                const hasChildren = node.children.length > 0;
                
                if (hasChildren) {
                    nodeDiv.innerHTML = `<span class="key">&lt;${node.nodeName}${attrsStr}&gt;</span>`;
                    
                    for (let child of node.children) {
                        nodeDiv.appendChild(renderXMLNode(child));
                    }
                    
                    const closingTag = document.createElement('div');
                    closingTag.style.marginLeft = '16px';
                    closingTag.innerHTML = `<span class="key">&lt;/${node.nodeName}&gt;</span>`;
                    nodeDiv.appendChild(closingTag);
                } else {
                    const textContent = node.textContent;
                    nodeDiv.innerHTML = `<span class="key">&lt;${node.nodeName}${attrsStr}&gt;</span>` +
                                       `<span class="str">${textContent}</span>` +
                                       `<span class="key">&lt;/${node.nodeName}&gt;</span>`;
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    const textSpan = document.createElement('span');
                    textSpan.className = 'str';
                    textSpan.textContent = text;
                    nodeDiv.appendChild(textSpan);
                }
            }
            
            return nodeDiv;
        };
        
        container.appendChild(renderXMLNode(xmlDoc.documentElement));
        floatBody.replaceChildren(container);
    }
    
    floatLayer.style.width = Math.max(640, type === 'json' ? getMaxValueLength(data) * 8 + 200 : 800) + 'px';
    floatLayer.classList.remove('hidden');

    const existingBtn = floatPath.parentNode.querySelector('.copy-all-btn');
    if (existingBtn) existingBtn.remove();

    const copyAllBtn = document.createElement('button');
    copyAllBtn.className = 'copy-all-btn';
    copyAllBtn.textContent = '复制全部';
    copyAllBtn.style.marginLeft = '10px';
    copyAllBtn.onclick = () => {
        let textToCopy;
        if (type === 'json') {
            textToCopy = JSON.stringify(data, null, 2);
        } else {
            textToCopy = data;
        }
        navigator.clipboard.writeText(textToCopy);
        copyAllBtn.textContent = '已复制';
        setTimeout(() => copyAllBtn.textContent = '复制全部', 1200);
    };
    floatPath.parentNode.insertBefore(copyAllBtn, floatPath.nextSibling);
};

// 监听浮动层事件
document.addEventListener('showFloatLayer', e => showFloatLayer(e.detail.path, e.detail.data, e.detail.type));

const renderNode = createRenderNode(createJSONStringExpander(false), createXMLStringExpander(false), true);
setupCopyableClickHandler();