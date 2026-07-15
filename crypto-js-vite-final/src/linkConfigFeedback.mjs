export function createLinkResultSummary(result) {
  if (result.type === 'success') {
    return {
      type: 'success',
      title: '操作成功',
      message: result.title,
      url: result.url || '',
    };
  }

  if (result.type === 'no-change') {
    return {
      type: 'no-change',
      title: '无变化',
      message: '当前链接没有可处理的变化',
      url: '',
    };
  }

  if (result.type === 'parse') {
    const path = result.path || '/';
    const protocol = result.protocol.replace(/:$/, '');
    return {
      type: 'parse',
      title: '解析完成',
      message: `${protocol}://${result.host}${path}，参数 ${result.paramCount} 个`,
      url: '',
    };
  }

  return {
    type: 'error',
    title: '操作失败',
    message: result.message || '链接处理失败',
    url: '',
  };
}
