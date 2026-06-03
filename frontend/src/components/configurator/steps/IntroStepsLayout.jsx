import { Spin } from 'antd';
import OptionCard from '../options/OptionCard';
import { QUANTITY_PRESETS } from '@/lib/configurator/quantity';
import {
  getAvailableSystems,
  PRODUCT_TYPES,
  WINDOW_MATERIALS
} from '@/utils/defaults';

const MATERIAL_OPTIONS = WINDOW_MATERIALS;
const QUANTITY_MIN = 1;
const QUANTITY_MAX = 20;

const INTRO_STEPPER_LABELS = {
  product: 'Produkt',
  quantity: 'Anzahl',
  material: 'Material',
  manufacturer: 'System'
};

const INTRO_STEP_COPY = {
  product: {
    title: 'Was moechten Sie einbauen oder austauschen lassen?',
    subtitle: 'Waehlen Sie das Produkt, das Sie konfigurieren moechten.',
    hint: 'Sie koennen jederzeit zurueckgehen und Ihre Auswahl aendern.'
  },
  quantity: {
    title: 'Wie viele Elemente benoetigen Sie?',
    subtitle:
      'Geben Sie die Menge an. Fuer Fenster legen wir automatisch die passende Anzahl an Einheiten an.',
    hint: 'Die Anzahl koennen Sie spaeter in der Detailkonfiguration anpassen.'
  },
  material: {
    title: 'Welches Fenstermaterial wuenschen Sie?',
    subtitle: 'Waehlen Sie das Material fuer Ihre Fenster oder Tueren.',
    hint: 'Preise sind Richtwerte — die genaue Kalkulation folgt im naechsten Schritt.'
  },
  manufacturer: {
    title: 'Welches System soll verwendet werden?',
    subtitle: 'Waehlen Sie den Profilhersteller fuer Ihr Fenstersystem.',
    hint: 'Das System bestimmt Profile, Beschlaege und verfuegbare Optionen.'
  }
};

const PRODUCT_DESCRIPTIONS = {
  window: 'Einzel- oder Mehrfachverglasung',
  door: 'Sicherheit & Design vereint',
  shutter: 'Sonnenschutz & Waermedaemmung'
};

function getSystemOptions(materialId) {
  return getAvailableSystems(materialId).map((system) => ({
    ...system,
    image: system.logo
  }));
}

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

function StepperNav({ steps, currentStep, onStepChange }) {
  const currentStepDefinition = steps[currentStep];
  const activeLabel =
    INTRO_STEPPER_LABELS[currentStepDefinition?.id] ?? currentStepDefinition?.label ?? '';
  const stepNumber = currentStep + 1;
  const totalSteps = steps.length;

  return (
    <nav className="wizard-nav wizard-nav--step-progress" aria-label="Konfiguration Schritte">
      <div className="wizard-step-progress__header" aria-live="polite">
        <p className="wizard-step-progress__kicker">
          Schritt <span className="wizard-step-progress__kicker-num">{stepNumber}</span> von{' '}
          {totalSteps}
        </p>
        {activeLabel ? <p className="wizard-step-progress__title">{activeLabel}</p> : null}
      </div>

      <ol
        className="wizard-step-progress__trail"
        style={{
          '--wizard-step-count': steps.length,
          '--wizard-step-current': currentStep
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          const isClickable = index < currentStep;
          const label = INTRO_STEPPER_LABELS[step.id] ?? step.label ?? '';
          const stateClass = isActive ? 'is-active' : isDone ? 'is-done' : 'is-upcoming';

          return (
            <li key={step.id} className={`wizard-step-progress__item ${stateClass}`}>
              <button
                type="button"
                className="wizard-step-progress__step"
                disabled={!isClickable}
                onClick={() => isClickable && onStepChange(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${label}, Schritt ${index + 1}${
                  isDone ? ', abgeschlossen' : isActive ? ', aktuell' : ''
                }`}
              >
                <span className="wizard-step-progress__dot" aria-hidden="true">
                  {isDone ? (
                    <svg
                      className="wizard-step-progress__check"
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="wizard-step-progress__label">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function IntroStepShell({
  stepId,
  steps,
  currentStep,
  onStepChange,
  children,
  gateMessage,
  wizardActions,
  isStartingConfiguration = false
}) {
  const copy = INTRO_STEP_COPY[stepId] ?? {};

  return (
    <section
      className={`page wizard-shell wizard-shell--intro-step wizard-shell--${stepId}-step${
        isStartingConfiguration ? ' is-starting-configuration' : ''
      }`}
    >
      {isStartingConfiguration ? (
        <div
          className="configurator-start-loader"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Spin size="large" />
          <p className="configurator-start-loader__text">Konfiguration wird vorbereitet...</p>
        </div>
      ) : null}
      <div className="wizard-layout wizard-layout--intro">
        <StepperNav steps={steps} currentStep={currentStep} onStepChange={onStepChange} />

        <div className="intro-step-center">
          <div className="intro-step-panel">
            {copy.title ? <h2 className="intro-step__title">{copy.title}</h2> : null}
            {copy.subtitle ? <p className="intro-step__subtitle">{copy.subtitle}</p> : null}
            {children}
            {gateMessage ? <p className="error wizard-panel-error">{gateMessage}</p> : null}
          </div>
          {copy.hint ? <p className="intro-step-hint">{copy.hint}</p> : null}
        </div>

        <footer className="intro-step-foot">
          <div className="intro-step-actions">{wizardActions}</div>
        </footer>
      </div>
    </section>
  );
}

function CardGrid({ variant, options, selected, onSelect }) {
  return (
    <div className={`${variant}-grid intro-selection-grid`}>
      {options.map((option) => {
        const optionId = option.id ?? option;
        const optionLabel = option.label ?? option;

        return (
          <OptionCard
            key={optionId}
            option={option}
            selected={selected}
            onSelect={onSelect}
            className={`${variant}-card intro-selection-card`}
          >
            <IntroCardContent variant={variant} option={option} label={optionLabel} />
          </OptionCard>
        );
      })}
    </div>
  );
}

function IntroCardContent({ variant, option, label }) {
  if (variant === 'product') {
    const description = PRODUCT_DESCRIPTIONS[option.id] ?? '';

    return (
      <>
        <div className="intro-selection-card-media product-card-media">
          {option.image ? <img src={option.image} alt={label} loading="lazy" /> : null}
        </div>
        <div className="intro-selection-card-copy product-card-copy">
          <h3 className="intro-selection-card-title product-card-title">{label}</h3>
          {description ? <p className="intro-selection-card-desc product-card-desc">{description}</p> : null}
        </div>
      </>
    );
  }

  if (variant === 'material') {
    return (
      <>
        <div className="intro-selection-card-media material-card-media">
          {option.image ? <img src={option.image} alt={label} loading="lazy" /> : null}
        </div>
        <div className="intro-selection-card-copy material-card-copy">
          <h3 className="intro-selection-card-title material-card-title">{label}</h3>
          {option.footer ? (
            <p className="intro-selection-card-desc material-card-desc">{option.footer}</p>
          ) : null}
          {option.basePrice ? (
            <p className="intro-selection-card-meta material-card-price">ab {option.basePrice} €</p>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="intro-selection-card-media manufacturer-card-media">
        <div className="manufacturer-logo">
          {option.image ? (
            <img
              src={option.image}
              alt={label}
              loading="lazy"
              onError={handleManufacturerLogoError}
            />
          ) : null}
        </div>
      </div>
      <div className="intro-selection-card-copy manufacturer-card-copy">
        <h3 className="intro-selection-card-title manufacturer-name">{label}</h3>
        <p className="intro-selection-card-desc manufacturer-leadtime">
          {option.price ? `+ ${option.price} € · ` : ''}
          {option.leadTime}
        </p>
      </div>
    </>
  );
}

function QuantityStep({ state, onSetQuantity }) {
  const productType = state.productType;
  const quantity = state.quantity;
  const isProductSelected = Boolean(productType);
  const canDecrease = isProductSelected && quantity > QUANTITY_MIN;
  const canIncrease = isProductSelected && quantity < QUANTITY_MAX;

  function handleDecrease() {
    onSetQuantity(quantity - 1);
  }

  function handleIncrease() {
    onSetQuantity(quantity + 1);
  }

  function handleInputChange(event) {
    onSetQuantity(event.target.value);
  }

  function handlePresetSelect(presetValue) {
    onSetQuantity(presetValue);
  }

  return (
    <div className="intro-quantity-panel">
      {!isProductSelected && (
        <div className="wizard-callout intro-quantity-callout">
          Bitte zuerst ein Produkt aus Schritt 1 auswaehlen.
        </div>
      )}
      <div className={`intro-quantity-card${isProductSelected ? '' : ' is-disabled'}`}>
        <p className="intro-quantity-card__eyebrow">Anzahl Elemente</p>

        <div className="intro-quantity-picker" role="group" aria-label="Anzahl waehlen">
          <button
            type="button"
            className="intro-quantity-picker__control intro-quantity-picker__control--dec"
            onClick={handleDecrease}
            disabled={!canDecrease}
            aria-label="Anzahl verringern"
          >
            <span aria-hidden="true">−</span>
          </button>

          <label className="intro-quantity-picker__display">
            <span className="intro-quantity-picker__sr-only">Anzahl</span>
            <input
              type="number"
              className="intro-quantity-picker__input"
              min={QUANTITY_MIN}
              max={QUANTITY_MAX}
              value={quantity}
              onChange={handleInputChange}
              disabled={!isProductSelected}
            />
            <span className="intro-quantity-picker__unit" aria-hidden="true">
              {quantity === 1 ? 'Stueck' : 'Stuecke'}
            </span>
          </label>

          <button
            type="button"
            className="intro-quantity-picker__control intro-quantity-picker__control--inc"
            onClick={handleIncrease}
            disabled={!canIncrease}
            aria-label="Anzahl erhoehen"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div className="intro-quantity-presets">
          <p className="intro-quantity-presets__label">Schnellauswahl</p>
          <div className="intro-quantity-presets__list" role="group" aria-label="Schnellauswahl Anzahl">
            {QUANTITY_PRESETS.map((presetValue) => (
              <button
                key={presetValue}
                type="button"
                className={`intro-quantity-presets__chip${
                  quantity === presetValue ? ' is-selected' : ''
                }`}
                onClick={() => handlePresetSelect(presetValue)}
                disabled={!isProductSelected}
                aria-pressed={quantity === presetValue}
              >
                {presetValue}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntroStepsLayout({
  steps,
  currentStep,
  currentStepId,
  state,
  setState,
  onStepChange,
  onSetMaterial,
  onSetSystem,
  onSetQuantity,
  onPrimary,
  canProceed,
  gateMessage,
  isStartingConfiguration = false
}) {
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const hasSystemOptions = getSystemOptions(state.globalConfig?.material).length > 0;
  const primaryButtonLabel = isLastStep
    ? isStartingConfiguration
      ? 'Wird gestartet...'
      : 'Konfiguration starten'
    : 'Weiter';
  const isActionDisabled = !canProceed || isStartingConfiguration;

  function handleProductTypeChange(productType) {
    setState((previousState) => ({ ...previousState, productType }));
  }

  function handlePreviousStep() {
    onStepChange(Math.max(0, currentStep - 1));
  }

  const wizardActions = (
    <>
      <button
        type="button"
        className="btn-secondary"
        disabled={isFirstStep || isStartingConfiguration}
        onClick={handlePreviousStep}
      >
        Zurueck
      </button>
      <button
        type="button"
        className={`btn-primary${isStartingConfiguration ? ' is-loading' : ''}`}
        disabled={isActionDisabled}
        onClick={onPrimary}
        aria-busy={isStartingConfiguration}
      >
        {isStartingConfiguration && isLastStep ? (
          <Spin size="small" className="btn-primary__spin" />
        ) : null}
        <span>{primaryButtonLabel}</span>
      </button>
    </>
  );

  const shellProps = {
    stepId: currentStepId,
    steps,
    currentStep,
    onStepChange,
    gateMessage,
    wizardActions,
    isStartingConfiguration
  };

  if (currentStepId === 'product') {
    return (
      <IntroStepShell {...shellProps}>
        <CardGrid
          variant="product"
          options={PRODUCT_TYPES}
          selected={state.productType}
          onSelect={handleProductTypeChange}
        />
      </IntroStepShell>
    );
  }

  if (currentStepId === 'quantity') {
    return (
      <IntroStepShell {...shellProps}>
        <QuantityStep state={state} onSetQuantity={onSetQuantity} />
      </IntroStepShell>
    );
  }

  if (currentStepId === 'material') {
    return (
      <IntroStepShell {...shellProps}>
        <CardGrid
          variant="material"
          options={MATERIAL_OPTIONS}
          selected={state.globalConfig?.material}
          onSelect={onSetMaterial}
        />
      </IntroStepShell>
    );
  }

  if (currentStepId === 'manufacturer') {
    return (
      <IntroStepShell {...shellProps}>
        {hasSystemOptions ? (
          <CardGrid
            variant="manufacturer"
            options={getSystemOptions(state.globalConfig?.material)}
            selected={state.globalConfig?.manufacturer}
            onSelect={onSetSystem}
          />
        ) : (
          <p className="wizard-callout intro-manufacturer-callout">
            Fuer dieses Material ist kein separates System notwendig. Sie koennen mit Weiter
            fortfahren.
          </p>
        )}
      </IntroStepShell>
    );
  }

  return null;
}
