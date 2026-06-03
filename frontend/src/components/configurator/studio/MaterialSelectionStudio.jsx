import './MaterialSelectionStudio.scss';
import SelectedMark from '@/components/ui/SelectedMark';
import { WINDOW_MATERIALS } from '@/utils/defaults';

const MATERIAL_HINTS = {
  Kunststoff: 'Pflegeleicht & guenstig',
  'Kunststoff-Aluminium': 'Hybrid-System',
  Holz: 'Natuerlich & warm',
  'Holz-Aluminium': 'Langlebig + warm',
  Aluminium: 'Schlank & modern'
};

export default function MaterialSelectionStudio({ selected, onSelect, showNextHint = false }) {
  return (
    <div className="fv-material-panel">
      <div className="fv-step-intro">
        <h3>Material auswaehlen</h3>
        <p>Waehlen Sie das Rahmenmaterial fuer Ihr Fenster.</p>
      </div>
      <div className="fv-material-grid">
        {WINDOW_MATERIALS.map((option) => {
          const isSelected = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              className={`fv-material-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(option.id)}
            >
              <SelectedMark selected={isSelected} />
              <span className="fv-material-visual">
                {option.image ? (
                  <img src={option.image} alt="" loading="lazy" />
                ) : (
                  <span className="fv-material-fallback" />
                )}
              </span>
              <strong>{option.label}</strong>
              <span>{MATERIAL_HINTS[option.id] || option.footer || ''}</span>
            </button>
          );
        })}
      </div>
      {showNextHint && selected && (
        <p className="fv-step-next-hint">Mit Weiter gelangen Sie zur Profilsystem-Auswahl.</p>
      )}
    </div>
  );
}
