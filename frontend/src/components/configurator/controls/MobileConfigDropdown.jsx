import { useEffect, useRef, useState } from 'react';
import DashedStepProgress from './DashedStepProgress';
import DropdownChevron from './DropdownChevron';

export default function MobileConfigDropdown({
  title,
  subtitle,
  stepKicker,
  stepTitle,
  steps,
  activeIndex,
  onStepSelect,
  children
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [activeIndex, title]);

  function handleToggle() {
    setIsOpen((wasOpen) => !wasOpen);
  }

  return (
    <div className={`fv-mobile-config-dropdown${isOpen ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="fv-mobile-config-dropdown__trigger"
        aria-expanded={isOpen}
        aria-controls="fv-mobile-config-dropdown-panel"
        onClick={handleToggle}
      >
        <span className="fv-mobile-config-dropdown__trigger-main">
          <span className="fv-mobile-config-dropdown__trigger-head">
            {stepKicker ? <span className="fv-mobile-config-dropdown__kicker">{stepKicker}</span> : null}
            <span className="fv-mobile-config-dropdown__step-title">{stepTitle}</span>
          </span>
          <DashedStepProgress steps={steps} activeIndex={activeIndex} />
        </span>
        <DropdownChevron isOpen={isOpen} className="fv-mobile-config-dropdown__chevron" />
      </button>

      {isOpen ? (
        <div id="fv-mobile-config-dropdown-panel" className="fv-mobile-config-dropdown__panel">
          <header className="fv-mobile-config-dropdown__head">
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </header>

          <div className="fv-mobile-config-dropdown__progress-block">
            <div className="fv-mobile-config-dropdown__progress-meta">
              {stepKicker ? <span>{stepKicker}</span> : null}
              <strong>{stepTitle}</strong>
            </div>
            <DashedStepProgress steps={steps} activeIndex={activeIndex} onSelect={onStepSelect} />
          </div>

          <div className="fv-mobile-config-dropdown__content">{children}</div>
        </div>
      ) : null}
    </div>
  );
}
