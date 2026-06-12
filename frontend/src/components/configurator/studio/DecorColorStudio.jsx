import './DecorColorStudio.scss';
import {
  ALUDEC_DECORS,
  ALU_METALLIC_COLORS,
  ALU_SONDER_RAL_COLORS,
  ALU_STANDARD_COLORS,
  DECOR_SONDER_COLORS,
  DECOR_STANDARD_COLORS,
  HOLZ_ARTEN,
  HOLZ_FARBEN,
  HOLZ_RAL_COLORS,
  WOODEC_DECORS
} from '@/config/configurator/decorColors';
import SelectedMark from '@/components/ui/SelectedMark';
import ConfigSection from '../shared/ConfigSection';

/** CSS-only swatch: solid colour or a light texture hint for decors / wood / metallic. */
function swatchStyle(option) {
  const color = option.color || '#e2e8f0';
  const style = { backgroundColor: color };

  if (option.brand === 'woodec') {
    style.backgroundImage = `repeating-linear-gradient(92deg, ${color}, rgba(0,0,0,0.14) 1px, ${color} 7px)`;
  } else if (option.brand === 'aludec') {
    style.backgroundImage = `linear-gradient(145deg, ${color} 0%, rgba(255,255,255,0.22) 45%, ${color} 100%)`;
  } else if (option.subtitle === 'strukturell') {
    style.backgroundImage = `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px)`;
  } else if (option.ralHint?.includes('Metallic') || option.ralHint?.includes('9007')) {
    style.backgroundImage = `linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.35) 50%, ${color} 100%)`;
  }

  return style;
}

function DecorOptionCard({ option, selected, onSelect }) {
  const isSelected = option.id === selected;
  return (
    <button
      type="button"
      className={`studio-decor-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(option.id)}
    >
      <SelectedMark selected={isSelected} />
      {option.brand && <span className="studio-decor-brand">{option.brand}</span>}
      <span className="studio-decor-swatch" style={swatchStyle(option)} aria-hidden />
      <span className="studio-decor-text">
        <strong>{option.label}</strong>
        {option.subtitle && <span className="studio-decor-sub">{option.subtitle}</span>}
        {option.ralHint && <span className="studio-decor-ral">{option.ralHint}</span>}
      </span>
      {option.surcharge && <span className="studio-decor-surcharge">{option.surcharge}</span>}
    </button>
  );
}

function DecorGroup({ heading, options, selected, onSelect }) {
  if (!options?.length) return null;
  return (
    <>
      {heading && <h4 className="studio-decor-subhead">{heading}</h4>}
      <div className="studio-decor-grid" role="list">
        {options.map((option) => (
          <DecorOptionCard
            key={`${heading || 'group'}-${option.id}`}
            option={option}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Build the list of colour sub-sections for the given material + surface,
 * mirroring the fensterversand structure:
 * - PVC: Farbe und Dekore + Sonderfarben + Aludec/Woodec
 * - Hybrid Aussen: Farbe Alu-Schale (Standard / Sonder-RAL / Metallic und Feinstruktur)
 * - Holz: Holzart + Holzfarbe (innen) and Holz-RAL-Farben (aussen)
 */
function getColorSections(material, isOutside) {
  const aluSchale = {
    title: 'Farbe Alu-Schale',
    kind: 'color',
    groups: [
      { heading: 'Standard-Farben', options: ALU_STANDARD_COLORS },
      { heading: 'Sonder-RAL-Farben', options: ALU_SONDER_RAL_COLORS },
      { heading: 'Metallic und Feinstruktur', options: ALU_METALLIC_COLORS }
    ]
  };

  const pvcDecor = {
    title: 'Farbe und Dekore',
    kind: 'color',
    lead: 'Bitte wählen Sie die gewünschte Farbe oder das gewünschte Dekor aus.',
    groups: [
      { options: DECOR_STANDARD_COLORS },
      { heading: 'Sonderfarben', options: DECOR_SONDER_COLORS }
    ]
  };

  const aludecWoodec = {
    title: 'Aludec und Woodec',
    kind: 'color',
    groups: [{ options: ALUDEC_DECORS }, { options: WOODEC_DECORS }]
  };

  const holzSpecies = {
    title: 'Holzart',
    kind: 'species',
    lead: 'Wählen Sie die Holzart für Ihr Fenster.',
    groups: [{ options: HOLZ_ARTEN }]
  };

  const holzFarbe = {
    title: 'Holzfarbe',
    kind: 'color',
    groups: [{ options: HOLZ_FARBEN }]
  };

  const holzRal = {
    title: 'Holz-RAL-Farben',
    kind: 'color',
    lead: 'Lackieren Sie die Außenseite in einer beliebigen RAL-Farbe.',
    groups: [{ options: HOLZ_RAL_COLORS }]
  };

  switch (material) {
    case 'Aluminium':
      return [{ ...aluSchale, title: 'Farbe (Aluminium)' }];
    case 'Kunststoff-Aluminium':
      return isOutside ? [aluSchale] : [pvcDecor, aludecWoodec];
    case 'Holz-Aluminium':
      return isOutside ? [aluSchale] : [holzSpecies, holzFarbe];
    case 'Holz':
      return isOutside ? [holzSpecies, holzRal] : [holzSpecies, holzFarbe];
    case 'Kunststoff':
    default:
      return [pvcDecor, aludecWoodec];
  }
}

function DecorSurfaceSections({ surface, globalConfig, onConfigChange, onSelect }) {
  const isOutside = surface === 'outside';
  const material = globalConfig?.material;
  const sections = getColorSections(material, isOutside);
  const colorKey = isOutside ? 'frameColorOutside' : 'frameColorInside';
  const selected = globalConfig?.[colorKey];

  return (
    <div
      className="studio-decor-surface-block"
      id={isOutside ? 'fv-colors-outside' : 'fv-colors-inside'}
    >
      <h3 className="studio-decor-surface-title">{isOutside ? 'Farbe und Dekor aussen' : 'Farbe und Dekor innen'}</h3>
      <div className="studio-decor-sections">
        {sections.map((section) => {
          const isSpecies = section.kind === 'species';
          const sectionSelected = isSpecies ? globalConfig?.woodSpecies : selected;
          const handleSelect = isSpecies
            ? (id) => onConfigChange?.('woodSpecies', id)
            : (id) => {
                onConfigChange?.(colorKey, id);
                onSelect?.(id);
              };
          return (
            <ConfigSection title={section.title} key={`${surface}-${section.title}`}>
              {section.lead && <p className="studio-decor-lead">{section.lead}</p>}
              {section.groups.map((group, idx) => (
                <DecorGroup
                  key={`${section.title}-${group.heading || idx}`}
                  heading={group.heading}
                  options={group.options}
                  selected={sectionSelected}
                  onSelect={handleSelect}
                />
              ))}
            </ConfigSection>
          );
        })}
      </div>
    </div>
  );
}

export default function DecorColorStudio({
  surface,
  selected,
  onSelect,
  onSurfaceChange,
  onConfigChange,
  globalConfig,
  stacked = true
}) {
  if (stacked) {
    return (
      <div className="studio-color-panel studio-decor-panel studio-decor-panel--stacked">
        <DecorSurfaceSections
          surface="outside"
          globalConfig={globalConfig}
          onConfigChange={onConfigChange}
          onSelect={onSelect}
        />
        <DecorSurfaceSections
          surface="inside"
          globalConfig={globalConfig}
          onConfigChange={onConfigChange}
          onSelect={onSelect}
        />
      </div>
    );
  }

  const isOutside = surface === 'outside';
  const material = globalConfig?.material;
  const sections = getColorSections(material, isOutside);

  return (
    <div className="studio-color-panel studio-decor-panel">
      <div className="studio-tabs" role="tablist" aria-label="Farbbereich">
        <button
          type="button"
          role="tab"
          className={`studio-tab ${isOutside ? 'active' : ''}`}
          aria-selected={isOutside}
          onClick={() => onSurfaceChange('outside')}
        >
          Außen
        </button>
        <button
          type="button"
          role="tab"
          className={`studio-tab ${!isOutside ? 'active' : ''}`}
          aria-selected={!isOutside}
          onClick={() => onSurfaceChange('inside')}
        >
          Innen
        </button>
      </div>

      <div className="studio-decor-sections">
        {sections.map((section) => {
          const isSpecies = section.kind === 'species';
          const sectionSelected = isSpecies ? globalConfig?.woodSpecies : selected;
          const handleSelect = isSpecies
            ? (id) => onConfigChange?.('woodSpecies', id)
            : onSelect;
          return (
            <ConfigSection title={section.title} key={`${surface}-${section.title}`}>
              {section.lead && <p className="studio-decor-lead">{section.lead}</p>}
              {section.groups.map((group, idx) => (
                <DecorGroup
                  key={`${section.title}-${group.heading || idx}`}
                  heading={group.heading}
                  options={group.options}
                  selected={sectionSelected}
                  onSelect={handleSelect}
                />
              ))}
            </ConfigSection>
          );
        })}
      </div>
    </div>
  );
}
