import { useState } from 'react';
import './WizardSteps.scss';
import { Input, Modal } from 'antd';
import {
  FITTINGS,
  FRAME_EXTENSION,
  GLASS_TYPES,
  GRILLE_TYPES,
  HANDLES,
  LIGHT_OPTIONS,
  OPENING_DIRECTIONS,
  OPENING_TYPES,
  ORNAMENT_GLASS,
  SECURITY_GLASS,
  SOUND_CLASSES,
  WINDOW_TYPES,
  typeDefaultOpening
} from '@/utils/defaults';
import { buildConfiguratorShapePreview } from '@/utils/windowShapePreview';
import { setGroupField, setWindowField } from '@/lib/configurator/state';
import ConfigSection from '../shared/ConfigSection';
import OptionGrid from '../options/OptionGrid';

export { ConfigSection };

const { TextArea } = Input;

const YES_NO_OPTIONS = [
  { id: 'Nein', label: 'Nein' },
  { id: 'Ja', label: 'Ja' }
];

const SIZE_LIMITS = {
  width: { min: 385, max: 2500 },
  height: { min: 385, max: 2510 }
};

function getSizeWarnings(win) {
  const warnings = [];
  const w = Number(win?.width);
  const h = Number(win?.height);
  if (!w || w < SIZE_LIMITS.width.min || w > SIZE_LIMITS.width.max) {
    warnings.push(`Breite muss zwischen ${SIZE_LIMITS.width.min} und ${SIZE_LIMITS.width.max} mm liegen.`);
  }
  if (!h || h < SIZE_LIMITS.height.min || h > SIZE_LIMITS.height.max) {
    warnings.push(`Höhe muss zwischen ${SIZE_LIMITS.height.min} und ${SIZE_LIMITS.height.max} mm liegen.`);
  }
  return warnings;
}

function YesNoCards({ value, onChange, columns = 2 }) {
  return (
    <OptionGrid
      options={YES_NO_OPTIONS}
      selected={value ? 'Ja' : 'Nein'}
      onSelect={(v) => onChange(v === 'Ja')}
      columns={columns}
    />
  );
}

function NumberField({ label, value, onChange, min = 0, max = 9999, step = 1 }) {
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

function StudioSections({ panels }) {
  return (
    <div className="studio-step-sections studio-step-sections--stacked">
      {panels.map((panel) => panel)}
    </div>
  );
}

export function WindowBuildStep({ state, setState, activeWindowIndex, previewSurface = 'outside' }) {
  if (state.productType !== 'window') return null;
  const [measureModalOpen, setMeasureModalOpen] = useState(false);

  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);
  const selectedType = WINDOW_TYPES.find((t) => t.id === win.windowType) || WINDOW_TYPES[0];
  const sizeWarnings = getSizeWarnings(win);
  const withBuildShapePreview = (option, windowOverrides, meta = {}) => {
    const merged = { ...win, ...windowOverrides };
    const typeMeta = WINDOW_TYPES.find((t) => t.id === merged.windowType) || selectedType;
    return {
      ...option,
      image: buildConfiguratorShapePreview(state.globalConfig, merged, {
        panes: meta.panes ?? typeMeta.panes,
        shape: meta.shape ?? typeMeta.shape ?? 'rect',
        layout: meta.layout ?? typeMeta.layout ?? 'row',
        divider: meta.divider ?? typeMeta.divider ?? 'pfosten',
        fixedOnly: meta.fixedOnly ?? typeMeta.fixedOnly,
        openingType: meta.openingType ?? typeDefaultOpening(typeMeta.id, typeMeta.panes),
        mode: meta.mode ?? 'type',
        colorSurface: previewSurface
      })
    };
  };

  const windowTypeOptions = WINDOW_TYPES.map((option) =>
    withBuildShapePreview(
      option,
      { windowType: option.id, lightOption: 'Ohne Ober-/Unterlicht' },
      {
        panes: option.panes,
        shape: option.shape,
        layout: option.layout,
        divider: option.divider,
        fixedOnly: option.fixedOnly,
        openingType: typeDefaultOpening(option.id, option.panes)
      }
    )
  );
  const lightOptions = LIGHT_OPTIONS.map((option) =>
    withBuildShapePreview(option, { lightOption: option.id }, { mode: 'light' })
  );
  const openingOptions = OPENING_TYPES.filter((option) => option.panes === selectedType.panes).map(
    (option) =>
      withBuildShapePreview(option, { openingType: option.id }, { mode: 'opening', openingType: option.id })
  );

  function changeWindowType(value) {
    const nextType = WINDOW_TYPES.find((t) => t.id === value) || WINDOW_TYPES[0];
    const nextOpening = OPENING_TYPES.find((option) => option.panes === nextType.panes);
    setState((prev) => ({
      ...prev,
      windows: prev.windows.map((item, idx) =>
        idx === activeWindowIndex
          ? {
              ...item,
              windowType: value,
              lightOption: 'Ohne Ober-/Unterlicht',
              openingType: nextOpening ? nextOpening.id : item.openingType
            }
          : item
      )
    }));
  }

  const panels = [
    <ConfigSection title="FENSTERTYP" sectionId="fv-build-type" key="type">
      <OptionGrid options={windowTypeOptions} selected={win.windowType} onSelect={changeWindowType} />
    </ConfigSection>,
    <ConfigSection title="OBER-/UNTERLICHT" sectionId="fv-build-light" key="light">
      <OptionGrid
        options={lightOptions}
        selected={win.lightOption}
        onSelect={(v) => setWin('lightOption', v)}
      />
    </ConfigSection>,
    <ConfigSection title="OEFFNUNG" sectionId="fv-build-opening" key="opening">
      <h3>Oeffnungsart</h3>
      <OptionGrid
        options={openingOptions}
        selected={win.openingType}
        onSelect={(v) => setWin('openingType', v)}
        columns={3}
      />
      <h3>Oeffnungsrichtung</h3>
      <OptionGrid
        options={OPENING_DIRECTIONS.map((option) =>
          withBuildShapePreview(
            option,
            {},
            {
              mode: 'opening',
              openingType: win.openingType || typeDefaultOpening(selectedType.id, selectedType.panes),
              openingDirection: option.id,
              panes: selectedType.panes,
              shape: selectedType.shape,
              layout: selectedType.layout,
              divider: selectedType.divider,
              fixedOnly: false
            }
          )
        )}
        selected={win.openingDirection}
        onSelect={(v) => setWin('openingDirection', v)}
        columns={4}
      />
    </ConfigSection>,
    <ConfigSection title="GROESSE" sectionId="fv-build-size" key="size">
      <div className="form-grid compact">
        <NumberField label="Gesamtbreite (mm)" value={win.width} min={SIZE_LIMITS.width.min} max={SIZE_LIMITS.width.max} onChange={(v) => setWin('width', v)} />
        <NumberField label="Gesamthoehe (mm)" value={win.height} min={SIZE_LIMITS.height.min} max={SIZE_LIMITS.height.max} onChange={(v) => setWin('height', v)} />
      </div>
      <p className="size-hint">
        Breite {SIZE_LIMITS.width.min}–{SIZE_LIMITS.width.max} mm · Höhe {SIZE_LIMITS.height.min}–{SIZE_LIMITS.height.max} mm
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
      <Modal
        title="Instructions for correct measurements"
        open={measureModalOpen}
        onCancel={() => setMeasureModalOpen(false)}
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
    </ConfigSection>
  ];

  return <StudioSections panels={panels} />;
}

export function WindowGlassStep({ state, setState, activeWindowIndex }) {
  if (state.productType !== 'window') return null;

  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  const panels = [
    <ConfigSection title="VERGLASUNG" key="glass">
      <h3>Glasart</h3>
      <OptionGrid
        options={GLASS_TYPES}
        selected={win.glassType}
        onSelect={(v) => setWin('glassType', v)}
        columns={4}
      />
    </ConfigSection>,
    <ConfigSection title="THERMISCHER RANDVERBUND" key="thermal">
      <YesNoCards value={win.thermalEdge} onChange={(v) => setWin('thermalEdge', v)} />
    </ConfigSection>,
    <ConfigSection title="SCHALLSCHUTZ" key="sound">
      <OptionGrid
        options={SOUND_CLASSES}
        selected={win.soundClass}
        onSelect={(v) => setWin('soundClass', v)}
        columns={4}
      />
    </ConfigSection>,
    <ConfigSection title="SICHERHEITSVERGLASUNG" key="security">
      <OptionGrid
        options={SECURITY_GLASS}
        selected={win.securityGlass}
        onSelect={(v) => setWin('securityGlass', v)}
        columns={4}
      />
    </ConfigSection>,
    <ConfigSection title="ORNAMENT-/STRUKTURGLAS" key="ornament">
      <OptionGrid
        options={ORNAMENT_GLASS}
        selected={win.ornamentGlass}
        onSelect={(v) => setWin('ornamentGlass', v)}
        columns={5}
      />
    </ConfigSection>
  ];

  return <StudioSections panels={panels} />;
}

export function WindowSecurityStep({ state, setState, activeWindowIndex }) {
  if (state.productType !== 'window') return null;

  const win = state.windows[activeWindowIndex] || state.windows[0];
  const setWin = (field, value) => setWindowField(setState, activeWindowIndex, field, value);

  const panels = [
    <ConfigSection title="SPROSSEN" key="grille">
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
          <NumberField label="Sprossenbreite (mm)" value={win.grilleWidth} min={18} max={45} onChange={(v) => setWin('grilleWidth', v)} />
          <NumberField label="Vertikal" value={win.grilleVertical} min={0} max={6} onChange={(v) => setWin('grilleVertical', v)} />
          <NumberField label="Horizontal" value={win.grilleHorizontal} min={0} max={6} onChange={(v) => setWin('grilleHorizontal', v)} />
        </div>
      )}
    </ConfigSection>,
    <ConfigSection title="BESCHLAG / FENSTERFALZLUEFTER" key="fitting">
      <h3>Beschlag</h3>
      <OptionGrid options={FITTINGS} selected={win.fitting} onSelect={(v) => setWin('fitting', v)} columns={3} />
      <h3>Fensterfalzlueter</h3>
      <YesNoCards value={win.hasVent} onChange={(v) => setWin('hasVent', v)} />
    </ConfigSection>,
    <ConfigSection title="GRIFFE / BOHRUNGEN" key="handle">
      <h3>Griffe</h3>
      <OptionGrid options={HANDLES} selected={win.handle} onSelect={(v) => setWin('handle', v)} columns={5} />
      <h3>Befestigungsloecher vorgebohrt</h3>
      <YesNoCards value={win.preDrilledHoles} onChange={(v) => setWin('preDrilledHoles', v)} />
    </ConfigSection>,
    <ConfigSection title="RAHMENVERBREITERUNG" key="ext">
      <YesNoCards value={win.frameExtensionEnabled} onChange={(v) => setWin('frameExtensionEnabled', v)} />
      {win.frameExtensionEnabled && (
        <>
          <OptionGrid
            options={FRAME_EXTENSION}
            selected={win.frameExtensionKind}
            onSelect={(v) => setWin('frameExtensionKind', v)}
            columns={2}
          />
          <div className="form-grid compact">
            <NumberField label="Links (mm)" value={win.frameExtensionLeft} max={200} onChange={(v) => setWin('frameExtensionLeft', v)} />
            <NumberField label="Rechts (mm)" value={win.frameExtensionRight} max={200} onChange={(v) => setWin('frameExtensionRight', v)} />
            <NumberField label="Oben (mm)" value={win.frameExtensionTop} max={200} onChange={(v) => setWin('frameExtensionTop', v)} />
            <NumberField label="Unten (mm)" value={win.frameExtensionBottom} max={200} onChange={(v) => setWin('frameExtensionBottom', v)} />
          </div>
        </>
      )}
    </ConfigSection>
  ];

  return <StudioSections panels={panels} />;
}

export { default as NonWindowProductStep } from './NonWindowProductStep';

export function CustomerStep({ state, setState }) {
  const c = state.customer;
  const setCustomer = (field, value) => setGroupField(setState, 'customer', field, value);

  return (
    <div className="studio-inquiry">
      <p className="studio-inquiry-lead">
        Fast fertig — hinterlassen Sie Ihre Kontaktdaten. Wir senden Ihnen ein unverbindliches Angebot zu Ihrer
        Konfiguration.
      </p>

      <ConfigSection title="KONTAKTDATEN">
        <div className="studio-inquiry-grid">
          <label className="studio-field">
            <span>Vollstaendiger Name *</span>
            <Input
              required
              autoComplete="name"
              placeholder="Max Mustermann"
              value={c.fullName}
              onChange={(e) => setCustomer('fullName', e.target.value)}
            />
          </label>
          <label className="studio-field">
            <span>E-Mail *</span>
            <Input
              required
              type="email"
              autoComplete="email"
              placeholder="name@beispiel.de"
              value={c.email}
              onChange={(e) => setCustomer('email', e.target.value)}
            />
          </label>
          <label className="studio-field studio-field-wide">
            <span>Adresse *</span>
            <Input
              required
              autoComplete="street-address"
              placeholder="Strasse, PLZ Ort"
              value={c.address}
              onChange={(e) => setCustomer('address', e.target.value)}
            />
          </label>
          <label className="studio-field">
            <span>Telefon</span>
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+49 ..."
              value={c.phone}
              onChange={(e) => setCustomer('phone', e.target.value)}
            />
          </label>
        </div>
      </ConfigSection>

      <ConfigSection title="IHRE NACHRICHT">
        <label className="studio-field studio-field-wide">
          <span>Anmerkungen (optional)</span>
          <TextArea
            rows={4}
            placeholder="Montagewunsch, Sonderwuensche, Fragen ..."
            value={c.notes}
            onChange={(e) => setCustomer('notes', e.target.value)}
          />
        </label>
      </ConfigSection>

      <p className="studio-inquiry-note">
        Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung der Anfrage verwenden. Pflichtfelder sind
        mit * markiert.
      </p>
    </div>
  );
}
