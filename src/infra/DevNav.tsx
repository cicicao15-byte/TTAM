import { useNavigate, useLocation } from 'react-router-dom';
import { KsDropdownMenu, KsIconButton } from '@byted-keystone/react';
import { KsIconAllApplication } from '@fe-infra/keystone-icons-react';

const NAV_OPTIONS = [
  { value: '/', label: 'Ads Dashboard' },
  { value: '/campaigns', label: 'Ads Campaign' },
  { value: '/ads/edit', label: 'Ads Edit-1' },
  { value: '/ads/edit-2', label: 'Ads Edit-2' },
  { value: '/carousel-template-editor-1', label: 'Carousel Template Editor - 1' },
  { value: '/carousel-template-editor-2', label: 'Carousel Template Editor - 2' },
  { value: '/carousel-template-editor-3', label: 'Carousel Template Editor - 3' },
  { value: '/carousel-template-editor-4', label: 'Carousel Template Editor - 4' },
  { value: '/carousel-template-editor-5', label: 'Carousel Template Editor - 5' },
  { value: '/carousel-template-editor-6', label: 'Carousel Template Editor - 6' },
];

export default function DevNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-5 left-5 z-[100000]">
      <KsDropdownMenu
        selectable
        defaultOpen={false}
        placement="top-start"
        options={NAV_OPTIONS}
        value={[location.pathname]}
        onChange={(values: (string | number)[]) => {
          const path = values[0];
          if (path) navigate(String(path));
        }}
      >
        <KsIconButton
          variant="filled"
          size="lg"
          style={
            {
              '--ks-comp-button-border-radius': '9999px',
              borderRadius: '100%',
              boxShadow: 'var(--ks-elevation-shadow-level1, 0 2px 8px 0 rgba(0, 0, 0, 0.12))',
            } as React.CSSProperties
          }
        >
          <KsIconAllApplication />
        </KsIconButton>
      </KsDropdownMenu>
    </div>
  );
}
