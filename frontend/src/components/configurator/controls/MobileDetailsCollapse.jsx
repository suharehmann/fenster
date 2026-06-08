import { useState } from 'react';
import DropdownChevron from './DropdownChevron';

export default function MobileDetailsCollapse({ rows }) {
  const [isOpen, setIsOpen] = useState(false);
  const filledCount = rows.filter((row) => !row.pending && row.value && row.value !== '—').length;

  return (
    <div className={`fv-mobile-details-collapse${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="fv-mobile-details-collapse__trigger"
        aria-expanded={isOpen}
        aria-controls="fv-mobile-details-collapse-panel"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className="fv-mobile-details-collapse__trigger-text">
          <strong>Details (aktuell)</strong>
          <span className="fv-mobile-details-collapse__meta">
            {filledCount} von {rows.length} ausgewaehlt
          </span>
        </span>
        <DropdownChevron isOpen={isOpen} className="fv-mobile-details-collapse__chevron" />
      </button>

      {isOpen ? (
        <div id="fv-mobile-details-collapse-panel" className="fv-mobile-details-collapse__panel">
          <ul className="fv-details-list">
            {rows.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <span className={row.pending ? 'pending' : ''}>{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
