/**
 * Workspace setting rules shared by the settings form and the server, so anything the form
 * accepts is also accepted on save.
 */
export const MIN_PAYOUT = 1_000;
export const MAX_AUTO_APPROVE = 50_000;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INTERNATIONAL_PHONE = /^\+\d[\d\s()-]{6,}$/;
const HTTPS_URL = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i;
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?:\/(\d{1,2}))?$/;

export const isValidEmail = (value: string) => EMAIL.test(value.trim());
export const isInternationalPhone = (value: string) => INTERNATIONAL_PHONE.test(value.trim());
export const isHttpsUrl = (value: string) => HTTPS_URL.test(value.trim());

interface Network {
  /** The address as a 32-bit number. */
  address: number;
  prefixLength: number;
}

/** An IPv4 address or CIDR range (/8 to /32), or null when it isn't one. */
export function parseNetwork(text: string): Network | null {
  const match = IPV4.exec(text.trim());
  if (!match) return null;
  const octets = match.slice(1, 5).map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  const prefixLength = match[5] === undefined ? 32 : Number(match[5]);
  if (prefixLength < 8 || prefixLength > 32) return null;
  const address = octets.reduce((total, octet) => total * 256 + octet, 0);
  return { address, prefixLength };
}

/** Whether `ipAddress` falls inside the `cidr` range. */
export function networkCovers(cidr: string, ipAddress: string): boolean {
  const range = parseNetwork(cidr);
  const ip = parseNetwork(ipAddress);
  if (!range || !ip) return false;
  const blockSize = 2 ** (32 - range.prefixLength);
  return Math.floor(range.address / blockSize) === Math.floor(ip.address / blockSize);
}

/** Why a network can't be added to the allowlist, or null. */
export function networkError(text: string, existing: readonly string[]): string | null {
  const value = text.trim();
  if (!value) return 'Enter an IP address or range';
  if (!parseNetwork(value)) {
    return 'Use an IPv4 address like 203.0.113.10, or a range like 203.0.113.0/24 (/8 to /32)';
  }
  if (existing.includes(value)) return 'That address is already on the list';
  return null;
}
