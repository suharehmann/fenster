import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

let initialized = false;

export default function useAos() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!initialized) {
      AOS.init({
        duration: 720,
        easing: 'ease-out-cubic',
        once: true,
        offset: 56,
        anchorPlacement: 'top-bottom',
        disable: prefersReducedMotion
      });
      initialized = true;
    }

    AOS.refresh();

    const onResize = () => AOS.refresh();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
}
