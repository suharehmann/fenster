import SelectedMark from '@/components/ui/SelectedMark';
import {
  getAvailableProfiles,
  getAvailableSystems,
  materialHasSystem
} from '@/utils/defaults';
import { ProfileSelectionStudio } from '../studio/DetailConfiguratorStudio';

function handleManufacturerLogoError(event) {
  const image = event.currentTarget;
  const src = image.getAttribute('src') ?? '';

  if (!image.dataset.fallbackTried && src.endsWith('.png')) {
    image.dataset.fallbackTried = 'true';
    image.src = src.replace(/\.png$/i, '.svg');
    return;
  }

  image.style.display = 'none';
  image.onerror = null;
}

function SystemSelection({ material, selected, onSelect }) {
  const systems = getAvailableSystems(material);

  if (!systems.length) {
    return (
      <p className="wizard-callout intro-manufacturer-callout">
        Fuer dieses Material ist kein separates System notwendig.
      </p>
    );
  }

  return (
    <div className="manufacturer-grid intro-selection-grid">
      {systems.map((system) => {
        const isSelected = system.id === selected;
        return (
          <button
            key={system.id}
            type="button"
            className={`manufacturer-card intro-selection-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(system.id)}
          >
            <SelectedMark selected={isSelected} />
            <div className="intro-selection-card-media manufacturer-card-media">
              <div className="manufacturer-logo">
                {system.logo ? (
                  <img
                    src={system.logo}
                    alt={system.label}
                    loading="lazy"
                    onError={handleManufacturerLogoError}
                  />
                ) : null}
              </div>
            </div>
            <div className="intro-selection-card-copy manufacturer-card-copy">
              <h3 className="intro-selection-card-title manufacturer-name">{system.label}</h3>
              <p className="intro-selection-card-desc manufacturer-leadtime">
                {system.price ? `+ ${system.price} € · ` : ''}
                {system.leadTime}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileSystemStep({ state, setState, onSystemChange }) {
  const { material, manufacturer } = state.globalConfig || {};
  const showSystem = materialHasSystem(material);

  return (
    <div className="fv-profile-system-step">
      {showSystem && (
        <div className="fv-profile-block">
          <div className="fv-step-intro">
            <h3>System waehlen</h3>
            <p>Waehlen Sie den Profilhersteller fuer Ihr Fenstersystem.</p>
          </div>
          <SystemSelection
            material={material}
            selected={manufacturer}
            onSelect={onSystemChange}
          />
        </div>
      )}
      {material && (!showSystem || manufacturer) && (
        <div className="fv-profile-block">
          <ProfileSelectionStudio state={state} setState={setState} />
        </div>
      )}
    </div>
  );
}
