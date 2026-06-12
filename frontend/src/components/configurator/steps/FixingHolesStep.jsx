import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import { YesNoCards } from './shared/stepUtils';

export default function FixingHolesStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="BEFESTIGUNGSLOECHER">
      <p className="studio-decor-lead">
        Sollen die Befestigungsloecher bereits vorgebohrt geliefert werden?
      </p>
      <YesNoCards value={win.preDrilledHoles} onChange={(v) => setWin('preDrilledHoles', v)} />
    </ConfigSection>
  );
}
