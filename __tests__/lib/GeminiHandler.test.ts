import { executeToolCall } from '@/lib/GeminiHandler';

describe('GeminiHandler Tool Execution', () => {
  it('handles getElectionReminder', async () => {
    const result = await executeToolCall('getElectionReminder', { country: 'UK' });
    expect(result.toolType).toBe('getElectionReminder');
    expect(result.data.country).toBe('UK');
  });

  it('handles setupVoterChecklist', async () => {
    const result = await executeToolCall('setupVoterChecklist', { region: 'IN' });
    expect(result.toolType).toBe('setupVoterChecklist');
    expect(result.data.region).toBe('IN');
  });

  it('handles getPollingRoute with provided coordinates', async () => {
    const result = await executeToolCall('getPollingRoute', { latitude: 51.5074, longitude: -0.1278 });
    expect(result.toolType).toBe('getPollingRoute');
    expect(result.data.userLat).toBe(51.5074);
    expect(result.data.userLng).toBe(-0.1278);
  });

  it('handles getPollingRoute with default coordinates if invalid', async () => {
    const result = await executeToolCall('getPollingRoute', { latitude: 'invalid', longitude: 'invalid' });
    expect(result.toolType).toBe('getPollingRoute');
    // Default Washington DC coordinates
    expect(result.data.userLat).toBe(38.8977);
    expect(result.data.userLng).toBe(-77.0365);
  });

  it('handles getPollingRoute for India (IN) region', async () => {
    const result = await executeToolCall('getPollingRoute', 
      { latitude: 28.6139, longitude: 77.2090 }, 
      { countryCode: 'IN' }
    );
    expect(result.toolType).toBe('getPollingRoute');
    expect(result.data.stationName).toContain('Government Primary School');
    expect(result.data.nearest.address).toContain('Ward 4');
  });

  it('handles getPollingRoute for United Kingdom (UK) region', async () => {
    const result = await executeToolCall('getPollingRoute', 
      { latitude: 51.5074, longitude: -0.1278 }, 
      { countryCode: 'UK' }
    );
    expect(result.toolType).toBe('getPollingRoute');
    expect(result.data.stationName).toContain('Parish Hall');
  });

  it('handles unknown tools gracefully', async () => {
    const result = await executeToolCall('unknownTool', {});
    expect(result.toolType).toBe('unknownTool');
    expect(result.data.error).toBe('Unknown tool');
  });

  it('handles getLocalCandidates', async () => {
    const result = await executeToolCall('getLocalCandidates', { latitude: 38.8977, longitude: -77.0365 });
    expect(result.toolType).toBe('getLocalCandidates');
    expect(Array.isArray(result.data.candidates)).toBe(true);
  });
});
