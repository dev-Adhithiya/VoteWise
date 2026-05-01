import {
  normalizeCountryCode,
  getRegionRequirements,
  formatLocation,
  getUserLocation,
} from '@/lib/geolocation';

describe('Geolocation Utilities', () => {
  describe('normalizeCountryCode', () => {
    it('normalizes common US variants', () => {
      expect(normalizeCountryCode('US')).toBe('US');
      expect(normalizeCountryCode('USA')).toBe('US');
      expect(normalizeCountryCode('us')).toBe('US');
    });

    it('normalizes common UK variants', () => {
      expect(normalizeCountryCode('GB')).toBe('UK');
      expect(normalizeCountryCode('UK')).toBe('UK');
      expect(normalizeCountryCode('gb')).toBe('UK');
    });

    it('normalizes common IN variants', () => {
      expect(normalizeCountryCode('IN')).toBe('IN');
      expect(normalizeCountryCode('IND')).toBe('IN');
      expect(normalizeCountryCode('ind')).toBe('IN');
    });

    it('returns UNKNOWN for unsupported codes', () => {
      expect(normalizeCountryCode('FR')).toBe('UNKNOWN');
      expect(normalizeCountryCode('DE')).toBe('UNKNOWN');
      expect(normalizeCountryCode('')).toBe('UNKNOWN');
    });
  });

  describe('getRegionRequirements', () => {
    it('returns US requirements', () => {
      const reqs = getRegionRequirements('US');
      expect(reqs.idTypes).toContain('Driver\'s License');
    });

    it('returns UK requirements', () => {
      const reqs = getRegionRequirements('UK');
      expect(reqs.idTypes).toContain('Voter Authority Certificate (provided by local council)');
    });

    it('returns UNKNOWN requirements for unsupported regions', () => {
      const reqs = getRegionRequirements('UNKNOWN');
      expect(reqs.idTypes).toContain('Valid Photo ID');
    });
  });

  describe('formatLocation', () => {
    it('formats with city and country', () => {
      expect(formatLocation({
        latitude: 0,
        longitude: 0,
        country: 'United States',
        countryCode: 'US',
        city: 'New York',
        timestamp: 0,
      })).toBe('New York, United States');
    });

    it('formats with only country if city is missing', () => {
      expect(formatLocation({
        latitude: 0,
        longitude: 0,
        country: 'United Kingdom',
        countryCode: 'UK',
        timestamp: 0,
      })).toBe('United Kingdom');
    });
  });

  describe('getUserLocation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('falls back to default UNKNOWN if both browser and IP geolocation fail', async () => {
      // Mock browser geolocation missing
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      // Mock fetch failure for IP geolocation
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const location = await getUserLocation();

      expect(location.countryCode).toBe('UNKNOWN');
      expect(location.country).toBe('Unknown');
      expect(location.latitude).toBe(0);
      expect(location.longitude).toBe(0);
    });

    it('uses browser geolocation if available', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: jest.fn().mockImplementation((success) => 
            success({ coords: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 } })
          ),
        },
        configurable: true,
      });

      // Mock reverse geocode fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: { country: 'United States', country_code: 'us' } }),
      });

      const location = await getUserLocation();

      expect(location.countryCode).toBe('US');
      expect(location.country).toBe('United States');
      expect(location.latitude).toBe(40.7128);
      expect(location.longitude).toBe(-74.0060);
    });
  });
});
