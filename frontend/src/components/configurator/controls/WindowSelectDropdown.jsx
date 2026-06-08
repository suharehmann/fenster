import './WindowSelectDropdown.scss';
import { useEffect, useRef, useState } from 'react';
import { getWindowDisplayName } from '@/lib/configurator/windowLabel';
import DropdownChevron from './DropdownChevron';

export default function WindowSelectDropdown({
  windows,
  activeIndex,
  material,
  onSelect,
  formatSummary,
  formatDetail
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
  }, [activeIndex]);

  function handleToggleDropdown() {
    setIsOpen((wasOpen) => !wasOpen);
  }

  function handleSelectWindow(windowIndex) {
    onSelect(windowIndex);
    setIsOpen(false);
  }

  const activeWindow = windows[activeIndex];
  const dropdownClassName = `fv-window-select${isOpen ? ' is-open' : ''}`;

  return (
    <div className={dropdownClassName} ref={rootRef}>
      <button
        type="button"
        className="fv-window-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggleDropdown}
      >
        <span className="fv-window-select-value">
          {formatSummary(activeWindow, activeIndex, material)}
        </span>
        <DropdownChevron isOpen={isOpen} className="fv-window-select-chevron" />
      </button>
      {isOpen && (
        <ul className="fv-window-select-menu" role="listbox" aria-label="Fenster auswaehlen">
          {windows.map((windowItem, windowIndex) => {
            const isActive = windowIndex === activeIndex;

            return (
              <li key={windowItem.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`fv-window-select-option${isActive ? ' active' : ''}`}
                  onClick={() => handleSelectWindow(windowIndex)}
                >
                  <span className="fv-window-num">{windowIndex + 1}</span>
                  <span className="fv-window-item-text">
                    <strong>{getWindowDisplayName(windowItem, windowIndex)}</strong>
                    <span>{formatDetail(windowItem, material)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
