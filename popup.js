/* ===== 工具 ===== */
const $ = id => document.getElementById(id);
const floatLayer = $('floatLayer');
const floatPath  = $('floatPath');
const floatBody  = $('floatBody');
$('closeFloat').onclick = () => floatLayer.classList.add('hidden');

/* ===== 主渲染 ===== */
$('render').onclick = () => {
  try {
    const obj = JSON.parse($('input').value.trim());
    $('tree').replaceChildren(renderNode(obj));
  } catch (e) {
    $('tree').textContent = '❌ ' + e.message;
  }
};

/* ===== 在新窗口中打开 ===== */
$('renderNewWindow').onclick = () => {
  try {
    const jsonStr = $('input').value.trim();
    const obj = JSON.parse(jsonStr); // 先解析验证是否为有效JSON
    const encodedJson = encodeURIComponent(jsonStr);
    // 传递根路径参数
    window.open(`viewer.html?json=${encodedJson}&path=${encodeURIComponent('$')}`, '_blank');
  } catch (e) {
    alert('JSON解析错误: ' + e.message);
  }
};

/* ===== 递归渲染节点 ===== */
function renderNode(data, path = '$', depth = 0) {
  const wrap = document.createElement('div');
  wrap.className = 'node';
  wrap.setAttribute('data-depth', depth);

  // 添加路径显示
  const pathDisplay = document.createElement('span');
  pathDisplay.className = 'path-display';
  pathDisplay.textContent = path;
  pathDisplay.style.display = 'none';
  wrap.appendChild(pathDisplay);

  // 鼠标悬停显示路径
  wrap.onmouseenter = () => pathDisplay.style.display = 'inline';
  wrap.onmouseleave = () => pathDisplay.style.display = 'none';

  if (data === null || typeof data !== 'object') { // 叶子
    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container copyable';
    valueContainer.setAttribute('data-copy-value', typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data));

    // 尝试JSON展开按钮
    maybeJSONString(valueContainer, data, path);

    // 添加路径前缀
    const keySpan = document.createElement('span');
    keySpan.className = 'key';
    keySpan.textContent = path === '$' ? '' : lastKey(path) + ': ';
    valueContainer.appendChild(keySpan);

    const leaf = leafSpan(data);
    valueContainer.appendChild(leaf);

    // 尝试URL预览
    maybeURL(valueContainer, data);

    wrap.appendChild(valueContainer);
    return wrap;
  }

  // 数组 / 对象
  const labelContainer = document.createElement('div');
  labelContainer.className = 'key-container copyable';
  labelContainer.setAttribute('data-copy-value', JSON.stringify(data, null, 2));

  const label = document.createElement('span');
  label.className = 'key';
  label.textContent = (path === '$' ? '' : lastKey(path) + ': ') + (Array.isArray(data) ? '[]' : '{}');
  labelContainer.appendChild(label);
  wrap.appendChild(labelContainer);

  Object.keys(data).forEach(k => {
    const childPath = buildPath(path, k, Array.isArray(data));
    wrap.appendChild(renderNode(data[k], childPath, depth + 1));
  });
  return wrap;
}

// 构建路径的辅助函数
function buildPath(currentPath, key, isArray) {
  if (currentPath === '$') {
    return isArray ? `$[${key}]` : `$.${key}`;
  } else {
    return isArray ? `${currentPath}[${key}]` : `${currentPath}.${key}`;
  }
}

/* ===== 叶子节点渲染 ===== */
function leafSpan(value) {
  const span = document.createElement('span');
  span.className = classOf(value);
  span.textContent = JSON.stringify(value);
  return span;
}

function classOf(v) {
  if (v === null) return 'null';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return 'num';
  if (typeof v === 'boolean') return 'bool';
  return '';
}

/* ===== 字符串是 URL 的预览 ===== */
function maybeURL(container, value) {
  if (typeof value !== 'string' || !/^https?:\/\//.test(value)) return;
  
  const ext = value.split('.').pop().split(/#|\?/)[0].toLowerCase();
  const isImage = /jpg|jpeg|png|gif|webp|svg|bmp|ico/.test(ext);
  
  if (isImage) {
    // 图片浮动显示
    const previewBtn = document.createElement('span');
    previewBtn.className = 'copyBtn image-preview-btn';
    previewBtn.textContent = '🖼️';
    previewBtn.title = '查看图片';
    container.appendChild(previewBtn);

    previewBtn.onclick = ev => {
      ev.stopPropagation();
      showImageFloat(value);
    };
  } else {
    // 其他链接在新窗口打开
    const openBtn = document.createElement('span');
    openBtn.className = 'copyBtn';
    openBtn.textContent = '🔗';
    openBtn.title = '在新窗口打开';
    container.appendChild(openBtn);

    openBtn.onclick = ev => {
      ev.stopPropagation();
      window.open(value, '_blank');
    };
  }
}

/* ===== 图片浮动显示 ===== */
function showImageFloat(imageUrl) {
  // 创建浮动图片容器
  const imageFloat = document.createElement('div');
  imageFloat.className = 'image-float-layer';
  
  // 创建头部
  const header = document.createElement('div');
  header.className = 'image-float-header';
  
  const title = document.createElement('span');
  title.textContent = '图片预览';
  header.appendChild(title);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'image-close-btn';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => {
    document.body.removeChild(imageFloat);
  };
  header.appendChild(closeBtn);
  
  imageFloat.appendChild(header);
  
  // 创建图片容器
  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-float-body';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '80vh';
  img.style.objectFit = 'contain';
  
  // 添加加载状态
  const loading = document.createElement('div');
  loading.textContent = '正在加载图片...';
  loading.style.textAlign = 'center';
  loading.style.padding = '20px';
  imageContainer.appendChild(loading);
  
  img.onload = () => {
    imageContainer.removeChild(loading);
    imageContainer.appendChild(img);
  };
  
  img.onerror = () => {
    loading.textContent = '图片加载失败';
    loading.style.color = '#f44336';
  };
  
  imageFloat.appendChild(imageContainer);
  
  // 添加URL显示
  const urlDisplay = document.createElement('div');
  urlDisplay.className = 'image-url-display';
  urlDisplay.textContent = imageUrl;
  urlDisplay.title = imageUrl;
  imageFloat.appendChild(urlDisplay);
  
  document.body.appendChild(imageFloat);
  
  // 点击外部关闭
  imageFloat.onclick = (e) => {
    if (e.target === imageFloat) {
      document.body.removeChild(imageFloat);
    }
  };
}

/* ===== 字符串是合法 JSON 的递归展开 ===== */
function maybeJSONString(container, value, path) {
  if (typeof value !== 'string' || !looksLikeJSON(value)) return;

  // 添加展开按钮到值的前面
  const expandBtn = document.createElement('span');
  expandBtn.className = 'expand-btn';
  expandBtn.textContent = '▶';
  expandBtn.title = '展开子JSON';

  // 确保展开按钮在容器的适当位置
  if (container.firstChild) {
    container.insertBefore(expandBtn, container.firstChild);
  } else {
    container.appendChild(expandBtn);
  }

  expandBtn.onclick = ev => {
    ev.stopPropagation();
    try {
      const obj = JSON.parse(value);
      // 传递完整路径到浮动层
      showFloatLayer(path, obj);
    } catch (e) {
      alert('JSON解析错误: ' + e.message);
    }
  };
}

function looksLikeJSON(str) {
  str = str.trim();
  return (str.startsWith('{') && str.endsWith('}')) ||
      (str.startsWith('[') && str.endsWith(']'));
}

/* ===== 浮动层 ===== */
function showFloatLayer(path, data) {
  floatPath.textContent = `完整JSON路径: ${path}`;
  // 传递当前路径作为起始路径
  floatBody.replaceChildren(renderNode(data, path, 0));
  
  // 动态调整浮动层宽度 - 移除最大宽度限制
  const maxValueLength = getMaxValueLength(data);
  const dynamicWidth = Math.max(640, maxValueLength * 8 + 200);
  floatLayer.style.width = dynamicWidth + 'px';
  
  floatLayer.classList.remove('hidden');

  // 清除之前的复制全部按钮
  const existingBtn = floatPath.parentNode.querySelector('.copy-all-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // 添加一个复制全部按钮
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
}

/* ===== 获取最大值长度 ===== */
function getMaxValueLength(obj) {
  let maxLength = 0;
  
  function traverse(data) {
    if (data === null || typeof data !== 'object') {
      const valueStr = JSON.stringify(data);
      maxLength = Math.max(maxLength, valueStr.length);
      return;
    }
    
    Object.values(data).forEach(value => traverse(value));
  }
  
  traverse(obj);
  return maxLength;
}

/* ===== 工具：最后一个 key ===== */
function lastKey(path) {
  const parts = path.split('.');
  return parts[parts.length - 1].replace(/^\[|\]$/g, '');
}

// 添加全局复制事件监听
document.addEventListener('click', (e) => {
  if (e.target.closest('.copyable')) {
    const copyable = e.target.closest('.copyable');
    const copyValue = copyable.getAttribute('data-copy-value');
    if (copyValue) {
      navigator.clipboard.writeText(copyValue);
      // 临时显示复制成功提示
      const originalBefore = copyable.style.setProperty;
      copyable.classList.add('copied');
      setTimeout(() => {
        copyable.classList.remove('copied');
      }, 1200);
    }
  }
});
