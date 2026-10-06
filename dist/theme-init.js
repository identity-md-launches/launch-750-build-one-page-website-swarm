// Resolve the theme before first paint. Storage may be unavailable in private mode.
(() => {
  let theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  try {
    const saved = localStorage.getItem('made-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* The system preference still works without storage. */ }
  document.documentElement.dataset.theme = theme;
})();
