/** Immutable updates for nested configurator state slices. */
export function setGroupField(setState, group, field, value) {
  setState((prev) => ({
    ...prev,
    [group]: { ...prev[group], [field]: value }
  }));
}

export function setWindowField(setState, activeWindowIndex, field, value) {
  setState((prev) => ({
    ...prev,
    windows: prev.windows.map((item, idx) =>
      idx === activeWindowIndex ? { ...item, [field]: value } : item
    )
  }));
}
