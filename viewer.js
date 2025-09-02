const params = new URLSearchParams(location.search);
const jsonStr = params.get('json');
const parentPath = params.get('path') || '$';

try {
  const obj = JSON.parse(jsonStr);
  // 显示完整路径
  const pathHeader = document.createElement('div');
  pathHeader.style.padding = '10px';
  pathHeader.style.background = '#f0f0f0';
  pathHeader.style.fontFamily = 'monospace';
  pathHeader.style.fontSize = '12px';
  pathHeader.style.borderBottom = '1px solid #ccc';
  pathHeader.textContent = `完整JSON路径: ${parentPath}`;
  document.body.insertBefore(pathHeader, document.getElementById('tree'));
  
  // 动态调整body宽度 - 移除最大宽度限制
  const maxValueLength = getMaxValueLength(obj);
  const dynamicWidth = Math.max(420, maxValueLength * 8 + 100);
  document.body.style.width = dynamicWidth + 'px';

  // 从父路径开始渲染
  document.getElementById('tree').appendChild(renderNode(obj, parentPath, 0));
} catch (e) {
  document.body.textContent = '解析失败：' + e.message;
}

function renderNode(data, path = '$', depth = 0, key = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'node';
  wrapper.setAttribute('data-depth', depth);

  if (data === null || typeof data !== 'object') {
    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container copyable';
    valueContainer.setAttribute('data-copy-value', typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data));
    
    // 如果是JSON字符串，添加展开按钮
    maybeJSONString(valueContainer, data, path);
    
    // 显示键
    if (key) {
      const keySpan = document.createElement('span');
      keySpan.className = 'key';
      keySpan.textContent = key + ': ';
      valueContainer.appendChild(keySpan);
    }
    
    // 显示值
    const leaf = document.createElement('span');
    leaf.className = classOf(data);
    leaf.textContent = JSON.stringify(data);
    valueContainer.appendChild(leaf);
    
    // 如果是URL，添加预览
    maybeURL(valueContainer, data);
    
    wrapper.appendChild(valueContainer);
    return wrapper;
  }

  // 数组 / 对象
  const labelContainer = document.createElement('div');
  labelContainer.className = 'key-container copyable';
  labelContainer.setAttribute('data-copy-value', JSON.stringify(data, null, 2));

  const label = document.createElement('span');
  label.className = 'key';
  label.textContent = key ? key + ': ' : '';
  label.textContent += Array.isArray(data) ? '[]' : '{}';
  labelContainer.appendChild(label);
  wrapper.appendChild(labelContainer);

  const isArray = Array.isArray(data);
  Object.keys(data).forEach(k => {
    const childPath = buildPath(path, k, isArray);
    wrapper.appendChild(renderNode(data[k], childPath, depth + 1, isArray ? null : k));
  });
  return wrapper;
}

function classOf(v) {
  if (v === null) return 'null';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return 'num';
  if (typeof v === 'boolean') return 'bool';
  return '';
}

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

function maybeJSONString(container, value, path) {
  if (typeof value !== 'string' || !looksLikeJSON(value)) return;

  const expandBtn = document.createElement('span');
  expandBtn.className = 'expand-btn';
  expandBtn.textContent = '▶';
  expandBtn.title = '展开子JSON';
  
  // 插入到容器的最前面
  if (container.firstChild) {
    container.insertBefore(expandBtn, container.firstChild);
  } else {
    container.appendChild(expandBtn);
  }
  
  let expanded = false;
  let subContainer = null;
  
  expandBtn.onclick = ev => {
    ev.stopPropagation();
    
    if (expanded) {
      // 收起
      if (subContainer) {
        subContainer.remove();
        subContainer = null;
      }
      expandBtn.textContent = '▶';
      expandBtn.title = '展开子JSON';
      expanded = false;
    } else {
      // 展开
      try {
        const obj = JSON.parse(value);
        subContainer = document.createElement('div');
        subContainer.className = 'sub-json';
        subContainer.style.marginLeft = '20px';
        subContainer.style.marginTop = '8px';
        subContainer.style.border = '1px solid #ddd';
        subContainer.style.padding = '8px';
        subContainer.style.backgroundColor = '#f9f9f9';
        
        // 添加子JSON的完整路径显示
        const subPathHeader = document.createElement('div');
        subPathHeader.style.fontSize = '11px';
        subPathHeader.style.color = '#666';
        subPathHeader.style.marginBottom = '4px';
        subPathHeader.style.fontFamily = 'monospace';
        
        // 构建完整的子JSON路径
        const fullSubPath = path; // 使用当前完整路径
        subPathHeader.textContent = `子JSON完整路径: ${fullSubPath}`;
        subContainer.appendChild(subPathHeader);
        
        // 渲染子JSON，路径从当前完整路径开始
        subContainer.appendChild(renderNode(obj, fullSubPath, 0));
        container.parentNode.insertBefore(subContainer, container.nextSibling);
        
        expandBtn.textContent = '▼';
        expandBtn.title = '收起子JSON';
        expanded = true;
      } catch (e) {
        alert('JSON解析错误: ' + e.message);
      }
    }
  };
}

function looksLikeJSON(str) {
  str = str.trim();
  return (str.startsWith('{') && str.endsWith('}')) ||
         (str.startsWith('[') && str.endsWith(']'));
}

// 构建路径的辅助函数
function buildPath(currentPath, key, isArray) {
  if (currentPath === '$') {
    return isArray ? `$[${key}]` : `$.${key}`;
  } else {
    return isArray ? `${currentPath}[${key}]` : `${currentPath}.${key}`;
  }
}

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

function lastKey(path) {
  const lastPart = path.split(/[.\[]/).pop();
  return lastPart ? lastPart.replace(']', '') : '';
}

// 添加全局复制事件监听
document.addEventListener('click', (e) => {
  if (e.target.closest('.copyable')) {
    const copyable = e.target.closest('.copyable');
    const copyValue = copyable.getAttribute('data-copy-value');
    if (copyValue) {
      navigator.clipboard.writeText(copyValue);
      // 临时显示复制成功提示
      copyable.classList.add('copied');
      setTimeout(() => {
        copyable.classList.remove('copied');
      }, 1200);
    }
  }
});

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
