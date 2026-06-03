import {
  findOption,
  getLightOptions,
  getMaterial,
  getOpeningTypes,
  getProfiles,
  getSectionOptions,
  getSystem,
  getWindowTypes
} from '@/config/windowConfiguratorData';
import { calculateWindowPrice } from '@/utils/calculateWindowPrice';

function label(option) {
  return option?.label || '—';
}

/** Live summary of the current configuration plus the running total price. */
export default function SummaryPanel({ config }) {
  const material = getMaterial(config.material);
  const rows = [['Material', material.label]];

  if (material.systems) rows.push(['System', label(getSystem(material, config.system))]);
  rows.push(['Profil', label(findOption(getProfiles(material, config.system), config.profile))]);

  // One summary row per material section, using each section's own title.
  material.sections.forEach((section) => {
    const options = getSectionOptions(material, section, config);
    rows.push([section.title, label(findOption(options, config[section.field]))]);
  });

  rows.push(['Fenstertyp', label(findOption(getWindowTypes(material), config.windowType))]);
  rows.push(['Ober/Unterlicht', label(findOption(getLightOptions(config.windowType), config.lightOption))]);
  rows.push(['Öffnungsart', label(findOption(getOpeningTypes(config.windowType), config.openingType))]);
  rows.push(['Gesamtbreite', `${config.width} mm`]);
  rows.push(['Gesamthöhe', `${config.height} mm`]);

  const price = calculateWindowPrice(config);

  return (
    <aside className="wc-summary">
      <h3 className="wc-summary-title">Zusammenfassung</h3>
      <dl className="wc-summary-list">
        {rows.map(([term, value]) => (
          <div className="wc-summary-row" key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="wc-summary-price">
        <span>Preis</span>
        <strong>{price} €</strong>
      </div>
    </aside>
  );
}
