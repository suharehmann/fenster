import { Input } from 'antd';
import {
  HANDLES,
  OPENING_TYPES,
  PROFILE_SYSTEMS,
  WINDOW_TYPES,
  getAvailableSystems
} from '@/utils/defaults';
import { setGroupField } from '@/lib/configurator/state';
import { computeTotal, formatPrice } from '@/lib/configurator/pricing';
import { getWindowDisplayName } from '@/lib/configurator/windowLabel';
import ConfigSection from '../shared/ConfigSection';
import { TextArea } from './shared/stepUtils';

function optionLabel(options, id) {
  return options.find((item) => item.id === id)?.label || id;
}

function formatMm(value, fallback) {
  const n = Number(value);
  const safe = Number.isFinite(n) && n >= 100 && n <= 15000 ? n : Number(fallback);
  return safe.toLocaleString('de-DE');
}

function SummarySpec({ label, value }) {
  return (
    <div className="fv-summary-spec">
      <span className="fv-summary-spec__label">{label}</span>
      <span className="fv-summary-spec__value">{value}</span>
    </div>
  );
}

export default function ReviewSummaryStep({ state, setState }) {
  const c = state.customer;
  const g = state.globalConfig;
  const setCustomer = (field, value) => setGroupField(setState, 'customer', field, value);
  const systemLabel = getAvailableSystems(g.material).find((s) => s.id === g.manufacturer)?.label;
  const totalPrice = computeTotal(state);

  const colorSummary =
    g.frameColorOutside === g.frameColorInside
      ? `${g.frameColorOutside} innen und aussen`
      : `${g.frameColorOutside} aussen, ${g.frameColorInside} innen`;

  const windowSummaries = state.windows.map((window, index) => {
    const dims = `${formatMm(window.width, 1200)} × ${formatMm(window.height, 1400)} mm`;
    const windowPrice = formatPrice(computeTotal({ ...state, windows: [window] }));

    return {
      index: index + 1,
      title: getWindowDisplayName(window, index),
      type: optionLabel(WINDOW_TYPES, window.windowType),
      opening: optionLabel(OPENING_TYPES, window.openingType),
      glazing: window.glassType || '—',
      handle: optionLabel(HANDLES, window.handle),
      dims,
      price: windowPrice
    };
  });

  return (
    <div className="studio-inquiry fv-review-summary">
      <ConfigSection title="Konfiguration" showDetailsLink={false}>
        <div className="fv-summary-specs">
          <SummarySpec label="Material" value={g.material || '—'} />
          {systemLabel ? <SummarySpec label="System" value={systemLabel} /> : null}
          <SummarySpec label="Profil" value={optionLabel(PROFILE_SYSTEMS, g.profileSystem)} />
          <SummarySpec label="Farben" value={colorSummary} />
        </div>

        <div className="fv-summary-windows">
          {windowSummaries.map((summary) => (
            <article key={summary.title} className="fv-summary-window-card">
              <header className="fv-summary-window-card__head">
                <span className="fv-summary-window-card__num" aria-hidden="true">
                  {summary.index}
                </span>
                <h4>{summary.title}</h4>
                <span className="fv-summary-window-card__price">{summary.price}</span>
              </header>
              <ul className="fv-summary-window-card__details">
                <li>
                  <span>Typ</span>
                  <strong>
                    {summary.type} · {summary.opening}
                  </strong>
                </li>
                <li>
                  <span>Verglasung</span>
                  <strong>{summary.glazing}</strong>
                </li>
                <li>
                  <span>Griff</span>
                  <strong>{summary.handle}</strong>
                </li>
                <li>
                  <span>Masse</span>
                  <strong>{summary.dims}</strong>
                </li>
              </ul>
            </article>
          ))}
        </div>

        <div className="fv-summary-total">
          <span>Geschaetzter Gesamtpreis</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
      </ConfigSection>

      <div className="fv-review-summary__forms">
        <ConfigSection title="Kontaktdaten" showDetailsLink={false}>
          <div className="studio-inquiry-grid">
            <label className="studio-field">
              <span>Vollstaendiger Name *</span>
              <Input
                required
                autoComplete="name"
                placeholder="Max Mustermann"
                value={c.fullName}
                onChange={(e) => setCustomer('fullName', e.target.value)}
              />
            </label>
            <label className="studio-field">
              <span>E-Mail *</span>
              <Input
                required
                type="email"
                autoComplete="email"
                placeholder="name@beispiel.de"
                value={c.email}
                onChange={(e) => setCustomer('email', e.target.value)}
              />
            </label>
            <label className="studio-field studio-field-wide">
              <span>Adresse *</span>
              <Input
                required
                autoComplete="street-address"
                placeholder="Strasse, PLZ Ort"
                value={c.address}
                onChange={(e) => setCustomer('address', e.target.value)}
              />
            </label>
            <label className="studio-field">
              <span>Telefon</span>
              <Input
                type="tel"
                autoComplete="tel"
                placeholder="+49 ..."
                value={c.phone}
                onChange={(e) => setCustomer('phone', e.target.value)}
              />
            </label>
          </div>
        </ConfigSection>

        <ConfigSection title="Ihre Nachricht" showDetailsLink={false}>
          <label className="studio-field studio-field-wide">
            <span>Anmerkungen (optional)</span>
            <TextArea
              rows={4}
              placeholder="Montagewunsch, Sonderwuensche, Fragen ..."
              value={c.notes}
              onChange={(e) => setCustomer('notes', e.target.value)}
            />
          </label>
        </ConfigSection>
      </div>

      <p className="studio-inquiry-note">
        Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung der Anfrage verwenden. Pflichtfelder
        sind mit * markiert.
      </p>
    </div>
  );
}
