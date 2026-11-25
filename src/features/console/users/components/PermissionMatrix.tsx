import { Icon } from '@/components/icons';
import { Table } from '@/components/ui';
import type {
  Capability,
  PermissionMatrix as PermissionMatrixData,
  PermissionRole,
  PermissionRoleId,
} from '@/types/console/team';

import styles from './PermissionMatrix.module.css';

interface PermissionMatrixProps {
  capabilities: readonly Capability[];
  roles: readonly PermissionRole[];
  permissions: PermissionMatrixData;
  onToggle: (roleId: PermissionRoleId, capabilityId: string) => void;
}

/** Capabilities down, roles across. Fixed system roles show their permissions but can't be edited. */
export function PermissionMatrix({ capabilities, roles, permissions, onToggle }: PermissionMatrixProps) {
  return (
    <Table minWidth={820} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Capability</th>
          {roles.map((role) => (
            <th key={role.id} scope="col" className={styles.roleHeading}>
              <span className={styles.roleName}>
                {role.name}
                {role.isFixed && (
                  <>
                    <Icon name="lock" size={12} className={styles.lock} />
                    <span className="visually-hidden">(fixed)</span>
                  </>
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {capabilities.map((capability) => (
          <tr key={capability.id}>
            <th scope="row" className={styles.capability}>
              <span className={styles.capabilityText}>
                {capability.label}
                {capability.description && (
                  <span className={styles.capabilityDescription}>{capability.description}</span>
                )}
              </span>
            </th>
            {roles.map((role) => (
              <td key={role.id} className={styles.cell}>
                <label className={styles.box}>
                  <input
                    type="checkbox"
                    className={styles.input}
                    aria-label={`${role.name}: ${capability.label}`}
                    checked={permissions[role.id][capability.id]}
                    disabled={role.isFixed}
                    onChange={() => onToggle(role.id, capability.id)}
                  />
                  <span aria-hidden="true" className={styles.mark}>
                    <Icon name="check" size={14} strokeWidth={2.6} />
                  </span>
                </label>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

/** Key for the matrix marks, shown beside the section title. */
export function PermissionLegend() {
  return (
    <span className={styles.legend}>
      <span className={styles.legendItem}>
        <span className={styles.legendAllowed} />
        Allowed
      </span>
      <span className={styles.legendItem}>
        <span className={styles.legendNotAllowed} />
        Not allowed
      </span>
      <span className={styles.legendItem}>
        <span className={styles.legendFixed} />
        Fixed
      </span>
    </span>
  );
}
