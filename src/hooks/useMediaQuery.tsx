
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // For SSR, default to matches = false initially
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    
    // Modern API - addEventListener
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Predefined breakpoints following the spec:
// Mobile: < 600px
// Tablet: 600px-1024px
// Desktop: > 1024px
export const useIsMobile = () => useMediaQuery('(max-width: 599px)');
export const useIsTablet = () => useMediaQuery('(min-width: 600px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

// Additional useful composites
export const useIsTabletOrDesktop = () => useMediaQuery('(min-width: 600px)');
export const useIsMobileOrTablet = () => useMediaQuery('(max-width: 1023px)');
