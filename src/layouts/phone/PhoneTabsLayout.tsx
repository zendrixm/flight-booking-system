import { NavLink, Outlet } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';

import { PHONE_TABS } from './phoneNavigation';
import styles from './PhoneTabsLayout.module.css';

/** The four main screens of the phone app, with the tab bar pinned to the bottom. */
export function PhoneTabsLayout() {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <nav aria-label="Main" className={styles.tabBar} data-bottom-bar="">
        {PHONE_TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === paths.phone.search} className={styles.tab}>
            <Icon name={tab.icon} size={22} />
            <span className={styles.tabLabel}>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
