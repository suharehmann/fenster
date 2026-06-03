/**
 * Decides whether the current configuration has a dedicated SVG asset or must
 * be drawn with the generated CSS preview.
 *
 * Only two real SVGs exist for now. Every other combination is generated, so we
 * never ship (or break on) missing image files. To add a real SVG later, drop
 * the file into public/assets/window-preview/svg/ and add its key below.
 */

const SVG_BASE = '/assets/window-preview/svg';

// key = `${material}|${innerColor}|${windowType}|${lightOption}|${openingType}`
const REAL_SVGS = {
  'kunststoff|weiss|einteilig|ohne_ober_unterlicht|fest': `${SVG_BASE}/kunststoff-weiss-einteilig-ohne-oberlicht-fest.svg`,
  'kunststoff|mahagoni|zweiteilig|ohne_ober_unterlicht|l_fest_r_fest': `${SVG_BASE}/kunststoff-mahagoni-zweiteilig-ohne-oberlicht-fest.svg`
};

export function getPreviewType(config) {
  const key = [config.material, config.innerColor, config.windowType, config.lightOption, config.openingType].join('|');
  const src = REAL_SVGS[key];
  return src ? { type: 'svg', src, key } : { type: 'generated', key };
}
