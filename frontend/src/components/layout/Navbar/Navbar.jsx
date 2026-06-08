import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import BrandIcon from '@/components/ui/BrandIcon';
import './Navbar.scss';

const NAV_LINKS = [
  { to: '/', label: 'Startseite', end: true },
  { to: '/konfigurator', label: 'Konfigurator' },
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/kontakt', label: 'Kontakt' },
  { to: '/admin', label: 'Admin' }
];

const MOBILE_NAV_MQ = '(max-width: 768px)';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_NAV_MQ).matches : false
  );
  const menuToggleRef = useRef(null);
  const location = useLocation();

  function releaseMenuFocus() {
    if (document.activeElement?.closest('#nav-mobile-menu')) {
      menuToggleRef.current?.focus({ preventScroll: true });
    }
  }

  function handleCloseMenu() {
    releaseMenuFocus();
    setIsMenuOpen(false);
  }

  useEffect(() => {
    releaseMenuFocus();
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', isMenuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [isMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_MQ);

    function handleViewportChange(event) {
      setIsMobileNav(event.matches);
      if (!event.matches) {
        setIsMenuOpen(false);
      }
    }

    setIsMobileNav(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleToggleMenu() {
    if (isMenuOpen) {
      handleCloseMenu();
      return;
    }
    setIsMenuOpen(true);
  }

  function getNavLinkClassName({ isActive }) {
    return `nav-link${isActive ? ' active' : ''}`;
  }

  const rootClassName = [
    'nav-root',
    'nav-root--vision',
    isMenuOpen ? 'is-open' : '',
    isScrolled ? 'is-scrolled' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const panelClassName = `nav-panel${isMenuOpen ? ' is-open' : ''}`;
  const menuToggleLabel = isMenuOpen ? 'Menü schließen' : 'Menü öffnen';

  return (
    <header className={rootClassName}>
      <div className="nav-inner">
        <NavLink className="brand" to="/" onClick={handleCloseMenu}>
          <span className="brand-mark" aria-hidden="true">
            <BrandIcon className="brand-logo" size={22} />
          </span>
          <span className="brand-copy">
            <span className="brand-name">FensterVision</span>
            <span className="brand-tagline">Fenster konfigurieren</span>
          </span>
        </NavLink>

        <NavLink className="nav-cta-compact" to="/konfigurator" onClick={handleCloseMenu}>
          Konfigurieren
        </NavLink>

        <button
          ref={menuToggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="nav-mobile-menu"
          aria-label={menuToggleLabel}
          onClick={handleToggleMenu}
        >
          <MenuOutlined aria-hidden />
        </button>
      </div>

      <button
        type="button"
        className="nav-backdrop"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={handleCloseMenu}
      />

      <aside
        id="nav-mobile-menu"
        className={panelClassName}
        aria-modal={isMobileNav && isMenuOpen ? true : undefined}
        {...(isMobileNav && !isMenuOpen ? { inert: '' } : {})}
      >
        <div className="nav-drawer-head">
          <div className="nav-drawer-brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandIcon className="brand-logo" size={18} />
            </span>
            <span>FensterVision</span>
          </div>
          <button
            type="button"
            className="nav-drawer-close"
            onClick={handleCloseMenu}
            aria-label="Menü schließen"
          >
            <CloseOutlined aria-hidden />
          </button>
        </div>
        <nav className="nav-links" aria-label="Hauptnavigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={getNavLinkClassName}
              onClick={handleCloseMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <NavLink to="/konfigurator" onClick={handleCloseMenu}>
            <Button type="primary" size="large">
              Konfigurator starten
            </Button>
          </NavLink>
        </div>
      </aside>
    </header>
  );
}
