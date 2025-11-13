import { pdfjs } from 'react-pdf';

// 初始化PDF.js worker
// 这个函数应该在应用启动时调用一次
export const initializePdfWorker = () => {
  // 使用chrome.runtime.getURL指向public目录下的worker文件
  // Plasmo会自动将public/目录下的文件作为web_accessible_resources
  pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('static/pdf.worker.min.js');
};

// 导出pdfjs以供其他组件使用
export { pdfjs };
