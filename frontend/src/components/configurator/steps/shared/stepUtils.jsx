import { Input, Modal } from 'antd';
import OptionGrid from '../../options/OptionGrid';

export const YES_NO_OPTIONS = [
  { id: 'Nein', label: 'Nein' },
  { id: 'Ja', label: 'Ja' }
];

export const SIZE_LIMITS = {
  width: { min: 385, max: 2500 },
  height: { min: 385, max: 2510 }
};

export function getSizeWarnings(win) {
  const warnings = [];
  const w = Number(win?.width);
  const h = Number(win?.height);
  if (!w || w < SIZE_LIMITS.width.min || w > SIZE_LIMITS.width.max) {
    warnings.push(`Breite muss zwischen ${SIZE_LIMITS.width.min} und ${SIZE_LIMITS.width.max} mm liegen.`);
  }
  if (!h || h < SIZE_LIMITS.height.min || h > SIZE_LIMITS.height.max) {
    warnings.push(`Hoehe muss zwischen ${SIZE_LIMITS.height.min} und ${SIZE_LIMITS.height.max} mm liegen.`);
  }
  return warnings;
}

export function YesNoCards({ value, onChange, columns = 2 }) {
  return (
    <OptionGrid
      options={YES_NO_OPTIONS}
      selected={value ? 'Ja' : 'Nein'}
      onSelect={(v) => onChange(v === 'Ja')}
      columns={columns}
    />
  );
}

export function NumberField({ label, value, onChange, min = 0, max = 9999, step = 1 }) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function SizeMeasureModal({ open, onClose }) {
  return (
    <Modal
      title="Instructions for correct measurements"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      mask={{ closable: true }}
      className="fv-measurement-modal"
    >
      <p>
        Measure the opening at three points for width and height. Use the smallest valid value so the window fits
        safely.
      </p>
      <ul>
        <li>Measure width at the top, middle, and bottom.</li>
        <li>Measure height on the left, center, and right.</li>
        <li>If the opening is uneven, send the smallest width and height.</li>
        <li>Add a note if you are unsure or if installation conditions are special.</li>
      </ul>
    </Modal>
  );
}

export const { TextArea } = Input;
