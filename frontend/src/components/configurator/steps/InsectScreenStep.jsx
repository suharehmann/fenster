import { INSECT_SCREEN_TYPES } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { YesNoCards } from './shared/stepUtils';

export default function InsectScreenStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="INSEKTENSCHUTZ">
      <p className="studio-decor-lead">Moechten Sie einen Insektenschutz hinzufuegen?</p>
      <YesNoCards value={win.hasInsectScreen} onChange={(v) => setWin('hasInsectScreen', v)} />
      {win.hasInsectScreen && (
        <OptionGrid
          options={INSECT_SCREEN_TYPES}
          selected={win.insectScreenType}
          onSelect={(v) => setWin('insectScreenType', v)}
          columns={2}
        />
      )}
    </ConfigSection>
  );
}
