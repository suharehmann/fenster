import './NonWindowProductStep.scss';
import { Input, InputNumber, Select } from 'antd';
import { ControlOutlined, ExpandOutlined, SettingOutlined } from '@ant-design/icons';
import OptionGrid from '../options/OptionGrid';
import ConfigSection from '../shared/ConfigSection';
import { setGroupField } from '@/lib/configurator/state';

const SHUTTER_TYPES = [
  { id: 'Aufsatzrollladen', label: 'Aufsatzrollladen', meta: 'Integriert in den Fensterrahmen' },
  { id: 'Vorsatzrollladen', label: 'Vorsatzrollladen', meta: 'Montage vor der Fensterfront' }
];

const CONTROL_OPTIONS = [
  { value: 'Manuell', label: 'Manuell (Gurt)' },
  { value: 'Elektrisch', label: 'Elektrisch' },
  { value: 'Funk', label: 'Funk / Smart Home' }
];

const FEATURE_PRESETS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Hinderniserkennung', label: 'Hinderniserkennung' },
  { value: 'Zeitschaltuhr', label: 'Zeitschaltuhr' },
  { value: 'Windwaechter', label: 'Windwaechter' }
];

function FieldHint({ children }) {
  return <p className="fv-product-field-hint">{children}</p>;
}

export default function NonWindowProductStep({ state, setState }) {
  if (state.productType === 'window') return null;

  if (state.productType === 'door') {
    const d = state.doorConfig;
    const setDoor = (field, value) => setGroupField(setState, 'doorConfig', field, value);

    return (
      <div className="fv-product-config">
        <ConfigSection title="MODELL & FARBE">
          <div className="fv-product-fields">
            <label className="fv-product-field">
              <span>Modell</span>
              <Input value={d.model} onChange={(e) => setDoor('model', e.target.value)} placeholder="z. B. Modell A" />
            </label>
            <label className="fv-product-field">
              <span>Farbe</span>
              <Input value={d.color} onChange={(e) => setDoor('color', e.target.value)} placeholder="z. B. Anthrazit" />
            </label>
          </div>
        </ConfigSection>

        <ConfigSection title="MASSE">
          <div className="fv-product-fields fv-product-fields--dims">
            <label className="fv-product-field">
              <span>
                <ExpandOutlined aria-hidden /> Breite (mm)
              </span>
              <InputNumber
                min={700}
                max={1500}
                value={d.width}
                onChange={(v) => setDoor('width', v ?? d.width)}
                controls
                className="fv-product-input-num"
              />
            </label>
            <label className="fv-product-field">
              <span>
                <ExpandOutlined aria-hidden /> Hoehe (mm)
              </span>
              <InputNumber
                min={1700}
                max={2600}
                value={d.height}
                onChange={(v) => setDoor('height', v ?? d.height)}
                controls
                className="fv-product-input-num"
              />
            </label>
          </div>
          <FieldHint>Standardoeffnungsmasse — individuelle Werte auf Anfrage moeglich.</FieldHint>
        </ConfigSection>

        <ConfigSection title="EXTRAS">
          <label className="fv-product-field fv-product-field--full">
            <span>Zusatzausstattung</span>
            <Input
              value={d.extras}
              onChange={(e) => setDoor('extras', e.target.value)}
              placeholder="z. B. Seitenteil links, Mehrfachverriegelung"
            />
          </label>
        </ConfigSection>
      </div>
    );
  }

  const s = state.shutterConfig;
  const setShutter = (field, value) => setGroupField(setState, 'shutterConfig', field, value);

  return (
    <div className="fv-product-config">
      <ConfigSection title="ROLLLADENTYP">
        <OptionGrid
          options={SHUTTER_TYPES}
          selected={s.shutterType}
          onSelect={(v) => setShutter('shutterType', v)}
          columns={2}
          cardClassName="select-card fv-product-type-card"
        />
      </ConfigSection>

      <ConfigSection title="MASSE">
        <div className="fv-product-fields fv-product-fields--dims">
          <label className="fv-product-field">
            <span>
              <ExpandOutlined aria-hidden /> Breite (mm)
            </span>
            <InputNumber
              min={300}
              max={3000}
              value={s.width}
              onChange={(v) => setShutter('width', v ?? s.width)}
              controls
              className="fv-product-input-num"
            />
          </label>
          <label className="fv-product-field">
            <span>
              <ExpandOutlined aria-hidden /> Hoehe (mm)
            </span>
            <InputNumber
              min={300}
              max={3000}
              value={s.height}
              onChange={(v) => setShutter('height', v ?? s.height)}
              controls
              className="fv-product-input-num"
            />
          </label>
        </div>
        <FieldHint>Die Masse beziehen sich auf die lichte Oeffnung des Rollladens.</FieldHint>
      </ConfigSection>

      <ConfigSection title="STEUERUNG & TECHNIK">
        <div className="fv-product-fields">
          <label className="fv-product-field">
            <span>
              <ControlOutlined aria-hidden /> Steuerung
            </span>
            <Select
              value={s.control}
              onChange={(v) => setShutter('control', v)}
              options={CONTROL_OPTIONS}
              className="fv-product-select"
            />
          </label>
          <label className="fv-product-field">
            <span>
              <SettingOutlined aria-hidden /> Technik
            </span>
            <Select
              value={s.features}
              onChange={(v) => setShutter('features', v)}
              options={FEATURE_PRESETS}
              className="fv-product-select"
            />
          </label>
        </div>
      </ConfigSection>
    </div>
  );
}
