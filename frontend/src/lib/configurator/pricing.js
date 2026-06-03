import {
  FRAME_COLORS,
  HOLZ_ARTEN,
  PROFILE_SYSTEMS,
  getAvailableSystems,
  getMaterialBasePrice
} from '@/utils/defaults';

const REFERENCE_AREA = 1200 * 1400;

function colorPricePct(colorId) {
  if (!colorId) return 0;
  const match = FRAME_COLORS.find((entry) => entry.id === colorId);
  return match?.pricePct || 0;
}

function woodSpeciesPct(speciesId) {
  if (!speciesId) return 0;
  return HOLZ_ARTEN.find((entry) => entry.id === speciesId)?.pricePct || 0;
}

function systemPrice(material, systemId) {
  return getAvailableSystems(material).find((entry) => entry.id === systemId)?.price || 0;
}

function profilePriceDiff(profileId) {
  return PROFILE_SYSTEMS.find((entry) => entry.id === profileId)?.priceDiff || 0;
}

function areaFactor(win) {
  const area = (Number(win?.width) || 1200) * (Number(win?.height) || 1400);
  return area / REFERENCE_AREA;
}

function glassFactor(win) {
  if ((win?.glassType || '').includes('3-fach')) return 1.12;
  return 1;
}

/**
 * Estimate the price for a single configured window unit.
 * Sums material base, PVC system, profile difference, colour/wood surcharges,
 * and scales by size and glass.
 */
export function computeUnitPrice(globalConfig = {}, win = {}) {
  const base = getMaterialBasePrice(globalConfig.material) || 129;
  const sizedBase = base * areaFactor(win) * glassFactor(win);

  const colorPct = Math.max(
    colorPricePct(globalConfig.frameColorOutside),
    colorPricePct(globalConfig.frameColorInside)
  );
  const colorSurcharge = sizedBase * (colorPct / 100);
  const woodSurcharge = sizedBase * (woodSpeciesPct(globalConfig.woodSpecies) / 100);

  const total =
    sizedBase +
    systemPrice(globalConfig.material, globalConfig.manufacturer) +
    profilePriceDiff(globalConfig.profileSystem) +
    colorSurcharge +
    woodSurcharge;

  return Math.round(total);
}

/** Estimate total project price across all window slots. */
export function computeTotal(state) {
  const globalConfig = state?.globalConfig || {};
  const windows = state?.windows?.length ? state.windows : [{}];
  const sum = windows.reduce((acc, win) => acc + computeUnitPrice(globalConfig, win), 0);
  return Math.round(sum);
}

export function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('de-DE')} €`;
}
