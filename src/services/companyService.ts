import { OPEN_ROLES, PRESS_ASSETS } from '@/mocks/company';
import type { JobApplication, OpenRole, PartnerEnquiry } from '@/types/company';

import { ApiError, mockRequest } from './mockApi';

export function listOpenRoles(): Promise<OpenRole[]> {
  return mockRequest(() => [...OPEN_ROLES]);
}

export function applyForRole(application: JobApplication): Promise<void> {
  return mockRequest(() => {
    if (!OPEN_ROLES.some((role) => role.id === application.roleId)) {
      throw new ApiError('role_closed', 'This role has just closed. Have a look at the other open roles.');
    }
  }, 900);
}

export function sendPartnerEnquiry(_enquiry: PartnerEnquiry): Promise<void> {
  return mockRequest(() => undefined, 900);
}

export function downloadPressAsset(assetId: string): Promise<{ fileName: string }> {
  return mockRequest(() => {
    const asset = PRESS_ASSETS.find((candidate) => candidate.id === assetId);
    if (!asset) throw new ApiError('not_found', 'That file isn’t available any more.');
    return { fileName: asset.fileName };
  });
}
