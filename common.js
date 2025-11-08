// ========== common.js ==========
// 核心工具函数

const classOf = v =>
    v === null ? 'null' :
        typeof v === 'string' ? 'str' :
            typeof v === 'number' ? 'num' :
                typeof v === 'boolean' ? 'bool' : '';

const looksLikeJSON = str => {
    str = str.trim();
    return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'));
};

const buildPath = (currentPath, key, isArray) =>
    currentPath === '$'
        ? (isArray ? `$[${key}]` : `$.${key}`)
        : (isArray ? `${currentPath}[${key}]` : `${currentPath}.${key}`);

const getMaxValueLength = obj => {
    let maxLength = 0;
    const traverse = data => {
        if (data === null || typeof data !== 'object') {
            maxLength = Math.max(maxLength, JSON.stringify(data).length);
        } else {
            Object.values(data).forEach(traverse);
        }
    };
    traverse(obj);
    return maxLength;
};

const lastKey = path =>
    path.split(/[.\[]/).pop()?.replace(']', '') || '';

const showImageFloat = imageUrl => {
    const layer = document.createElement('div');
    layer.className = 'image-float-layer';
    layer.innerHTML = `
    <div class="image-float-header">
      <span>图片预览</span>
      <button class="image-close-btn" onclick="this.closest('.image-float-layer').remove()">×</button>
    </div>
    <div class="image-float-body">
      <div style="text-align:center;padding:20px;">正在加载图片...</div>
    </div>
    <div class="image-url-display" title="${imageUrl}">${imageUrl}</div>`;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'max-width:100%;max-height:80vh;object-fit:contain';
    img.onload = () => layer.querySelector('.image-float-body').replaceChildren(img);
    img.onerror = () => layer.querySelector('.image-float-body').innerHTML = '<div style="color:#f44336;text-align:center;padding:20px;">图片加载失败</div>';

    layer.onclick = e => {
        if (e.target === layer) layer.remove();
    };
    document.body.appendChild(layer);
};

const maybeURL = (container, value) => {
    if (typeof value !== 'string' || !/^https?:\/\//.test(value)) return;

    const isImage = /jpg|jpeg|png|gif|webp|svg|bmp|ico$/.test(value.split('.').pop().split(/#|\?/)[0]);
    const btn = document.createElement('span');
    btn.className = isImage ? 'copyBtn image-preview-btn' : 'copyBtn';
    btn.textContent = isImage ? '🖼️' : '🔗';
    btn.title = isImage ? '查看图片' : '在新窗口打开';
    btn.onclick = ev => {
        ev.stopPropagation();
        isImage ? showImageFloat(value) : window.open(value, '_blank');
    };
    container.appendChild(btn);
};

// 通用渲染器工厂
const createRenderNode = jsonExpander => {
    return function renderNode(data, path = '$', depth = 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'node';
        wrapper.setAttribute('data-depth', depth);

        if (data === null || typeof data !== 'object') {
            const container = document.createElement('div');
            container.className = 'value-container copyable';
            container.setAttribute('data-copy-value', String(data));

            jsonExpander(container, data, path, false);

            const keyName = lastKey(path);
            if (keyName && path !== '$') {
                const keySpan = document.createElement('span');
                keySpan.className = 'key';
                keySpan.textContent = keyName + ': ';
                container.appendChild(keySpan);
            }

            const leaf = document.createElement('span');
            leaf.className = classOf(data);
            leaf.textContent = JSON.stringify(data);
            container.appendChild(leaf);

            maybeURL(container, data);
            wrapper.appendChild(container);
            return wrapper;
        }

        const isArray = Array.isArray(data);
        const labelContainer = document.createElement('div');
        labelContainer.className = 'key-container copyable';
        labelContainer.setAttribute('data-copy-value', JSON.stringify(data, null, 2));

        const label = document.createElement('span');
        label.className = 'key';
        label.textContent = (path === '$' ? '' : lastKey(path) + ': ') + (isArray ? '[]' : '{}');
        labelContainer.appendChild(label);
        wrapper.appendChild(labelContainer);

        Object.keys(data).forEach(k => {
            const childPath = buildPath(path, k, isArray);
            wrapper.appendChild(renderNode(data[k], childPath, depth + 1));
        });
        return wrapper;
    };
};

// 公共点击复制
const setupCopyableClickHandler = () => {
    document.addEventListener('click', e => {
        const copyable = e.target.closest('.copyable');
        if (!copyable) return;

        const copyValue = copyable.getAttribute('data-copy-value');
        if (copyValue) {
            navigator.clipboard.writeText(copyValue);
            copyable.classList.add('copied');
            setTimeout(() => copyable.classList.remove('copied'), 1200);
        }
    });
};

// JSON展开逻辑工厂
const createJSONStringExpander = (isInline = true) => {
    return (container, value, path, inPopup = false) => {
        if (typeof value !== 'string' || !looksLikeJSON(value)) return;

        const btn = document.createElement('span');
        btn.className = 'expand-btn';
        btn.textContent = '▶';
        btn.title = '展开子JSON';
        container.insertBefore(btn, container.firstChild);

        btn.onclick = ev => {
            ev.stopPropagation();
            try {
                const obj = JSON.parse(value);
                if (isInline) {
                    // 内联展开
                    let subContainer = container.nextSibling;
                    if (!subContainer || !subContainer.classList.contains('sub-json')) {
                        subContainer = document.createElement('div');
                        subContainer.className = 'sub-json';
                        subContainer.style.cssText = 'margin:8px 0 8px 20px;border:1px solid #ddd;padding:8px;background:#f9f9f9';

                        const header = document.createElement('div');
                        header.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;font-family:monospace';
                        header.textContent = `子JSON完整路径: ${path}`;
                        subContainer.appendChild(header);

                        const renderNode = createRenderNode(createJSONStringExpander(true));
                        subContainer.appendChild(renderNode(obj, path, 0));
                        container.parentNode.insertBefore(subContainer, container.nextSibling);
                    }
                    btn.textContent = subContainer.style.display === 'none' ? '▼' : '▶';
                    subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
                } else {
                    // 浮动层展开
                    const event = new CustomEvent('showFloatLayer', {detail: {path, data}});
                    document.dispatchEvent(event);
                }
            } catch (e) {
                alert('JSON解析错误: ' + e.message);
            }
        };
    };
};