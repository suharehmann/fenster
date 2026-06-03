import {
  AppstoreOutlined,
  BorderOutlined,
  ColumnHeightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './ServicesPage.scss';

const SERVICES = [
  {
    title: 'Fenster',
    tag: 'Kernleistung',
    icon: BorderOutlined,
    description:
      'Waermedaemmende und schalloptimierte Systeme fuer Neubau und Sanierung — konfigurierbar im 3D Studio.'
  },
  {
    title: 'Haustueren',
    tag: 'Eingang',
    icon: AppstoreOutlined,
    description:
      'Sichere Eingangstueren mit individueller Gestaltung, Mehrfachverriegelung und passenden Farbdekoren.'
  },
  {
    title: 'Rollladen',
    tag: 'Schutz & Komfort',
    icon: ColumnHeightOutlined,
    description:
      'Aufsatz- und Vorsatzrollladen mit manueller oder elektrischer Steuerung fuer mehr Ruhe und Sicherheit.'
  }
];

function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="service-card">
      <span className="service-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="service-card__tag">{service.tag}</span>
      <h2>{service.title}</h2>
      <p>{service.description}</p>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <section className="page page--content page--services">
      <header className="page-hero">
        <p className="page-hero__eyebrow">FensterVision Leistungen</p>
        <h1>Alles aus einer Hand — von der Beratung bis zur Montage</h1>
        <p className="page-hero__lead">
          Wir planen, liefern und betreuen Fensterloesungen fuer Wohn- und Gewerbeprojekte. Starten Sie
          digital im Konfigurator oder kontaktieren Sie uns direkt.
        </p>
      </header>

      <div className="services-grid">
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>

      <div className="page-cta-bar">
        <p>Planen Sie Ihr Projekt interaktiv — Schritt fuer Schritt mit Live-Vorschau.</p>
        <div className="cta-row">
          <Link className="btn-primary" to="/konfigurator">
            Konfigurator starten
          </Link>
          <Link className="btn-secondary" to="/kontakt">
            Beratung anfragen
          </Link>
        </div>
      </div>
    </section>
  );
}
