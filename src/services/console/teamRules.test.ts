import { describe, expect, it } from 'vitest';

import { INITIAL_PERMISSIONS } from '@/mocks/console/team';
import type { TeamMember } from '@/types/console/team';

import { countPermissionChanges, inviteEmailError } from './teamRules';

const team = [
  { fullName: 'Ian Cruz', email: 'ian.cruz@vela.travel', role: 'Admin' },
] as unknown as TeamMember[];

describe('team rules', () => {
  it('needs a new @vela.travel address', () => {
    expect(inviteEmailError('', team)).toBe('Enter their work email.');
    expect(inviteEmailError('mika@gmail.com', team)).toMatch('Use a @vela.travel address');
    expect(inviteEmailError('IAN.CRUZ@vela.travel', team)).toMatch('Ian Cruz already has access as Admin');
    expect(inviteEmailError('mika.tan@vela.travel', team)).toBeNull();
  });

  it('counts changed permission switches', () => {
    const changed = structuredClone(INITIAL_PERMISSIONS);
    const [firstCapability] = Object.keys(changed.support);
    changed.support[firstCapability] = !changed.support[firstCapability];
    expect(countPermissionChanges(INITIAL_PERMISSIONS, INITIAL_PERMISSIONS)).toBe(0);
    expect(countPermissionChanges(INITIAL_PERMISSIONS, changed)).toBe(1);
  });
});
