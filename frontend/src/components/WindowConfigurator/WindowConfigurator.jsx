import { useState } from 'react';
import {
  MATERIALS,
  getDefaultsForMaterial,
  getLightOptions,
  getMaterial,
  getOpeningTypes,
  getProfiles,
  getSectionOptions,
  getSizeLimits,
  getSystems,
  getWindowTypes,
  getWoodColorOptions,
  hasSystem
} from '@/config/windowConfiguratorData';
import OptionCard from './OptionCard';
import PreviewPanel from './PreviewPanel';
import SummaryPanel from './SummaryPanel';
import { v2LightShape, v2OpeningShape, v2WindowTypeShape } from '@/utils/windowShapePreview';
import './WindowConfigurator.scss';

function getDefaultOpeningTypeForPaneCount(paneCount) {
  if (paneCount === 1) {
    return 'fest';
  }
  if (paneCount === 2) {
    return 'l_fest_r_fest';
  }
  return 'l_fest_m_fest_r_fest';
}

function addWindowTypePreviewShapes(options) {
  return options.map((option) => ({
    ...option,
    image: v2WindowTypeShape({
      windowType: option.id,
      lightOption: 'ohne_ober_unterlicht',
      openingType: getDefaultOpeningTypeForPaneCount(option.panes)
    })
  }));
}

function addLightPreviewShapes(options, windowTypeId) {
  return options.map((option) => ({
    ...option,
    image: v2LightShape(option.id, windowTypeId)
  }));
}

function addOpeningPreviewShapes(options, windowTypeId) {
  return options.map((option) => ({
    ...option,
    image: v2OpeningShape(option.id, windowTypeId)
  }));
}

function OptionSection({ title, options, selected, onSelect }) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <section className="wc-section">
      <h3 className="wc-section-title">{title}</h3>
      <div className="wc-grid">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selected}
            onSelect={onSelect}
            disabled={option.disabled}
          />
        ))}
      </div>
    </section>
  );
}

const MATERIAL_OPTIONS = MATERIALS.map((material) => ({
  id: material.id,
  label: material.label,
  startingPrice: material.startingPrice
}));

export default function WindowConfigurator() {
  const [config, setConfig] = useState(() => getDefaultsForMaterial(getMaterial('kunststoff')));

  const selectedMaterial = getMaterial(config.material);
  const availableSystems = getSystems(selectedMaterial);
  const availableProfiles = getProfiles(selectedMaterial, config.system);
  const windowTypeOptions = getWindowTypes(selectedMaterial);
  const lightOptions = getLightOptions(config.windowType);
  const openingTypeOptions = getOpeningTypes(config.windowType);
  const sizeLimits = getSizeLimits(selectedMaterial);

  const isWidthValid =
    config.width >= sizeLimits.width.min && config.width <= sizeLimits.width.max;
  const isHeightValid =
    config.height >= sizeLimits.height.min && config.height <= sizeLimits.height.max;
  const isSizeValid = isWidthValid && isHeightValid;
  const showSystemSection = hasSystem(selectedMaterial);

  function updateConfig(changes) {
    setConfig((previousConfig) => ({ ...previousConfig, ...changes }));
  }

  function handleMaterialChange(materialId) {
    setConfig(getDefaultsForMaterial(getMaterial(materialId)));
  }

  function handleSystemChange(systemId) {
    const profiles = getProfiles(selectedMaterial, systemId);
    updateConfig({ system: systemId, profile: profiles[0]?.id || null });
  }

  function handleProfileChange(profileId) {
    updateConfig({ profile: profileId });
  }

  function handleWoodTypeChange(woodTypeId) {
    const defaultColor = getWoodColorOptions(woodTypeId)[0]?.id || null;
    updateConfig({ woodType: woodTypeId, woodColor: defaultColor });
  }

  function handleWindowTypeChange(windowTypeId) {
    const defaultLightOption = getLightOptions(windowTypeId)[0]?.id;
    const defaultOpeningType = getOpeningTypes(windowTypeId)[0]?.id;
    updateConfig({
      windowType: windowTypeId,
      lightOption: defaultLightOption,
      openingType: defaultOpeningType
    });
  }

  function handleLightOptionChange(lightOptionId) {
    updateConfig({ lightOption: lightOptionId });
  }

  function handleConfigFieldChange(fieldName) {
    return (selectedId) => {
      updateConfig({ [fieldName]: selectedId });
    };
  }

  function handleDimensionChange(dimensionField) {
    return (event) => {
      const numericValue = Number(event.target.value);
      updateConfig({
        [dimensionField]: Number.isFinite(numericValue) ? numericValue : 0
      });
    };
  }

  function getMaterialSectionSelectHandler(section) {
    if (section.field === 'woodType') {
      return handleWoodTypeChange;
    }
    return handleConfigFieldChange(section.field);
  }

  return (
    <section className="wc-page">
      <div className="wc-layout">
        <div className="wc-preview-col">
          <PreviewPanel config={config} />
        </div>

        <div className="wc-options-col">
          <OptionSection
            title="Material"
            options={MATERIAL_OPTIONS}
            selected={config.material}
            onSelect={handleMaterialChange}
          />

          {showSystemSection && (
            <OptionSection
              title="System"
              options={availableSystems}
              selected={config.system}
              onSelect={handleSystemChange}
            />
          )}

          <OptionSection
            title="Profil"
            options={availableProfiles}
            selected={config.profile}
            onSelect={handleProfileChange}
          />

          {selectedMaterial.sections.map((section) => (
            <OptionSection
              key={section.id}
              title={section.title}
              options={getSectionOptions(selectedMaterial, section, config)}
              selected={config[section.field]}
              onSelect={getMaterialSectionSelectHandler(section)}
            />
          ))}

          <OptionSection
            title="Fenstertyp"
            options={addWindowTypePreviewShapes(windowTypeOptions)}
            selected={config.windowType}
            onSelect={handleWindowTypeChange}
          />
          <OptionSection
            title="Ober/Unterlicht"
            options={addLightPreviewShapes(lightOptions, config.windowType)}
            selected={config.lightOption}
            onSelect={handleLightOptionChange}
          />
          <OptionSection
            title="Öffnungsart"
            options={addOpeningPreviewShapes(openingTypeOptions, config.windowType)}
            selected={config.openingType}
            onSelect={handleConfigFieldChange('openingType')}
          />

          <section className="wc-section wc-section--size">
            <h3 className="wc-section-title">Größe (mm)</h3>
            <div className="wc-size">
              <label className={`wc-size-field ${isWidthValid ? '' : 'is-invalid'}`}>
                <span>Gesamtbreite</span>
                <input type="number" value={config.width} onChange={handleDimensionChange('width')} />
                <small>
                  {sizeLimits.width.min}–{sizeLimits.width.max} mm
                </small>
              </label>
              <label className={`wc-size-field ${isHeightValid ? '' : 'is-invalid'}`}>
                <span>Gesamthöhe</span>
                <input type="number" value={config.height} onChange={handleDimensionChange('height')} />
                <small>
                  {sizeLimits.height.min}–{sizeLimits.height.max} mm
                </small>
              </label>
            </div>
            {!isSizeValid && (
              <p className="wc-size-warning">
                Bitte Maße innerhalb der erlaubten Grenzen eingeben, um fortzufahren.
              </p>
            )}
            <button type="button" className="wc-next" disabled={!isSizeValid}>
              Weiter zur Anfrage
            </button>
          </section>
        </div>

        <div className="wc-summary-col">
          <SummaryPanel config={config} />
        </div>
      </div>
    </section>
  );
}
