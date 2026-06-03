import './StudioShapePreview.scss';
import { WINDOW_TYPES, typeDefaultOpening } from '@/utils/defaults';
import { resolvePreviewFrameFill, resolveStudioPreviewWindow } from '@/utils/previewConfig';
import { buildConfiguratorShapePreview } from '@/utils/windowShapePreview';

/** Neutral placeholder until the user reaches Fensteraufbau (Typ / Öffnung / Maße). */
const COLOR_STEP_SHAPE = {
  windowType: 'Einteilig',
  lightOption: 'Ohne Ober-/Unterlicht',
  openingType: 'F'
};

/**
 * Farben + Fensteraufbau live preview: CSS shapes with selected colour.
 * Build sub-steps only show layout options chosen up to the current step.
 */
export default function StudioShapePreview({
  windowConfig,
  globalConfig,
  colorSurface = 'outside',
  neutralOnly = false,
  detailStepId,
  subStep = 0
}) {
  const rawWin = neutralOnly ? COLOR_STEP_SHAPE : windowConfig || {};
  const win = neutralOnly
    ? rawWin
    : resolveStudioPreviewWindow(rawWin, { detailStepId, subStep });
  const typeMeta = WINDOW_TYPES.find((t) => t.id === win.windowType) || WINDOW_TYPES[0];
  const panes = typeMeta.panes || 1;
  const onOpeningSubStep = detailStepId === 'build' && subStep === 2;
  const openingForPreview = onOpeningSubStep
    ? win.openingType || typeDefaultOpening(typeMeta.id, panes)
    : 'F';
  const previewMode =
    detailStepId === 'build' && subStep === 2
      ? 'opening'
      : detailStepId === 'build' && subStep === 1
        ? 'light'
        : 'type';

  const { background: frameBg } = resolvePreviewFrameFill(globalConfig, colorSurface);

  const frameClass = [
    'gw-frame',
    'gw-frame--flat',
    typeMeta.layout === 'tall' || typeMeta.shape === 'tall' ? 'gw-frame--tall' : '',
    typeMeta.shape === 'arch' ? 'gw-frame--arch' : '',
    typeMeta.shape === 'arch-soft' ? 'gw-frame--arch-soft' : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (neutralOnly) {
    return (
      <div className="gw studio-shape-preview studio-shape-preview--flat">
        <div className={frameClass} style={{ background: frameBg }}>
          <div className="gw-glass gw-glass--flat" />
        </div>
      </div>
    );
  }

  const useDimensionAspect =
    (detailStepId === 'build' && subStep >= 3) ||
    detailStepId === 'glass' ||
    detailStepId === 'security' ||
    detailStepId === 'customer';

  const widthMm = Number(win?.width);
  const heightMm = Number(win?.height);
  const hasDimensions =
    useDimensionAspect && Number.isFinite(widthMm) && Number.isFinite(heightMm) && widthMm > 0 && heightMm > 0;

  const svgUrl = buildConfiguratorShapePreview(globalConfig, win, {
    panes: typeMeta.panes,
    shape: typeMeta.shape,
    layout: typeMeta.layout,
    divider: typeMeta.divider,
    fixedOnly: onOpeningSubStep ? false : typeMeta.fixedOnly,
    openingType: openingForPreview,
    openingDirection: onOpeningSubStep ? win.openingDirection : null,
    mode: previewMode,
    colorSurface,
    transparentChrome: true,
    useDimensionAspect
  });

  return (
    <div className="gw studio-shape-preview studio-shape-preview--flat studio-shape-preview--svg studio-shape-preview--fill">
      <img
        className="studio-shape-preview__img"
        src={svgUrl}
        alt=""
        style={hasDimensions ? { aspectRatio: `${widthMm} / ${heightMm}` } : undefined}
      />
    </div>
  );
}
