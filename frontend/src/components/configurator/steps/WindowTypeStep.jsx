import {
  OPENING_TYPES,
  WINDOW_TYPES,
  typeDefaultOpening
} from '@/utils/defaults';
import { buildConfiguratorShapePreview } from '@/utils/windowShapePreview';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';

export default function WindowTypeStep({ state, setState, activeWindowIndex, previewSurface = 'outside' }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const selectedType = WINDOW_TYPES.find((t) => t.id === win.windowType) || WINDOW_TYPES[0];

  const withBuildShapePreview = (option, windowOverrides, meta = {}) => {
    const merged = { ...win, ...windowOverrides };
    const typeMeta = WINDOW_TYPES.find((t) => t.id === merged.windowType) || selectedType;
    return {
      ...option,
      image: buildConfiguratorShapePreview(state.globalConfig, merged, {
        panes: meta.panes ?? typeMeta.panes,
        shape: meta.shape ?? typeMeta.shape ?? 'rect',
        layout: meta.layout ?? typeMeta.layout ?? 'row',
        divider: meta.divider ?? typeMeta.divider ?? 'pfosten',
        fixedOnly: meta.fixedOnly ?? typeMeta.fixedOnly,
        openingType: meta.openingType ?? typeDefaultOpening(typeMeta.id, typeMeta.panes),
        mode: meta.mode ?? 'type',
        colorSurface: previewSurface
      })
    };
  };

  const windowTypeOptions = WINDOW_TYPES.map((option) =>
    withBuildShapePreview(
      option,
      { windowType: option.id, lightOption: 'Ohne Ober-/Unterlicht' },
      {
        panes: option.panes,
        shape: option.shape,
        layout: option.layout,
        divider: option.divider,
        fixedOnly: option.fixedOnly,
        openingType: typeDefaultOpening(option.id, option.panes)
      }
    )
  );

  function changeWindowType(value) {
    const nextType = WINDOW_TYPES.find((t) => t.id === value) || WINDOW_TYPES[0];
    const nextOpening = OPENING_TYPES.find((option) => option.panes === nextType.panes);
    setState((prev) => ({
      ...prev,
      windows: prev.windows.map((item, idx) =>
        idx === activeWindowIndex
          ? {
              ...item,
              windowType: value,
              lightOption: 'Ohne Ober-/Unterlicht',
              openingType: nextOpening ? nextOpening.id : item.openingType
            }
          : item
      )
    }));
  }

  return (
    <ConfigSection title="FENSTERTYP">
      <OptionGrid options={windowTypeOptions} selected={win.windowType} onSelect={changeWindowType} />
    </ConfigSection>
  );
}
