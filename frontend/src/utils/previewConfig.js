import {
  findDecorById,
  findDecorByIdForSurface,
  resolvePreviewColorId
} from '@/config/configurator/decorColors';
import {
  FRAME_COLORS,
  FRAME_EXTENSION,
  OPENING_TYPES,
  WINDOW_TYPES,
  openingTypePreview,
  typeDefaultOpening
} from './defaults';
import {
  DECOR_PREVIEW_IMAGES,
  MATERIAL_IMAGES,
  PRODUCT_IMAGES,
  WINDOW_TYPE_IMAGES
} from '@/config/configurator/configuratorImages';
import { DEFAULT_WINDOW_PREVIEW, resolveWindowSvgPreview } from '@/config/configurator/svgPreviewImages';
import { decorFrameBackground } from '@/utils/previewFrameStyle';

const MATERIAL_IMAGE_MANIFEST = MATERIAL_IMAGES;
const PRODUCT_IMAGE_MANIFEST = PRODUCT_IMAGES;
const WINDOW_TYPE_IMAGE_MANIFEST = WINDOW_TYPE_IMAGES;

const LEGACY_FRAME_COLOR_HEX = {
  Cremeweiss: '#faf6eb',
  Anthrazitgrau: '#3d4450',
  'Anthrazit matt': '#374151',
  Winchester: '#8b5a2b',
  'Eiche Dunkel': '#3f3228',
  Quarzgrau: '#6b7280',
  Betongrau: '#78716c',
  'Schwarz matt': '#171717',
  'Alux DB703': '#52525b',
  Silbergrau: '#94a3b8'
};

export function colorToHex(colorName, material, surface) {
  if (!colorName) return '#f8fafc';
  const match =
    (material && surface
      ? findDecorByIdForSurface(colorName, material, surface)
      : null) ||
    findDecorById(colorName) ||
    FRAME_COLORS.find((entry) => entry.id === colorName || entry.label === colorName);
  if (match?.color) return match.color;
  if (LEGACY_FRAME_COLOR_HEX[colorName]) return LEGACY_FRAME_COLOR_HEX[colorName];
  return '#f8fafc';
}

/** Resolved colour for one preview surface (material-aware). */
export function resolvePreviewColor(globalConfig, surface) {
  const material = globalConfig?.material || 'Kunststoff';
  const colorId = resolvePreviewColorId(globalConfig, surface);
  const decor = findDecorByIdForSurface(colorId, material, surface);
  const hex = decor?.color || colorToHex(colorId, material, surface);
  return { colorId, hex, decor };
}

/** CSS background for the frame (matches selected decor swatch). */
export function resolvePreviewFrameFill(globalConfig, surface) {
  const { colorId, hex, decor } = resolvePreviewColor(globalConfig, surface);
  return {
    colorId,
    hex,
    decor,
    background: decorFrameBackground(colorId, hex)
  };
}

export function resolveFrameColors(globalConfig) {
  const material = globalConfig?.material || 'Kunststoff';
  const exteriorName = resolvePreviewColorId(globalConfig, 'outside');
  const interiorName = resolvePreviewColorId(globalConfig, 'inside');
  return {
    exteriorName,
    interiorName,
    exterior: colorToHex(exteriorName, material, 'outside'),
    interior: colorToHex(interiorName, material, 'inside')
  };
}

export function glassPaneFill(glassType) {
  if (!glassType) return '#e8f4fc';
  if (glassType.includes('3-fach')) return '#cfe8f8';
  if (glassType.includes('Ug 0.6') || glassType.includes('Ug 0.7')) return '#d4ebf7';
  return '#e8f4fc';
}

function findOptionImage(options, id) {
  if (!id || !options?.length) return null;
  return options.find((entry) => entry.id === id)?.image || null;
}

function windowTypeMeta(windowType) {
  return WINDOW_TYPES.find((type) => type.id === windowType) || WINDOW_TYPES[0];
}

function resolveWindowTypeCatalogImage(windowType) {
  if (windowType && WINDOW_TYPE_IMAGE_MANIFEST[windowType]) {
    return WINDOW_TYPE_IMAGE_MANIFEST[windowType];
  }
  return windowTypeMeta(windowType)?.image || null;
}

function resolveMaterialCatalogImage(material) {
  if (material && MATERIAL_IMAGE_MANIFEST[material]) {
    return MATERIAL_IMAGE_MANIFEST[material];
  }
  return null;
}

/** Photo preview for specific decor colours (e.g. Weiß) on the Farben step. */
export function resolveDecorCatalogPreview(globalConfig, surface) {
  const colorId = resolvePreviewColorId(globalConfig, surface);
  return DECOR_PREVIEW_IMAGES[colorId] || null;
}

function resolveOpeningImage(windowConfig) {
  const openingId = windowConfig?.openingType;
  if (!openingId) return null;
  const fromCatalog = findOptionImage(OPENING_TYPES, openingId);
  if (fromCatalog) return fromCatalog;
  const type = windowTypeMeta(windowConfig?.windowType);
  return openingTypePreview(openingId, type.panes, type.shape);
}

/**
 * SVG/canvas preview applies frame colors, size, handles, and full composition.
 * Catalog photos are only used on early steps (material, type, opening pick).
 */
export function shouldPreferDynamicPreview(detailStepId, subStep) {
  if (detailStepId === 'profile') return false;
  if (detailStepId === 'colors') return true;
  if (detailStepId === 'build') return true;
  if (detailStepId === 'customer') return true;
  if (detailStepId === 'glass' || detailStepId === 'security') return true;
  return false;
}

/**
 * Live preview on Fensteraufbau only reflects choices made so far
 * (Typ → no Oberlicht/Seitenteile from a later sub-step yet).
 */
export function resolveStudioPreviewWindow(windowConfig, options = {}) {
  const { detailStepId, subStep = 0 } = options;
  if (detailStepId !== 'build' || !windowConfig) return windowConfig;

  const typeId = windowConfig.windowType || 'Einteilig';
  const typeMeta = WINDOW_TYPES.find((t) => t.id === typeId) || WINDOW_TYPES[0];
  const defaultOpening = typeDefaultOpening(typeId, typeMeta.panes || 1);

  if (subStep <= 0) {
    return {
      ...windowConfig,
      lightOption: 'Ohne Ober-/Unterlicht',
      openingType: defaultOpening
    };
  }
  if (subStep === 1) {
    return {
      ...windowConfig,
      openingType: defaultOpening
    };
  }
  return windowConfig;
}

/** Merge per-window options with global profile/colors for live preview. */
export function buildPreviewWindow(windowConfig, globalConfig) {
  if (!windowConfig) return null;
  const { exteriorName, interiorName } = resolveFrameColors(globalConfig);

  return {
    ...windowConfig,
    frameColorOutside: exteriorName,
    frameColorInside: interiorName,
    profileSystem: globalConfig?.profileSystem,
    material: globalConfig?.material,
    manufacturer: globalConfig?.manufacturer
  };
}

/** Catalog image only for steps before colors / without live styling. */
export function resolvePreviewImage(windowConfig, globalConfig, options = {}) {
  const { detailStepId, subStep = 0, preferMaterial } = options;
  const material = globalConfig?.material;
  const win = windowConfig;

  if (preferMaterial || detailStepId === 'profile') {
    return DEFAULT_WINDOW_PREVIEW || resolveMaterialCatalogImage(material) || PRODUCT_IMAGE_MANIFEST.window || null;
  }

  if (shouldPreferDynamicPreview(detailStepId, subStep)) {
    return null;
  }

  if (detailStepId === 'build') {
    if (subStep === 0) return resolveWindowTypeCatalogImage(win?.windowType);
    if (subStep === 2) return resolveOpeningImage(win);
    if (subStep === 1) return resolveWindowTypeCatalogImage(win?.windowType);
  }

  if (detailStepId === 'security' && subStep === 3) {
    return findOptionImage(FRAME_EXTENSION, win?.frameExtensionKind);
  }

  const typeImage = resolveWindowTypeCatalogImage(win?.windowType);
  if (typeImage) return typeImage;

  return resolveMaterialCatalogImage(material) || PRODUCT_IMAGE_MANIFEST.window || null;
}

export function resolveConfiguredSvgPreview(windowConfig, globalConfig, options = {}) {
  return resolveWindowSvgPreview(windowConfig, globalConfig, options);
}
