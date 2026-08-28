export type DemoNavOption = {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  children?: DemoNavOption[];
  showHelpIcon?: boolean;
  showDivider?: boolean;
}

export const DEMO_NAV_OPTIONS: DemoNavOption[] = [
  {
    label: 'Reco tab-VV',
    showDivider: false,
    children: [
      { value: '/reco-tab-v-1', label: '1-Banner' },
      { value: '/reco-tab-v-2', label: '2-Toggle' },
      { value: '/reco-tab-v-3', label: '3-Toggle+tag' },
    ],
  },
  {
    label: 'Carousel Template Editor',
    children: [
      { value: '/carousel-template-editor-6', label: '6-新布局模版区悬浮，图层和属性分开' },
      { value: '/carousel-template-editor-5', label: '5-新布局模版区悬浮' },
      { value: '/carousel-template-editor-4', label: '4-新布局模版区可折叠' },
      { value: '/carousel-template-editor-3', label: '3-新布局左侧两列设置，右侧preview' },
      { value: '/carousel-template-editor-2', label: '2-原布局background为新增逻辑' },
      { value: '/carousel-template-editor-1', label: '1-原布局background为替换逻辑' },
    ],
  },
  {
    label: 'ACA',
    children: [
      { value: '/ads/edit-2', label: '2-URL有default值' },
      { value: '/ads/edit', label: '1-URL无default值' },
    ],
  },
  { value: '/campaigns', label: 'Ads Campaign' },
  { value: '/', label: 'Ads Dashboard' },
];

function collectRoutePaths(options: DemoNavOption[]): string[] {
  return options.flatMap((option) => {
    const ownValue = typeof option.value === 'string' ? [option.value] : [];
    const childValues = option.children ? collectRoutePaths(option.children) : [];
    return [...ownValue, ...childValues];
  });
}

export const DEMO_ROUTE_PATHS = collectRoutePaths(DEMO_NAV_OPTIONS);
