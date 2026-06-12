import {
  OPENING_DIRECTIONS,
  OPENING_TYPES,
  WINDOW_TYPES,
  typeDefaultOpening
} from '@/utils/defaults';
import { buildConfiguratorShapePreview } from '@/utils/windowShapePreview';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';

export default function OpeningTypeStep({ state, setState, activeWindowIndex, previewSurface = 'outside' }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);
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
        mode: meta.mode ?? 'opening',
        colorSurface: previewSurface
      })
    };
  };

  const openingOptions = OPENING_TYPES.filter((option) => option.panes === selectedType.panes).map(
    (option) =>
      withBuildShapePreview(option, { openingType: option.id }, { mode: 'opening', openingType: option.id })
  );

  return (
    <ConfigSection title="OEFFNUNG">
      <h3>Oeffnungsart</h3>
      <OptionGrid
        options={openingOptions}
        selected={win.openingType}
        onSelect={(v) => setWin('openingType', v)}
        columns={3}
      />
      <h3>Oeffnungsrichtung</h3>
      <OptionGrid
        options={OPENING_DIRECTIONS.map((option) =>
          withBuildShapePreview(
            option,
            {},
            {
              mode: 'opening',
              openingType: win.openingType || typeDefaultOpening(selectedType.id, selectedType.panes),
              openingDirection: option.id,
              panes: selectedType.panes,
              shape: selectedType.shape,
              layout: selectedType.layout,
              divider: selectedType.divider,
              fixedOnly: false
            }
          )
        )}
        selected={win.openingDirection}
        onSelect={(v) => setWin('openingDirection', v)}
        columns={4}
      />
    </ConfigSection>
  );
}
