export function normalizeUploadPath(path) {
  const normalized = String(path || '').trim().replace(/^\/+|\/+$/g, '');
  return normalized || 'upload';
}

export function getFileExtension(fileName) {
  const lastSlashIndex = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex <= lastSlashIndex + 1) {
    return '';
  }

  return fileName.slice(lastDotIndex);
}

export function formatBatchUploadJson(items) {
  return JSON.stringify(items.map(({ fileName, url }) => ({ fileName, url })), null, 2);
}
