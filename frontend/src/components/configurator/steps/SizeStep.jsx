import { useState } from 'react';
import { setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import {
  NumberField,
  SIZE_LIMITS,
  SizeMeasureModal,
  getSizeWarnings
} from './shared/stepUtils';

export default function SizeStep({ state, setState, activeWindowIndex }) {
  const [measureModalOpen, setMeasureModalOpen] = useState(false);
  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);
  const sizeWarnings = getSizeWarnings(win);

  return (
    <ConfigSection title="GROESSE">
      <div className="form-grid compact">
        <NumberField
          label="Gesamtbreite (mm)"
          value={win.width}
          min={SIZE_LIMITS.width.min}
          max={SIZE_LIMITS.width.max}
          onChange={(v) => setWin('width', v)}
        />
        <NumberField
          label="Gesamthoehe (mm)"
          value={win.height}
          min={SIZE_LIMITS.height.min}
          max={SIZE_LIMITS.height.max}
          onChange={(v) => setWin('height', v)}
        />
      </div>
      <p className="size-hint">
        Breite {SIZE_LIMITS.width.min}–{SIZE_LIMITS.width.max} mm · Hoehe {SIZE_LIMITS.height.min}–
        {SIZE_LIMITS.height.max} mm
      </p>
      {sizeWarnings.length > 0 && (
        <ul className="size-warning error">
          {sizeWarnings.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <button type="button" className="size-measure-link" onClick={() => setMeasureModalOpen(true)}>
        Instructions for correct measurements
      </button>
      <SizeMeasureModal open={measureModalOpen} onClose={() => setMeasureModalOpen(false)} />
    </ConfigSection>
  );
}
