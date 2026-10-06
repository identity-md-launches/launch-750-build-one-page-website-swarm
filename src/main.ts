import './style.css';

const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const themeLabel = document.querySelector<HTMLElement>('#theme-label')!;
const themeStatus = document.querySelector<HTMLElement>('#theme-status')!;
const colorPreference = matchMedia('(prefers-color-scheme: light)');
let manualTheme = false;

try {
  manualTheme = ['light', 'dark'].includes(localStorage.getItem('made-theme') ?? '');
} catch { /* Persistence is optional. */ }

function syncThemeButton() {
  const isDark = root.dataset.theme === 'dark';
  themeLabel.textContent = isDark ? 'light mode' : 'dark mode';
  themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

syncThemeButton();
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  manualTheme = true;
  try { localStorage.setItem('made-theme', theme); } catch { /* Keep the choice for this visit. */ }
  syncThemeButton();
  themeStatus.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} mode enabled.`;
});
colorPreference.addEventListener('change', () => {
  if (manualTheme) return;
  root.dataset.theme = colorPreference.matches ? 'light' : 'dark';
  syncThemeButton();
});

const copyButton = document.querySelector<HTMLButtonElement>('#copy-address')!;
const copyLabel = document.querySelector<HTMLElement>('#copy-label')!;
const address = document.querySelector<HTMLElement>('#token-address')!;
const copyStatus = document.querySelector<HTMLElement>('#copy-status')!;
let pending = false;

copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  if (pending) return;
  pending = true;
  copyLabel.textContent = 'copying…';
  copyButton.setAttribute('aria-busy', 'true');
  copyStatus.textContent = '';
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(address.textContent!.trim());
    copyLabel.textContent = 'copy again';
    copyStatus.textContent = 'Address copied.';
  } catch {
    copyLabel.textContent = 'try copy again';
    copyStatus.textContent = 'Could not copy. Select the address above and copy it manually.';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(address);
    selection?.removeAllRanges();
    selection?.addRange(range);
  } finally {
    pending = false;
    copyButton.removeAttribute('aria-busy');
  }
});
