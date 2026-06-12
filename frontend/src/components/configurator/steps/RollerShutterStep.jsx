import { ROLLER_SHUTTER_TYPES } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { YesNoCards } from './shared/stepUtils';

export default function RollerShutterStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="ROLLLADEN">
      <p className="studio-decor-lead">Moechten Sie einen Rollladen hinzufuegen?</p>
      <YesNoCards value={win.hasRollerShutter} onChange={(v) => setWin('hasRollerShutter', v)} />
      {win.hasRollerShutter && (
        <OptionGrid
          options={ROLLER_SHUTTER_TYPES}
          selected={win.rollerShutterType}
          onSelect={(v) => setWin('rollerShutterType', v)}
          columns={2}
        />
      )}
    </ConfigSection>
  );
}
