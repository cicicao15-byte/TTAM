import { useState } from 'react';
import type { GlobalAlertItem } from '@byted-keystone/core';
import { KsBadge, KsMultipleGlobalAlert } from '@byted-keystone/react';
import { KsIconSearch, KsIconHelp, KsIconBell } from '@fe-infra/keystone-icons-react';
import { AppHeader, HeaderIconButton, HeaderAccountDropdown } from '@/components/app-header';
import tiktokLogo from '@/assets/tiktok-logo.svg';
import { DEMO_NAV_OPTIONS } from '@/infra/demoRoutes';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Campaigns', path: '/campaigns' },
  { label: 'Tools', path: '/tools' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'GMV Max', path: '/gmv-max' },
];

const ALERT_ITEMS: GlobalAlertItem[] = [
  {
    key: '1',
    variant: 'warning',
    title: '',
    content: 'Your account has run out of balance. To keep your auction ads running, add balance.',
    actions: undefined,
  },
  {
    key: '2',
    variant: 'info',
    title: '',
    content: 'New campaign optimization features are now available. Try them out today.',
    actions: undefined,
  },
  {
    key: '3',
    variant: 'info',
    title: '',
    content: 'Your payment method will expire soon. Update your billing information.',
    actions: undefined,
  },
];

function AlertBar() {
  const [items, setItems] = useState(ALERT_ITEMS);

  if (items.length === 0) return null;

  return (
    <div className="bg-[#121415] px-3">
      <KsMultipleGlobalAlert
        items={items}
        defaultOpen
        closeable
        showIcon
        onItemClose={(_item, index) => {
          setItems((prev) => prev.filter((_, i) => i !== index));
        }}
      />
    </div>
  );
}

export function Header() {
  return (
    <header>
      <AppHeader
        logo={<img src={tiktokLogo} alt="TikTok" width={84} className="select-none" draggable={false} />}
        productName="Ads Manager"
        brandHref="/"
        userInitial="J"
        navItems={NAV_ITEMS}
        demoOptions={DEMO_NAV_OPTIONS}
        trailingActions={
          <>
            <HeaderIconButton icon={<KsIconSearch size={24} />} ariaLabel="Search" />
            <HeaderIconButton icon={<KsIconHelp size={24} />} ariaLabel="Help" />
            <KsBadge dot variant="error">
              <HeaderIconButton icon={<KsIconBell size={24} />} ariaLabel="Notifications" />
            </KsBadge>
            <HeaderAccountDropdown label="TTAM Test Test" />
          </>
        }
      />
      <AlertBar />
    </header>
  );
}
