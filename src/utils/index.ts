export {
    classOf,
    looksLikeJSON,
    looksLikeXML,
    buildPath,
    lastKey,
    getMaxValueLength
} from './helperUtils';

export {
    isInViewport,
    smoothScrollTo,
    copyToClipboard,
    downloadFile,
    debounce,
    throttle
} from './domUtils';

export {
    JSON_DETECTION_CONFIG,
    PERFORMANCE_CONFIG,
    HTML_ENTITIES,
    JSON_FIX_PATTERNS,
    ESCAPE_FIX_CONFIG,
    JsonDetectionCache,
    globalJsonDetectionCache,
    JsonDetectionUtils,
    createJsonDetectionConfig,
    JSON_DETECTION_PRESETS
} from './jsonDetectionConfig';

export type {
    JsonDetectionConfig,
    JsonDetectionStrategies
} from './jsonDetectionConfig';