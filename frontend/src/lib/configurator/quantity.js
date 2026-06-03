import { createWindow } from '@/utils/defaults';

export const QUANTITY_PRESETS = [1, 2, 3, 5, 10];
export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 20;

export function clampQuantity(raw) {
  return Math.max(QUANTITY_MIN, Math.min(QUANTITY_MAX, Number(raw) || 1));
}

/**
 * @param {{ fillAllSlots?: boolean }} options
 * fillAllSlots: intro step — create every window immediately.
 * default: detail modal — keep extra slots empty until selected.
 */
export function applyQuantity(prev, raw, options = {}) {
  const { fillAllSlots = false } = options;
  const quantity = clampQuantity(raw);
  if (prev.productType !== 'window') {
    return { ...prev, quantity };
  }
  const windows = [...prev.windows];
  if (fillAllSlots) {
    while (windows.length < quantity) windows.push(createWindow());
  }
  return {
    ...prev,
    quantity,
    windows: windows.slice(0, quantity)
  };
}

/** Remove one window slot; keeps at least {@link QUANTITY_MIN}. */
export function removeWindowAtIndex(prev, index) {
  if (prev.productType !== 'window') {
    return prev;
  }

  const quantity = clampQuantity(prev.quantity ?? prev.windows.length);
  if (quantity <= QUANTITY_MIN) {
    return prev;
  }

  const windows = [...prev.windows];
  windows.splice(index, 1);
  const newQuantity = quantity - 1;

  return {
    ...prev,
    quantity: newQuantity,
    windows: windows.slice(0, newQuantity)
  };
}

/** Ensure a window exists at index (fills gaps with new defaults). */
export function ensureWindowAtIndex(prev, index) {
  const windows = [...prev.windows];
  while (windows.length <= index) {
    windows.push(createWindow());
  }
  if (!windows[index]) {
    windows[index] = createWindow();
  }
  return { ...prev, windows };
}
