import {
  findOption,
  getInnerColorOptions,
  getMaterial,
  getOpeningTypes,
  getOuterColorOptions,
  getProfiles,
  getSystem,
  getWindowTypes,
  getWoodColorOptions,
  getWoodTypeOptions,
  getLightOptions
} from '@/config/windowConfiguratorData';

/** Placeholder for size-based pricing; returns 0 until real rules exist. */
export function calculateSizePrice(width, height) {
  void width;
  void height;
  return 0;
}

function impact(option) {
  return option?.priceImpact || 0;
}

/** Material base price plus every selected option's price impact. */
export function calculateWindowPrice(config) {
  const material = getMaterial(config.material);
  if (!material) return 0;

  let total = material.startingPrice || 0;

  total += impact(getSystem(material, config.system));
  total += impact(findOption(getProfiles(material, config.system), config.profile));
  total += impact(findOption(getInnerColorOptions(material), config.innerColor));
  total += impact(findOption(getOuterColorOptions(material), config.outerColor));
  total += impact(findOption(getWoodTypeOptions(material), config.woodType));
  total += impact(findOption(getWoodColorOptions(config.woodType), config.woodColor));
  total += impact(findOption(getWindowTypes(material), config.windowType));
  total += impact(findOption(getLightOptions(config.windowType), config.lightOption));
  total += impact(findOption(getOpeningTypes(config.windowType), config.openingType));
  total += calculateSizePrice(config.width, config.height);

  return Math.round(total);
}
