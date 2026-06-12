import {
  GLASS_TYPES,
  ORNAMENT_GLASS,
  SECURITY_GLASS,
  SOUND_CLASSES
} from '@/utils/defaults';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';
import { YesNoCards } from './shared/stepUtils';

export default function GlazingStep({ state, setState, activeWindowIndex }) {
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  return (
    <div className="studio-step-sections">
      <ConfigSection title="VERGLASUNG">
        <h3>Glasart</h3>
        <OptionGrid
          options={GLASS_TYPES}
          selected={win.glassType}
          onSelect={(v) => setWin('glassType', v)}
          columns={4}
        />
      </ConfigSection>
      <ConfigSection title="THERMISCHER RANDVERBUND">
        <YesNoCards value={win.thermalEdge} onChange={(v) => setWin('thermalEdge', v)} />
      </ConfigSection>
      <ConfigSection title="SCHALLSCHUTZ">
        <OptionGrid
          options={SOUND_CLASSES}
          selected={win.soundClass}
          onSelect={(v) => setWin('soundClass', v)}
          columns={4}
        />
      </ConfigSection>
      <ConfigSection title="SICHERHEITSVERGLASUNG">
        <OptionGrid
          options={SECURITY_GLASS}
          selected={win.securityGlass}
          onSelect={(v) => setWin('securityGlass', v)}
          columns={4}
        />
      </ConfigSection>
      <ConfigSection title="ORNAMENT-/STRUKTURGLAS">
        <OptionGrid
          options={ORNAMENT_GLASS}
          selected={win.ornamentGlass}
          onSelect={(v) => setWin('ornamentGlass', v)}
          columns={5}
        />
      </ConfigSection>
    </div>
  );
}
