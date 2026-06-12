import { FRAME_EXTENSION } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { NumberField, YesNoCards } from './shared/stepUtils';

export default function FrameExtensionsStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="RAHMENVERBREITERUNG">
      <YesNoCards value={win.frameExtensionEnabled} onChange={(v) => setWin('frameExtensionEnabled', v)} />
      {win.frameExtensionEnabled && (
        <>
          <OptionGrid
            options={FRAME_EXTENSION}
            selected={win.frameExtensionKind}
            onSelect={(v) => setWin('frameExtensionKind', v)}
            columns={2}
          />
          <div className="form-grid compact">
            <NumberField
              label="Links (mm)"
              value={win.frameExtensionLeft}
              max={200}
              onChange={(v) => setWin('frameExtensionLeft', v)}
            />
            <NumberField
              label="Rechts (mm)"
              value={win.frameExtensionRight}
              max={200}
              onChange={(v) => setWin('frameExtensionRight', v)}
            />
            <NumberField
              label="Oben (mm)"
              value={win.frameExtensionTop}
              max={200}
              onChange={(v) => setWin('frameExtensionTop', v)}
            />
            <NumberField
              label="Unten (mm)"
              value={win.frameExtensionBottom}
              max={200}
              onChange={(v) => setWin('frameExtensionBottom', v)}
            />
          </div>
        </>
      )}
    </ConfigSection>
  );
}
