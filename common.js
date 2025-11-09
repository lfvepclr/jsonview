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

const looksLikeXML = str => {
    str = str.trim();
    return str.startsWith('<') && str.endsWith('>') && str.includes('</');
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
const createRenderNode = (jsonExpander, xmlExpander, defaultExpand = false) => {
    return function renderNode(data, path = '$', depth = 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'node';
        wrapper.setAttribute('data-depth', depth);

        if (data === null || typeof data !== 'object') {
            const container = document.createElement('div');
            container.className = 'value-container copyable';
            container.setAttribute('data-copy-value', String(data));

            jsonExpander(container, data, path, false);
            xmlExpander(container, data, path, false);

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
        labelContainer.className = 'key-container copyable expandable-key';
        labelContainer.setAttribute('data-copy-value', JSON.stringify(data, null, 2));

        const label = document.createElement('span');
        label.className = 'key';
        label.textContent = (path === '$' ? '' : lastKey(path) + ': ') + (isArray ? '[' : '{');
        
        // 添加展开按钮
        const expandBtn = document.createElement('span');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = defaultExpand ? '▼' : '▶';
        expandBtn.title = '展开/收缩';
        
        labelContainer.appendChild(expandBtn);
        labelContainer.appendChild(label);
        
        wrapper.appendChild(labelContainer);

        const childrenWrapper = document.createElement('div');
        childrenWrapper.className = 'children-wrapper';
        childrenWrapper.style.display = defaultExpand ? 'block' : 'none'; // 根据defaultExpand设置默认展开状态
        
        // 对对象的键进行排序
        const keys = isArray ? Object.keys(data) : Object.keys(data).sort();
        
        keys.forEach(k => {
            const childPath = buildPath(path, k, isArray);
            childrenWrapper.appendChild(renderNode(data[k], childPath, depth + 1, defaultExpand));
        });
        
        wrapper.appendChild(childrenWrapper);
        
        // 结束符号
        const endSymbol = document.createElement('div');
        endSymbol.className = 'end-symbol';
        endSymbol.textContent = isArray ? ']' : '}';
        endSymbol.style.marginLeft = '16px';
        wrapper.appendChild(endSymbol);
        
        // 点击键名控制展开/收缩
        labelContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('expand-btn')) {
                e.stopPropagation();
                const isVisible = childrenWrapper.style.display === 'block';
                childrenWrapper.style.display = isVisible ? 'none' : 'block';
                expandBtn.textContent = isVisible ? '▶' : '▼';
            }
        });
        
        // 点击展开按钮控制展开/收缩
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = childrenWrapper.style.display === 'block';
            childrenWrapper.style.display = isVisible ? 'none' : 'block';
            expandBtn.textContent = isVisible ? '▶' : '▼';
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
        
        // 处理非容器节点（字符串值）的展开按钮点击
        const expandBtn = e.target.closest('.expand-btn');
        if (expandBtn && expandBtn.parentElement.classList.contains('key')) {
            const keyContainer = expandBtn.closest('.key');
            const valueContainer = keyContainer.closest('.value-container');
            if (valueContainer) {
                const value = valueContainer.getAttribute('data-copy-value');
                if (value) {
                    e.stopPropagation();
                    if (looksLikeJSON(value)) {
                        try {
                            const obj = JSON.parse(value);
                            let subContainer = valueContainer.nextSibling;
                            if (!subContainer || !subContainer.classList.contains('sub-json')) {
                                subContainer = document.createElement('div');
                                subContainer.className = 'sub-json';
                                subContainer.style.cssText = 'margin:8px 0 8px 20px;border:1px solid #ddd;padding:8px;background:#f9f9f9';

                                const header = document.createElement('div');
                                header.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;font-family:monospace';
                                header.textContent = `子JSON完整路径: ${buildPath('$', keyContainer.textContent.replace(/:.*$/, ''), false)}`;
                                subContainer.appendChild(header);

                                const renderNode = createRenderNode(createJSONStringExpander(true), createXMLStringExpander(true), true);
                                subContainer.appendChild(renderNode(obj, '$', 0, true));
                                valueContainer.parentNode.insertBefore(subContainer, valueContainer.nextSibling);
                            }
                            expandBtn.textContent = subContainer.style.display === 'none' ? '▼' : '▶';
                            subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
                        } catch (err) {
                            alert('JSON解析错误: ' + err.message);
                        }
                    } else if (looksLikeXML(value)) {
                        try {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(value, "text/xml");
                            
                            let subContainer = valueContainer.nextSibling;
                            if (!subContainer || !subContainer.classList.contains('sub-xml')) {
                                subContainer = document.createElement('div');
                                subContainer.className = 'sub-xml';
                                subContainer.style.cssText = 'margin:8px 0 8px 20px;border:1px solid #ddd;padding:8px;background:#f9f9f9';

                                const header = document.createElement('div');
                                header.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;font-family:monospace';
                                header.textContent = `子XML完整路径: ${buildPath('$', keyContainer.textContent.replace(/:.*$/, ''), false)}`;
                                subContainer.appendChild(header);

                                // 简单的XML渲染
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

                                subContainer.appendChild(renderXMLNode(xmlDoc.documentElement));
                                // 添加对内嵌JSON/XML的支持
                                const jsonInCDATA = value.match(/<!\[CDATA\[(\{.*?\})\]\]>/);
                                if (jsonInCDATA) {
                                    try {
                                        const jsonObj = JSON.parse(jsonInCDATA[1]);
                                        const jsonSubContainer = document.createElement('div');
                                        jsonSubContainer.className = 'sub-json';
                                        jsonSubContainer.style.cssText = 'margin:8px 0 8px 20px;border:1px solid #ddd;padding:8px;background:#f9f9f9';
                                        
                                        const jsonHeader = document.createElement('div');
                                        jsonHeader.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;font-family:monospace';
                                        jsonHeader.textContent = '内嵌JSON:';
                                        jsonSubContainer.appendChild(jsonHeader);
                                        
                                        const renderNode = createRenderNode(createJSONStringExpander(true), createXMLStringExpander(true), true);
                                        jsonSubContainer.appendChild(renderNode(jsonObj, '$', 0, true));
                                        subContainer.appendChild(jsonSubContainer);
                                    } catch (e) {
                                        // 忽略解析错误
                                    }
                                }
                                
                                valueContainer.parentNode.insertBefore(subContainer, valueContainer.nextSibling);
                            }
                            expandBtn.textContent = subContainer.style.display === 'none' ? '▼' : '▶';
                            subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
                        } catch (err) {
                            alert('XML解析错误: ' + err.message);
                        }
                    }
                }
            }
        }
    });
};

// XML展开逻辑工厂
const createXMLStringExpander = (isInline = true) => {
    return (container, value, path, inPopup = false) => {
        if (typeof value !== 'string' || !looksLikeXML(value)) return;

        const btn = document.createElement('span');
        btn.className = 'expand-btn';
        btn.textContent = '▶';
        btn.title = '展开子XML';
        // 将按钮插入到容器的开头，而不是key前面
        container.insertBefore(btn, container.firstChild);

        btn.onclick = ev => {
            ev.stopPropagation();
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(value, "text/xml");
                
                if (isInline) {
                    // 内联展开
                    let subContainer = container.nextSibling;
                    if (!subContainer || !subContainer.classList.contains('sub-xml')) {
                        subContainer = document.createElement('div');
                        subContainer.className = 'sub-xml';
                        subContainer.style.cssText = 'margin:8px 0 8px 20px;border:1px solid #ddd;padding:8px;background:#f9f9f9';

                        const header = document.createElement('div');
                        header.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;font-family:monospace';
                        header.textContent = `子XML完整路径: ${path}`;
                        subContainer.appendChild(header);

                        // 简单的XML渲染
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

                        subContainer.appendChild(renderXMLNode(xmlDoc.documentElement));
                        // 确保父节点存在再插入
                        if (container.parentNode) {
                            container.parentNode.insertBefore(subContainer, container.nextSibling);
                        }
                    }
                    btn.textContent = subContainer.style.display === 'none' ? '▼' : '▶';
                    subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
                } else {
                    // 浮动层展开
                    const event = new CustomEvent('showFloatLayer', {detail: {path, data: value, type: 'xml'}});
                    document.dispatchEvent(event);
                }
            } catch (e) {
                alert('XML解析错误: ' + e.message);
            }
        };
    };
};

// JSON展开逻辑工厂
const createJSONStringExpander = (isInline = true) => {
    return (container, value, path, inPopup = false) => {
        if (typeof value !== 'string' || !looksLikeJSON(value)) return;

        const btn = document.createElement('span');
        btn.className = 'expand-btn';
        btn.textContent = '▶';
        btn.title = '展开子JSON';
        // 将按钮插入到容器的开头，而不是key前面
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

                        const renderNode = createRenderNode(createJSONStringExpander(true), createXMLStringExpander(true), true);
                        subContainer.appendChild(renderNode(obj, path, 0, true));
                        // 确保父节点存在再插入
                        if (container.parentNode) {
                            container.parentNode.insertBefore(subContainer, container.nextSibling);
                        }
                    }
                    btn.textContent = subContainer.style.display === 'none' ? '▼' : '▶';
                    subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
                } else {
                    // 浮动层展开
                    const event = new CustomEvent('showFloatLayer', {detail: {path, data: obj, type: 'json'}});
                    document.dispatchEvent(event);
                }
            } catch (e) {
                alert('JSON解析错误: ' + e.message);
            }
        };
    };
};