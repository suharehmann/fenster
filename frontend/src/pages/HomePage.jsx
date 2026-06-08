import { useEffect } from 'react';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ColumnHeightOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  PartitionOutlined,
  RocketOutlined,
  ToolOutlined
} from '@ant-design/icons';
import BrandIcon from '@/components/ui/BrandIcon';
import { Link } from 'react-router-dom';
import useAos from '@/hooks/useAos';
import './HomePage.scss';

const FEATURE_HIGHLIGHTS = [
  {
    icon: PartitionOutlined,
    tag: 'Kernleistung',
    title: 'Kunststofffenster nach Mass',
    description: 'Profil, Einbau und Beschlag passen wir auf Ihr Projekt und Budget an.',
    to: '/leistungen'
  },
  {
    icon: EyeOutlined,
    tag: 'Digital',
    title: 'Klarer 3D Konfigurator',
    description: 'Alle technischen Entscheidungen Schritt fuer Schritt, ohne Preisstress.',
    to: '/konfigurator'
  },
  {
    icon: ToolOutlined,
    tag: 'Service',
    title: 'Lieferung & Montage',
    description: 'Regionale Partner fuer Aufmass, Einbau und Wartung.',
    to: '/kontakt'
  }
];

const PLANNING_STEPS = [
  {
    title: 'Bedarf definieren',
    description: 'Fenstertyp, Oeffnung und Anzahl im Konfigurator festlegen.'
  },
  {
    title: 'Technik waehlen',
    description: 'Profil, Verglasung, Sicherheit und Farben bestimmen.'
  },
  {
    title: 'Anfrage senden',
    description: 'Ihre Daten erfassen und einen Fachberater anfordern.'
  },
  {
    title: 'Aufmass & Umsetzung',
    description: 'Vor-Ort Termin, Feinplanung und Lieferung in einem Ablauf.'
  }
];

const TRUST_PILLS = [
  '3D Live-Vorschau',
  'Profil nach Mass',
  'Sanierung & Neubau',
  'Unverbindliche Anfrage'
];

const GALLERY_IMAGES = [
  { src: '/vision/Vision_page-0001.jpg', alt: 'Moderne Fensterfront an einem Wohnhaus' },
  { src: '/vision/Vision_page-0005.jpg', alt: 'Detail eines hochwertigen Fensterrahmens' },
  { src: '/vision/Vision_page-0009.jpg', alt: 'Architektur mit grosszuegigen Glasflaechen' },
  { src: '/vision/Vision_page-0012.jpg', alt: 'Licht und Schatten an der Fensterfront' }
];

function FeatureTile({ feature, animationDelay }) {
  const Icon = feature.icon;

  return (
    <Link
      className="home-tile"
      to={feature.to}
      data-aos="fade-up"
      data-aos-delay={animationDelay}
    >
      <span className="home-tile__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="home-tile__tag">{feature.tag}</span>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      <span className="home-tile__link">
        Mehr erfahren <ArrowRightOutlined aria-hidden />
      </span>
    </Link>
  );
}

function PlanningStep({ step, stepNumber, animationDelay }) {
  return (
    <li className="home-timeline__step" data-aos="fade-up" data-aos-delay={animationDelay}>
      <span className="home-timeline__num" aria-hidden="true">
        {stepNumber}
      </span>
      <div className="home-timeline__body">
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
    </li>
  );
}

export default function HomePage() {
  useAos();

  useEffect(() => {
    document.documentElement.classList.add('is-home');
    return () => document.documentElement.classList.remove('is-home');
  }, []);

  const [heroImage, secondaryImage, mosaicHeroImage, mosaicSecondaryImage] = GALLERY_IMAGES;

  return (
    <section className="page home">
      <header className="home-hero">
        <div
          className="home-hero__copy"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-easing="ease-out-cubic"
        >
          <p className="home-eyebrow">
            <BrandIcon size={18} />
            FensterVision · Kunststofffenster
          </p>
          <h1>
            Fenster, die wie ein <em>System</em> funktionieren
          </h1>
          <p className="home-lead">
            Konfigurieren Sie Fenster, Balkontueren und Hebeschiebeanlagen mit der technischen Tiefe
            eines Fachplaners und der Klarheit eines modernen Shops.
          </p>
          <div className="cta-row home-hero__cta">
            <Link className="btn-primary" to="/konfigurator">
              Konfigurator starten
              <ArrowRightOutlined aria-hidden />
            </Link>
            <Link className="btn-secondary" to="/kontakt">
              Beratung anfragen
            </Link>
          </div>
          <dl className="home-stats">
            <div className="home-stat" data-aos="fade-up" data-aos-delay="120">
              <dt>
                <RocketOutlined aria-hidden /> Live
              </dt>
              <dd>3D Vorschau im Konfigurator</dd>
            </div>
            <div className="home-stat" data-aos="fade-up" data-aos-delay="200">
              <dt>
                <FieldTimeOutlined aria-hidden /> 24h
              </dt>
              <dd>Antwort auf Ihre Anfrage</dd>
            </div>
            <div className="home-stat" data-aos="fade-up" data-aos-delay="280">
              <dt>
                <ColumnHeightOutlined aria-hidden /> 10+
              </dt>
              <dd>Profil- und Glasvarianten</dd>
            </div>
          </dl>
        </div>

        <div className="home-hero__visual">
          <div className="home-showcase" data-aos="fade-left" data-aos-duration="900" data-aos-delay="150">
            <span className="home-showcase__glow" aria-hidden="true" />
            <figure className="home-showcase__primary">
              <img src={heroImage.src} alt={heroImage.alt} loading="eager" decoding="async" />
              <figcaption className="home-showcase__chip">Live 3D</figcaption>
            </figure>
            <figure className="home-showcase__secondary" data-aos="zoom-in" data-aos-delay="400" data-aos-duration="700">
              <img src={secondaryImage.src} alt={secondaryImage.alt} loading="lazy" decoding="async" />
            </figure>
          </div>
        </div>
      </header>

      <div className="home-trust" aria-label="Schwerpunkte" data-aos="fade-up" data-aos-delay="100">
        {TRUST_PILLS.map((label, index) => (
          <span
            className="home-trust__pill"
            key={label}
            data-aos="fade-up"
            data-aos-delay={80 + index * 60}
          >
            {label}
          </span>
        ))}
      </div>

      <section className="home-section home-section--lined" aria-labelledby="home-features-title">
        <div className="home-section__head" data-aos="fade-up">
          <p className="home-eyebrow">Vorteile</p>
          <h2 id="home-features-title">Konfiguration mit Planungsqualitaet</h2>
          <p className="home-section__lead">
            Die wichtigsten Entscheidungen auf einen Blick, ohne ueberladene Tabellen.
          </p>
        </div>
        <div className="home-tiles">
          {FEATURE_HIGHLIGHTS.map((feature, index) => (
            <FeatureTile
              key={feature.title}
              feature={feature}
              animationDelay={100 + index * 90}
            />
          ))}
        </div>
      </section>

      <section className="home-section home-split home-section--lined" aria-labelledby="home-config-title">
        <div className="home-split__copy" data-aos="fade-right" data-aos-duration="800">
          <p className="home-eyebrow">3D Konfigurator</p>
          <h2 id="home-config-title">Alle Fenster in einer Liste. Einmal konfigurieren, mehrfach nutzen.</h2>
          <p>
            Setzen Sie globale Einstellungen, duplizieren Sie Fenster und steuern Sie Farbwelten
            zentral. Ideal fuer Projekte mit mehreren Elementen.
          </p>
          <ul className="home-checklist">
            <li data-aos="fade-up" data-aos-delay="80">
              <CheckCircleOutlined aria-hidden /> Globale Profileinstellungen und Verglasung
            </li>
            <li data-aos="fade-up" data-aos-delay="140">
              <CheckCircleOutlined aria-hidden /> Fensterliste mit Duplizierung
            </li>
            <li data-aos="fade-up" data-aos-delay="200">
              <CheckCircleOutlined aria-hidden /> Direkter Wechsel zwischen 2D und 3D
            </li>
          </ul>
          <Link className="btn-primary home-split__btn" to="/konfigurator" data-aos="fade-up" data-aos-delay="260">
            Projekt starten
            <ArrowRightOutlined aria-hidden />
          </Link>
        </div>
        <div className="home-mosaic" aria-label="Projektbeispiele" data-aos="fade-left" data-aos-duration="850">
          <figure className="home-mosaic__item home-mosaic__item--hero" data-aos="zoom-in" data-aos-delay="0">
            <img src={mosaicHeroImage.src} alt={mosaicHeroImage.alt} loading="lazy" decoding="async" />
          </figure>
          <figure className="home-mosaic__item" data-aos="zoom-in" data-aos-delay="120">
            <img src={mosaicSecondaryImage.src} alt={mosaicSecondaryImage.alt} loading="lazy" decoding="async" />
          </figure>
          <figure className="home-mosaic__item home-mosaic__item--detail" data-aos="zoom-in" data-aos-delay="220">
            <img src={secondaryImage.src} alt="Fensterdetail" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      <section className="home-section home-section--lined" aria-labelledby="home-steps-title">
        <div className="home-section__head" data-aos="fade-up">
          <p className="home-eyebrow">Ablauf</p>
          <h2 id="home-steps-title">Planung in vier Schritten</h2>
          <p className="home-section__lead">Von der Idee bis zur Umsetzung ohne Medienbruch.</p>
        </div>
        <ol className="home-timeline">
          {PLANNING_STEPS.map((step, index) => (
            <PlanningStep
              key={step.title}
              step={step}
              stepNumber={index + 1}
              animationDelay={80 + index * 100}
            />
          ))}
        </ol>
      </section>

      <section className="home-cta-band" aria-labelledby="home-cta-title" data-aos="fade-up" data-aos-duration="800">
        <div className="home-cta-band__inner">
          <div className="home-cta-band__copy" data-aos="fade-right" data-aos-delay="80">
            <p className="home-eyebrow">Loslegen</p>
            <h2 id="home-cta-title">Bereit fuer Ihr neues Fensterpaket?</h2>
            <p>Wir planen, beraten und liefern. Sie entscheiden nur noch die Details.</p>
          </div>
          <div className="cta-row home-cta-band__actions" data-aos="fade-left" data-aos-delay="160">
            <Link className="btn-primary" to="/konfigurator">
              Jetzt konfigurieren
            </Link>
            <Link className="btn-ghost" to="/leistungen">
              Leistungen ansehen
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
