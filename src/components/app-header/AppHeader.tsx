import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { KsText, KsAvatar, KsDropdownButton, KsTooltip } from '@byted-keystone/react';
import { KsIconHamburger, KsIconChevronDown, KsIconChevronRight, KsIconCheckMark, KsIconHelp } from '@fe-infra/keystone-icons-react';
import type { DemoNavOption } from '@/infra/demoRoutes';

export type NavItem = { label: string; path: string };

export interface AppHeaderProps {
  /** Brand mark — typically an <img> with the TikTok logo. */
  logo?: React.ReactNode;
  /** Product name shown next to the logo (e.g., "Ads Manager"). */
  productName?: string;
  /** Path the brand area navigates to when clicked. Defaults to "/". */
  brandHref?: string;
  /** Show an avatar pill next to the hamburger when set. */
  userInitial?: string;
  /** Called when the hamburger is clicked. */
  onMenuClick?: () => void;
  /** Primary nav items rendered in the center. Omit for headers with no nav. */
  navItems?: NavItem[];
  /** Demo routes shown in the dropdown button next to the product name. */
  demoOptions?: DemoNavOption[];
  /** Optional label for the demo route button. */
  demoLabel?: string;
  /** Composed slot for the right side — icons, pills, account dropdowns, etc. */
  trailingActions?: React.ReactNode;
}

function getCurrentDemoPath(options: DemoNavOption[], currentPath: string) {
  for (const option of options) {
    if (typeof option.value === 'string' && (option.value === '/' ? currentPath === '/' : currentPath === option.value || currentPath.startsWith(`${option.value}/`))) {
      return option.value;
    }
    if (option.children) {
      const childMatch = getCurrentDemoPath(option.children, currentPath);
      if (childMatch) return childMatch;
    }
  }

  return undefined;
}

function hasChildPath(option: DemoNavOption, currentPath: string) {
  if (!option.children) return false;
  return option.children.some((child) => typeof child.value === 'string' && (child.value === currentPath || currentPath.startsWith(`${child.value}/`)));
}

function getGroupKey(option: DemoNavOption) {
  return option.label ?? String(option.value);
}

function getInitialExpandedGroups(options: DemoNavOption[], currentPath: string) {
  return options.reduce<Record<string, boolean>>((acc, option) => {
    if (option.children?.length) {
      acc[getGroupKey(option)] = hasChildPath(option, currentPath);
    }
    return acc;
  }, {});
}

function HelpIcon({ label }: { label: string }) {
  return (
    <KsTooltip content={`Learn more about ${label}`}>
      <span
        className="flex shrink-0 cursor-pointer items-center text-neutral-lowOnSurface"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <KsIconHelp size={14} color="#87898b" />
      </span>
    </KsTooltip>
  );
}

export function AppHeader({
  logo,
  productName,
  brandHref = '/',
  userInitial,
  onMenuClick,
  navItems,
  demoOptions,
  demoLabel = 'Demo',
  trailingActions,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const demoMenuRef = useRef<HTMLDivElement | null>(null);

  const activePath = navItems?.find((item) => (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)))?.path;
  const currentDemoPath = demoOptions?.length ? getCurrentDemoPath(demoOptions, location.pathname) : undefined;
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => getInitialExpandedGroups(demoOptions ?? [], location.pathname));

  useEffect(() => {
    if (!isDemoMenuOpen) return undefined;

    function handleClickOutside(event: MouseEvent) {
      if (demoMenuRef.current && !demoMenuRef.current.contains(event.target as Node)) {
        setIsDemoMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDemoMenuOpen]);

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const option of demoOptions ?? []) {
        if (!option.children?.length) continue;
        const groupKey = getGroupKey(option);
        const shouldExpand = hasChildPath(option, location.pathname);
        if (shouldExpand && !next[groupKey]) {
          next[groupKey] = true;
          changed = true;
        } else if (!(groupKey in next)) {
          next[groupKey] = shouldExpand;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [demoOptions, location.pathname]);

  const menuItemClass = 'flex w-full items-center rounded-md px-4 py-3 text-left transition-colors';
  const renderDemoOption = (option: DemoNavOption, depth = 0) => {
    const isSelected = typeof option.value === 'string' && currentDemoPath === option.value;
    const hasChildren = Boolean(option.children?.length);
    const indentClass = depth > 0 ? 'pl-12' : '';

    if (hasChildren) {
      const groupKey = getGroupKey(option);
      const expanded = expandedGroups[groupKey] ?? false;

      return (
        <div key={option.label ?? String(option.value)} className={clsx('mt-2 first:mt-0', depth === 0 && 'border-t border-neutral-fillLow pt-3')}>
          <button
            type="button"
            className={clsx(menuItemClass, 'text-neutral-highOnSurface hover:bg-neutral-surface1', indentClass)}
            onClick={() => {
              setExpandedGroups((prev) => ({
                ...prev,
                [groupKey]: !(prev[groupKey] ?? false),
              }));
            }}
          >
            <span className="flex items-center gap-2">
              {expanded ? <KsIconChevronDown size={14} color="#121415" /> : <KsIconChevronRight size={14} color="#121415" />}
              <span>{option.label}</span>
            </span>
          </button>
          {expanded && (
            <div className="mt-1 space-y-1">
              {option.children?.map((child) => renderDemoOption(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={option.label ?? String(option.value)}
        type="button"
        className={clsx(menuItemClass, indentClass, isSelected ? 'bg-primary-surface2 text-neutral-highOnSurface' : 'text-neutral-highOnSurface hover:bg-neutral-surface1')}
        onClick={() => {
          if (option.value) {
            navigate(String(option.value));
            setIsDemoMenuOpen(false);
          }
        }}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1">
          <KsTooltip content={String(option.label)}>
            <span className="truncate">{option.label}</span>
          </KsTooltip>
          {option.showHelpIcon && <HelpIcon label={String(option.label)} />}
        </span>
        <span className="ml-3 flex shrink-0 items-center gap-2">
          {isSelected && <KsIconCheckMark size={16} color="#6d6e70" />}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-neutral-highOnSurface top-0 z-50">
      <div className="flex items-center h-[70px] px-6">
        {/* Left: menu + optional avatar + brand */}
        <div className="flex items-center">
          <button onClick={onMenuClick} className={clsx('h-9 rounded-full flex items-center cursor-pointer text-neutral-onFill bg-[#FFFFFF1F] hover:bg-[#FFFFFF33] transition-colors', userInitial ? 'pl-2.5 pr-1.5' : 'px-2.5')}>
            <KsIconHamburger size={18} />
            {userInitial && (
              <KsAvatar size="sm" className="ml-3">
                {userInitial}
              </KsAvatar>
            )}
          </button>

          {(logo || productName) && (
            <div className="ml-3 flex items-center">
              <div className="flex shrink-0 cursor-pointer items-end pb-1" onClick={() => navigate(brandHref)}>
                {logo}
                {productName && (
                  <span className="ml-1 whitespace-nowrap leading-none -mb-1.5 text-neutral-onFill">
                    <KsText variant="bodyMd" color="inherit">
                      {productName}
                    </KsText>
                  </span>
                )}
              </div>
              {demoOptions && demoOptions.length > 0 && (
                <div ref={demoMenuRef} className="relative ml-2 shrink-0">
                  <div onClick={() => setIsDemoMenuOpen((prev) => !prev)}>
                  <KsDropdownButton
                    variant="inverse"
                    size="xs"
                    open={false}
                    options={[]}
                  >
                    <span className="font-medium">{demoLabel}</span>
                  </KsDropdownButton>
                  </div>
                  {isDemoMenuOpen && (
                    <div
                      className="absolute left-0 top-full z-[80] mt-2 w-[272px] rounded-md border border-neutral-fillLow p-2 shadow-2"
                      style={{ backgroundColor: '#FFFFFF' }}
                    >
                      <div className="space-y-1">{demoOptions.map((option) => renderDemoOption(option))}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: primary nav */}
        {navItems && navItems.length > 0 && (
          <nav className="flex items-center ml-8 h-full">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className="h-full px-3 border-0 cursor-pointer bg-transparent transition-colors flex items-center">
                <span className={clsx('inline-block pt-1 pb-0.5 border-b-2', activePath === item.path ? 'border-primary-fill text-neutral-onFill' : 'border-hidden text-neutral-fill')}>
                  <KsText variant="titleMd" color="inherit">
                    {item.label}
                  </KsText>
                </span>
              </button>
            ))}
          </nav>
        )}

        {/* Right: composed slot */}
        {trailingActions && <div className="flex items-center ml-auto gap-5 text-neutral-fill">{trailingActions}</div>}
      </div>
    </div>
  );
}
