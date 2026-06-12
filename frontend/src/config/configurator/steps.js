/** Single source of truth for the Fensterversand-style configurator step order. */
export const CONFIGURATOR_STEPS = [
  { id: 'material', label: 'Material', kicker: 'Material' },
  { id: 'profile', label: 'Profilsystem', kicker: 'Profil' },
  { id: 'colors', label: 'Farben & Dekor', kicker: 'Dekorfarben' },
  { id: 'window-type', label: 'Fenstertyp', kicker: 'Konstruktion' },
  { id: 'opening-type', label: 'Oeffnungsart', kicker: 'Konstruktion' },
  { id: 'size', label: 'Groesse', kicker: 'Konstruktion' },
  { id: 'glazing', label: 'Verglasung', kicker: 'Verglasung' },
  { id: 'grilles', label: 'Sprossen', kicker: 'Sprossen' },
  { id: 'hardware', label: 'Beschlag & Griffe', kicker: 'Beschlag' },
  { id: 'fixing-holes', label: 'Befestigungsloecher', kicker: 'Bohrungen' },
  { id: 'window-sill', label: 'Fensterbank', kicker: 'Fensterbank' },
  { id: 'roller-shutter', label: 'Rollladen', kicker: 'Rollladen' },
  { id: 'insect-screen', label: 'Insektenschutz', kicker: 'Insektenschutz' },
  { id: 'frame-extensions', label: 'Rahmenverbreiterung', kicker: 'Rahmen' },
  { id: 'summary', label: 'Zusammenfassung', kicker: 'Anfrage' }
];

export const STEP_IDS = CONFIGURATOR_STEPS.map((step) => step.id);

export function getStepById(stepId) {
  return CONFIGURATOR_STEPS.find((step) => step.id === stepId);
}

export function getStepIndex(stepId) {
  return CONFIGURATOR_STEPS.findIndex((step) => step.id === stepId);
}

/** Steps before window shape is chosen — preview uses neutral placeholder. */
export function isBeforeShapeStep(stepId) {
  return stepId === 'material' || stepId === 'profile' || stepId === 'colors';
}
