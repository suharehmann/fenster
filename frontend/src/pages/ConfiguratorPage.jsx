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
import useMediaQuery from '@/hooks/useMediaQuery';
import { applyQuantity } from '@/lib/configurator/quantity';
import {
  getAvailableProfiles,
  getAvailableSystems,
  INITIAL_CONFIGURATOR_STATE,
  materialHasSystem
} from '@/utils/defaults';

const STORAGE_KEY = 'fenster-konfigurator-v2';
const ACTIVE_WINDOW_INDEX_KEY = 'fenster-konfigurator-active-window-index-v1';
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';
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

const SUB_STEPS = {
  profile: ['Material', 'Profilsystem'],
  colors: ['Farbe und Dekor aussen', 'Farbe und Dekor innen'],
  build: ['Fenstertyp', 'Ober-/Unterlicht', 'Oeffnungsart', 'Groesse'],
  glass: ['Glasart', 'Randverbund', 'Schallschutz', 'Sicherheitsglas', 'Ornamentglas'],
  security: ['Sprossen', 'Beschlag & Luefter', 'Griff & Bohrungen', 'Rahmenverbreiterung']
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

function getPartInfo(stepId, subStepIndex, isMobileViewport) {
  if (stepId === 'profile' && !isMobileViewport) {
    return { part: 1, total: 1 };
  }

  const subStepLabels = SUB_STEPS[stepId];
  if (subStepLabels) {
    return { part: subStepIndex + 1, total: subStepLabels.length };
  }

  return { part: 1, total: 1 };
}

function getSubStepTotal(detailStepId, isMobileViewport) {
  if (detailStepId === 'profile' && !isMobileViewport) {
    return 1;
  }
  return SUB_STEPS[detailStepId]?.length || 1;
}

function getColorSurface(subStepIndex) {
  return subStepIndex === 0 ? 'outside' : 'inside';
}

function isCustomerStepComplete(customer) {
  return (
    customer.fullName.trim().length >= 2 &&
    customer.address.trim().length >= 5 &&
    CUSTOMER_EMAIL_PATTERN.test(customer.email)
  );
}

function getGateMessage({ canProceed, stepId, isProfileSplitOnMobile, subStepIndex }) {
  if (canProceed) {
    return '';
  }

  if (isProfileSplitOnMobile && subStepIndex === 0) {
    return GATE_MESSAGES.profileMaterial;
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

  const isMobileViewport = useMediaQuery(MOBILE_MEDIA_QUERY);

  const introSteps = getIntroSteps(state.productType);
  const detailSteps = state.productType === 'window' ? WINDOW_DETAIL_STEPS : OTHER_DETAIL_STEPS;
  const currentStepId = introSteps[currentStep]?.id;
  const detailStepId = detailSteps[detailStep]?.id;
  const isProfileStepSplitOnMobile = detailStepId === 'profile' && isMobileViewport;
  const subStepTotal = getSubStepTotal(detailStepId, isMobileViewport);
  const colorSurface = getColorSurface(subStep);
  const isDetailPhase = phase === 'detail';
  const activeStepId = isDetailPhase ? detailStepId : currentStepId;
  const canProceed = isDetailPhase
    ? canProceedFromDetail(detailStepId)
    : canProceedFromIntro(currentStepId);
  const gateMessage = getGateMessage({
    canProceed,
    stepId: activeStepId,
    isProfileSplitOnMobile: isProfileStepSplitOnMobile,
    subStepIndex: subStep
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
    if (detailStepId === 'colors') {
      setPreviewSurface(colorSurface);
    }
  }, [detailStepId, colorSurface]);

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

  useEffect(() => {
    if (!isProfileStepSplitOnMobile || phase !== 'detail' || subStep !== 1) {
      return;
    }

    const scrollTarget = document.getElementById('fv-profile-step');
    requestAnimationFrame(() => {
      scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isProfileStepSplitOnMobile, phase, subStep]);

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

  function canProceedFromDetail(stepId, partIndex = subStep) {
    if (stepId === 'profile') {
      const hasMaterial = Boolean(state.globalConfig?.material);
      const hasProfile = Boolean(state.globalConfig?.profileSystem);

      if (!isMobileViewport) {
        return hasMaterial && hasProfile;
      }
      if (partIndex === 0) {
        return hasMaterial;
      }
      return hasProfile;
    }

    if (stepId === 'customer') {
      return isCustomerStepComplete(state.customer);
    }

    return true;
  }

  function startDetailConfiguration() {
    setState((previousState) => applyQuantity(previousState, previousState.quantity, { fillAllSlots: true }));
    setPhase('detail');
    setDetailStep(0);
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
    if (subStep > 0) {
      setSubStep((previousSubStep) => previousSubStep - 1);
      return;
    }
    if (detailStep === 0) {
      setPhase('intro');
      return;
    }
    setDetailStep((previousStep) => previousStep - 1);
    setSubStep(0);
  }

  function handleDetailStepChange(stepIndex, nextSubStep = 0) {
    setDetailStep(stepIndex);
    setSubStep(nextSubStep);
  }

  function handleDetailContinue() {
    if (subStep < subStepTotal - 1) {
      setSubStep((previousSubStep) => previousSubStep + 1);
      return;
    }
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
    setSubStep(surface === 'outside' ? 0 : 1);
    setPreviewSurface(surface);
  }

  function handleDecorColorSelect(colorKey, value) {
    updateGlobalConfig(colorKey, value);
  }

  function renderProfileStepContent() {
    if (!isMobileViewport) {
      return (
        <>
          <MaterialSelectionStudio
            selected={state.globalConfig.material}
            onSelect={handleMaterialChange}
          />
          {state.globalConfig.material && (
            <div className="fv-profile-block">
              <ProfileSelectionStudio state={state} setState={setState} />
            </div>
          )}
        </>
      );
    }

    if (subStep === 0) {
      return (
        <MaterialSelectionStudio
          selected={state.globalConfig.material}
          onSelect={handleMaterialChange}
          showNextHint
        />
      );
    }

    return (
      <div className="fv-profile-block fv-profile-block--step" id="fv-profile-step">
        <ProfileSelectionStudio state={state} setState={setState} />
      </div>
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
          subStep={subStep}
          previewSurface={previewSurface}
        />
      );
    }

    if (detailStepId === 'colors') {
      const colorConfigKey =
        colorSurface === 'outside' ? 'frameColorOutside' : 'frameColorInside';

      return (
        <ColorSelectionStudio
          surface={colorSurface}
          selected={state.globalConfig[colorConfigKey]}
          onSurfaceChange={handleColorSurfaceChange}
          onSelect={(value) => handleDecorColorSelect(colorConfigKey, value)}
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
          subStep={subStep}
        />
      );
    }

    if (detailStepId === 'security') {
      return (
        <WindowSecurityStep
          state={state}
          setState={setState}
          activeWindowIndex={activeWindowIndex}
          subStep={subStep}
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
    const partInfo = getPartInfo(detailStepId, subStep, isMobileViewport);
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
          colorSurface={colorSurface}
          onColorSurfaceChange={(surface) => setSubStep(surface === 'outside' ? 0 : 1)}
          detailStepId={detailStepId}
          subStep={subStep}
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
