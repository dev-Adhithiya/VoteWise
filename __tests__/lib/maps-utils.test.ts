import { calculateDistance, getNavigationUrl } from '@/lib/maps-utils';

describe('Maps Utilities', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two points correctly (Washington DC)', () => {
      // White House to Capitol Hill is roughly 1.5 - 2 miles
      const whiteHouse = { lat: 38.8977, lng: -77.0365 };
      const capitol = { lat: 38.8899, lng: -77.0091 };
      
      const distance = calculateDistance(
        whiteHouse.lat, 
        whiteHouse.lng, 
        capitol.lat, 
        capitol.lng
      );
      
      // Expected: ~1.56 miles
      expect(distance).toBeGreaterThan(1.5);
      expect(distance).toBeLessThan(1.7);
    });

    it('returns 0 for the same point', () => {
      expect(calculateDistance(10, 10, 10, 10)).toBe(0);
    });
  });

  describe('getNavigationUrl', () => {
    it('generates a valid Google Maps URL with coordinates', () => {
      const url = getNavigationUrl(38.8, -77.0, 38.9, -77.1);
      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain('origin=38.8,-77');
      expect(url).toContain('destination=38.9,-77.1');
    });

    it('generates a valid Google Maps URL with address', () => {
      const url = getNavigationUrl(38.8, -77.0, 38.9, -77.1, '123 Democracy Ave');
      expect(url).toContain('destination=123%20Democracy%20Ave');
    });
  });
});
