import { describe, expect, it } from 'vitest';

import { meetsPasswordRules, passwordStrength } from './password';
import { safeRedirect } from './safeRedirect';
import { editDistance, normalizeSpaces } from './text';
import {
  detectCardBrand,
  isValidBookingReference,
  isValidCardNumber,
  isValidEmail,
  isValidPhilippineMobile,
  isValidPhilippinePassport,
  passesLuhnCheck,
} from './validation';

describe('validators', () => {
  it('accepts real email addresses only', () => {
    expect(isValidEmail('andrea.reyes@example.com')).toBe(true);
    expect(isValidEmail('support@vela')).toBe(false);
  });

  it('checks booking references', () => {
    expect(isValidBookingReference('vl7q2k')).toBe(true);
    expect(isValidBookingReference('VL7Q2')).toBe(false);
  });

  it('accepts Philippine mobiles in any common format', () => {
    expect(isValidPhilippineMobile('0917 555 0123')).toBe(true);
    expect(isValidPhilippineMobile('+63 917 555 0123')).toBe(true);
    expect(isValidPhilippineMobile('8835 2000')).toBe(false);
  });

  it('checks Philippine passports', () => {
    expect(isValidPhilippinePassport('P4831207A')).toBe(true);
    expect(isValidPhilippinePassport('P483120A')).toBe(false);
  });
});

describe('cards', () => {
  it('runs the Luhn check', () => {
    expect(passesLuhnCheck('4242 4242 4242 4242')).toBe(true);
    expect(passesLuhnCheck('4242 4242 4242 4241')).toBe(false);
  });

  it('detects the brand from the first digits', () => {
    expect(detectCardBrand('4111')).toBe('Visa');
    expect(detectCardBrand('5500')).toBe('Mastercard');
    expect(detectCardBrand('3782')).toBe('Amex');
    expect(detectCardBrand('3530')).toBe('JCB');
    expect(detectCardBrand('9999')).toBeNull();
  });

  it('expects 15 digits for Amex and 16 otherwise', () => {
    expect(isValidCardNumber('3782 822463 10005')).toBe(true);
    expect(isValidCardNumber('4242 4242 4242 4242')).toBe(true);
    expect(isValidCardNumber('4242 4242 4242')).toBe(false);
  });
});

describe('passwords', () => {
  it('needs length, mixed case and a number', () => {
    expect(meetsPasswordRules('Manila2026')).toBe(true);
    expect(meetsPasswordRules('manila2026')).toBe(false);
    expect(passwordStrength('Manila2026!')).toBe(4);
  });
});

describe('text helpers', () => {
  it('measures how far two spellings are apart', () => {
    expect(editDistance('Reyes', 'reyez')).toBe(1);
    expect(editDistance('Cruz', 'Cruz')).toBe(0);
  });

  it('collapses spaces', () => {
    expect(normalizeSpaces('  Andrea   Lim ')).toBe('Andrea Lim');
  });
});

describe('safeRedirect', () => {
  it('only allows paths on this site', () => {
    expect(safeRedirect('/trips', '/')).toBe('/trips');
    expect(safeRedirect('https://evil.example', '/')).toBe('/');
    expect(safeRedirect('//evil.example', '/')).toBe('/');
    expect(safeRedirect(null, '/account')).toBe('/account');
  });
});
