import { useState } from 'react';
import './DetailConfiguratorStudio.scss';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  FullscreenOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import SelectedMark from '@/components/ui/SelectedMark';
import ConfigStepper from './ConfigStepper';
import useMediaQuery from '@/hooks/useMediaQuery';
import WindowSelectDropdown from '../controls/WindowSelectDropdown';
import WindowQuantityModal from '../controls/WindowQuantityModal';
import WindowNameModal from '../controls/WindowNameModal';
import { applyQuantity, clampQuantity } from '@/lib/configurator/quantity';
import { getWindowDisplayName, renameWindowAtIndex } from '@/lib/configurator/windowLabel';
import CatalogImagePreview from '../preview/CatalogImagePreview';
import StudioShapePreview from '../preview/StudioShapePreview';
import WindowPreview from '../preview/WindowPreview';
import Window3DPreview from '../preview/Window3DPreview';
import { findDecorByIdForSurface } from '@/config/configurator/decorColors';
import {
  FRAME_COLORS,
  getAvailableProfiles,
  getAvailableSystems,
  HOLZ_ARTEN,
  LIGHT_OPTIONS,
  HANDLES,
  materialHasSystem,
  OPENING_TYPES,
  PRODUCT_TYPES,
  PROFILE_SYSTEMS,
  WINDOW_TYPES
} from '@/utils/defaults';
import { computeTotal } from '@/lib/configurator/pricing';
import { ensureWindowAtIndex, removeWindowAtIndex } from '@/lib/configurator/quantity';
import {
  buildPreviewWindow,
  resolveConfiguredSvgPreview,
  resolvePreviewImage,
  shouldPreferDynamicPreview
} from '@/utils/previewConfig';

const PRODUCT_STEPS = [
  { num: '1', title: 'Konfiguration' },
  { num: '2', title: 'Anfrage' }
];

const PRODUCT_RAIL_META = {
  door: { listTitle: 'Ihre Haustueren', itemLabel: 'Haustuer', hint: 'Element waehlen' },
  shutter: { listTitle: 'Ihre Rollladen', itemLabel: 'Rollladen', hint: 'Element waehlen' }
};

const BRAND_LOGO = '/assets/configurator/window.svg';

const STEPPER_STEPS = [
  { num: '1', title: 'Material' },
  { num: '2', title: 'Farben' },
  { num: '3', title: 'Typ' },
  { num: '4', title: 'Öffnung' },
  { num: '5', title: 'Maße' },
  { num: '6', title: 'Verglasung' },
  { num: '7', title: 'Extras' }
];

const STEPPER_JUMP = [
  { stepId: 'profile', subStep: 0 },
  { stepId: 'colors', subStep: 0 },
  { stepId: 'build', subStep: 0 },
  { stepId: 'build', subStep: 2 },
  { stepId: 'build', subStep: 3 },
  { stepId: 'glass', subStep: 0 },
  { stepId: 'security', subStep: 0 }
];

function getStepperDisplayIndex(detailStepId, subStep) {
  if (detailStepId === 'profile') return 0;
  if (detailStepId === 'colors') return 1;
  if (detailStepId === 'build') {
    if (subStep <= 1) return 2;
    if (subStep === 2) return 3;
    return 4;
  }
  if (detailStepId === 'glass') return 5;
  if (detailStepId === 'security') return 6;
  if (detailStepId === 'customer') return 6;
  return 0;
}

function formatMm(value, fallback) {
  const n = Number(value);
  const safe = Number.isFinite(n) && n >= 100 && n <= 15000 ? n : Number(fallback);
  return safe.toLocaleString('de-DE');
}

/** Typ, Öffnung and Maße are chosen in Fensteraufbau — not before that step. */
function isBeforeShapeStep(detailStepId) {
  return detailStepId === 'profile' || detailStepId === 'colors';
}

function optionLabel(options, id) {
  return options.find((item) => item.id === id)?.label || id;
}

function formatWindowSummary(win, index, material) {
  const dims = `${formatMm(win?.width, 1200)} × ${formatMm(win?.height, 1400)} mm`;
  const windowType = optionLabel(WINDOW_TYPES, win?.windowType);
  const opening = optionLabel(OPENING_TYPES, win?.openingType);
  const handle = optionLabel(HANDLES, win?.handle);
  return `${getWindowDisplayName(win, index)} — ${material || 'Noch offen'} · ${windowType || 'Typ offen'} · ${opening || 'Öffnung offen'} · ${handle || 'Griff offen'} · ${dims}`;
}

function formatWindowDetail(win, material) {
  const dims = `${formatMm(win?.width, 1200)} × ${formatMm(win?.height, 1400)} mm`;
  const windowType = optionLabel(WINDOW_TYPES, win?.windowType);
  const opening = optionLabel(OPENING_TYPES, win?.openingType);
  const light = optionLabel(LIGHT_OPTIONS, win?.lightOption);
  const handle = optionLabel(HANDLES, win?.handle);
  const fitting = win?.fitting || 'Beschlag offen';
  const grille = win?.hasGrille ? 'Sprossen' : null;
  const holes = win?.preDrilledHoles ? 'Bohrungen vorgebohrt' : null;
  const extras = [grille, holes].filter(Boolean).join(', ');
  return `${material || 'Noch offen'} · ${windowType || 'Typ offen'} · ${opening || 'Öffnung offen'} · ${light || 'Ober-/Unterlicht offen'} · ${win?.glassType || 'Verglasung offen'} · ${handle || 'Griff offen'} · ${fitting}${extras ? ` · ${extras}` : ''} · ${dims}`;
}

function getWindowProgress(win, g) {
  const checks = [
    g?.profileSystem,
    win?.windowType,
    win?.openingType,
    win?.width && win?.height,
    g?.frameColorOutside && g?.frameColorInside,
    win?.glassType,
    win?.fitting,
    win?.handle
  ];
  return checks.filter(Boolean).length / checks.length;
}

function getProductSummaryLine(state) {
  if (state.productType === 'door') {
    const d = state.doorConfig;
    return `${d?.model || 'Modell'}, ${formatMm(d?.width, 1100)} × ${formatMm(d?.height, 2100)} mm`;
  }
  const s = state.shutterConfig;
  return `${s?.shutterType || 'Typ'}, ${formatMm(s?.width, 1200)} × ${formatMm(s?.height, 1400)} mm`;
}

function getProductDetailRows(state) {
  if (state.productType === 'door') {
    const d = state.doorConfig;
    return [
      { label: 'Modell', value: d?.model || '—', pending: !d?.model },
      { label: 'Farbe', value: d?.color || '—', pending: !d?.color },
      {
        label: 'Ma�e',
        value: `${formatMm(d?.width, 1100)} × ${formatMm(d?.height, 2100)} mm`,
        pending: !d?.width
      },
      { label: 'Extras', value: d?.extras || '—', pending: false }
    ];
  }
  const s = state.shutterConfig;
  return [
    { label: 'Typ', value: s?.shutterType || '—', pending: !s?.shutterType },
    {
      label: 'Ma�e',
      value: `${formatMm(s?.width, 1200)} × ${formatMm(s?.height, 1400)} mm`,
      pending: !s?.width
    },
    { label: 'Steuerung', value: s?.control || '—', pending: !s?.control },
    { label: 'Technik', value: s?.features || '—', pending: !s?.features }
  ];
}

function getProductProgress(state) {
  const rows = getProductDetailRows(state);
  const filled = rows.filter((r) => !r.pending && r.value !== '—').length;
  return Math.round((filled / rows.length) * 100);
}

function estimateProductPrice(state) {
  if (state.productType === 'door') {
    const d = state.doorConfig;
    const area = ((d?.width || 1100) * (d?.height || 2100)) / (1100 * 2100);
    return Math.round(890 * area * (state.quantity || 1));
  }
  const s = state.shutterConfig;
  const area = ((s?.width || 1200) * (s?.height || 1400)) / (1200 * 1400);
  const controlFactor = s?.control === 'Elektrisch' ? 1.15 : 1;
  return Math.round(320 * area * controlFactor * (state.quantity || 1));
}

export { default as ColorSelectionStudio } from './DecorColorStudio';

function formatUValue(value) {
  return Number(value).toFixed(2).replace('.', ',');
}

export function ProfileSelectionStudio({ state, setState }) {
  const { material, manufacturer } = state.globalConfig || {};
  const selected = state.globalConfig?.profileSystem;
  const profiles = getAvailableProfiles(material, manufacturer);
  const activeSystem = getAvailableSystems(material).find((s) => s.id === manufacturer);

  function handleProfileSelect(profileId) {
    setState((previousState) => ({
      ...previousState,
      globalConfig: { ...previousState.globalConfig, profileSystem: profileId }
    }));
  }
  return (
    <div className="fv-profile-panel">
      <div className="fv-step-intro">
        <h3>Profil waehlen</h3>
        <p>
          {activeSystem
            ? `Verfuegbare Profile fuer ${activeSystem.label}.`
            : 'Waehlen Sie das passende Profil zu Ihrem Material.'}
        </p>
      </div>
      <div className="studio-profile-grid">
        {profiles.map((option) => {
          const isSelected = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              className={`studio-profile-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleProfileSelect(option.id)}
            >
              <SelectedMark selected={isSelected} />
              <strong>
                {option.label}
                {option.id === 'Holz-Alu IV 78' && (
                  <span className="fv-profile-recommended-badge">Empfohlen</span>
                )}
              </strong>
              <span className="studio-profile-uvalue">Uw ab {formatUValue(option.uValue)} W/m²K</span>
              <ul className="studio-profile-features">
                {option.chambers ? <li>{option.chambers} Kammern</li> : null}
                <li>{option.seals} Dichtungsebenen</li>
                <li>{option.frameDepth} mm Bautiefe</li>
              </ul>
              <span className="studio-profile-metric">
                {option.priceDiff > 0 ? `+ ${option.priceDiff} €` : 'inklusive'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WindowRail({
  windows,
  slotCount,
  activeIndex,
  material,
  onSelect,
  onEnsureSlot,
  onExit,
  onEditQuantity,
  onEditName,
  onDeleteWindow,
  canDeleteWindow
}) {
  const totalSlots = Math.max(slotCount ?? windows.length, 1);

  function renderWindowItemActions(index, label, { onEdit, showDelete = true }) {
    return (
      <div className="fv-window-item-actions">
        <button type="button" className="fv-window-item-edit" onClick={onEdit} aria-label={`${label} umbenennen`}>
          <EditOutlined className="fv-edit-icon" aria-hidden />
        </button>
        {showDelete ? (
          <button
            type="button"
            className="fv-window-item-delete"
            onClick={() => onDeleteWindow(index)}
            disabled={!canDeleteWindow}
            aria-label={`${label} entfernen`}
          >
            <DeleteOutlined className="fv-edit-icon" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="fv-rail" aria-label="Projektfenster">
      <button type="button" className="fv-back-link" onClick={onExit} aria-label="Zurueck zur Uebersicht">
        <span className="fv-back-arrow" aria-hidden="true">
          <ArrowLeftOutlined />
        </span>
        <span className="fv-back-label">Zurueck zur Uebersicht</span>
      </button>
      <div className="fv-window-panel">
        <div className="fv-window-panel-head">
          <div className="fv-window-panel-title-row">
            <h2>Ihre Fenster</h2>
            <span className="fv-window-select-hint">Fenster waehlen</span>
          </div>
          <div className="fv-window-panel-actions">
            <span className="fv-window-count">{totalSlots}</span>
            <button
              type="button"
              className="fv-window-edit"
              onClick={onEditQuantity}
              aria-haspopup="dialog"
              aria-label="Anzahl Fenster bearbeiten"
            >
              <EditOutlined className="fv-edit-icon" aria-hidden />
              Bearbeiten
            </button>
          </div>
        </div>
        <div className="fv-window-select-wrap">
          <WindowSelectDropdown
            windows={windows}
            activeIndex={activeIndex}
            material={material}
            onSelect={onSelect}
            formatSummary={formatWindowSummary}
            formatDetail={formatWindowDetail}
          />
        </div>
        <div className="fv-window-list">
          {Array.from({ length: totalSlots }, (_, index) => {
            const win = windows[index];
            if (!win) {
              return (
                <div key={`window-slot-empty-${index}`} className="fv-window-item-row">
                  <button
                    type="button"
                    className="fv-window-item fv-window-item--empty"
                    onClick={() => onEnsureSlot(index)}
                  >
                    <span className="fv-window-num">{index + 1}</span>
                    <span className="fv-window-item-text">
                      <strong>Fenster {index + 1}</strong>
                      <span>Leer — zum Konfigurieren waehlen</span>
                    </span>
                  </button>
                  {renderWindowItemActions(index, `Fenster ${index + 1}`, {
                    onEdit: () => {
                      onEnsureSlot(index);
                      onEditName(index);
                    }
                  })}
                </div>
              );
            }
            const label = getWindowDisplayName(win, index);
            return (
              <div
                key={win.id}
                className={`fv-window-item-row ${activeIndex === index ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className={`fv-window-item ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => onSelect(index)}
                >
                  <span className="fv-window-num">{index + 1}</span>
                  <span className="fv-window-item-text">
                    <strong>{label}</strong>
                    <span>
                      {material || 'Noch offen'}, {formatMm(win?.width, 1200)} × {formatMm(win?.height, 1400)} mm
                    </span>
                  </span>
                </button>
                {renderWindowItemActions(index, label, {
                  onEdit: () => onEditName(index)
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="fv-help-card">
        <img src={BRAND_LOGO} alt="" className="fv-help-logo" width={22} height={22} />
        <div className="fv-help-copy">
          <strong>Brauchen Sie Hilfe?</strong>
          <p>Wir beraten Sie gerne.</p>
        </div>
        <Link to="/kontakt" className="fv-help-link">
          <Button type="primary" block>
            Kontakt aufnehmen
          </Button>
        </Link>
      </div>
    </aside>
  );
}

function ProductRail({ state, activeIndex, onSelect, onExit, onEditQuantity }) {
  const meta = PRODUCT_RAIL_META[state.productType] || PRODUCT_RAIL_META.shutter;
  const quantity = Math.max(1, state.quantity || 1);
  const summary = getProductSummaryLine(state);

  return (
    <aside className="fv-rail" aria-label="Projektelemente">
      <button type="button" className="fv-back-link" onClick={onExit} aria-label="Zurueck zur Uebersicht">
        <span className="fv-back-arrow" aria-hidden="true">
          <ArrowLeftOutlined />
        </span>
        <span className="fv-back-label">Zurueck zur Uebersicht</span>
      </button>
      <div className="fv-window-panel">
        <div className="fv-window-panel-head">
          <div className="fv-window-panel-title-row">
            <h2>{meta.listTitle}</h2>
            <span className="fv-window-select-hint">{meta.hint}</span>
          </div>
          <div className="fv-window-panel-actions">
            <span className="fv-window-count">{quantity}</span>
            <button
              type="button"
              className="fv-window-edit"
              onClick={onEditQuantity}
              aria-haspopup="dialog"
              aria-label={`Anzahl ${meta.itemLabel} bearbeiten`}
            >
              <EditOutlined className="fv-edit-icon" aria-hidden />
              Bearbeiten
            </button>
          </div>
        </div>
        <div className="fv-window-list">
          {Array.from({ length: quantity }, (_, index) => (
            <button
              key={`product-${index}`}
              type="button"
              className={`fv-window-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <span className="fv-window-num">{index + 1}</span>
              <span className="fv-window-item-text">
                <strong>
                  {meta.itemLabel} {index + 1}
                </strong>
                <span>{summary}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="fv-help-card">
        <img src={BRAND_LOGO} alt="" className="fv-help-logo" width={22} height={22} />
        <div className="fv-help-copy">
          <strong>Brauchen Sie Hilfe?</strong>
          <p>Wir beraten Sie gerne.</p>
        </div>
        <Link to="/kontakt" className="fv-help-link">
          <Button type="primary" block>
            Kontakt aufnehmen
          </Button>
        </Link>
      </div>
    </aside>
  );
}

function ProductPreviewCard({ state }) {
  const product = PRODUCT_TYPES.find((p) => p.id === state.productType);
  const isDoor = state.productType === 'door';
  const cfg = isDoor ? state.doorConfig : state.shutterConfig;
  const dims = {
    w: formatMm(cfg?.width, isDoor ? 1100 : 1200),
    h: formatMm(cfg?.height, isDoor ? 2100 : 1400)
  };

  return (
    <div className="fv-preview-card">
      <div className="fv-preview-head">
        <h3>Live Vorschau</h3>
      </div>
      <div className="fv-preview-canvas fv-preview-canvas--product detail-studio-preview-canvas">
        {product?.image ? (
          <img className="fv-product-preview-img" src={product.image} alt="" loading="lazy" decoding="async" />
        ) : null}
        <span className="detail-studio-dim detail-studio-dim-h">H {dims.h} mm</span>
        <span className="detail-studio-dim detail-studio-dim-w">B {dims.w} mm</span>
      </div>
    </div>
  );
}

function PreviewCard({
  previewMode,
  previewSurface,
  setPreviewSurface,
  colorSurface,
  onPreviewSurfaceChange,
  previewKey,
  window,
  globalConfig,
  dims,
  detailStepId,
  subStep
}) {
  const previewWindow = buildPreviewWindow(window, globalConfig);
  const previewImage = resolvePreviewImage(window, globalConfig, {
    detailStepId,
    subStep,
    preferMaterial: detailStepId === 'profile'
  });
  const isColorsStep = detailStepId === 'colors';
  const isBuildStep = detailStepId === 'build';
  const usesSelectedColors =
    isColorsStep || isBuildStep || detailStepId === 'glass' || detailStepId === 'security' || detailStepId === 'customer';
  const activeSurface = isColorsStep ? colorSurface : previewSurface;

  function handlePreviewSurfaceChange(surface) {
    setPreviewSurface(surface);
    if (isColorsStep) onPreviewSurfaceChange?.(surface);
  }

  const configuredSvgPreview = usesSelectedColors
    ? null
    : resolveConfiguredSvgPreview(previewWindow, globalConfig, {
        detailStepId,
        subStep,
        colorSurface: activeSurface
      });
  const resolvedPreviewImage = configuredSvgPreview || previewImage;
  // CSS preview with selected decor colour (no catalog photo overrides).
  const useShapePreview = usesSelectedColors;
  const neutralShapePreview = isBeforeShapeStep(detailStepId);
  const useDynamic =
    !useShapePreview &&
    !configuredSvgPreview &&
    (shouldPreferDynamicPreview(detailStepId, subStep) || !resolvedPreviewImage);
  const showHandle = detailStepId === 'security' || detailStepId === 'customer';

  return (
    <div className="fv-preview-card">
      <div className="fv-preview-head">
        <h3>Live Vorschau</h3>
        <div className="fv-view-toggle" role="tablist" aria-label="Ansicht">
          {[
            { id: 'inside', label: 'Innen' },
            { id: 'outside', label: 'Außen' }
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              className={activeSurface === view.id ? 'active' : ''}
              aria-selected={activeSurface === view.id}
              onClick={() => handlePreviewSurfaceChange(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fv-preview-canvas detail-studio-preview-canvas">
        {useShapePreview ? (
          <StudioShapePreview
            key={previewKey}
            windowConfig={window}
            globalConfig={globalConfig}
            colorSurface={activeSurface}
            neutralOnly={neutralShapePreview}
            detailStepId={detailStepId}
            subStep={subStep}
          />
        ) : useDynamic ? (
          previewMode === '3d' ? (
            <Window3DPreview
              key={previewKey}
              windowConfig={previewWindow}
              globalConfig={globalConfig}
              colorSurface={activeSurface}
              showHandle={showHandle}
              embedded
            />
          ) : (
            <WindowPreview
              key={previewKey}
              windowConfig={previewWindow}
              globalConfig={globalConfig}
              colorSurface={activeSurface}
              showHandle={showHandle}
              embedded
            />
          )
        ) : (
          <CatalogImagePreview key={previewKey} src={resolvedPreviewImage} dims={dims} mode={previewMode} />
        )}
        {(useDynamic || useShapePreview) && (
          <>
            <span className="detail-studio-dim detail-studio-dim-h">H {dims.h} mm</span>
            <span className="detail-studio-dim detail-studio-dim-w">B {dims.w} mm</span>
          </>
        )}
        <div className="fv-preview-tools" aria-label="Vorschau Steuerung">
          <button
            type="button"
            title={activeSurface === 'inside' ? 'Außenansicht anzeigen' : 'Innenansicht anzeigen'}
            onClick={() => handlePreviewSurfaceChange(activeSurface === 'inside' ? 'outside' : 'inside')}
          >
            <ReloadOutlined aria-hidden />
          </button>
          <button type="button" title="Verkleinern" disabled>
            <MinusOutlined aria-hidden />
          </button>
          <button type="button" title="Vergroessern" disabled>
            <PlusOutlined aria-hidden />
          </button>
          <button type="button" title="Vollbild" disabled>
            <FullscreenOutlined aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

const CONFIGURATOR_STEP_COUNT = 7;

function DetailsCard({ rows, unitPrice, currentStepIndex }) {
  const currentStepNumber = Math.min(CONFIGURATOR_STEP_COUNT, Math.max(1, currentStepIndex + 1));
  const progressPercent = (currentStepNumber / CONFIGURATOR_STEP_COUNT) * 100;
  const formattedPrice = `${Number(unitPrice).toLocaleString('de-DE')} €`;

  return (
    <div className="fv-details-card">
      <h3>Details (aktuell)</h3>
      <ul className="fv-details-list">
        {rows.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <span className={row.pending ? 'pending' : ''}>{row.value}</span>
          </li>
        ))}
      </ul>
      <div className="fv-price-card">
        <span className="fv-price-card__label">Geschätzte Gesamtkosten</span>
        <strong className="fv-price-card__amount">{formattedPrice}</strong>
        <div className="fv-price-card__track" aria-hidden="true">
          <span className="fv-price-card__fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="fv-price-card__step">
          Schritt {currentStepNumber} von {CONFIGURATOR_STEP_COUNT}
        </span>
      </div>
    </div>
  );
}


export default function DetailConfiguratorStudio({
  state,
  setState,
  detailStep,
  detailSteps,
  activeWindowIndex,
  setActiveWindowIndex,
  previewMode,
  setPreviewMode,
  previewSurface = 'outside',
  setPreviewSurface,
  stepPart,
  stepPartTotal,
  stepKicker,
  children,
  canContinue,
  continueLabel,
  onBack,
  onContinue,
  onStepChange,
  onExitToIntro,
  submitStatus,
  colorSurface = 'outside',
  onColorSurfaceChange,
  detailStepId,
  subStep = 0
}) {
  const g = state.globalConfig;
  const activeWindow = state.windows[activeWindowIndex] || state.windows[0];
  const dims = { w: formatMm(activeWindow?.width, 1200), h: formatMm(activeWindow?.height, 1400) };
  const windowTypeLabel = WINDOW_TYPES.find((t) => t.id === activeWindow?.windowType)?.label || activeWindow?.windowType;
  const openingLabel = OPENING_TYPES.find((t) => t.id === activeWindow?.openingType)?.label || activeWindow?.openingType;
  const lightLabel = optionLabel(LIGHT_OPTIONS, activeWindow?.lightOption);
  const profileLabel = optionLabel(PROFILE_SYSTEMS, g.profileSystem);
  const systemLabel = getAvailableSystems(g.material).find((s) => s.id === g.manufacturer)?.label;
  const hasSystem = materialHasSystem(g.material);
  const isWoodMaterial = g.material === 'Holz' || g.material === 'Holz-Aluminium';
  const woodSpeciesLabel = HOLZ_ARTEN.find((s) => s.id === g.woodSpecies)?.label;
  const outsideDecor = findDecorByIdForSurface(g.frameColorOutside, g.material, 'outside');
  const insideDecor = findDecorByIdForSurface(g.frameColorInside, g.material, 'inside');
  const outsideColorLabel = outsideDecor?.label || optionLabel(FRAME_COLORS, g.frameColorOutside);
  const insideColorLabel = insideDecor?.label || optionLabel(FRAME_COLORS, g.frameColorInside);
  const colorLabel =
    g.frameColorOutside === g.frameColorInside
      ? `${outsideColorLabel} innen und außen`
      : `${outsideColorLabel} außen, ${insideColorLabel} innen`;
  const extrasLabel = [
    activeWindow?.handle,
    activeWindow?.fitting,
    activeWindow?.hasGrille ? 'Sprossen' : null,
    activeWindow?.preDrilledHoles ? 'Bohrungen vorgebohrt' : null
  ]
    .filter(Boolean)
    .join(', ');

  const projectPrice = computeTotal(state);

  const beforeShapeStep = isBeforeShapeStep(detailStepId);
  const buildSubStep = detailStepId === 'build' ? subStep : 99;
  const notChosenYet = 'Noch nicht gewählt';

  const detailRows = [
    { label: 'Material', value: g.material || '—', pending: !g.material },
    ...(hasSystem ? [{ label: 'System', value: systemLabel || '—', pending: !g.manufacturer }] : []),
    { label: 'Profil', value: profileLabel || '—', pending: !g.profileSystem },
    ...(isWoodMaterial
      ? [{ label: 'Holzart', value: woodSpeciesLabel || '—', pending: !g.woodSpecies }]
      : []),
    { label: 'Farbe', value: colorLabel || '—', pending: !g.frameColorOutside || !g.frameColorInside },
    {
      label: 'Fenstertyp',
      value: beforeShapeStep ? notChosenYet : windowTypeLabel || '—',
      pending: beforeShapeStep || !activeWindow?.windowType
    },
    {
      label: 'Ober-/Unterlicht',
      value: beforeShapeStep || buildSubStep < 1 ? notChosenYet : lightLabel || '—',
      pending: beforeShapeStep || buildSubStep < 1 || !activeWindow?.lightOption
    },
    {
      label: 'Oeffnung',
      value: beforeShapeStep || buildSubStep < 2 ? notChosenYet : openingLabel || '—',
      pending: beforeShapeStep || buildSubStep < 2 || !activeWindow?.openingType
    },
    {
      label: 'Ma�e',
      value: beforeShapeStep || buildSubStep < 3 ? notChosenYet : activeWindow ? `${dims.w} × ${dims.h} mm` : '—',
      pending: beforeShapeStep || buildSubStep < 3 || !activeWindow?.width
    },
    {
      label: 'Verglasung',
      value: detailStepId === 'glass' || detailStepId === 'security' || detailStepId === 'customer'
        ? activeWindow?.glassType || '—'
        : notChosenYet,
      pending: detailStepId !== 'glass' && detailStepId !== 'security' && detailStepId !== 'customer'
    },
    {
      label: 'Griffe',
      value: detailStepId === 'security' || detailStepId === 'customer' ? activeWindow?.handle || '—' : notChosenYet,
      pending: detailStepId !== 'security' && detailStepId !== 'customer'
    },
    {
      label: 'Extras',
      value: detailStepId === 'security' || detailStepId === 'customer' ? extrasLabel || '—' : notChosenYet,
      pending: detailStepId !== 'security' && detailStepId !== 'customer'
    }
  ];

  const isWindow = state.productType === 'window';
  const isInquiryStep = detailStepId === 'customer';
  const showStudioChrome = !isInquiryStep || isWindow;
  const productMeta = PRODUCT_TYPES.find((p) => p.id === state.productType);
  const productLabel = productMeta?.label || 'Produkt';
  const productRailMeta = PRODUCT_RAIL_META[state.productType];
  const itemCount = Math.max(1, state.quantity || 1);
  const itemLabel = isWindow ? 'Fenster' : productRailMeta?.itemLabel || productLabel;
  const activeWindowLabel = isWindow
    ? getWindowDisplayName(state.windows[activeWindowIndex], activeWindowIndex)
    : `${itemLabel} ${activeWindowIndex + 1}`;
  const headTitle = isInquiryStep
    ? 'Anfrage abschliessen'
    : isWindow
      ? `${activeWindowLabel} — ${activeWindowIndex + 1} von ${itemCount}`
      : `${activeWindowLabel} von ${itemCount}`;
  const headLead = isInquiryStep
    ? 'Fast geschafft — bitte geben Sie Ihre Kontaktdaten fuer das unverbindliche Angebot ein.'
    : isWindow
      ? 'Konfigurieren Sie das Fenster Schritt fuer Schritt.'
      : `Konfigurieren Sie ${productLabel === 'Haustuer' ? 'die' : 'den'} ${productLabel} Schritt fuer Schritt.`;

  const productDetailRows = !isWindow ? getProductDetailRows(state) : [];
  const productPrice = !isWindow ? estimateProductPrice(state) : 0;
  const previewRows = isWindow ? detailRows : productDetailRows;
  const previewPrice = isWindow ? projectPrice : productPrice;
  const productStepperIndex = detailStepId === 'customer' ? 1 : 0;
  const isMobileViewport = useMediaQuery('(max-width: 768px)');
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [nameModalIndex, setNameModalIndex] = useState(null);
  const nameModalOpen = nameModalIndex !== null;
  const nameModalWindow =
    nameModalIndex !== null ? state.windows[nameModalIndex] : null;
  const stepperActiveIndex = getStepperDisplayIndex(detailStepId, subStep);
  const activeStepperStep = STEPPER_STEPS[stepperActiveIndex] ?? STEPPER_STEPS[0];

  function handleQuantityConfirm(value) {
    const nextCount = clampQuantity(value);
    setState((prev) => applyQuantity(prev, nextCount));
    setActiveWindowIndex((idx) => Math.min(idx, Math.max(0, nextCount - 1)));
  }

  function handleEnsureWindowSlot(index) {
    setState((prev) => ensureWindowAtIndex(prev, index));
    setActiveWindowIndex(index);
  }

  function handleDeleteWindow(index) {
    setState((prev) => removeWindowAtIndex(prev, index));
    setActiveWindowIndex((idx) => {
      if (index < idx) {
        return idx - 1;
      }
      if (index === idx) {
        return Math.max(0, idx - 1);
      }
      return idx;
    });
  }

  const canDeleteWindow =
    isWindow && clampQuantity(state.quantity ?? state.windows.length) > 1;

  function handleNameConfirm(name) {
    if (nameModalIndex === null) return;
    setState((prev) => renameWindowAtIndex(prev, nameModalIndex, name));
  }

  function handleStepperSelect(displayIndex) {
    const jump = STEPPER_JUMP[displayIndex];
    if (!jump) return;
    const stepIndex = detailSteps.findIndex((s) => s.id === jump.stepId);
    if (stepIndex < 0) return;
    onStepChange(stepIndex, jump.subStep);
  }

  const previewKey = [
    activeWindow?.id,
    detailStepId,
    subStep,
    colorSurface,
    previewSurface,
    activeWindow?.windowType,
    activeWindow?.openingType,
    activeWindow?.openingDirection,
    activeWindow?.width,
    activeWindow?.height,
    activeWindow?.glassType,
    activeWindow?.handle,
    activeWindow?.fitting,
    activeWindow?.lightOption,
    activeWindow?.hasGrille,
    g.material,
    g.profileSystem,
    g.frameColorOutside,
    g.frameColorInside,
    g.woodSpecies,
    previewMode
  ].join('|');

  return (
    <>
    <div
      className={`detail-studio fv-studio ${
        isInquiryStep ? 'inquiry-mode' : ''
      } ${isInquiryStep && isWindow ? 'inquiry-window-mode' : ''}`}
    >
      <div className="fv-studio-grid">
        {showStudioChrome && isWindow && (
          <WindowRail
            windows={state.windows}
            slotCount={state.quantity}
            activeIndex={activeWindowIndex}
            material={g.material}
            onSelect={setActiveWindowIndex}
            onEnsureSlot={handleEnsureWindowSlot}
            onExit={onExitToIntro}
            onEditQuantity={() => setQuantityModalOpen(true)}
            onEditName={setNameModalIndex}
            onDeleteWindow={handleDeleteWindow}
            canDeleteWindow={canDeleteWindow}
          />
        )}
        {showStudioChrome && !isWindow && (
          <ProductRail
            state={state}
            activeIndex={activeWindowIndex}
            onSelect={setActiveWindowIndex}
            onExit={onExitToIntro}
            onEditQuantity={() => setQuantityModalOpen(true)}
          />
        )}

        <main className="fv-main">
          <header className="fv-main-head">
            <h1>{headTitle}</h1>
            <p>{headLead}</p>
          </header>

          {!isWindow && !isInquiryStep && isMobileViewport ? (
            <>
              <p className="fv-step-mobile-kicker">Schritt {PRODUCT_STEPS[productStepperIndex].num}</p>
              <div className="fv-step-mobile-badge" aria-current="step">
                <span className="fv-step-mobile-num" aria-hidden="true">
                  {PRODUCT_STEPS[productStepperIndex].num}
                </span>
                <span className="fv-step-mobile-title">{PRODUCT_STEPS[productStepperIndex].title}</span>
              </div>
            </>
          ) : null}
          {!isWindow && !isInquiryStep && !isMobileViewport ? (
            <ConfigStepper
              steps={PRODUCT_STEPS}
              activeIndex={productStepperIndex}
              onSelect={(index) => {
                const stepIndex = detailSteps.findIndex((s) =>
                  index === 0 ? s.id === 'product-config' : s.id === 'customer'
                );
                if (stepIndex >= 0) onStepChange(stepIndex, 0);
              }}
              getKey={(item) => item.num}
              getNum={(item) => item.num}
              getLabel={(item) => item.title}
            />
          ) : null}

          {isWindow && !isInquiryStep && isMobileViewport ? (
            <>
              <p className="fv-step-mobile-kicker">Schritt {activeStepperStep.num}</p>
              <div className="fv-step-mobile-badge" aria-current="step">
                <span className="fv-step-mobile-num" aria-hidden="true">
                  {activeStepperStep.num}
                </span>
                <span className="fv-step-mobile-title">{activeStepperStep.title}</span>
              </div>
            </>
          ) : null}
          {isWindow && !isInquiryStep && !isMobileViewport ? (
            <ConfigStepper
              steps={STEPPER_STEPS}
              activeIndex={stepperActiveIndex}
              onSelect={handleStepperSelect}
              getKey={(item) => item.num}
              getNum={(item) => item.num}
              getLabel={(item) => item.title}
            />
          ) : null}

          <div className="fv-step-body studio-embedded">
            {!isInquiryStep && stepPartTotal > 1 && (
              <p className="detail-studio-kicker fv-step-part-hint">
                {stepKicker}
                <span className="fv-step-part-sep" aria-hidden="true">
                  {' '}
                  ·{' '}
                </span>
                Teil {stepPart} von {stepPartTotal}
              </p>
            )}
            <div className="fv-config-card">{children}</div>
            {submitStatus?.error && <p className="error">{submitStatus.error}</p>}
            {submitStatus?.success && (
              <p className="wizard-callout">Vielen Dank! Ihre Anfrage wurde erfolgreich uebermittelt.</p>
            )}
          </div>

          <footer className="fv-step-foot">
            <Button onClick={onBack} disabled={submitStatus?.loading}>
              Zurueck
            </Button>
            <Button
              type="primary"
              onClick={onContinue}
              disabled={!canContinue || submitStatus?.loading || submitStatus?.success}
              loading={submitStatus?.loading}
            >
              {continueLabel}
            </Button>
          </footer>
        </main>

        {showStudioChrome && (
          <aside className="fv-preview-col" aria-label="Live Vorschau">
            <div className="fv-preview-bundle">
              {isWindow ? (
                <PreviewCard
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  previewSurface={previewSurface}
                  setPreviewSurface={setPreviewSurface}
                  colorSurface={colorSurface}
                  onPreviewSurfaceChange={onColorSurfaceChange}
                  previewKey={previewKey}
                  window={activeWindow}
                  globalConfig={g}
                  dims={dims}
                  detailStepId={detailStepId}
                  subStep={subStep}
                />
              ) : (
                <ProductPreviewCard state={state} />
              )}
              <DetailsCard
                rows={previewRows}
                unitPrice={previewPrice}
                currentStepIndex={isWindow ? stepperActiveIndex : productStepperIndex}
              />
            </div>
          </aside>
        )}
      </div>
    </div>

    <WindowQuantityModal
      open={quantityModalOpen}
      onClose={() => setQuantityModalOpen(false)}
      quantity={state.quantity}
      productType={state.productType}
      itemLabel={itemLabel}
      onConfirm={handleQuantityConfirm}
    />
    <WindowNameModal
      open={nameModalOpen}
      onClose={() => setNameModalIndex(null)}
      index={nameModalIndex ?? 0}
      currentName={nameModalWindow?.name ?? ''}
      onConfirm={handleNameConfirm}
    />
    </>
  );
}

