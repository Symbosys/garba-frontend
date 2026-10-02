import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures whenever navigating to any screen or route, the page automatically scrolls to the top.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Immediate scroll to top on any route/screen transition
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Also reset any internal scrollable main content containers
    const scrollContainers = document.querySelectorAll('main, [data-scroll-container="true"]');
    scrollContainers.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname, search]);

  return null;
};
