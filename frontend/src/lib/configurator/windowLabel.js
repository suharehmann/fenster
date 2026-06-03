import { createWindow } from '@/utils/defaults';

export function getWindowDefaultLabel(index) {
  return `Fenster ${index + 1}`;
}

export function getWindowDisplayName(win, index) {
  const custom = (win?.name || '').trim();
  return custom || getWindowDefaultLabel(index);
}

export function renameWindowAtIndex(prev, index, rawName) {
  const name = String(rawName ?? '').trim();
  const windows = [...prev.windows];
  while (windows.length <= index) {
    windows.push(createWindow());
  }
  windows[index] = { ...windows[index], name };
  return { ...prev, windows };
}
