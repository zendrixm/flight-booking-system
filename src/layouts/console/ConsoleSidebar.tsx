import clsx from 'clsx';
import { useState } from 'react';
import { NavLink } from 'react-router';

import { paths } from '@/app/paths';
import { useStaffSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Avatar, CountBadge, IconButton, Menu, type MenuEntry } from '@/components/ui';
import { initialsOf } from '@/lib/format';
import { WORKSPACES } from '@/mocks/console/staff';
import type { ConsoleNavCounts, Workspace } from '@/types/console/staff';

import { CONSOLE_NAV_GROUPS } from './consoleNavigation';
import styles from './ConsoleSidebar.module.css';
import { SignOutDialog } from './SignOutDialog';

interface ConsoleSidebarProps {
  id: string;
  /** Icons only, with names as tooltips (desktop collapsed state). */
  isRail: boolean;
  counts: ConsoleNavCounts | undefined;
}

export function ConsoleSidebar({ id, isRail, counts }: ConsoleSidebarProps) {
  const [openMenu, setOpenMenu] = useState<'workspace' | 'staff' | null>(null);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const { staff, workspace } = useStaffSession();

  const toggleMenu = (menu: 'workspace' | 'staff') => (open: boolean) => setOpenMenu(open ? menu : null);

  return (
    <aside id={id} aria-label="Console navigation" className={clsx(styles.sidebar, isRail && styles.rail)}>
      <div className={styles.groups}>
        <WorkspaceMenu
          workspace={workspace}
          isRail={isRail}
          open={openMenu === 'workspace'}
          onOpenChange={toggleMenu('workspace')}
        />

        {CONSOLE_NAV_GROUPS.map((group, groupIndex) => (
          <nav
            key={group.label}
            aria-label={group.label}
            className={clsx(styles.group, groupIndex === 0 && styles.firstGroup)}
          >
            <span className={styles.groupLabel} aria-hidden={isRail || undefined}>
              {group.label}
            </span>
            {group.items.map((item) => {
              const count = item.count && counts?.[item.count.key];
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.id === 'dashboard'}
                  className={styles.link}
                  aria-label={isRail ? item.label : undefined}
                >
                  <Icon name={item.icon} size={18} className={styles.linkIcon} />
                  <span className={styles.label}>{item.label}</span>
                  {item.count && count ? (
                    <CountBadge
                      count={count}
                      tone={item.count.isUrgent ? 'attention' : 'neutral'}
                      surface="dark"
                      label={`${count} ${item.count.label}`}
                      className={styles.badge}
                    />
                  ) : null}
                  {isRail && (
                    <span className={styles.tooltip} aria-hidden="true">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        ))}
      </div>

      {staff && (
        <div className={styles.staff}>
          <Menu
            open={openMenu === 'staff'}
            onOpenChange={toggleMenu('staff')}
            label="Account"
            side="top"
            block
            width={isRail ? 288 : 232}
            trigger={(triggerProps) => (
              <button
                {...triggerProps}
                type="button"
                className={styles.staffButton}
                aria-label={`Account menu for ${staff.fullName}`}
                title={isRail ? staff.fullName : undefined}
              >
                <Avatar
                  initials={initialsOf(staff.fullName)}
                  size={36}
                  tone="neutral"
                  className={styles.staffAvatar}
                />
                <span className={clsx(styles.label, styles.staffText)}>
                  <span className={styles.staffName}>{staff.fullName}</span>
                  <span className={styles.staffTitle}>{staff.jobTitle}</span>
                </span>
              </button>
            )}
            intro={
              <span className={styles.staffCard}>
                <span className={styles.staffCardName}>{staff.fullName}</span>
                <span className={styles.staffCardEmail}>{staff.email}</span>
                <span className={styles.staffRole}>
                  {staff.jobTitle} · {staff.accessLevel}
                </span>
              </span>
            }
            items={staffMenuItems(() => setIsSignOutOpen(true))}
          />
          {!isRail && (
            <IconButton
              icon="logOut"
              label="Sign out"
              variant="ghostInverse"
              shape="square"
              aria-haspopup="dialog"
              className={styles.signOut}
              onClick={() => setIsSignOutOpen(true)}
            />
          )}
        </div>
      )}

      <SignOutDialog open={isSignOutOpen} onClose={() => setIsSignOutOpen(false)} />
    </aside>
  );
}

function staffMenuItems(onSignOut: () => void): MenuEntry[] {
  return [
    { kind: 'separator', id: 'top' },
    {
      id: 'security',
      label: 'Profile and security',
      icon: 'user',
      to: paths.console.settingsTab('security'),
    },
    {
      id: 'notifications',
      label: 'Notification settings',
      icon: 'bell',
      to: paths.console.settingsTab('notifications'),
    },
    { id: 'website', label: 'Open the Vela website', icon: 'arrowUpRight', to: paths.home },
    { kind: 'separator', id: 'bottom' },
    { id: 'sign-out', label: 'Sign out', icon: 'logOut', tone: 'danger', onSelect: onSignOut },
  ];
}

interface WorkspaceMenuProps {
  workspace: Workspace;
  isRail: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function WorkspaceMenu({ workspace, isRail, open, onOpenChange }: WorkspaceMenuProps) {
  const { switchWorkspace } = useStaffSession();
  const items: MenuEntry[] = [
    ...WORKSPACES.map((option): MenuEntry => ({
      id: option.code,
      label: option.name,
      description: option.description,
      checked: option.code === workspace.code,
      onSelect: () => switchWorkspace(option.code),
    })),
    { kind: 'separator', id: 'separator' },
    {
      id: 'settings',
      label: 'Workspace settings',
      icon: 'sliders',
      to: paths.console.settingsTab('general'),
    },
  ];

  return (
    <Menu
      open={open}
      onOpenChange={onOpenChange}
      label="Switch workspace"
      header="Workspaces"
      block
      width={isRail ? 288 : 232}
      items={items}
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          className={styles.workspaceButton}
          aria-label={`Workspace: ${workspace.name}. Switch workspace`}
          title={isRail ? workspace.name : undefined}
        >
          <span className={styles.workspaceName}>
            <span className={styles.workspaceCode} aria-hidden="true">
              {workspace.code}
            </span>
            <span className={styles.label}>{workspace.name}</span>
          </span>
          <Icon name="chevronDown" size={16} className={styles.chevron} />
        </button>
      )}
    />
  );
}
