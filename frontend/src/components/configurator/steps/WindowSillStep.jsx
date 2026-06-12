import { WINDOW_SILL_TYPES } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { YesNoCards } from './shared/stepUtils';

export default function WindowSillStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="FENSTERBANK">
      <p className="studio-decor-lead">Moechten Sie eine Fensterbank mitbestellen?</p>
      <YesNoCards value={win.hasWindowSill} onChange={(v) => setWin('hasWindowSill', v)} />
      {win.hasWindowSill && (
        <OptionGrid
          options={WINDOW_SILL_TYPES}
          selected={win.windowSillType}
          onSelect={(v) => setWin('windowSillType', v)}
          columns={2}
        />
      )}
    </ConfigSection>
  );
}
