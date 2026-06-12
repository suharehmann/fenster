import { FITTINGS, HANDLES } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { YesNoCards } from './shared/stepUtils';

export default function HardwareHandlesStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <div className="studio-step-sections">
      <ConfigSection title="BESCHLAG">
        <OptionGrid options={FITTINGS} selected={win.fitting} onSelect={(v) => setWin('fitting', v)} columns={3} />
      </ConfigSection>
      <ConfigSection title="FENSTERFALZLUEFTER">
        <YesNoCards value={win.hasVent} onChange={(v) => setWin('hasVent', v)} />
      </ConfigSection>
      <ConfigSection title="GRIFFE">
        <OptionGrid options={HANDLES} selected={win.handle} onSelect={(v) => setWin('handle', v)} columns={5} />
      </ConfigSection>
    </div>
  );
}
