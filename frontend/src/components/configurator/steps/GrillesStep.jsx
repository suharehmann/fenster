import { GRILLE_TYPES } from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import { NumberField, YesNoCards } from './shared/stepUtils';

export default function GrillesStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <ConfigSection title="SPROSSEN">
      <YesNoCards value={win.hasGrille} onChange={(v) => setWin('hasGrille', v)} />
      {win.hasGrille && (
        <div className="form-grid compact">
          <label>
            Sprossentyp
            <select value={win.grilleType} onChange={(e) => setWin('grilleType', e.target.value)}>
              {GRILLE_TYPES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <NumberField
            label="Sprossenbreite (mm)"
            value={win.grilleWidth}
            min={18}
            max={45}
            onChange={(v) => setWin('grilleWidth', v)}
          />
          <NumberField
            label="Vertikal"
            value={win.grilleVertical}
            min={0}
            max={6}
            onChange={(v) => setWin('grilleVertical', v)}
          />
          <NumberField
            label="Horizontal"
            value={win.grilleHorizontal}
            min={0}
            max={6}
            onChange={(v) => setWin('grilleHorizontal', v)}
          />
        </div>
      )}
    </ConfigSection>
  );
}
