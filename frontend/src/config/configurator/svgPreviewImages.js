import { WINDOW_DEFAULT_PREVIEW } from '@/config/configurator/configuratorImages';
import { resolvePreviewColorId } from '@/config/configurator/decorColors';

const svgModules = import.meta.glob('../../assets/svgs/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
});

/** Neutral front-view window used during material/profile selection. */
export const DEFAULT_WINDOW_PREVIEW = WINDOW_DEFAULT_PREVIEW;

const DECOR_ASSET_STEMS = {
  Weiss: 'Weiss',
  'Reinweiss strukturell': 'Reinweiss strukturell +25pct',
  'Cremeweiss strukturell': 'Cremeweiss strukturell +25pct',
  'Golden Oak': 'Golden Oak +25pct',
  Nussbaum: 'Nussbaum +25pct',
  Anthrazit: 'Anthrazit aehnlich RAL 7016 +25pct',
  Mahagoni: 'Sonderfarben Mahagoni +35pct',
  Grau: 'Sonderfarben Grau aehnlich RAL 7001 +35pct',
  Basaltgrau: 'Sonderfarben Basaltgrau aehnlich RAL 7012 +35pct',
  'Eisenglimmer DB 703': 'Sonderfarben Eisenglimmer DB 703 +35pct',
  Mooreiche: 'Sonderfarben Mooreiche +35pct',
  'Braun dekor': 'Sonderfarben Braun dekor +35pct',
  'aludec Fenstergrau': 'aludec Fenstergrau +35pct',
  'aludec Umbragrau': 'aludec Umbragrau +35pct',
  'aludec Basaltgrau': 'aludec Basaltgrau +35pct',
  'aludec Anthrazitgrau': 'aludec Anthrazitgrau +35pct',
  'aludec DB703': 'aludec DB703 +35pct',
  'aludec Jet Black': 'aludec Jet Black +35pct',
  'woodec Turner Oak Malt': 'woodec Turner Oak Malt +35pct',
  'woodec Sheffield Oak Alpine': 'woodec Sheffield Oak Alpine +35pct',
  'woodec Sheffield Oak Concrete': 'woodec Sheffield Oak Concrete +35pct',
  'woodec Turner Oak Toffee': 'woodec Turner Oak Toffee +35pct'
};

/** The single-sash (Einteilig) assets use different, English-ish file stems. */
const ONE_PANE_DECOR_STEMS = {
  Weiss: 'White Structural',
  'Reinweiss strukturell': 'Pure White Structural',
  'Cremeweiss strukturell': 'Creamy White Textured',
  'Golden Oak': 'Golden Oak',
  Nussbaum: 'Walnut',
  Anthrazit: 'Anthracite Similar to RAL 7016',
  Mahagoni: 'Mahagoni Special Colors',
  Grau: 'Grau Aehnlich RAL 7001 Special Colors',
  'Eisenglimmer DB 703': 'Eisenglimmer DB 703 Special Colors',
  Mooreiche: 'Mooreiche Special Colors',
  'Braun dekor': 'Braun dekor Special Colors',
  'aludec Fenstergrau': 'Aludec Fenstergrau',
  'aludec Umbragrau': 'Aludec Umbragrau',
  'aludec Basaltgrau': 'Aludec Basaltgrau',
  'aludec Anthrazitgrau': 'Aludec Anthrazitgrau',
  'aludec DB703': 'Aludec DB703',
  'aludec Jet Black': 'Aludec Jet Black',
  'woodec Turner Oak Malt': 'Woodec Turner Oak Malt',
  'woodec Sheffield Oak Alpine': 'Woodec Sheffield Oak Alpine',
  'woodec Turner Oak Toffee': 'Woodec Turner Oak Toffee'
};

const ONE_PANE_FOLDER = 'Einteilig';

const TWO_PANE_FOLDERS = {
  standard: 'Zweiteilig',
  topLight: 'Zweiteilig-mit Oberlicht',
  splitTopLight: 'Zweiteilig-mit Oberlicht, geteilt',
  openingFixedTilt: 'Zweiteilig-\u00d6ffnungsart',
  openingTiltFixed: 'Zweiteilig-\u00d6ffnungsart-second window',
  openingTiltTilt: 'Zweiteilig-\u00d6ffnungsart-third'
};

const TWO_PANE_OPENING_FOLDERS = {
  'F-DKR': TWO_PANE_FOLDERS.openingFixedTilt,
  'DKL-F': TWO_PANE_FOLDERS.openingTiltFixed,
  'DKL-DKR': TWO_PANE_FOLDERS.openingTiltTilt
};

function svgAsset(folder, filename) {
  return svgModules[`../../assets/svgs/${folder}/${filename}`] || null;
}

function decorStem(colorId) {
  return DECOR_ASSET_STEMS[colorId] || null;
}

function twoPaneFolder(windowConfig, options = {}) {
  const lightOption = windowConfig?.lightOption || '';
  const shouldUseOpening =
    options.useOpeningFolder ||
    (options.detailStepId === 'build' && options.subStep === 2) ||
    (options.detailStepId === 'colors' && TWO_PANE_OPENING_FOLDERS[windowConfig?.openingType]);

  if (shouldUseOpening && !lightOption.includes('Oberlicht')) {
    return TWO_PANE_OPENING_FOLDERS[windowConfig?.openingType] || TWO_PANE_FOLDERS.standard;
  }

  if (lightOption.includes('Oberlicht') && lightOption.includes('geteilt')) {
    return TWO_PANE_FOLDERS.splitTopLight;
  }

  if (lightOption.includes('Oberlicht')) {
    return TWO_PANE_FOLDERS.topLight;
  }

  return TWO_PANE_FOLDERS.standard;
}

function twoPaneStructuralFolder(windowConfig) {
  return twoPaneFolder(windowConfig, {});
}

function isTwoPaneWindow(windowType) {
  return typeof windowType === 'string' && windowType.includes('Zweiteilig');
}

function isPlainOnePaneWindow(windowConfig) {
  if (windowConfig?.windowType !== 'Einteilig') return false;
  const lightOption = windowConfig?.lightOption || '';
  return !(
    lightOption.includes('Oberlicht') ||
    lightOption.includes('Unterlicht') ||
    lightOption.includes('Seitenteil')
  );
}

function surfaceColorId(globalConfig, surface) {
  return resolvePreviewColorId(globalConfig, surface === 'inside' ? 'inside' : 'outside');
}

function resolveTwoPanePreview(windowConfig, globalConfig, options) {
  const surface = options.colorSurface === 'inside' ? 'inside' : 'outside';
  const stem = decorStem(surfaceColorId(globalConfig, surface) || 'Weiss');
  if (!stem) return null;

  const filename = surface === 'inside' ? `${stem}.svg` : `${stem} (1).svg`;
  const folder = twoPaneFolder(windowConfig, options);
  return svgAsset(folder, filename) || svgAsset(twoPaneStructuralFolder(windowConfig), filename);
}

function resolveOnePanePreview(windowConfig, globalConfig, options) {
  // The opening sub-step should fall back to the procedural arrows preview.
  if (options.detailStepId === 'build' && options.subStep === 2) return null;

  const surface = options.colorSurface === 'inside' ? 'inside' : 'outside';
  const stem = ONE_PANE_DECOR_STEMS[surfaceColorId(globalConfig, surface) || 'Weiss'];
  if (!stem) return null;

  const filename = surface === 'inside' ? `${stem}.svg` : `${stem} (1).svg`;
  return svgAsset(ONE_PANE_FOLDER, filename) || svgAsset(ONE_PANE_FOLDER, `${stem}.svg`);
}

export function resolveWindowSvgPreview(windowConfig, globalConfig, options = {}) {
  if (options.detailStepId === 'build' && options.subStep === 3) return null;
  // Fenstertyp cards: always use generated icons (thin Einteilig-style), not photo SVG assets.
  if (options.detailStepId === 'build' && options.subStep === 0) return null;
  // Material/profile selection shows the neutral base window, not a colour asset.
  if (options.detailStepId === 'profile') return null;

  if (isTwoPaneWindow(windowConfig?.windowType)) {
    return resolveTwoPanePreview(windowConfig, globalConfig, options);
  }

  if (isPlainOnePaneWindow(windowConfig)) {
    return resolveOnePanePreview(windowConfig, globalConfig, options);
  }

  return null;
}
