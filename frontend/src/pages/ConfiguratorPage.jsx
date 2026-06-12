import { useEffect, useState } from 'react';
import './ConfiguratorPage.scss';
import { submitInquiry } from '@/api/client';
import DetailConfiguratorStudio, {
  ColorSelectionStudio,
  ProfileSelectionStudio,
  MaterialSelectionStudio,
  CustomerStep,
  NonWindowProductStep,
  WindowBuildStep,
  WindowGlassStep,
  WindowSecurityStep,
  IntroStepsLayout
} from '@/components/configurator';
import ConfiguratorStartLoader from '@/components/configurator/shared/ConfiguratorStartLoader';
import { applyQuantity } from '@/lib/configurator/quantity';
import {
  getAvailableProfiles,
  getAvailableSystems,
  INITIAL_CONFIGURATOR_STATE,
  materialHasSystem
} from '@/utils/defaults';

const STORAGE_KEY = 'fenster-konfigurator-v2';
const ACTIVE_WINDOW_INDEX_KEY = 'fenster-konfigurator-active-window-index-v1';
const CUSTOMER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INTRO_STEPS = [
  { id: 'product', label: 'Produkt', description: 'Fenster, Haustuer oder Rollladen' },
  { id: 'quantity', label: 'Anzahl', description: 'Wie viele Elemente werden gebraucht?' },
  { id: 'material', label: 'Material', description: 'Fenstermaterial auswaehlen' },
  { id: 'manufacturer', label: 'System', description: 'Profilsystem / Hersteller (nur Kunststoff)' }
];

const WINDOW_DETAIL_STEPS = [
  { id: 'profile', label: 'Profilsystem' },
  { id: 'colors', label: 'Dekorfarben' },
  { id: 'build', label: 'Fensteraufbau' },
  { id: 'glass', label: 'Verglasung' },
  { id: 'security', label: 'Sicherheit' },
  { id: 'customer', label: 'Anfrage' }
];

const OTHER_DETAIL_STEPS = [
  { id: 'product-config', label: 'Konfiguration' },
  { id: 'customer', label: 'Anfrage' }
];

/** Last sub-step index per detail step — used for live preview when sections are stacked. */
const PREVIEW_SUB_STEP = {
  build: 3,
  glass: 4,
  security: 3
};

const STEP_KICKERS = {
  profile: 'Profil',
  build: 'Konstruktion',
  colors: 'Dekorfarben',
  glass: 'Verglasung',
  security: 'Sicherheit',
  customer: 'Anfrage',
  'product-config': 'Konfiguration'
};

const GATE_MESSAGES = {
  product: 'Bitte waehlen Sie ein Produkt aus.',
  quantity: 'Bitte geben Sie eine gueltige Anzahl an.',
  material: 'Bitte waehlen Sie ein Fenstermaterial.',
  manufacturer: 'Bitte waehlen Sie ein System.',
  profile: 'Bitte waehlen Sie ein Profilsystem.',
  profileMaterial: 'Bitte waehlen Sie zuerst ein Fenstermaterial.',
  customer: 'Bitte fuellen Sie Name, Adresse und gueltige E-Mail aus.'
};

function getIntroSteps(productType) {
  if (productType !== 'window') {
    return INTRO_STEPS.slice(0, 2);
  }
  return INTRO_STEPS;
}

function getPartInfo() {
  return { part: 1, total: 1 };
}

function getPreviewSubStep(detailStepId) {
  return PREVIEW_SUB_STEP[detailStepId] ?? 0;
}

function isCustomerStepComplete(customer) {
  return (
    customer.fullName.trim().length >= 2 &&
    customer.address.trim().length >= 5 &&
    CUSTOMER_EMAIL_PATTERN.test(customer.email)
  );
}

function getGateMessage({ canProceed, stepId }) {
  if (canProceed) {
    return '';
  }

  return GATE_MESSAGES[stepId] || '';
}

function readStoredConfiguratorState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : INITIAL_CONFIGURATOR_STATE;
}

function readStoredActiveWindowIndex() {
  const stored = Number(localStorage.getItem(ACTIVE_WINDOW_INDEX_KEY));
  return Number.isFinite(stored) && stored >= 0 ? stored : 0;
}

export default function ConfiguratorPage() {
  const [state, setState] = useState(readStoredConfiguratorState);
  const [phase, setPhase] = useState('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [detailStep, setDetailStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [activeWindowIndex, setActiveWindowIndex] = useState(readStoredActiveWindowIndex);
  const [previewMode, setPreviewMode] = useState('2d');
  const [previewSurface, setPreviewSurface] = useState('outside');
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });
  const [isStartingConfiguration, setIsStartingConfiguration] = useState(false);

  const introSteps = getIntroSteps(state.productType);
  const detailSteps = state.productType === 'window' ? WINDOW_DETAIL_STEPS : OTHER_DETAIL_STEPS;
  const currentStepId = introSteps[currentStep]?.id;
  const detailStepId = detailSteps[detailStep]?.id;
  const previewSubStep = getPreviewSubStep(detailStepId);
  const isDetailPhase = phase === 'detail';
  const activeStepId = isDetailPhase ? detailStepId : currentStepId;

  function canProceedFromIntro(stepId) {
    if (stepId === 'product') {
      return Boolean(state.productType);
    }
    if (stepId === 'quantity') {
      return Boolean(state.productType) && state.quantity > 0;
    }
    if (stepId === 'material') {
      return Boolean(state.globalConfig?.material);
    }
    if (stepId === 'manufacturer') {
      const material = state.globalConfig?.material;
      if (!materialHasSystem(material)) {
        return true;
      }
      return Boolean(state.globalConfig?.manufacturer);
    }
    return false;
  }

  function canProceedFromDetail(stepId) {
    if (stepId === 'profile') {
      return Boolean(state.globalConfig?.material) && Boolean(state.globalConfig?.profileSystem);
    }

    if (stepId === 'customer') {
      return isCustomerStepComplete(state.customer);
    }

    return true;
  }

  const gateMessage = getGateMessage({
    canProceed: isDetailPhase
      ? canProceedFromDetail(detailStepId)
      : canProceedFromIntro(currentStepId),
    stepId: activeStepId
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    setCurrentStep((previousStep) => Math.min(previousStep, introSteps.length - 1));
  }, [introSteps.length]);

  useEffect(() => {
    setDetailStep((previousStep) => Math.min(previousStep, detailSteps.length - 1));
  }, [detailSteps.length]);

  useEffect(() => {
    const maxIndex =
      state.productType === 'window'
        ? Math.max(0, state.windows.length - 1)
        : Math.max(0, (state.quantity || 1) - 1);
    setActiveWindowIndex((previousIndex) => Math.min(previousIndex, maxIndex));
  }, [state.windows.length, state.quantity, state.productType]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_WINDOW_INDEX_KEY, String(activeWindowIndex));
  }, [activeWindowIndex]);

  function updateGlobalConfig(key, value) {
    setState((previousState) => ({
      ...previousState,
      globalConfig: { ...previousState.globalConfig, [key]: value }
    }));
  }

  function handleMaterialChange(materialId) {
    setState((previousState) => {
      const systems = getAvailableSystems(materialId);
      const systemId = systems[0]?.id || null;
      const profiles = getAvailableProfiles(materialId, systemId);
      const profileSystem = profiles[0]?.id || previousState.globalConfig.profileSystem;

      return {
        ...previousState,
        globalConfig: {
          ...previousState.globalConfig,
          material: materialId,
          manufacturer: systemId,
          profileSystem
        }
      };
    });
  }

  function handleSystemChange(systemId) {
    setState((previousState) => {
      const profiles = getAvailableProfiles(previousState.globalConfig.material, systemId);
      const profileSystem = profiles[0]?.id || previousState.globalConfig.profileSystem;

      return {
        ...previousState,
        globalConfig: {
          ...previousState.globalConfig,
          manufacturer: systemId,
          profileSystem
        }
      };
    });
  }

  function handleQuantityChange(quantity) {
    setState((previousState) => applyQuantity(previousState, quantity, { fillAllSlots: true }));
  }

  function startDetailConfiguration() {
    setState((previousState) => applyQuantity(previousState, previousState.quantity, { fillAllSlots: true }));
    setPhase('detail');
    setDetailStep(0);
    setSubStep(0);
    setSubmitStatus({ loading: false, error: '', success: false });
  }

  async function handleSubmitInquiry() {
    setSubmitStatus({ loading: true, error: '', success: false });

    try {
      await submitInquiry(state);
      setSubmitStatus({ loading: false, error: '', success: true });
    } catch (requestError) {
      setSubmitStatus({
        loading: false,
        error: requestError.message || 'Anfrage konnte nicht gesendet werden.',
        success: false
      });
    }
  }

  async function handleIntroPrimary() {
    if (isStartingConfiguration) {
      return;
    }

    if (currentStep < introSteps.length - 1) {
      setCurrentStep((previousStep) => previousStep + 1);
      return;
    }

    setIsStartingConfiguration(true);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      startDetailConfiguration();

      await new Promise((resolve) => {
        setTimeout(resolve, 450);
      });
    } finally {
      setIsStartingConfiguration(false);
    }
  }

  function handleDetailBack() {
    if (detailStep === 0) {
      setPhase('intro');
      return;
    }
    setDetailStep((previousStep) => previousStep - 1);
    setSubStep(0);
  }

  function handleDetailStepChange(stepIndex) {
    setDetailStep(stepIndex);
    setSubStep(0);
  }

  function handleDetailContinue() {
    if (detailStep < detailSteps.length - 1) {
      setDetailStep((previousStep) => previousStep + 1);
      setSubStep(0);
      return;
    }
    if (detailStepId === 'customer') {
      handleSubmitInquiry();
    }
  }

  function handleExitToIntro() {
    setPhase('intro');
  }

  function handleColorSurfaceChange(surface) {
    setPreviewSurface(surface);
  }

  function handleDecorColorSelect(colorKey, value) {
    updateGlobalConfig(colorKey, value);
  }

  function renderProfileStepContent() {
    return (
      <>
        <div id="fv-profile-material">
          <MaterialSelectionStudio
            selected={state.globalConfig.material}
            onSelect={handleMaterialChange}
          />
        </div>
        {state.globalConfig.material && (
          <div className="fv-profile-block" id="fv-profile-system">
            <ProfileSelectionStudio state={state} setState={setState} />
          </div>
        )}
      </>
    );
  }

  function renderDetailContent() {
    if (detailStepId === 'profile') {
      return renderProfileStepContent();
    }

    if (detailStepId === 'build') {
      return (
        <WindowBuildStep
          state={state}
          setState={setState}
          activeWindowIndex={activeWindowIndex}
          previewSurface={previewSurface}
        />
      );
    }

    if (detailStepId === 'colors') {
      return (
        <ColorSelectionStudio
          stacked
          surface={previewSurface}
          selected={state.globalConfig.frameColorOutside}
          onSurfaceChange={handleColorSurfaceChange}
          onSelect={(value) => handleDecorColorSelect('frameColorOutside', value)}
          onConfigChange={updateGlobalConfig}
          windowConfig={state.windows[activeWindowIndex] || state.windows[0]}
          globalConfig={state.globalConfig}
        />
      );
    }

    if (detailStepId === 'glass') {
      return (
        <WindowGlassStep
          state={state}
          setState={setState}
          activeWindowIndex={activeWindowIndex}
        />
      );
    }

    if (detailStepId === 'security') {
      return (
        <WindowSecurityStep
          state={state}
          setState={setState}
          activeWindowIndex={activeWindowIndex}
        />
      );
    }

    if (detailStepId === 'product-config') {
      return <NonWindowProductStep state={state} setState={setState} />;
    }

    if (detailStepId === 'customer') {
      return <CustomerStep state={state} setState={setState} />;
    }

    return null;
  }

  function renderIntroPhase() {
    return (
      <IntroStepsLayout
        steps={introSteps}
        currentStep={currentStep}
        currentStepId={currentStepId}
        state={state}
        setState={setState}
        onStepChange={setCurrentStep}
        onSetMaterial={handleMaterialChange}
        onSetSystem={handleSystemChange}
        onSetQuantity={handleQuantityChange}
        onPrimary={handleIntroPrimary}
        canProceed={canProceedFromIntro(currentStepId)}
        gateMessage={gateMessage}
        isStartingConfiguration={isStartingConfiguration}
      />
    );
  }

  function renderDetailPhase() {
    const partInfo = getPartInfo();
    const isLastStep =
      detailStep === detailSteps.length - 1 && partInfo.part === partInfo.total;

    let continueLabel = 'Weiter';
    if (submitStatus.loading) {
      continueLabel = 'Wird gesendet...';
    } else if (isLastStep) {
      continueLabel = 'Anfrage senden';
    }

    return (
      <section
        className={`page wizard-shell detail-phase-page${
          isStartingConfiguration ? ' is-starting-configuration' : ''
        }`}
      >
        <DetailConfiguratorStudio
          state={state}
          setState={setState}
          detailStep={detailStep}
          detailSteps={detailSteps}
          activeWindowIndex={activeWindowIndex}
          setActiveWindowIndex={setActiveWindowIndex}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          previewSurface={previewSurface}
          setPreviewSurface={setPreviewSurface}
          stepPart={partInfo.part}
          stepPartTotal={partInfo.total}
          stepKicker={STEP_KICKERS[detailStepId] || 'KONFIGURATION'}
          canContinue={canProceedFromDetail(detailStepId)}
          continueLabel={continueLabel}
          onBack={handleDetailBack}
          onContinue={handleDetailContinue}
          onStepChange={handleDetailStepChange}
          onExitToIntro={handleExitToIntro}
          submitStatus={submitStatus}
          colorSurface={previewSurface}
          onColorSurfaceChange={handleColorSurfaceChange}
          detailStepId={detailStepId}
          subStep={previewSubStep}
        >
          {renderDetailContent()}
          {gateMessage && <p className="error">{gateMessage}</p>}
        </DetailConfiguratorStudio>
      </section>
    );
  }

  if (isDetailPhase) {
    return (
      <>
        {isStartingConfiguration ? <ConfiguratorStartLoader /> : null}
        {renderDetailPhase()}
      </>
    );
  }

  return (
    <>
      {isStartingConfiguration ? <ConfiguratorStartLoader /> : null}
      {renderIntroPhase()}
    </>
  );
}
