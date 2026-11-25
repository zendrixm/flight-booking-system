/**
 * Only same-site paths are allowed as a post-sign-in destination, so a crafted link can't
 * send someone to another site after they sign in.
 */
export function safeRedirect(target: string | null, fallback: string): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
    return fallback;
  }
  return target;
}
