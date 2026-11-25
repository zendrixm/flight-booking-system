import { describe, expect, it } from 'vitest';

import { isHttpsUrl, isInternationalPhone, networkCovers, networkError, parseNetwork } from './settingsRules';

describe('settings rules', () => {
  it('checks contact details', () => {
    expect(isInternationalPhone('+63 2 8835 2000')).toBe(true);
    expect(isInternationalPhone('8835 2000')).toBe(false);
    expect(isHttpsUrl('https://ops.vela.travel/hooks/bookings')).toBe(true);
    expect(isHttpsUrl('http://ops.vela.travel/hooks')).toBe(false);
  });

  it('parses addresses and ranges', () => {
    expect(parseNetwork('203.0.113.48')).toMatchObject({ prefixLength: 32 });
    expect(parseNetwork('203.0.113.0/24')).toMatchObject({ prefixLength: 24 });
    expect(parseNetwork('203.0.113.300')).toBeNull();
    expect(parseNetwork('10.0.0.0/4')).toBeNull();
  });

  it('knows which range covers an address', () => {
    expect(networkCovers('203.0.113.0/24', '203.0.113.48')).toBe(true);
    expect(networkCovers('198.51.100.64/27', '198.51.100.100')).toBe(false);
    expect(networkCovers('198.51.100.64/27', '198.51.100.90')).toBe(true);
  });

  it('explains why a network can’t be added', () => {
    expect(networkError('', [])).toBe('Enter an IP address or range');
    expect(networkError('203.0.113.300', [])).toMatch('Use an IPv4 address');
    expect(networkError('192.0.2.0/28', ['192.0.2.0/28'])).toBe('That address is already on the list');
    expect(networkError('198.51.100.64/27', [])).toBeNull();
  });
});
