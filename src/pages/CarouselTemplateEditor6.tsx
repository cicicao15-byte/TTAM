import { useMemo, useRef, useState, type ReactNode } from 'react';
import { KsTabs, KsTabItem } from '@byted-keystone/react';
import { Header } from '@/layouts/Header';
import { EditorToolIcon } from '@/components/carousel/EditorToolIcon';

type ToolKey = 'template' | 'background' | 'text' | 'sticker';
type TemplateTabKey = 'recommended' | 'saved';
type StaticDraggableLayerKey = 'decorationBand' | 'product' | 'decorationPattern' | 'decorationArrow';
type LayerKey =
  | 'backgroundPrimary'
  | 'backgroundSecondary'
  | 'decorationBand'
  | 'product'
  | 'decorationPattern'
  | 'textHeadline'
  | 'textCaption'
  | 'decorationArrow';

interface TemplateCard {
  id: string;
  label: string;
  accent: string;
  bg: string;
  title: string;
  price: string;
  badge?: string;
}

interface TemplateGroup {
  title: string;
  items: TemplateCard[];
}

interface PreviewFrame {
  id: string;
  title: string;
  bg: string;
  accent: string;
  product: string;
  marble: string;
  band: string;
  scene: string;
}

interface BackgroundAsset {
  id: string;
  label: string;
  fill: string;
  thumbnail: string;
}

interface ProductOption {
  id: string;
  label: string;
  kind: 'jar' | 'bottle' | 'mug' | 'bowl';
  scene: string;
  vessel: string;
  secondary: string;
  accent: string;
}

interface TextPreset {
  id: string;
  label: string;
  className: string;
  preview: string;
}

interface TextLayerInstance {
  id: string;
  presetId: string;
  label: string;
  preview: string;
  top: number;
  left: number;
  dynamicTextEnabled: boolean;
  fontFamily: string;
  fontSize: string;
  align: TextAlignMode;
  color: string;
  order: number;
}

interface StickerPreset {
  id: string;
  label: string;
  group: 'uploaded' | 'seasonal' | 'selling' | 'effect';
  kind: 'image' | 'logo' | 'ribbon' | 'badge' | 'text' | 'arrow';
  text?: string;
  accent: string;
  secondary?: string;
  bg?: string;
}

interface StickerLayerInstance {
  id: string;
  presetId: string;
  label: string;
  top: number;
  left: number;
  order: number;
}

interface BackgroundLayerInstance {
  id: string;
  assetId: string;
  label: string;
  order: number;
}

interface EditorSnapshot {
  activeTool: ToolKey;
  activeLayerKey: LayerKey;
  selectedTemplateId: string;
  selectedProductId: string;
  baseBackgroundId: string;
  selectedBackgroundId: string;
  selectedTextPresetId: string | null;
  textLayers: TextLayerInstance[];
  activeTextLayerId: string | null;
  backgroundLayers: BackgroundLayerInstance[];
  activeBackgroundLayerId: string | null;
  stickerLayers: StickerLayerInstance[];
  activeStickerLayerId: string | null;
  nextOverlayOrder: number;
  removeBackground: boolean;
  safeZone: boolean;
  textPanelOpen: {
    typography: boolean;
    color: boolean;
    styles: boolean;
  };
  expandedLayers: Record<LayerKey, boolean>;
  staticLayerOrders: Record<StaticDraggableLayerKey, number>;
}

interface DraggableLayerDescriptor {
  id: string;
  kind: 'text' | 'sticker' | 'static';
  order: number;
  label: string;
  textLayer?: TextLayerInstance;
  stickerLayer?: StickerLayerInstance;
  staticKey?: StaticDraggableLayerKey;
}

interface DropIndicatorState {
  layerId: string;
  position: 'before' | 'after';
}

type PropertySnapshot =
  | {
      kind: 'text';
      layerId: string;
      layer: TextLayerInstance;
    }
  | {
      kind: 'background-layer';
      layerId: string;
      layer: BackgroundLayerInstance;
    }
  | {
      kind: 'background-base';
      assetId: string;
    };

const LIST_START_DROP_ID = '__list_start__';
const BACKGROUND_LIST_START_DROP_ID = '__background_list_start__';
const BACKGROUND_LIST_END_DROP_ID = '__background_list_end__';

type TextAlignMode = 'left' | 'center' | 'right';

const TOOL_ITEMS: Array<{ key: ToolKey; label: string; short: string }> = [
  { key: 'template', label: 'Template', short: 'T' },
  { key: 'background', label: 'Background', short: 'B' },
  { key: 'text', label: 'Text', short: 'Tx' },
  { key: 'sticker', label: 'Sticker', short: 'S' },
];

const DEFAULT_STATIC_LAYER_ORDERS: Record<StaticDraggableLayerKey, number> = {
  decorationArrow: 4,
  decorationPattern: 3,
  product: 2,
  decorationBand: 1,
};
const INITIAL_OVERLAY_ORDER = Math.max(...Object.values(DEFAULT_STATIC_LAYER_ORDERS)) + 1;

const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    title: 'Simple',
    items: [
      { id: 'simple-1', label: 'Warm bottle', accent: '#59472e', bg: '#f5eee1', title: 'Amazing Finds', price: '$18.99' },
      { id: 'simple-2', label: 'Minimal card', accent: '#b58b62', bg: '#fbf7f0', title: 'Limited Stock', price: '$18.99' },
      { id: 'simple-3', label: 'Paper card', accent: '#d9b392', bg: '#f8efe8', title: 'Daily Ritual', price: '$12.99' },
    ],
  },
  {
    title: 'Fashion',
    items: [
      { id: 'fashion-1', label: 'Bold sale', accent: '#7e4ca2', bg: '#f4eefb', title: 'Shop Quality', price: '$36.00' },
      { id: 'fashion-2', label: 'Purple grid', accent: '#6f2f96', bg: '#efe5fa', title: 'Best Seller', price: '$39.99', badge: 'Hot' },
      { id: 'fashion-3', label: 'Golden frame', accent: '#d1a23a', bg: '#fff5df', title: 'New Arrival', price: '$29.00' },
    ],
  },
  {
    title: 'Dynamic',
    items: [
      { id: 'dynamic-1', label: 'Blue arc', accent: '#1aa6b7', bg: '#e8fbfd', title: 'Ready to buy', price: '$21.00' },
      { id: 'dynamic-2', label: 'Retail burst', accent: '#2442c8', bg: '#edf0ff', title: 'Flash sale', price: '$19.90' },
      { id: 'dynamic-3', label: 'Orange star', accent: '#ff8a20', bg: '#fff1e5', title: 'Explore now', price: '$27.49' },
    ],
  },
  {
    title: 'Modern',
    items: [
      { id: 'modern-1', label: 'Soft peach', accent: '#c88370', bg: '#fdf0ea', title: 'New Favorite', price: '$31.80' },
      { id: 'modern-2', label: 'Cloud white', accent: '#b89077', bg: '#fbfaf8', title: 'Clean Choice', price: '$26.99' },
      { id: 'modern-3', label: 'Brick edge', accent: '#ad4942', bg: '#fff5f3', title: 'Editor Pick', price: '$22.49' },
    ],
  },
];

const PREVIEW_FRAMES: PreviewFrame[] = [
  {
    id: 'frame-1',
    title: 'Cleansing powder',
    bg: '#f6f3f2',
    accent: '#0c0c0d',
    product: '#d9ea7c',
    marble: 'linear-gradient(115deg, #f6f3f2 0%, #ece8e7 42%, #f8f5f4 100%)',
    band: '#ccbcb2',
    scene: '#a4bfcd',
  },
  {
    id: 'frame-2',
    title: 'Fresh serum',
    bg: '#f5f5f2',
    accent: '#101114',
    product: '#d6b06a',
    marble: 'linear-gradient(115deg, #f6f4ed 0%, #ece9e0 42%, #f8f7f2 100%)',
    band: '#d9ccb7',
    scene: '#bed6db',
  },
  {
    id: 'frame-3',
    title: 'Night cream',
    bg: '#f3f2f4',
    accent: '#0f1013',
    product: '#8eb274',
    marble: 'linear-gradient(115deg, #f1f1f3 0%, #e6e7eb 42%, #f8f8fa 100%)',
    band: '#cabfc9',
    scene: '#a7acb9',
  },
  {
    id: 'frame-4',
    title: 'Vitamin mask',
    bg: '#f7f4ef',
    accent: '#131212',
    product: '#d8bc62',
    marble: 'linear-gradient(115deg, #f7f3ec 0%, #eee6dc 42%, #faf7f1 100%)',
    band: '#d7c3ae',
    scene: '#c8d6d0',
  },
];

const BACKGROUND_ASSETS: BackgroundAsset[] = [
  {
    id: 'mountain-rock',
    label: 'Rock texture',
    fill: 'linear-gradient(135deg, #8f7c63 0%, #b8aa8b 28%, #7f7059 58%, #c9be9d 100%)',
    thumbnail: 'linear-gradient(135deg, #8f7c63 0%, #b8aa8b 28%, #7f7059 58%, #c9be9d 100%)',
  },
  {
    id: 'teal-solid',
    label: 'Teal solid',
    fill: '#129a97',
    thumbnail: '#129a97',
  },
  {
    id: 'purple-solid',
    label: 'Purple solid',
    fill: '#7871e4',
    thumbnail: '#7871e4',
  },
  {
    id: 'ocean-photo',
    label: 'Ocean photo',
    fill: 'linear-gradient(180deg, #0d1235 0%, #182d67 34%, #17305e 58%, #10264e 100%)',
    thumbnail: 'linear-gradient(180deg, #0d1235 0%, #182d67 34%, #17305e 58%, #10264e 100%)',
  },
  {
    id: 'green-solid',
    label: 'Green solid',
    fill: '#2ea243',
    thumbnail: '#2ea243',
  },
  {
    id: 'yellow-solid',
    label: 'Yellow solid',
    fill: '#f1cb53',
    thumbnail: '#f1cb53',
  },
  {
    id: 'red-solid',
    label: 'Coast dusk',
    fill: `
      linear-gradient(180deg, rgba(38, 54, 108, 0.88) 0%, rgba(23, 29, 73, 0.3) 16%, rgba(11, 18, 48, 0.22) 28%, rgba(12, 20, 56, 0.1) 100%),
      radial-gradient(circle at 76% 18%, rgba(132, 92, 111, 0.58) 0%, rgba(132, 92, 111, 0) 22%),
      linear-gradient(168deg, transparent 0 18%, #5d5372 18% 24%, #3c3558 24% 31%, #28274c 31% 42%, transparent 42% 100%),
      linear-gradient(146deg, transparent 0 36%, #32325e 36% 52%, #1d234c 52% 64%, #131b43 64% 76%, transparent 76% 100%),
      linear-gradient(132deg, transparent 0 56%, #4e4156 56% 67%, #30294b 67% 79%, #171d44 79% 88%, transparent 88% 100%),
      linear-gradient(180deg, #5f648f 0%, #444d7c 15%, #2c315f 28%, #1b2454 46%, #102152 68%, #0a1d4d 100%)
    `,
    thumbnail: `
      linear-gradient(180deg, rgba(38, 54, 108, 0.84) 0%, rgba(15, 22, 54, 0.16) 28%, rgba(12, 20, 56, 0.08) 100%),
      radial-gradient(circle at 78% 18%, rgba(132, 92, 111, 0.52) 0%, rgba(132, 92, 111, 0) 20%),
      linear-gradient(168deg, transparent 0 16%, #5d5372 16% 22%, #3c3558 22% 29%, #28274c 29% 40%, transparent 40% 100%),
      linear-gradient(146deg, transparent 0 34%, #32325e 34% 50%, #1d234c 50% 62%, #131b43 62% 74%, transparent 74% 100%),
      linear-gradient(132deg, transparent 0 54%, #4e4156 54% 65%, #30294b 65% 77%, #171d44 77% 86%, transparent 86% 100%),
      linear-gradient(180deg, #5f648f 0%, #444d7c 15%, #2c315f 28%, #1b2454 46%, #102152 68%, #0a1d4d 100%)
    `,
  },
  {
    id: 'sky-photo',
    label: 'Scallop frame',
    fill: `
      radial-gradient(circle at 14px 14px, transparent 22px, #d0bf2b 22px 26px, transparent 26px) 0 0/54px 54px repeat-x,
      radial-gradient(circle at calc(100% - 14px) 14px, transparent 22px, #d0bf2b 22px 26px, transparent 26px) 0 0/54px 54px repeat-x,
      radial-gradient(circle at 14px calc(100% - 14px), transparent 22px, #d0bf2b 22px 26px, transparent 26px) 0 100%/54px 54px repeat-x,
      radial-gradient(circle at 14px 14px, transparent 22px, #d0bf2b 22px 26px, transparent 26px) 0 0/54px 54px repeat-y,
      linear-gradient(90deg, transparent 0 7%, #fbf8ef 7% 93%, transparent 93% 100%),
      linear-gradient(180deg, transparent 0 6%, #fbf8ef 6% 94%, transparent 94% 100%),
      repeating-linear-gradient(
        90deg,
        transparent 0 7%,
        rgba(229, 227, 204, 0.88) 7% 12%,
        rgba(251, 248, 239, 0.98) 12% 18%
      ),
      radial-gradient(circle at 22% 34%, rgba(255, 187, 88, 0.9) 0, rgba(255, 196, 112, 0.7) 18%, rgba(255,255,255,0) 42%),
      radial-gradient(circle at 16% 38%, rgba(255, 220, 185, 0.95) 0, rgba(255, 210, 155, 0.72) 20%, rgba(255,255,255,0) 38%),
      linear-gradient(180deg, #7d78ee 0%, #7d78ee 100%)
    `,
    thumbnail: `
      radial-gradient(circle at 10px 10px, transparent 14px, #d0bf2b 14px 17px, transparent 17px) 0 0/34px 34px repeat-x,
      radial-gradient(circle at 10px calc(100% - 10px), transparent 14px, #d0bf2b 14px 17px, transparent 17px) 0 100%/34px 34px repeat-x,
      radial-gradient(circle at 10px 10px, transparent 14px, #d0bf2b 14px 17px, transparent 17px) 0 0/34px 34px repeat-y,
      linear-gradient(90deg, transparent 0 9%, #fbf8ef 9% 91%, transparent 91% 100%),
      linear-gradient(180deg, transparent 0 7%, #fbf8ef 7% 93%, transparent 93% 100%),
      repeating-linear-gradient(
        90deg,
        transparent 0 10%,
        rgba(229, 227, 204, 0.9) 10% 16%,
        rgba(251, 248, 239, 0.98) 16% 23%
      ),
      radial-gradient(circle at 26% 40%, rgba(255, 187, 88, 0.88) 0, rgba(255, 210, 155, 0.76) 14%, rgba(255,255,255,0) 28%),
      linear-gradient(180deg, #7d78ee 0%, #7d78ee 100%)
    `,
  },
];

const PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: 'matcha-jar',
    label: 'Matcha jar',
    kind: 'jar',
    scene: '#a4bfcd',
    vessel: '#d9ea7c',
    secondary: '#c5e0b1',
    accent: '#f2ca43',
  },
  {
    id: 'steel-bottle',
    label: 'Steel bottle',
    kind: 'bottle',
    scene: '#d8d4ca',
    vessel: '#8e8f8c',
    secondary: '#5a4c3f',
    accent: '#232323',
  },
  {
    id: 'amber-mug',
    label: 'Amber mug',
    kind: 'mug',
    scene: '#e1d4bf',
    vessel: '#c9984e',
    secondary: '#fff1ce',
    accent: '#7e5324',
  },
  {
    id: 'violet-bowl',
    label: 'Violet bowl',
    kind: 'bowl',
    scene: '#b6b1c8',
    vessel: '#6f628f',
    secondary: '#d9d3e6',
    accent: '#2d233b',
  },
];

const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'purchase',
    label: 'Purchase me!',
    className: 'bg-[#f2efe8] text-[#efb73b] [text-shadow:0_1px_0_rgba(110,74,0,0.4)]',
    preview: 'Purchase me!',
  },
  {
    id: 'tech',
    label: 'Tech-inspired designs',
    className: 'bg-[#edeaf9] text-[#6b67ff] underline decoration-[#6b67ff]/60 decoration-2 underline-offset-2',
    preview: 'Tech-inspired designs',
  },
  {
    id: 'sale',
    label: '< 20% off',
    className: 'bg-[#f5f1ff] text-white',
    preview: '< 20% off',
  },
  {
    id: 'eco',
    label: 'Eco-friendly',
    className: 'bg-[#ebfbf8] text-[#0aa89f]',
    preview: 'Eco-friendly',
  },
  {
    id: 'shipping',
    label: 'Free shipping',
    className: 'bg-black text-white',
    preview: 'Free shipping',
  },
  {
    id: 'limited',
    label: 'Limited edition',
    className: 'bg-[#f3f3f3] text-[#111111]',
    preview: 'Limited edition',
  },
];

const FONT_FAMILIES = ['TikTok Sans Display', 'TikTok Sans Text', 'Georgia'];
const FONT_SIZES = ['72px', '90px', '108px'];
const TEXT_LAYER_POSITIONS = [
  { top: 92, left: 28 },
  { top: 144, left: 176 },
  { top: 198, left: 26 },
  { top: 252, left: 184 },
];

const STICKER_LAYER_POSITIONS = [
  { top: 168, left: 58 },
  { top: 160, left: 192 },
  { top: 464, left: 100 },
  { top: 432, left: 182 },
  { top: 112, left: 188 },
  { top: 238, left: 36 },
];

const STICKER_PRESETS: StickerPreset[] = [
  { id: 'uploaded-landscape', label: 'Uploaded image', group: 'uploaded', kind: 'image', accent: '#8f7c63', secondary: '#b7aa8f' },
  { id: 'uploaded-amazon', label: 'Amazon', group: 'uploaded', kind: 'logo', text: 'amazon', accent: '#111111', secondary: '#f59e0b' },
  { id: 'seasonal-merry', label: 'Merry Christmas', group: 'seasonal', kind: 'badge', text: 'MERRY\nCHRISTMAS', accent: '#165a3e', secondary: '#ffd54f', bg: '#ffffff' },
  { id: 'seasonal-promotion', label: 'Promotion', group: 'seasonal', kind: 'ribbon', text: '-CHRISTMAS-\nPROMOTION!', accent: '#ff8f6b', secondary: '#ffffff', bg: '#fff8ef' },
  { id: 'seasonal-christmas', label: 'Christmas promotion', group: 'seasonal', kind: 'badge', text: 'CHRISTMAS\nPROMOTION', accent: '#f28c28', secondary: '#ffffff', bg: '#fff5ef' },
  { id: 'seasonal-promo', label: 'Promotion', group: 'seasonal', kind: 'ribbon', text: 'PROMOTION', accent: '#ff4f9a', secondary: '#ffffff', bg: '#fff0f6' },
  { id: 'seasonal-newyear', label: 'New year sale', group: 'seasonal', kind: 'ribbon', text: 'NEW YEAR SALE', accent: '#ff6b35', secondary: '#ffffff', bg: '#fff5f0' },
  { id: 'selling-free-ship', label: 'Free Shipping', group: 'selling', kind: 'text', text: 'FREE\nSHIPPING', accent: '#e8d8f4', secondary: '#c59de9', bg: '#faf6fd' },
  { id: 'selling-free-delivery', label: 'Free Delivery', group: 'selling', kind: 'text', text: 'FREE\nDELIVERY', accent: '#ffffff', secondary: '#d4372f', bg: '#fff5f5' },
  { id: 'selling-free-now', label: 'Free shipping', group: 'selling', kind: 'text', text: 'Free shipping', accent: '#7ce6ce', secondary: '#44d7b6', bg: '#f1fffb' },
  { id: 'effect-arrow-purple', label: 'Arrow purple', group: 'effect', kind: 'arrow', accent: '#d493e8', secondary: '#6d2879' },
  { id: 'effect-arrow-orange', label: 'Arrow orange', group: 'effect', kind: 'arrow', accent: '#ffb27d', secondary: '#f39a65' },
  { id: 'effect-arrow-pink', label: 'Arrow pink', group: 'effect', kind: 'arrow', accent: '#f7669c', secondary: '#d6336c' },
];

const LAYER_ITEMS: Array<{
  key: LayerKey;
  label: string;
  tool: ToolKey;
  preview: 'background' | 'texture' | 'band' | 'product' | 'dots' | 'headline' | 'caption' | 'arrow';
}> = [
  { key: 'backgroundPrimary', label: 'Background', tool: 'background', preview: 'background' },
  { key: 'backgroundSecondary', label: 'Background', tool: 'background', preview: 'texture' },
  { key: 'decorationBand', label: 'Decoration', tool: 'sticker', preview: 'band' },
  { key: 'product', label: 'Product', tool: 'template', preview: 'product' },
  { key: 'decorationPattern', label: 'Decoration', tool: 'sticker', preview: 'dots' },
  { key: 'textHeadline', label: 'Text', tool: 'text', preview: 'headline' },
  { key: 'textCaption', label: 'Text', tool: 'text', preview: 'caption' },
  { key: 'decorationArrow', label: 'Decoration', tool: 'sticker', preview: 'arrow' },
];

function createTextLayer(preset: TextPreset, index: number, order: number): TextLayerInstance {
  const position = TEXT_LAYER_POSITIONS[index % TEXT_LAYER_POSITIONS.length];

  return {
    id: `${preset.id}-${index + 1}`,
    presetId: preset.id,
    label: 'Text',
    preview: preset.preview,
    top: position.top,
    left: position.left,
    dynamicTextEnabled: true,
    fontFamily: FONT_FAMILIES[0],
    fontSize: FONT_SIZES[1],
    align: 'center',
    color: preset.id === 'shipping' ? '#ffffff' : preset.id === 'eco' ? '#0aa89f' : '#000000',
    order,
  };
}

function createStickerLayer(preset: StickerPreset, index: number, order: number): StickerLayerInstance {
  const position = STICKER_LAYER_POSITIONS[index % STICKER_LAYER_POSITIONS.length];

  return {
    id: `${preset.id}-${index + 1}`,
    presetId: preset.id,
    label: 'Sticker',
    top: position.top,
    left: position.left,
    order,
  };
}

function createBackgroundLayer(asset: BackgroundAsset, uniqueId: number, order: number): BackgroundLayerInstance {
  return {
    id: `background-${uniqueId}`,
    assetId: asset.id,
    label: 'Background',
    order,
  };
}

function StickerGraphic({ preset, compact = false }: { preset: StickerPreset; compact?: boolean }) {
  const boxClass = compact ? 'h-8 w-8' : 'h-full w-full';

  if (preset.kind === 'image') {
    return (
      <div
        className={`${boxClass} overflow-hidden rounded-[4px]`}
        style={{ background: 'linear-gradient(135deg, #847055 0%, #b7aa8f 35%, #8e7d63 60%, #d1c3a6 100%)' }}
      />
    );
  }

  if (preset.kind === 'logo') {
    return (
      <div className={`${boxClass} flex items-center justify-center rounded-[4px] bg-white text-[10px] font-black text-[#111111]`}>
        <span className="relative">
          amazon
          <span className="absolute -bottom-1 left-[2px] h-[3px] w-[24px] rounded-full border-b-2 border-[#f59e0b]" />
        </span>
      </div>
    );
  }

  if (preset.kind === 'arrow') {
    return (
      <div className={`${boxClass} flex items-center justify-center rounded-[4px] bg-white`}>
        <div
          className="h-0 w-0 rotate-[12deg] border-y-[12px] border-l-[24px] border-y-transparent"
          style={{ borderLeftColor: preset.accent, filter: compact ? 'none' : 'drop-shadow(0 0 0.5px #00000040)' }}
        />
      </div>
    );
  }

  if (preset.kind === 'text') {
    return (
      <div className={`${boxClass} flex items-center justify-center rounded-[4px]`} style={{ background: preset.bg }}>
        <div className="text-center text-[8px] font-black leading-[1] whitespace-pre-line" style={{ color: preset.secondary }}>
          {preset.text}
        </div>
      </div>
    );
  }

  if (preset.kind === 'ribbon') {
    return (
      <div className={`${boxClass} flex items-center justify-center rounded-[4px]`} style={{ background: preset.bg }}>
        <div className="rotate-[-12deg] rounded-[999px] border px-2 py-1 text-center text-[7px] font-black leading-[1.05] whitespace-pre-line" style={{ color: preset.accent, borderColor: preset.accent }}>
          {preset.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`${boxClass} flex items-center justify-center rounded-[4px]`} style={{ background: preset.bg ?? '#fff7ed' }}>
      <div className="text-center text-[8px] font-black leading-[1.05] whitespace-pre-line" style={{ color: preset.secondary ?? '#fff' }}>
        {preset.text}
      </div>
    </div>
  );
}

function ProductGraphic({
  product,
  compact = false,
}: {
  product: ProductOption;
  compact?: boolean;
}) {
  if (product.kind === 'bottle') {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-[12%] h-[12%] w-[16%] -translate-x-1/2 rounded-t-[8px]" style={{ background: product.accent }} />
        <div
          className="absolute left-1/2 top-[20%] h-[64%] w-[30%] -translate-x-1/2 rounded-[18px] shadow-[inset_4px_0_12px_rgba(255,255,255,0.35),inset_-6px_0_12px_rgba(0,0,0,0.12)]"
          style={{ background: `linear-gradient(90deg, ${product.secondary} 0%, ${product.vessel} 26%, ${product.secondary} 52%, ${product.vessel} 78%, ${product.secondary} 100%)` }}
        />
      </div>
    );
  }

  if (product.kind === 'mug') {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-[24%] h-[42%] w-[36%] -translate-x-1/2 rounded-[10px_10px_14px_14px]" style={{ background: product.vessel }} />
        <div className="absolute left-[57%] top-[31%] h-[22%] w-[16%] rounded-full border-[5px]" style={{ borderColor: product.accent }} />
        <div className="absolute left-1/2 top-[18%] h-[8%] w-[32%] -translate-x-1/2 rounded-full" style={{ background: product.secondary }} />
      </div>
    );
  }

  if (product.kind === 'bowl') {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-[28%] h-[12%] w-[48%] -translate-x-1/2 rounded-full" style={{ background: product.secondary }} />
        <div className="absolute left-1/2 top-[34%] h-[26%] w-[52%] -translate-x-1/2 rounded-[0_0_28px_28px]" style={{ background: product.vessel }} />
        <div className="absolute left-1/2 top-[60%] h-[7%] w-[18%] -translate-x-1/2 rounded-b-[8px]" style={{ background: product.accent }} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div
        className={[
          'absolute left-[18%] top-[28%] rounded-[20%_20%_18%_18%] shadow-[0_8px_14px_rgba(0,0,0,0.14)]',
          compact ? 'h-[42%] w-[26%]' : 'h-[48%] w-[28%]',
        ].join(' ')}
        style={{ background: product.vessel }}
      />
      <div
        className={[
          'absolute rounded-[18px_18px_6px_6px] shadow-[0_8px_14px_rgba(0,0,0,0.1)]',
          compact ? 'left-[54%] top-[26%] h-[18%] w-[22%]' : 'left-[56%] top-[24%] h-[18%] w-[24%]',
        ].join(' ')}
        style={{ background: product.secondary }}
      />
      <div
        className={[
          'absolute rotate-[28deg] rounded-t-full',
          compact ? 'left-[63%] top-[18%] h-[10%] w-[12%]' : 'left-[66%] top-[14%] h-[12%] w-[14%]',
        ].join(' ')}
        style={{ background: product.accent }}
      />
      <div className="absolute left-[59%] top-[42%] h-[6%] w-[20%] rounded-full bg-[#f6ebd3]" />
    </div>
  );
}

function MockBackstagePanel() {
  return (
    <div className="flex h-[calc(100vh-118px)] min-h-[640px] overflow-hidden">
      <div className="w-[252px] border-r border-neutral-fillLow bg-neutral-surface px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[12px] font-medium text-neutral-highOnSurface">Campaign turned on</span>
          <div className="h-5 w-9 rounded-full bg-teal-600/80 p-[2px]">
            <div className="ml-auto h-4 w-4 rounded-full bg-white" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg bg-neutral-surface2 px-3 py-2 text-[13px] font-medium text-neutral-highOnSurface">
            Sales2026081214133
          </div>
          <div className="rounded-lg px-3 py-2 text-[13px] text-neutral-lowOnSurface">
            ad group 20260811101148
          </div>
          <div className="rounded-lg bg-primary-surface1 px-3 py-2 text-[13px] text-neutral-highOnSurface">
            Ad name20
            <br />
            26-08-11
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-neutral-surface2 px-8 py-6">
        <div className="mx-auto max-w-[760px] space-y-6">
          <div>
            <div className="mb-2 text-[14px] font-medium text-neutral-highOnSurface">
              Add promo code or offer
            </div>
            <div className="rounded-xl border border-dashed border-neutral-fillMed px-4 py-8 text-center text-[13px] text-neutral-lowOnSurface">
              + Add
            </div>
          </div>

          <div className="rounded-xl bg-neutral-surface px-5 py-4">
            <div className="mb-2 text-[14px] font-medium text-neutral-highOnSurface">
              TikTok Shopping Assistant
            </div>
            <div className="text-[13px] text-neutral-lowOnSurface">
              Answers shopper questions and improves engagement.
            </div>
          </div>

          <div className="rounded-xl bg-neutral-surface px-5 py-4">
            <div className="mb-2 text-[14px] font-medium text-neutral-highOnSurface">
              Automatic enhancement
            </div>
            <div className="space-y-1 text-[13px] text-neutral-lowOnSurface">
              <div>Turned on: Product display card</div>
              <div>Turned off: Carousel template preview</div>
              <div>Image quality, resize, and text polish</div>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-surface px-5 py-4">
            <div className="mb-2 text-[14px] font-medium text-neutral-highOnSurface">
              Tracking
            </div>
            <div className="space-y-3 text-[13px] text-neutral-lowOnSurface">
              <div className="rounded-lg border border-neutral-fillLow px-4 py-3">
                TikTok events tracking
              </div>
              <div className="rounded-lg border border-neutral-fillLow px-4 py-3">
                Third-party integration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateThumbnail({ card, active }: { card: TemplateCard; active: boolean }) {
  return (
    <button
      className={[
        'group rounded-xl border p-2 text-left transition-all',
        active
          ? 'border-primary-fill bg-primary-surface1 shadow-[0_0_0_1px_rgba(22,119,255,0.12)]'
          : 'border-neutral-fillLow bg-neutral-surface hover:-translate-y-0.5 hover:shadow-sm',
      ].join(' ')}
      type="button"
    >
      <div className="relative overflow-hidden rounded-lg border border-black/5" style={{ background: card.bg }}>
        <div className="aspect-[3/4] p-2">
          <div className="mb-2 h-2.5 w-10 rounded-full" style={{ background: card.accent, opacity: 0.9 }} />
          <div
            className={[
              'mb-1 font-semibold tracking-[0.02em]',
              card.id === 'simple-1' ? 'text-[14px]' : 'text-[8px]',
            ].join(' ')}
            style={{ color: card.accent }}
          >
            {card.title}
          </div>
          <div className="mb-2 text-[11px] font-bold leading-none" style={{ color: card.accent }}>
            {card.price}
          </div>
          <div className="mx-auto mt-3 flex h-[72px] w-[48px] items-end justify-center rounded-[14px] bg-white shadow-sm">
            <div className="mb-2 h-10 w-7 rounded-[8px]" style={{ background: card.accent, opacity: 0.78 }} />
          </div>
          {card.badge && (
            <div
              className="absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[7px] font-semibold text-white"
              style={{ background: card.accent }}
            >
              {card.badge}
            </div>
          )}
        </div>
      </div>
      <div className="pt-2 text-[11px] font-medium text-neutral-highOnSurface">{card.label}</div>
    </button>
  );
}

function PreviewPhone({
  frame,
  currentTemplate,
  backgroundAsset,
  product,
  staticLayerOrders,
  removeBackground,
  safeZone,
  activeTextLayerId,
  textLayers,
  activeStickerLayerId,
  stickerLayers,
}: {
  frame: PreviewFrame;
  currentTemplate: TemplateCard;
  backgroundAsset: BackgroundAsset;
  product: ProductOption;
  staticLayerOrders: Record<StaticDraggableLayerKey, number>;
  removeBackground: boolean;
  safeZone: boolean;
  activeTextLayerId: string | null;
  textLayers: TextLayerInstance[];
  activeStickerLayerId: string | null;
  stickerLayers: StickerLayerInstance[];
}) {
  const headline = currentTemplate.title === 'Limited Stock' ? 'Limited Stock for' : `${currentTemplate.title} for`;
  const visualLayers = [
    {
      id: 'static:decorationBand',
      order: staticLayerOrders.decorationBand,
      node: (
        <div
          className="absolute left-10 top-[126px] h-[136px] w-[278px]"
          style={{ background: removeBackground ? `${frame.band}cc` : frame.band }}
        />
      ),
    },
    {
      id: 'static:product',
      order: staticLayerOrders.product,
      node: (
        <div
          className="absolute left-[86px] top-[126px] h-[152px] w-[156px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          style={{ background: product.scene }}
        >
          <div className="absolute inset-x-0 top-0 h-[44px] bg-white/15" />
          <div className="absolute inset-[18px]">
            <ProductGraphic product={product} />
          </div>
        </div>
      ),
    },
    ...textLayers.map((item) => ({ type: 'text' as const, item, order: item.order })),
    ...stickerLayers.map((item) => ({ type: 'sticker' as const, item, order: item.order })),
    {
      id: 'static:decorationArrow',
      order: staticLayerOrders.decorationArrow,
      node: <div className="absolute left-0 right-0 top-[404px] text-center text-[24px] font-black leading-none">{'>>>>'}</div>,
    },
    {
      id: 'static:decorationPattern',
      order: staticLayerOrders.decorationPattern,
      node: (
        <>
          <div className="absolute bottom-0 right-0 h-[112px] w-[70px] bg-[radial-gradient(circle,#8a6a53_1.1px,transparent_1.1px)] bg-[size:12px_12px] opacity-80" />
          <div className="absolute bottom-[18px] right-[18px] h-[34px] w-[34px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#404040_0,#111_42%,#000_72%)] shadow-[0_4px_14px_rgba(0,0,0,0.24)]" />
        </>
      ),
    },
  ].sort((a, b) => a.order - b.order);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[580px] w-[328px] overflow-hidden rounded-[12px] bg-[#f2f2f2] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="absolute inset-0" style={{ background: backgroundAsset.fill }} />
        <div
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 24%), radial-gradient(circle at 75% 8%, rgba(0,0,0,0.04) 0, rgba(0,0,0,0) 18%), linear-gradient(102deg, rgba(255,255,255,0) 0%, rgba(152,152,152,0.18) 38%, rgba(255,255,255,0) 58%), linear-gradient(168deg, rgba(255,255,255,0) 0%, rgba(121,121,121,0.12) 35%, rgba(255,255,255,0) 64%)',
          }}
        />

        <div className="absolute left-14 right-14 top-[10px] flex items-center justify-between text-[11px] font-medium text-white">
          <span>8:00</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px]">|||</span>
            <span className="text-[10px]">)))</span>
            <span className="h-[9px] w-[16px] rounded-[3px] border border-white/80" />
          </div>
        </div>
        <div className="absolute left-4 top-[40px] h-4 w-4 rounded bg-white/70 text-center text-[8px] leading-4 text-neutral-lowOnSurface">
          LIVE
        </div>
        <div className="absolute left-0 right-0 top-[44px] flex items-center justify-center gap-6 text-[12px] text-white">
          <span className="opacity-70">Following</span>
          <div className="relative font-semibold">
            For You
            <div className="absolute left-1/2 top-[20px] h-[2px] w-5 -translate-x-1/2 rounded-full bg-white/80" />
          </div>
          <span className="text-[22px] font-light">o</span>
        </div>

        {visualLayers.map((overlay) => {
          if ('type' in overlay && overlay.type === 'text') {
            const textLayer = overlay.item;
            const preset = TEXT_PRESETS.find((item) => item.id === textLayer.presetId);
            const isEditing = activeTextLayerId === textLayer.id;
            const previewFontSize = `${Math.round(Number.parseInt(textLayer.fontSize, 10) * 0.18)}px`;
            const alignClass =
              textLayer.align === 'left' ? 'text-left' : textLayer.align === 'right' ? 'text-right' : 'text-center';

            if (!preset) return null;

            return (
              <div
                key={textLayer.id}
                className={['absolute max-w-[150px]', alignClass].join(' ')}
                style={{ top: `${textLayer.top}px`, left: `${textLayer.left}px` }}
              >
                <div
                  className={[
                    'relative inline-flex min-h-[32px] min-w-[66px] items-center justify-center px-3 py-1.5 text-[12px] font-semibold',
                    preset.id === 'sale' || preset.id === 'shipping' ? 'rounded-[16px]' : 'rounded-[8px]',
                    preset.id === 'sale' ? '' : preset.className,
                    isEditing ? 'border border-[#6f767d] bg-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.5)]' : '',
                  ].join(' ')}
                >
                  {isEditing && (
                    <>
                      <div className="absolute -left-[4px] -top-[4px] h-2 w-2 rounded-full border border-[#6f767d] bg-white" />
                      <div className="absolute -right-[4px] -top-[4px] h-2 w-2 rounded-full border border-[#6f767d] bg-white" />
                      <div className="absolute -bottom-[4px] -left-[4px] h-2 w-2 rounded-full border border-[#6f767d] bg-white" />
                      <div className="absolute -bottom-[4px] -right-[4px] h-2 w-2 rounded-full border border-[#6f767d] bg-white" />
                    </>
                  )}
                  {preset.id === 'sale' ? (
                    <span className="rounded-full bg-[#8b5cf6] px-3 py-1 text-[#ffd54f]">{textLayer.preview}</span>
                  ) : (
                    <span style={{ color: textLayer.color, fontFamily: textLayer.fontFamily, fontSize: previewFontSize }}>
                      {textLayer.dynamicTextEnabled ? textLayer.preview : preset.preview}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          if ('type' in overlay && overlay.type === 'sticker') {
            const stickerLayer = overlay.item;
            const preset = STICKER_PRESETS.find((item) => item.id === stickerLayer.presetId);
            const isEditing = activeStickerLayerId === stickerLayer.id;

            if (!preset) return null;

            return (
              <div
                key={stickerLayer.id}
                className={[
                  'absolute',
                  preset.kind === 'image' ? 'h-[14px] w-[62px]' : preset.kind === 'logo' ? 'h-[24px] w-[78px]' : 'h-[34px] w-[92px]',
                ].join(' ')}
                style={{ top: `${stickerLayer.top}px`, left: `${stickerLayer.left}px` }}
              >
                <div className={isEditing ? 'rounded-[6px] border border-[#6f767d] bg-white/20 p-0.5' : ''}>
                  <StickerGraphic preset={preset} />
                </div>
              </div>
            );
          }

          return <div key={overlay.id}>{overlay.node}</div>;
        })}

        <div
          className={[
            'absolute left-[38px] right-[38px] top-[328px] text-neutral-highOnSurface',
            'text-center',
          ].join(' ')}
        >
          <div className="relative inline-block max-w-full">
            <div className="font-black italic leading-[1.2]">
              {headline}
              <br />
              {currentTemplate.price}!
            </div>
          </div>
          <div className="mt-3 text-[12px] text-neutral-lowOnSurface">Be the Envy of Your Friends</div>
        </div>

        <div className="absolute bottom-[78px] left-4 text-white/70">
          <div className="text-[10px]">testcsvkbfjvjq</div>
          <div className="mt-4 text-[8px]">Sponsored</div>
          <div className="mt-1 text-[9px]">music Fine Line - Harry Styles</div>
        </div>

        <div className="absolute bottom-[28px] left-4 right-4 h-[28px] rounded-[3px] bg-white/70">
          <div className="flex h-full items-center justify-center text-[16px] text-white/70">{'>'}</div>
        </div>

        <div className="absolute right-3 top-[270px] flex flex-col items-center gap-2 text-white">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d7d7d7]">
            <div className="h-5 w-5 rounded-full bg-[#f2f2f2]" />
            <div className="absolute -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff375f] text-[18px] font-medium leading-none">
              +
            </div>
          </div>
          {[
            ['o', '991K'],
            ['...', '3456'],
            ['->', '1256'],
          ].map(([icon, count]) => (
            <div key={count} className="flex flex-col items-center">
              <div className="text-[26px] leading-none text-white/92">{icon}</div>
              <div className="mt-1 text-[10px] text-white/75">{count}</div>
            </div>
          ))}
        </div>

        {safeZone && (
          <div className="pointer-events-none absolute inset-[16px] rounded-[10px] border border-dashed border-[#12b3a6]/80" />
        )}
      </div>
    </div>
  );
}

function ProductThumb({
  product,
  active,
}: {
  product: ProductOption;
  active: boolean;
}) {
  return (
    <div
      className={[
        'relative h-[72px] w-[72px] overflow-hidden rounded-[6px] border bg-white',
        active ? 'border-[#12b3a6] shadow-[0_0_0_1px_rgba(18,179,166,0.12)]' : 'border-neutral-fillLow',
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[#f4f2ee]" />
      <div className="absolute left-0 right-0 top-[20px] h-[22px] bg-[#d9ccb7]" />
      <div className="absolute left-[18px] top-[10px] h-[38px] w-[38px] overflow-hidden rounded-[2px]" style={{ background: product.scene }}>
        <ProductGraphic product={product} compact />
      </div>
    </div>
  );
}

function LayerPreviewThumb({
  kind,
  frame,
}: {
  kind: 'background' | 'texture' | 'band' | 'product' | 'dots' | 'headline' | 'caption' | 'arrow';
  frame: PreviewFrame;
}) {
  if (kind === 'background') {
    return <div className="h-8 w-8 rounded-[6px] border border-neutral-fillLow" style={{ background: frame.marble }} />;
  }

  if (kind === 'texture') {
    return (
      <div
        className="h-8 w-8 rounded-[6px] border border-neutral-fillLow"
        style={{ background: `${frame.marble}, linear-gradient(140deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 60%)` }}
      />
    );
  }

  if (kind === 'band') {
    return (
      <div className="flex h-8 w-8 items-center overflow-hidden rounded-[6px] border border-neutral-fillLow bg-white">
        <div className="h-4 w-full" style={{ background: frame.band }} />
      </div>
    );
  }

  if (kind === 'product') {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-[6px] border border-neutral-fillLow" style={{ background: frame.scene }}>
        <div className="absolute bottom-[6px] left-[7px] h-4 w-3 rounded-[4px]" style={{ background: frame.product }} />
        <div className="absolute bottom-[7px] left-[17px] h-[7px] w-[7px] rounded-full bg-[#dce08f]" />
      </div>
    );
  }

  if (kind === 'dots') {
    return (
      <div className="h-8 w-8 rounded-[6px] border border-neutral-fillLow bg-[radial-gradient(circle,#c7b4a0_1px,transparent_1px)] bg-[size:6px_6px]" />
    );
  }

  if (kind === 'headline') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-neutral-fillLow bg-white text-[5px] font-black italic leading-[1.1] text-neutral-highOnSurface">
        Limit
        <br />
        Stock
      </div>
    );
  }

  if (kind === 'caption') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-neutral-fillLow bg-white text-[4px] leading-[1.2] text-neutral-lowOnSurface">
        Be the
        <br />
        envy
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-neutral-fillLow bg-white text-[12px] font-black text-neutral-highOnSurface">
      {'>>>>'}
    </div>
  );
}

function DragHandleIcon() {
  return (
    <span className="flex h-12 w-4 shrink-0 items-center justify-center text-[#2b2b2b]">
      <svg
        width="11"
        height="21"
        viewBox="0 0 11 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="block"
      >
        <circle cx="2" cy="2" r="2" fill="currentColor" />
        <circle cx="9" cy="2" r="2" fill="currentColor" />
        <circle cx="2" cy="10.5" r="2" fill="currentColor" />
        <circle cx="9" cy="10.5" r="2" fill="currentColor" />
        <circle cx="2" cy="19" r="2" fill="currentColor" />
        <circle cx="9" cy="19" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

function LayerDropIndicator({ position }: { position: 'before' | 'after' }) {
  return (
    <div
      className={[
        'pointer-events-none absolute left-0 right-0 z-20 h-0',
        position === 'before' ? 'top-[-8px]' : 'bottom-[-8px]',
      ].join(' ')}
    >
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#009995]" />
    </div>
  );
}

function LayerDragPlaceholder() {
  return (
    <div className="pointer-events-none absolute inset-[6px] z-10 rounded-[10px] border border-dashed border-[#009995] bg-[rgba(0,153,149,0.08)]" />
  );
}

function AccordionRow({
  label,
  open,
  active,
  showChevron = true,
  preview,
  frame,
  thumb,
  onClick,
  children,
  draggable = false,
  isDragging = false,
  dropIndicatorPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  label: string;
  open: boolean;
  active: boolean;
  showChevron?: boolean;
  preview: 'background' | 'texture' | 'band' | 'product' | 'dots' | 'headline' | 'caption' | 'arrow';
  frame: PreviewFrame;
  thumb?: ReactNode;
  onClick: () => void;
  children?: ReactNode;
  draggable?: boolean;
  isDragging?: boolean;
  dropIndicatorPosition?: 'before' | 'after';
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={[
        'relative rounded-[12px] border border-[#d9dcdf] bg-white transition-[box-shadow,background-color,border-color,opacity,margin]',
        dropIndicatorPosition ? 'overflow-visible' : 'overflow-hidden',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'border-transparent bg-[rgba(0,153,149,0.08)] shadow-[inset_0_0_0_1px_rgba(0,153,149,0.16)]' : '',
        dropIndicatorPosition ? 'shadow-[0_0_0_1px_rgba(0,153,149,0.24)]' : '',
        dropIndicatorPosition === 'before' ? 'mt-4' : '',
        dropIndicatorPosition === 'after' ? 'mb-4' : '',
      ].join(' ')}
    >
      {dropIndicatorPosition && <LayerDropIndicator position={dropIndicatorPosition} />}
      {isDragging && <LayerDragPlaceholder />}
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center justify-between px-4 py-4 text-left transition-colors',
          active ? 'bg-[#f3faf8]' : 'hover:bg-neutral-surface1Hover',
          isDragging ? 'opacity-0' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <DragHandleIcon />
          {thumb ?? <LayerPreviewThumb kind={preview} frame={frame} />}
          <span className="text-[14px] font-semibold text-neutral-highOnSurface">{label}</span>
        </div>
        {showChevron && <span className="text-[14px] text-neutral-lowOnSurface">{open ? '^' : 'v'}</span>}
      </button>
      {open && (
        <div
          className={[
            'border-t border-neutral-fillLow px-4 py-3 text-[12px] text-neutral-lowOnSurface transition-opacity',
            isDragging ? 'opacity-0' : '',
          ].join(' ')}
        >
          {children ?? `Editable properties for ${label.toLowerCase()}.`}
        </div>
      )}
    </div>
  );
}

function TextLayerThumb({
  preset,
  preview,
  color,
}: {
  preset: TextPreset;
  preview: string;
  color: string;
}) {
  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[6px] border border-neutral-fillLow bg-white p-1">
      {preset.id === 'sale' ? (
        <span className="rounded-full bg-[#8b5cf6] px-1.5 py-0.5 text-[5px] font-medium leading-none text-[#ffd54f]">
          {preview}
        </span>
      ) : (
        <span
          className={['line-clamp-2 max-w-full break-words text-center text-[5px] leading-[1.05]', preset.className].join(' ')}
          style={{ color }}
        >
          {preview}
        </span>
      )}
    </div>
  );
}

function StickerLayerRow({
  label,
  preset,
  active,
  onClick,
  draggable = false,
  isDragging = false,
  dropIndicatorPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  label: string;
  preset: StickerPreset;
  active: boolean;
  onClick: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  dropIndicatorPosition?: 'before' | 'after';
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={[
        'relative rounded-[12px] border border-[#d9dcdf] bg-white transition-[box-shadow,background-color,border-color,opacity,margin]',
        dropIndicatorPosition ? 'overflow-visible' : 'overflow-hidden',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'border-transparent bg-[rgba(0,153,149,0.08)] shadow-[inset_0_0_0_1px_rgba(0,153,149,0.16)]' : '',
        dropIndicatorPosition ? 'shadow-[0_0_0_1px_rgba(0,153,149,0.24)]' : '',
        dropIndicatorPosition === 'before' ? 'mt-4' : '',
        dropIndicatorPosition === 'after' ? 'mb-4' : '',
      ].join(' ')}
    >
      {dropIndicatorPosition && <LayerDropIndicator position={dropIndicatorPosition} />}
      {isDragging && <LayerDragPlaceholder />}
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
          active ? 'bg-[#f3faf8]' : 'hover:bg-neutral-surface1Hover',
          isDragging ? 'opacity-0' : '',
        ].join(' ')}
      >
        <DragHandleIcon />
        <div className="h-8 w-8 overflow-hidden rounded-[6px] border border-neutral-fillLow bg-white p-1">
          <StickerGraphic preset={preset} compact />
        </div>
        <span className="text-[14px] font-semibold text-neutral-highOnSurface">{label}</span>
      </button>
    </div>
  );
}

function BackgroundLayerThumb({
  asset,
  textured = false,
}: {
  asset: BackgroundAsset;
  textured?: boolean;
}) {
  return (
    <div className="relative h-8 w-8 overflow-hidden rounded-[6px] border border-neutral-fillLow">
      <div className="absolute inset-0" style={{ background: asset.thumbnail }} />
      {textured && (
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 16%, rgba(255,255,255,0.88) 0, rgba(255,255,255,0) 24%), linear-gradient(102deg, rgba(255,255,255,0) 0%, rgba(152,152,152,0.18) 38%, rgba(255,255,255,0) 58%), linear-gradient(168deg, rgba(255,255,255,0) 0%, rgba(121,121,121,0.12) 35%, rgba(255,255,255,0) 64%)',
          }}
        />
      )}
    </div>
  );
}

function BackgroundLayerRow({
  label,
  asset,
  textured,
  active,
  open = false,
  showChevron = true,
  onClick,
  showDragHandle = false,
  draggable = false,
  isDragging = false,
  dropIndicatorPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children,
}: {
  label: string;
  asset: BackgroundAsset;
  textured?: boolean;
  active: boolean;
  open?: boolean;
  showChevron?: boolean;
  onClick: () => void;
  showDragHandle?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  dropIndicatorPosition?: 'before' | 'after';
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={[
        'relative rounded-[12px] border border-[#d9dcdf] bg-white transition-[box-shadow,background-color,border-color,opacity,margin]',
        dropIndicatorPosition ? 'overflow-visible' : 'overflow-hidden',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'border-transparent bg-[rgba(0,153,149,0.08)] shadow-[inset_0_0_0_1px_rgba(0,153,149,0.16)]' : '',
        dropIndicatorPosition ? 'shadow-[0_0_0_1px_rgba(0,153,149,0.24)]' : '',
        dropIndicatorPosition === 'before' ? 'mt-4' : '',
        dropIndicatorPosition === 'after' ? 'mb-4' : '',
      ].join(' ')}
    >
      {dropIndicatorPosition && <LayerDropIndicator position={dropIndicatorPosition} />}
      {isDragging && <LayerDragPlaceholder />}
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
          active ? 'bg-[#f3faf8]' : 'hover:bg-neutral-surface1Hover',
          isDragging ? 'opacity-0' : '',
        ].join(' ')}
      >
        {showDragHandle && <DragHandleIcon />}
        <BackgroundLayerThumb asset={asset} textured={textured} />
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-neutral-highOnSurface">{label}</span>
        {showChevron && children && <span className="text-[14px] text-neutral-lowOnSurface">{open ? '^' : 'v'}</span>}
      </button>
      {open && children && <div className="border-t border-neutral-fillLow px-4 py-4">{children}</div>}
    </div>
  );
}

function ProductLayerRow({
  label,
  product,
  active,
  onClick,
  draggable = false,
  isDragging = false,
  dropIndicatorPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  label: string;
  product: ProductOption;
  active: boolean;
  onClick: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  dropIndicatorPosition?: 'before' | 'after';
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={[
        'relative rounded-[12px] border border-[#d9dcdf] bg-white transition-[box-shadow,background-color,border-color,opacity,margin]',
        dropIndicatorPosition ? 'overflow-visible' : 'overflow-hidden',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'border-transparent bg-[rgba(0,153,149,0.08)] shadow-[inset_0_0_0_1px_rgba(0,153,149,0.16)]' : '',
        dropIndicatorPosition ? 'shadow-[0_0_0_1px_rgba(0,153,149,0.24)]' : '',
        dropIndicatorPosition === 'before' ? 'mt-4' : '',
        dropIndicatorPosition === 'after' ? 'mb-4' : '',
      ].join(' ')}
    >
      {dropIndicatorPosition && <LayerDropIndicator position={dropIndicatorPosition} />}
      {isDragging && <LayerDragPlaceholder />}
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
          active ? 'bg-[#f3faf8]' : 'hover:bg-neutral-surface1Hover',
          isDragging ? 'opacity-0' : '',
        ].join(' ')}
      >
        <DragHandleIcon />
        <div className="relative h-8 w-8 overflow-hidden rounded-[6px] border border-neutral-fillLow bg-white">
          <div className="absolute inset-0" style={{ background: product.scene }} />
          <div className="absolute inset-[3px]">
            <ProductGraphic product={product} compact />
          </div>
        </div>
        <span className="text-[14px] font-semibold text-neutral-highOnSurface">{label}</span>
      </button>
    </div>
  );
}

export default function CarouselTemplateEditor6() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolKey>('template');
  const [templateTab, setTemplateTab] = useState<TemplateTabKey>('recommended');
  const [toolPanelVisible, setToolPanelVisible] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<ToolKey | null>(null);
  const [activeLayerKey, setActiveLayerKey] = useState<LayerKey>('product');
  const [selectedTemplateId, setSelectedTemplateId] = useState('simple-2');
  const [selectedProductId, setSelectedProductId] = useState('matcha-jar');
  const [baseBackgroundId, setBaseBackgroundId] = useState('teal-solid');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState('teal-solid');
  const [selectedTextPresetId, setSelectedTextPresetId] = useState<string | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayerInstance[]>([]);
  const [activeTextLayerId, setActiveTextLayerId] = useState<string | null>(null);
  const [backgroundLayers, setBackgroundLayers] = useState<BackgroundLayerInstance[]>([]);
  const [activeBackgroundLayerId, setActiveBackgroundLayerId] = useState<string | null>(null);
  const [stickerLayers, setStickerLayers] = useState<StickerLayerInstance[]>([]);
  const [activeStickerLayerId, setActiveStickerLayerId] = useState<string | null>(null);
  const [nextOverlayOrder, setNextOverlayOrder] = useState(INITIAL_OVERLAY_ORDER);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [safeZone, setSafeZone] = useState(false);
  const [textPanelOpen, setTextPanelOpen] = useState({
    typography: false,
    color: false,
    styles: false,
  });
  const [_undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [_redoStack, setRedoStack] = useState<EditorSnapshot[]>([]);
  const [propertyUndoStacks, setPropertyUndoStacks] = useState<Record<string, PropertySnapshot[]>>({});
  const [propertyRedoStacks, setPropertyRedoStacks] = useState<Record<string, PropertySnapshot[]>>({});
  const [staticLayerOrders, setStaticLayerOrders] = useState<Record<StaticDraggableLayerKey, number>>(DEFAULT_STATIC_LAYER_ORDERS);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Record<LayerKey, boolean>>({
    backgroundPrimary: false,
    backgroundSecondary: false,
    decorationBand: false,
    product: false,
    decorationPattern: false,
    textHeadline: false,
    textCaption: false,
    decorationArrow: false,
  });
  const [lastAction, setLastAction] = useState('Editing');
  const dragPreviewRef = useRef<HTMLElement | null>(null);

  const templateMap = useMemo(
    () => new Map(TEMPLATE_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item]))),
    [],
  );
  const currentTemplate = templateMap.get(selectedTemplateId) ?? TEMPLATE_GROUPS[1].items[1];
  const currentFrame = PREVIEW_FRAMES[0];
  const currentProduct = PRODUCT_OPTIONS.find((item) => item.id === selectedProductId) ?? PRODUCT_OPTIONS[0];
  const baseBackground = BACKGROUND_ASSETS.find((item) => item.id === baseBackgroundId) ?? BACKGROUND_ASSETS[1];
  const activeTextLayer = textLayers.find((item) => item.id === activeTextLayerId) ?? null;
  const activeStickerLayer = stickerLayers.find((item) => item.id === activeStickerLayerId) ?? null;
  const backgroundLayerItems = useMemo(
    () => [...backgroundLayers].sort((a, b) => b.order - a.order),
    [backgroundLayers],
  );
  const activeBackgroundLayer = backgroundLayers.find((item) => item.id === activeBackgroundLayerId) ?? null;
  const previewBackground =
    BACKGROUND_ASSETS.find((item) => item.id === backgroundLayerItems[0]?.assetId) ?? baseBackground;
  const draggableLayers = useMemo<DraggableLayerDescriptor[]>(
    () =>
      [
        ...textLayers.map((item) => ({
          id: `text:${item.id}`,
          kind: 'text' as const,
          order: item.order,
          label: item.label,
          textLayer: item,
        })),
        ...stickerLayers.map((item) => ({
          id: `sticker:${item.id}`,
          kind: 'sticker' as const,
          order: item.order,
          label: item.label,
          stickerLayer: item,
        })),
        {
          id: 'static:decorationArrow',
          kind: 'static' as const,
          order: staticLayerOrders.decorationArrow,
          label: 'Decoration',
          staticKey: 'decorationArrow' as const,
        },
        {
          id: 'static:decorationPattern',
          kind: 'static' as const,
          order: staticLayerOrders.decorationPattern,
          label: 'Decoration',
          staticKey: 'decorationPattern' as const,
        },
        {
          id: 'static:product',
          kind: 'static' as const,
          order: staticLayerOrders.product,
          label: 'Product',
          staticKey: 'product' as const,
        },
        {
          id: 'static:decorationBand',
          kind: 'static' as const,
          order: staticLayerOrders.decorationBand,
          label: 'Decoration',
          staticKey: 'decorationBand' as const,
        },
      ].sort((a, b) => b.order - a.order),
    [textLayers, stickerLayers, staticLayerOrders],
  );
  const firstDraggableLayerId = draggableLayers[0]?.id ?? null;
  const firstBackgroundLayerId = backgroundLayerItems[0]?.id ?? null;
  const lastBackgroundLayerId = backgroundLayerItems[backgroundLayerItems.length - 1]?.id ?? null;
  const isDraggingBackgroundLayer = draggingLayerId?.startsWith('background:') ?? false;
  const activePropertyScopeKey = useMemo(() => {
    if (activeTextLayerId) {
      return `text:${activeTextLayerId}`;
    }

    if (activeBackgroundLayerId) {
      return `background:${activeBackgroundLayerId}`;
    }

    if (activeLayerKey === 'backgroundPrimary') {
      return 'background:base';
    }

    return null;
  }, [activeBackgroundLayerId, activeLayerKey, activeTextLayerId]);

  const createSnapshot = (): EditorSnapshot => ({
    activeTool,
    activeLayerKey,
    selectedTemplateId,
    selectedProductId,
    baseBackgroundId,
    selectedBackgroundId,
    selectedTextPresetId,
    textLayers: textLayers.map((item) => ({ ...item })),
    activeTextLayerId,
    backgroundLayers: backgroundLayers.map((item) => ({ ...item })),
    activeBackgroundLayerId,
    stickerLayers: stickerLayers.map((item) => ({ ...item })),
    activeStickerLayerId,
    nextOverlayOrder,
    removeBackground,
    safeZone,
    textPanelOpen: { ...textPanelOpen },
    expandedLayers: { ...expandedLayers },
    staticLayerOrders: { ...staticLayerOrders },
  });

  const captureHistory = () => {
    const snapshot = createSnapshot();
    setUndoStack((prev) => [...prev.slice(-49), snapshot]);
    setRedoStack([]);
  };

  const createPropertySnapshot = (scopeKey: string | null): PropertySnapshot | null => {
    if (!scopeKey) return null;

    if (scopeKey.startsWith('text:')) {
      const layerId = scopeKey.replace('text:', '');
      const layer = textLayers.find((item) => item.id === layerId);
      return layer ? { kind: 'text', layerId, layer: { ...layer } } : null;
    }

    if (scopeKey.startsWith('background:') && scopeKey !== 'background:base') {
      const layerId = scopeKey.replace('background:', '');
      const layer = backgroundLayers.find((item) => item.id === layerId);
      return layer ? { kind: 'background-layer', layerId, layer: { ...layer } } : null;
    }

    if (scopeKey === 'background:base') {
      return { kind: 'background-base', assetId: baseBackgroundId };
    }

    return null;
  };

  const capturePropertyHistory = (scopeKey = activePropertyScopeKey) => {
    const snapshot = createPropertySnapshot(scopeKey);
    if (!snapshot || !scopeKey) return;

    setPropertyUndoStacks((prev) => ({
      ...prev,
      [scopeKey]: [...(prev[scopeKey] ?? []).slice(-49), snapshot],
    }));
    setPropertyRedoStacks((prev) => ({
      ...prev,
      [scopeKey]: [],
    }));
  };

  const applyPropertySnapshot = (snapshot: PropertySnapshot, actionLabel: string) => {
    if (snapshot.kind === 'text') {
      setTextLayers((prev) => prev.map((item) => (item.id === snapshot.layerId ? { ...snapshot.layer } : item)));
      setActiveLayerKey('textHeadline');
      setActiveTextLayerId(snapshot.layerId);
      setActiveBackgroundLayerId(null);
      setActiveStickerLayerId(null);
      setLastAction(actionLabel);
      return;
    }

    if (snapshot.kind === 'background-layer') {
      setBackgroundLayers((prev) =>
        prev.map((item) => (item.id === snapshot.layerId ? { ...snapshot.layer } : item)),
      );
      setSelectedBackgroundId(snapshot.layer.assetId);
      setActiveLayerKey('backgroundSecondary');
      setActiveBackgroundLayerId(snapshot.layerId);
      setActiveTextLayerId(null);
      setActiveStickerLayerId(null);
      setLastAction(actionLabel);
      return;
    }

    setBaseBackgroundId(snapshot.assetId);
    setSelectedBackgroundId(snapshot.assetId);
    setActiveLayerKey('backgroundPrimary');
    setActiveBackgroundLayerId(null);
    setActiveTextLayerId(null);
    setActiveStickerLayerId(null);
    setLastAction(actionLabel);
  };

  const handlePropertyUndo = () => {
    if (!activePropertyScopeKey) return;
    const stack = propertyUndoStacks[activePropertyScopeKey] ?? [];
    const previousSnapshot = stack[stack.length - 1];
    if (!previousSnapshot) return;

    const currentSnapshot = createPropertySnapshot(activePropertyScopeKey);
    if (!currentSnapshot) return;

    setPropertyUndoStacks((prev) => ({
      ...prev,
      [activePropertyScopeKey]: (prev[activePropertyScopeKey] ?? []).slice(0, -1),
    }));
    setPropertyRedoStacks((prev) => ({
      ...prev,
      [activePropertyScopeKey]: [...(prev[activePropertyScopeKey] ?? []).slice(-49), currentSnapshot],
    }));
    applyPropertySnapshot(previousSnapshot, 'Undo property');
  };

  const handlePropertyRedo = () => {
    if (!activePropertyScopeKey) return;
    const stack = propertyRedoStacks[activePropertyScopeKey] ?? [];
    const nextSnapshot = stack[stack.length - 1];
    if (!nextSnapshot) return;

    const currentSnapshot = createPropertySnapshot(activePropertyScopeKey);
    if (!currentSnapshot) return;

    setPropertyRedoStacks((prev) => ({
      ...prev,
      [activePropertyScopeKey]: (prev[activePropertyScopeKey] ?? []).slice(0, -1),
    }));
    setPropertyUndoStacks((prev) => ({
      ...prev,
      [activePropertyScopeKey]: [...(prev[activePropertyScopeKey] ?? []).slice(-49), currentSnapshot],
    }));
    applyPropertySnapshot(nextSnapshot, 'Redo property');
  };

  const toggleLayer = (key: LayerKey) => {
    setActiveLayerKey(key);
    setActiveTextLayerId(null);
    setActiveBackgroundLayerId(null);
    setActiveStickerLayerId(null);
    setExpandedLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateActiveTextLayer = (patch: Partial<TextLayerInstance>) => {
    if (!activeTextLayerId) return;

    capturePropertyHistory(`text:${activeTextLayerId}`);
    setTextLayers((prev) =>
      prev.map((item) => (item.id === activeTextLayerId ? { ...item, ...patch } : item)),
    );
  };

  const reorderLayerItems = (draggedId: string, targetId: string, position: 'before' | 'after') => {
    if (draggedId === targetId) return;

    const sourceIndex = draggableLayers.findIndex((item) => item.id === draggedId);
    const targetIndex = draggableLayers.findIndex((item) => item.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    captureHistory();

    const reordered = [...draggableLayers];
    const [moved] = reordered.splice(sourceIndex, 1);
    const rawInsertIndex = targetIndex + (position === 'after' ? 1 : 0);
    const insertIndex = sourceIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
    reordered.splice(insertIndex, 0, moved);

    const nextTextOrders = new Map<string, number>();
    const nextStickerOrders = new Map<string, number>();
    const nextStaticOrders = { ...staticLayerOrders };

    reordered.forEach((item, index) => {
      const order = reordered.length - index;

      if (item.kind === 'text' && item.textLayer) {
        nextTextOrders.set(item.textLayer.id, order);
      } else if (item.kind === 'sticker' && item.stickerLayer) {
        nextStickerOrders.set(item.stickerLayer.id, order);
      } else if (item.kind === 'static' && item.staticKey) {
        nextStaticOrders[item.staticKey] = order;
      }
    });

    setTextLayers((prev) =>
      prev.map((item) => (nextTextOrders.has(item.id) ? { ...item, order: nextTextOrders.get(item.id)! } : item)),
    );
    setStickerLayers((prev) =>
      prev.map((item) => (nextStickerOrders.has(item.id) ? { ...item, order: nextStickerOrders.get(item.id)! } : item)),
    );
    setStaticLayerOrders(nextStaticOrders);
    setDraggingLayerId(null);
    setDropIndicator(null);
    setLastAction(`Moved ${moved.label}`);
  };

  const reorderBackgroundLayerItems = (draggedId: string, targetId: string, position: 'before' | 'after') => {
    if (draggedId === targetId) return;

    const sourceIndex = backgroundLayerItems.findIndex((item) => item.id === draggedId);
    const targetIndex = backgroundLayerItems.findIndex((item) => item.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    captureHistory();

    const reordered = [...backgroundLayerItems];
    const [moved] = reordered.splice(sourceIndex, 1);
    const rawInsertIndex = targetIndex + (position === 'after' ? 1 : 0);
    const insertIndex = sourceIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
    reordered.splice(insertIndex, 0, moved);

    const nextOrders = new Map<string, number>();
    reordered.forEach((item, index) => {
      nextOrders.set(item.id, reordered.length - index);
    });

    setBackgroundLayers((prev) =>
      prev.map((item) => (nextOrders.has(item.id) ? { ...item, order: nextOrders.get(item.id)! } : item)),
    );
    setDraggingLayerId(null);
    setDropIndicator(null);
    setLastAction(`Moved ${moved.label}`);
  };

  const moveBackgroundLayerToEnd = (draggedId: string) => {
    const sourceIndex = backgroundLayerItems.findIndex((item) => item.id === draggedId);

    if (sourceIndex === -1 || sourceIndex === backgroundLayerItems.length - 1) return;

    captureHistory();

    const reordered = [...backgroundLayerItems];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.push(moved);

    const nextOrders = new Map<string, number>();
    reordered.forEach((item, index) => {
      nextOrders.set(item.id, reordered.length - index);
    });

    setBackgroundLayers((prev) =>
      prev.map((item) => (nextOrders.has(item.id) ? { ...item, order: nextOrders.get(item.id)! } : item)),
    );
    setDraggingLayerId(null);
    setDropIndicator(null);
    setLastAction(`Moved ${moved.label}`);
  };

  const clearDragPreview = () => {
    if (dragPreviewRef.current) {
      dragPreviewRef.current.remove();
      dragPreviewRef.current = null;
    }
  };

  const createDragHandlers = (layerId: string) => ({
    draggable: true,
    isDragging: draggingLayerId === layerId,
    dropIndicatorPosition: dropIndicator?.layerId === layerId ? dropIndicator.position : undefined,
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => {
      clearDragPreview();
      const source = event.currentTarget;
      const sourceRect = source.getBoundingClientRect();
      const preview = source.cloneNode(true) as HTMLElement;

      preview.style.position = 'fixed';
      preview.style.top = '-9999px';
      preview.style.left = '-9999px';
      preview.style.width = `${sourceRect.width}px`;
      preview.style.pointerEvents = 'none';
      preview.style.opacity = '0.98';
      preview.style.background = '#ffffff';
      preview.style.border = '2px solid rgba(0,153,149,0.95)';
      preview.style.borderRadius = '14px';
      preview.style.boxShadow = '0 18px 36px rgba(0,153,149,0.2)';
      preview.style.transform = 'rotate(2deg) scale(1.02)';
      preview.style.overflow = 'hidden';
      preview.style.zIndex = '9999';
      document.body.appendChild(preview);
      dragPreviewRef.current = preview;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setDragImage(preview, 24, 24);
      setDraggingLayerId(layerId);
    },
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (draggingLayerId && !draggingLayerId.startsWith('background:') && draggingLayerId !== layerId) {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        setDropIndicator({ layerId, position });
      }
    },
    onDrop: (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!draggingLayerId || draggingLayerId.startsWith('background:') || draggingLayerId === layerId) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
      reorderLayerItems(draggingLayerId, layerId, position);
    },
    onDragEnd: () => {
      clearDragPreview();
      setDraggingLayerId(null);
      setDropIndicator(null);
    },
  });

  const createBackgroundDragHandlers = (layerId: string, draggableEnabled = true) => {
    const encodedLayerId = `background:${layerId}`;

    return {
      draggable: draggableEnabled,
      showDragHandle: draggableEnabled,
      isDragging: draggingLayerId === encodedLayerId,
      dropIndicatorPosition:
        dropIndicator?.layerId === encodedLayerId ? dropIndicator.position : undefined,
      onDragStart: !draggableEnabled
        ? undefined
        : (event: React.DragEvent<HTMLDivElement>) => {
        clearDragPreview();
        const source = event.currentTarget;
        const sourceRect = source.getBoundingClientRect();
        const preview = source.cloneNode(true) as HTMLElement;

        preview.style.position = 'fixed';
        preview.style.top = '-9999px';
        preview.style.left = '-9999px';
        preview.style.width = `${sourceRect.width}px`;
        preview.style.pointerEvents = 'none';
        preview.style.opacity = '0.98';
        preview.style.background = '#ffffff';
        preview.style.border = '2px solid rgba(0,153,149,0.95)';
        preview.style.borderRadius = '14px';
        preview.style.boxShadow = '0 18px 36px rgba(0,153,149,0.2)';
        preview.style.transform = 'rotate(2deg) scale(1.02)';
        preview.style.overflow = 'hidden';
        preview.style.zIndex = '9999';
        document.body.appendChild(preview);
        dragPreviewRef.current = preview;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setDragImage(preview, 24, 24);
        setDraggingLayerId(encodedLayerId);
      },
      onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggingLayerId && draggingLayerId.startsWith('background:') && draggingLayerId !== encodedLayerId) {
          const rect = event.currentTarget.getBoundingClientRect();
          const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
          setDropIndicator({ layerId: encodedLayerId, position });
        }
      },
      onDrop: (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!draggingLayerId || !draggingLayerId.startsWith('background:') || draggingLayerId === encodedLayerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        reorderBackgroundLayerItems(draggingLayerId.replace('background:', ''), layerId, position);
      },
      onDragEnd: !draggableEnabled
        ? undefined
        : () => {
        clearDragPreview();
        setDraggingLayerId(null);
        setDropIndicator(null);
      },
    };
  };

  const resetState = () => {
    captureHistory();
    setActiveTool('template');
    setActiveLayerKey('product');
    setSelectedTemplateId('simple-2');
    setSelectedProductId('matcha-jar');
    setBaseBackgroundId('teal-solid');
    setSelectedBackgroundId('teal-solid');
    setSelectedTextPresetId(null);
    setTextLayers([]);
    setActiveTextLayerId(null);
    setBackgroundLayers([]);
    setActiveBackgroundLayerId(null);
    setStickerLayers([]);
    setActiveStickerLayerId(null);
    setNextOverlayOrder(INITIAL_OVERLAY_ORDER);
    setRemoveBackground(true);
    setSafeZone(false);
    setTextPanelOpen({
      typography: false,
      color: false,
      styles: false,
    });
    setPropertyUndoStacks({});
    setPropertyRedoStacks({});
    setStaticLayerOrders({ ...DEFAULT_STATIC_LAYER_ORDERS });
    setDraggingLayerId(null);
    setDropIndicator(null);
    setExpandedLayers({
      backgroundPrimary: false,
      backgroundSecondary: false,
      decorationBand: false,
      product: false,
      decorationPattern: false,
      textHeadline: false,
      textCaption: false,
      decorationArrow: false,
    });
    setLastAction('Reset');
    setDrawerOpen(true);
  };

  const renderToolBody = (tool: ToolKey) => {
    if (tool === 'template') {
      return (
        <>
          <div className="mb-2">
            <KsTabs
              activeTabId={templateTab}
              size="md"
              type="default"
              onActiveTabIdChange={(value: string | CustomEvent<string | [string]>) => {
                const next = typeof value === 'string'
                  ? value
                  : Array.isArray(value.detail)
                    ? value.detail[0]
                    : value.detail;
                if (next === 'recommended' || next === 'saved') {
                  setTemplateTab(next);
                }
              }}
            >
              <span slot="recommended">Recommended</span>
              <span slot="saved">Your saved</span>
              <KsTabItem tabId="recommended" />
              <KsTabItem tabId="saved" />
            </KsTabs>
          </div>
          <div className="mb-4 text-[12px] leading-4 text-neutral-onSurface">
            Templates are optimized to maximize campaign performance. For best results, we recommend not making any edits to them.
          </div>

          {templateTab === 'recommended' ? (
            <div className="space-y-5 pb-2">
              {TEMPLATE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[13px] font-semibold text-neutral-highOnSurface">{group.title}</div>
                    <button type="button" className="text-[11px] font-medium text-primary-onSurface">
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          captureHistory();
                          setSelectedTemplateId(item.id);
                          setToolPanelVisible(false);
                          setLastAction(`Selected ${item.label}`);
                        }}
                      >
                        <TemplateThumbnail card={item} active={item.id === selectedTemplateId} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[160px] items-center justify-center text-[12px] text-neutral-onSurface">
              No saved templates yet.
            </div>
          )}
        </>
      );
    }

    if (tool === 'background') {
      return (
        <div>
          <div className="mb-4 text-[14px] font-semibold text-neutral-highOnSurface">Uploaded images</div>
          <div className="grid grid-cols-3 gap-8 gap-y-14">
            <button
              type="button"
              className="flex aspect-[1/1.55] items-center justify-center rounded-[4px] border border-dashed border-neutral-fillMed bg-white text-[36px] text-neutral-highOnSurface"
            >
              +
            </button>
            {BACKGROUND_ASSETS.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  captureHistory();
                  const nextOrder =
                    backgroundLayers.length > 0 ? Math.max(...backgroundLayers.map((item) => item.order)) + 1 : 1;
                  const nextLayer = createBackgroundLayer(asset, nextOverlayOrder, nextOrder);
                  setBackgroundLayers((prev) => [...prev, nextLayer]);
                  setSelectedBackgroundId(asset.id);
                  setActiveTool('background');
                  setActiveLayerKey('backgroundSecondary');
                  setActiveTextLayerId(null);
                  setActiveBackgroundLayerId(nextLayer.id);
                  setActiveStickerLayerId(null);
                  setToolPanelVisible(false);
                  setNextOverlayOrder((prev) => prev + 1);
                  setLastAction(`Added ${asset.label}`);
                }}
                className={[
                  'aspect-[1/1.55] rounded-[4px] border transition-all',
                  selectedBackgroundId === asset.id
                    ? 'border-[#12b3a6] shadow-[0_0_0_1px_rgba(18,179,166,0.18)]'
                    : 'border-neutral-fillLow',
                ].join(' ')}
                style={{ background: asset.thumbnail }}
                aria-label={asset.label}
              />
            ))}
          </div>
        </div>
      );
    }

    if (tool === 'text') {
      return (
        <div>
          <div className="mb-4 text-[14px] font-semibold text-neutral-highOnSurface">Add text</div>
          <div className="grid grid-cols-2 gap-4">
            {TEXT_PRESETS.map((preset) => {
              const active = preset.id === selectedTextPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    captureHistory();
                    const nextLayer = createTextLayer(preset, textLayers.length, nextOverlayOrder);
                    setSelectedTextPresetId(preset.id);
                    setTextLayers((prev) => [...prev, nextLayer]);
                    setActiveLayerKey('textHeadline');
                    setActiveTextLayerId(nextLayer.id);
                    setActiveBackgroundLayerId(null);
                    setActiveStickerLayerId(null);
                    setActiveTool('text');
                    setTextPanelOpen({
                      typography: false,
                      color: false,
                      styles: false,
                    });
                    setToolPanelVisible(false);
                    setNextOverlayOrder((prev) => prev + 1);
                    setLastAction(`Added ${preset.label}`);
                  }}
                  className={[
                    'flex h-[64px] items-center justify-center rounded-[4px] border bg-[#f6f6f6] px-3 text-center transition-all',
                    active ? 'border-[#12b3a6] shadow-[0_0_0_1px_rgba(18,179,166,0.16)]' : 'border-transparent hover:border-neutral-fillMed',
                  ].join(' ')}
                >
                  {preset.id === 'sale' ? (
                    <span className="rounded-full bg-[#8b5cf6] px-3 py-1 text-[13px] font-semibold text-[#ffd54f]">
                      {preset.preview}
                    </span>
                  ) : (
                    <span className={['text-[13px] font-semibold', preset.className].join(' ')}>{preset.preview}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (tool === 'sticker') {
      const groups: Array<{ key: StickerPreset['group']; title: string; badge?: string }> = [
        { key: 'uploaded', title: 'Uploaded stickers' },
        { key: 'seasonal', title: 'Seasonal stickers', badge: 'New' },
        { key: 'selling', title: 'Selling-point stickers' },
        { key: 'effect', title: 'Effect stickers' },
      ];

      return (
        <div className="space-y-5">
          <div className="text-[14px] font-semibold text-neutral-highOnSurface">Add stickers</div>
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-neutral-highOnSurface">{group.title}</span>
                  {group.badge && (
                    <span className="rounded-full bg-[#ff6b35] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {group.badge}
                    </span>
                  )}
                </div>
                <button type="button" className="text-[11px] font-medium text-primary-onSurface">
                  See all
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {group.key === 'uploaded' && (
                  <button
                    type="button"
                    className="flex aspect-square items-center justify-center rounded-[4px] border border-dashed border-neutral-fillMed bg-white text-[36px] text-neutral-highOnSurface"
                  >
                    +
                  </button>
                )}
                {STICKER_PRESETS.filter((item) => item.group === group.key).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      captureHistory();
                      const nextLayer = createStickerLayer(preset, stickerLayers.length, nextOverlayOrder);
                      setStickerLayers((prev) => [...prev, nextLayer]);
                      setActiveStickerLayerId(nextLayer.id);
                      setActiveTextLayerId(null);
                      setActiveBackgroundLayerId(null);
                      setActiveTool('sticker');
                      setToolPanelVisible(false);
                      setNextOverlayOrder((prev) => prev + 1);
                      setLastAction(`Added ${preset.label}`);
                    }}
                    className="aspect-square rounded-[4px] border border-neutral-fillLow bg-[#f7f7f7] p-2 transition-all hover:border-neutral-fillMed"
                  >
                    <StickerGraphic preset={preset} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        <div className="text-[14px] text-neutral-lowOnSurface">Unsupported tab</div>
      </div>
    );
  };

  const renderPropertyHeader = (thumb: ReactNode, title: string) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {thumb}
        <div className="text-[14px] font-medium text-neutral-highOnSurface">{title}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous step"
          onClick={handlePropertyUndo}
          disabled={!activePropertyScopeKey || !(propertyUndoStacks[activePropertyScopeKey]?.length ?? 0)}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-[8px] text-[20px] transition-colors',
            activePropertyScopeKey && (propertyUndoStacks[activePropertyScopeKey]?.length ?? 0)
              ? 'text-black hover:bg-neutral-surface1Hover'
              : 'cursor-not-allowed text-[#a3a3a3]',
          ].join(' ')}
        >
          ↩
        </button>
        <button
          type="button"
          aria-label="Next step"
          onClick={handlePropertyRedo}
          disabled={!activePropertyScopeKey || !(propertyRedoStacks[activePropertyScopeKey]?.length ?? 0)}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-[8px] text-[20px] transition-colors',
            activePropertyScopeKey && (propertyRedoStacks[activePropertyScopeKey]?.length ?? 0)
              ? 'text-black hover:bg-neutral-surface1Hover'
              : 'cursor-not-allowed text-[#a3a3a3]',
          ].join(' ')}
        >
          ↪
        </button>
      </div>
    </div>
  );

  const renderBackgroundPropertyGrid = (mode: 'base' | 'layer') => {
    const layer = mode === 'layer' ? activeBackgroundLayer : null;
    const currentBackgroundId = mode === 'layer' ? layer?.assetId : baseBackgroundId;
    const currentBackgroundAsset =
      BACKGROUND_ASSETS.find((item) => item.id === currentBackgroundId) ?? BACKGROUND_ASSETS[0];

    return (
      <div className="space-y-5">
        {renderPropertyHeader(
          <div className="h-8 w-8 rounded-[6px] border border-neutral-fillLow" style={{ background: currentBackgroundAsset.thumbnail }} />,
          'Background',
        )}

        <div className="grid grid-cols-5 gap-3">
          <button
            type="button"
            className="flex aspect-[1/1.55] items-center justify-center rounded-[8px] border border-dashed border-[#d9dcdf] bg-white text-[36px] text-neutral-highOnSurface"
            aria-label="Upload background"
          >
            +
          </button>
          {BACKGROUND_ASSETS.map((presetAsset) => {
            const presetActive = presetAsset.id === currentBackgroundId;

            return (
              <button
                key={`${mode}-${presetAsset.id}`}
                type="button"
                onClick={() => {
                  capturePropertyHistory(mode === 'layer' && layer ? `background:${layer.id}` : 'background:base');
                  if (mode === 'layer' && layer) {
                    setBackgroundLayers((prev) =>
                      prev.map((item) => (item.id === layer.id ? { ...item, assetId: presetAsset.id } : item)),
                    );
                    setActiveBackgroundLayerId(layer.id);
                    setSelectedBackgroundId(presetAsset.id);
                    setActiveLayerKey('backgroundSecondary');
                    setLastAction(`Updated ${layer.label}`);
                    return;
                  }

                  setBaseBackgroundId(presetAsset.id);
                  setSelectedBackgroundId(presetAsset.id);
                  setActiveLayerKey('backgroundPrimary');
                  setActiveBackgroundLayerId(null);
                  setLastAction('Updated Background');
                }}
                className={[
                  'aspect-[1/1.55] rounded-[8px] border transition-all',
                  presetActive
                    ? 'border-[#009995] shadow-[0_0_0_2px_rgba(0,153,149,0.18)]'
                    : 'border-neutral-fillLow',
                ].join(' ')}
                style={{ background: presetAsset.thumbnail }}
                aria-label={presetAsset.label}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderTextPropertiesPanel = () => {
    if (!activeTextLayer) {
      return <div className="text-[13px] text-neutral-lowOnSurface">Select a text layer to edit.</div>;
    }

    const previewLength = activeTextLayer.preview.length;
    const activeTextPreset = TEXT_PRESETS.find((item) => item.id === activeTextLayer.presetId);

    return (
      <div className="space-y-5">
        {renderPropertyHeader(
          activeTextPreset ? (
            <TextLayerThumb
              preset={activeTextPreset}
              preview={activeTextLayer.preview}
              color={activeTextLayer.color}
            />
          ) : (
            <div className="h-8 w-8 rounded-[6px] border border-neutral-fillLow bg-white" />
          ),
          'Text',
        )}

        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-neutral-highOnSurface">Dynamic text</span>
          <button
            type="button"
            onClick={() => updateActiveTextLayer({ dynamicTextEnabled: !activeTextLayer.dynamicTextEnabled })}
            className={`flex h-6 w-[40px] items-center rounded-full px-[2px] transition-colors ${activeTextLayer.dynamicTextEnabled ? 'bg-[#12b3a6]' : 'bg-[#d6d7d9]'}`}
          >
            <span className={`h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition-transform ${activeTextLayer.dynamicTextEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[#12b3a6] bg-white">
          <textarea
            value={activeTextLayer.preview}
            maxLength={100}
            onChange={(event) => updateActiveTextLayer({ preview: event.target.value })}
            className="h-[120px] w-full resize-none border-0 px-5 py-4 text-[16px] leading-7 text-neutral-highOnSurface outline-none"
          />
          <div className="px-5 pb-3 text-right text-[14px] text-neutral-lowOnSurface">{previewLength} / 100</div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setTextPanelOpen((prev) => ({ ...prev, typography: !prev.typography }))}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[14px] font-medium text-neutral-highOnSurface">Typography</span>
            <span className="text-[18px] text-neutral-highOnSurface">{textPanelOpen.typography ? '⌃' : '⌄'}</span>
          </button>
          {textPanelOpen.typography && (
            <div className="pt-3">
              <div className="flex gap-2">
                <select value={activeTextLayer.fontFamily} onChange={(event) => updateActiveTextLayer({ fontFamily: event.target.value })} className="min-w-0 flex-1 rounded-[8px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface">
                  {FONT_FAMILIES.map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
                <select value={activeTextLayer.fontSize} onChange={(event) => updateActiveTextLayer({ fontSize: event.target.value })} className="w-[82px] rounded-[8px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface">
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as TextAlignMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateActiveTextLayer({ align: mode })}
                    className={[
                      'rounded-[8px] border px-3 py-2 text-[14px]',
                      activeTextLayer.align === mode
                        ? 'border-[#12b3a6] bg-[#ecfbf8] text-[#12b3a6]'
                        : 'border-neutral-fillLow bg-white text-neutral-lowOnSurface',
                    ].join(' ')}
                  >
                    {mode === 'left' ? '≡' : mode === 'center' ? '☰' : '≣'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setTextPanelOpen((prev) => ({ ...prev, color: !prev.color }))}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[14px] font-medium text-neutral-highOnSurface">Color</span>
            <span className="text-[18px] text-neutral-highOnSurface">{textPanelOpen.color ? '⌃' : '⌄'}</span>
          </button>
          {textPanelOpen.color && (
            <div className="pt-3">
              <div className="overflow-hidden rounded-[8px] border border-neutral-fillLow">
                <div className="h-[132px] w-full" style={{ background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #000 100%), linear-gradient(90deg, #fff 0%, ${activeTextLayer.color} 100%)` }} />
                <div className="h-3 w-full bg-[linear-gradient(90deg,#ff0000_0%,#fff000_17%,#00ff00_33%,#00ffff_50%,#0000ff_66%,#ff00ff_83%,#ff0000_100%)]" />
              </div>
              <div className="mt-3 flex gap-2">
                <input value={activeTextLayer.color} onChange={(event) => updateActiveTextLayer({ color: event.target.value })} className="min-w-0 flex-1 rounded-[8px] border border-neutral-fillLow px-3 py-2 text-[13px] text-neutral-highOnSurface" />
                <label className="relative h-[38px] w-[38px] overflow-hidden rounded-[8px] border border-neutral-fillLow" style={{ background: activeTextLayer.color }}>
                  <input type="color" value={activeTextLayer.color} onChange={(event) => updateActiveTextLayer({ color: event.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setTextPanelOpen((prev) => ({ ...prev, styles: !prev.styles }))}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[14px] font-medium text-neutral-highOnSurface">Styles</span>
            <span className="text-[18px] text-neutral-highOnSurface">{textPanelOpen.styles ? '⌃' : '⌄'}</span>
          </button>
          {textPanelOpen.styles && (
            <div className="pt-3 text-[13px] text-neutral-lowOnSurface">No additional styles are configured for this text layer.</div>
          )}
        </div>
      </div>
    );
  };

  const renderPropertiesBody = () => {
    const renderDecorationReplacePanel = (kind: 'arrow' | 'dots' | 'band') => (
      <div className="space-y-5">
        {renderPropertyHeader(<LayerPreviewThumb kind={kind} frame={currentFrame} />, 'Decoration')}
        <div className="flex">
          <button
            type="button"
            className="flex h-[84px] w-[84px] items-center justify-center rounded-[10px] border border-dashed border-[#c9cdd2] bg-white text-[36px] leading-none text-neutral-highOnSurface transition-colors hover:border-[#aeb5bc]"
            aria-label="Replace decoration"
          >
            +
          </button>
        </div>
      </div>
    );

    if (activeTextLayerId) {
      return renderTextPropertiesPanel();
    }

    if (activeLayerKey === 'product') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {PRODUCT_OPTIONS.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                captureHistory();
                setSelectedProductId(product.id);
                setLastAction(`Selected ${product.label}`);
              }}
              className="transition-transform hover:-translate-y-0.5"
              aria-label={product.label}
            >
              <ProductThumb product={product} active={selectedProductId === product.id} />
            </button>
          ))}
        </div>
      );
    }

    if (activeLayerKey === 'backgroundPrimary' && activeBackgroundLayerId === null) {
      return renderBackgroundPropertyGrid('base');
    }

    if (activeBackgroundLayerId && activeBackgroundLayer) {
      return renderBackgroundPropertyGrid('layer');
    }

    if (activeStickerLayerId && activeStickerLayer) {
      const stickerPreset = STICKER_PRESETS.find((item) => item.id === activeStickerLayer.presetId);

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[12px] border border-neutral-fillLow bg-[#fafafa] p-4">
            <div className="h-12 w-12 overflow-hidden rounded-[8px] border border-neutral-fillLow bg-white p-2">
              {stickerPreset && <StickerGraphic preset={stickerPreset} compact />}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-neutral-highOnSurface">{activeStickerLayer.label}</div>
              <div className="text-[12px] text-neutral-lowOnSurface">Sticker layer has no editable properties.</div>
            </div>
          </div>
        </div>
      );
    }

    if (
      activeLayerKey === 'decorationArrow' ||
      activeLayerKey === 'decorationPattern' ||
      activeLayerKey === 'decorationBand'
    ) {
      if (activeLayerKey === 'decorationArrow') {
        return renderDecorationReplacePanel('arrow');
      }

      if (activeLayerKey === 'decorationPattern') {
        return renderDecorationReplacePanel('dots');
      }

      return renderDecorationReplacePanel('band');
    }

    return <div className="text-[13px] text-neutral-lowOnSurface">Select a layer to edit its settings.</div>;
  };

  const shouldShowPropertiesPanel =
    Boolean(activeTextLayerId) ||
    Boolean(activeBackgroundLayerId) ||
    (activeLayerKey === 'backgroundPrimary' && activeBackgroundLayerId === null) ||
    (activeStickerLayerId === null &&
      activeBackgroundLayerId === null &&
      activeTextLayerId === null &&
      (activeLayerKey === 'decorationArrow' ||
        activeLayerKey === 'decorationPattern' ||
        activeLayerKey === 'decorationBand'));
  const visibleToolPanel = hoveredTool ?? (toolPanelVisible ? activeTool : null);

  return (
    <div className="min-h-screen bg-neutral-surface2">
      <Header />

      <div className="relative">
        <MockBackstagePanel />

        {!drawerOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(true);
                setLastAction('Reopened');
              }}
              className="rounded-full bg-primary-fill px-5 py-3 text-[14px] font-semibold text-primary-onFill shadow-lg"
            >
              Open carousel template editor
            </button>
          </div>
        )}

        {drawerOpen && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-y-0 right-0 flex w-[1120px] max-w-full bg-neutral-surface shadow-[-12px_0_40px_rgba(0,0,0,0.14)]">
              <div
                className="flex w-[96px] shrink-0 flex-col border-r border-neutral-fillLow bg-neutral-surface px-3 py-4"
                onMouseLeave={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  if (event.clientX <= bounds.left) {
                    setHoveredTool(null);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  {TOOL_ITEMS.map((item) => {
                    const emphasized = item.key === visibleToolPanel;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onMouseEnter={() => {
                          setHoveredTool(item.key);
                        }}
                        onClick={() => {
                          setActiveTool(item.key);
                          setToolPanelVisible(true);
                        }}
                        aria-pressed={emphasized}
                        className={[
                          'flex h-14 w-full flex-col items-center justify-center gap-1 rounded-[4px] transition-colors',
                          emphasized ? 'bg-[#f3f3f3] text-[#161823]' : 'text-[#6b6f76] hover:bg-[#f7f7f7]',
                        ].join(' ')}
                      >
                        <EditorToolIcon tool={item.key} />
                        <span className="text-center text-[12px] leading-4">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex min-w-0 flex-1 bg-[#f2f2f2] pb-[76px]">
                <div
                  className="relative flex w-[304px] shrink-0 flex-col border-r border-neutral-fillLow bg-[#ffffff]"
                  onClick={() => {
                    if (toolPanelVisible) {
                      setToolPanelVisible(false);
                    }
                    setHoveredTool(null);
                  }}
                >
                  {visibleToolPanel && (
                    <div className="absolute bottom-[10px] left-[10px] right-[-18px] top-[10px] z-20 overflow-hidden rounded-[8px] bg-[#ffffff] px-4 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                      <div className="h-full overflow-y-auto">{renderToolBody(visibleToolPanel)}</div>
                    </div>
                  )}
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#ffffff] px-4 py-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="text-[18px] font-medium text-neutral-highOnSurface">Layers</div>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {!isDraggingBackgroundLayer && draggingLayerId && firstDraggableLayerId && draggingLayerId !== firstDraggableLayerId && (
                      <div
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                          setDropIndicator({ layerId: LIST_START_DROP_ID, position: 'before' });
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          reorderLayerItems(draggingLayerId, firstDraggableLayerId, 'before');
                        }}
                        className="relative h-4"
                      >
                        {dropIndicator?.layerId === LIST_START_DROP_ID && (
                          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#009995]" />
                        )}
                      </div>
                    )}
                    {draggableLayers.map((overlay) => {
                      if (overlay.kind === 'text' && overlay.textLayer) {
                        const textLayer = overlay.textLayer;
                        const textPreset = TEXT_PRESETS.find((item) => item.id === textLayer.presetId);

                        if (!textPreset) return null;

                        return (
                          <AccordionRow
                            key={textLayer.id}
                            label={textLayer.label}
                            open={false}
                            active={activeTextLayerId === textLayer.id}
                            showChevron={false}
                            preview="headline"
                            frame={currentFrame}
                            thumb={
                              <TextLayerThumb
                                preset={textPreset}
                                preview={textLayer.preview}
                                color={textLayer.color}
                              />
                            }
                            {...createDragHandlers(overlay.id)}
                            onClick={() => {
                              setActiveLayerKey('textHeadline');
                              setActiveBackgroundLayerId(null);
                              setActiveStickerLayerId(null);
                              setTextPanelOpen({
                                typography: false,
                                color: false,
                                styles: false,
                              });
                              setToolPanelVisible(false);
                              setActiveTextLayerId(textLayer.id);
                            }}
                          >
                            {activeTextLayerId === textLayer.id && activeTextLayer && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[14px] font-semibold text-neutral-highOnSurface">Dynamic text</span>
                                  <button
                                    type="button"
                                    onClick={() => updateActiveTextLayer({ dynamicTextEnabled: !activeTextLayer.dynamicTextEnabled })}
                                    className={`flex h-6 w-10 items-center rounded-full px-[2px] transition-colors ${activeTextLayer.dynamicTextEnabled ? 'bg-[#12b3a6]' : 'bg-neutral-fillMed'}`}
                                  >
                                    <span className={`h-5 w-5 rounded-full bg-white transition-transform ${activeTextLayer.dynamicTextEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </button>
                                </div>
                                <select className="w-full rounded-[8px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface" value="Sale price" onChange={() => undefined}>
                                  <option>Sale price</option>
                                </select>
                                <div className="rounded-[8px] border border-neutral-fillLow bg-[#fafafa] px-3 py-2">
                                  <div className="min-h-[52px] text-[13px] leading-5 text-neutral-highOnSurface">
                                    {textLayer.preview} <span className="font-semibold text-[#12b3a6]">@Sale price</span>
                                  </div>
                                  <div className="mt-2 text-right text-[12px] text-neutral-lowOnSurface">19/100</div>
                                </div>
                                <div className="border-t border-neutral-fillLow pt-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setTextPanelOpen((prev) => ({ ...prev, typography: !prev.typography }))
                                    }
                                    className="mb-3 flex w-full items-center justify-between text-left"
                                  >
                                    <span className="text-[14px] font-semibold text-neutral-highOnSurface">Typography</span>
                                    <span className="text-[14px] text-neutral-lowOnSurface">
                                      {textPanelOpen.typography ? '^' : 'v'}
                                    </span>
                                  </button>
                                  {textPanelOpen.typography && (
                                    <>
                                      <div className="flex gap-2">
                                        <select value={activeTextLayer.fontFamily} onChange={(event) => updateActiveTextLayer({ fontFamily: event.target.value })} className="min-w-0 flex-1 rounded-[8px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface">
                                          {FONT_FAMILIES.map((family) => (
                                            <option key={family} value={family}>
                                              {family}
                                            </option>
                                          ))}
                                        </select>
                                        <select value={activeTextLayer.fontSize} onChange={(event) => updateActiveTextLayer({ fontSize: event.target.value })} className="w-[82px] rounded-[8px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface">
                                          {FONT_SIZES.map((size) => (
                                            <option key={size} value={size}>
                                              {size}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="mt-3 grid grid-cols-3 gap-2">
                                        {(['left', 'center', 'right'] as TextAlignMode[]).map((mode) => (
                                          <button
                                            key={mode}
                                            type="button"
                                            onClick={() => updateActiveTextLayer({ align: mode })}
                                            className={[
                                              'rounded-[8px] border px-3 py-2 text-[14px]',
                                              activeTextLayer.align === mode
                                                ? 'border-[#12b3a6] bg-[#ecfbf8] text-[#12b3a6]'
                                                : 'border-neutral-fillLow bg-white text-neutral-lowOnSurface',
                                            ].join(' ')}
                                          >
                                            {mode === 'left' ? '≡' : mode === 'center' ? '☰' : '≣'}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="border-t border-neutral-fillLow pt-4">
                                  <button
                                    type="button"
                                    onClick={() => setTextPanelOpen((prev) => ({ ...prev, color: !prev.color }))}
                                    className="mb-3 flex w-full items-center justify-between text-left"
                                  >
                                    <span className="text-[14px] font-semibold text-neutral-highOnSurface">Color</span>
                                    <span className="text-[14px] text-neutral-lowOnSurface">
                                      {textPanelOpen.color ? '^' : 'v'}
                                    </span>
                                  </button>
                                  {textPanelOpen.color && (
                                    <>
                                      <div className="overflow-hidden rounded-[8px] border border-neutral-fillLow">
                                        <div className="h-[132px] w-full" style={{ background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #000 100%), linear-gradient(90deg, #fff 0%, ${activeTextLayer.color} 100%)` }} />
                                        <div className="h-3 w-full bg-[linear-gradient(90deg,#ff0000_0%,#fff000_17%,#00ff00_33%,#00ffff_50%,#0000ff_66%,#ff00ff_83%,#ff0000_100%)]" />
                                      </div>
                                      <div className="mt-3 flex gap-2">
                                        <input value={activeTextLayer.color} onChange={(event) => updateActiveTextLayer({ color: event.target.value })} className="min-w-0 flex-1 rounded-[8px] border border-neutral-fillLow px-3 py-2 text-[13px] text-neutral-highOnSurface" />
                                        <label className="relative h-[38px] w-[38px] overflow-hidden rounded-[8px] border border-neutral-fillLow" style={{ background: activeTextLayer.color }}>
                                          <input type="color" value={activeTextLayer.color} onChange={(event) => updateActiveTextLayer({ color: event.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
                                        </label>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </AccordionRow>
                        );
                      }

                      if (overlay.kind === 'sticker' && overlay.stickerLayer) {
                        const stickerLayer = overlay.stickerLayer;
                        const stickerPreset = STICKER_PRESETS.find((item) => item.id === stickerLayer.presetId);

                        if (!stickerPreset) return null;

                        return (
                          <StickerLayerRow
                            key={stickerLayer.id}
                            label={stickerLayer.label}
                            preset={stickerPreset}
                            active={activeStickerLayerId === stickerLayer.id}
                            {...createDragHandlers(overlay.id)}
                            onClick={() => {
                              setActiveLayerKey('decorationPattern');
                              setActiveTextLayerId(null);
                              setActiveBackgroundLayerId(null);
                              setActiveStickerLayerId(stickerLayer.id);
                            }}
                          />
                        );
                      }

                      if (overlay.staticKey === 'decorationArrow') {
                        return (
                          <AccordionRow
                            key={overlay.id}
                            label="Decoration"
                            open={false}
                            active={activeLayerKey === 'decorationArrow'}
                            showChevron={false}
                            preview="arrow"
                            frame={currentFrame}
                            {...createDragHandlers(overlay.id)}
                            onClick={() => toggleLayer('decorationArrow')}
                          />
                        );
                      }

                      if (overlay.staticKey === 'decorationPattern') {
                        return (
                          <AccordionRow
                            key={overlay.id}
                            label="Decoration"
                            open={false}
                            active={activeLayerKey === 'decorationPattern'}
                            showChevron={false}
                            preview="dots"
                            frame={currentFrame}
                            {...createDragHandlers(overlay.id)}
                            onClick={() => toggleLayer('decorationPattern')}
                          />
                        );
                      }

                      if (overlay.staticKey === 'product') {
                        return (
                          <ProductLayerRow
                            key={overlay.id}
                            label="Product"
                            product={currentProduct}
                            active={activeLayerKey === 'product'}
                            {...createDragHandlers(overlay.id)}
                            onClick={() => {
                              setActiveLayerKey('product');
                              setActiveTextLayerId(null);
                              setActiveBackgroundLayerId(null);
                              setActiveStickerLayerId(null);
                            }}
                          />
                        );
                      }

                      if (overlay.staticKey === 'decorationBand') {
                        return (
                          <AccordionRow
                            key={overlay.id}
                            label="Decoration"
                            open={false}
                            active={activeLayerKey === 'decorationBand'}
                            showChevron={false}
                            preview="band"
                            frame={currentFrame}
                            {...createDragHandlers(overlay.id)}
                            onClick={() => toggleLayer('decorationBand')}
                          />
                        );
                      }

                      return null;
                    })}
                    <div className="my-1 border-t border-[#d9dcdf]" />
                    {isDraggingBackgroundLayer && firstBackgroundLayerId && draggingLayerId !== `background:${firstBackgroundLayerId}` && (
                      <div
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                          setDropIndicator({ layerId: BACKGROUND_LIST_START_DROP_ID, position: 'before' });
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (!draggingLayerId) return;
                          reorderBackgroundLayerItems(draggingLayerId.replace('background:', ''), firstBackgroundLayerId, 'before');
                        }}
                        className="relative h-4"
                      >
                        {dropIndicator?.layerId === BACKGROUND_LIST_START_DROP_ID && (
                          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#009995]" />
                        )}
                      </div>
                    )}
                    {backgroundLayerItems.map((layer) => {
                      const asset = BACKGROUND_ASSETS.find((item) => item.id === layer.assetId);
                      if (!asset) return null;
                      const isOpen = activeBackgroundLayerId === layer.id;

                      return (
                        <BackgroundLayerRow
                          key={layer.id}
                          label={layer.label}
                          asset={asset}
                          active={isOpen}
                          open={false}
                          showChevron={false}
                          {...createBackgroundDragHandlers(layer.id)}
                          onClick={() => {
                            setActiveLayerKey('backgroundSecondary');
                            setSelectedBackgroundId(layer.assetId);
                            setActiveTextLayerId(null);
                            setActiveStickerLayerId(null);
                            setActiveBackgroundLayerId((prev) => (prev === layer.id ? null : layer.id));
                          }}
                        >
                          <div className="grid grid-cols-5 gap-3">
                            <button
                              type="button"
                              className="flex aspect-[1/1.55] items-center justify-center rounded-[8px] border border-dashed border-[#d9dcdf] bg-white text-[36px] text-neutral-highOnSurface"
                            >
                              +
                            </button>
                            {BACKGROUND_ASSETS.map((presetAsset) => {
                              const presetActive = presetAsset.id === layer.assetId;

                              return (
                                <button
                                  key={presetAsset.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    captureHistory();
                                    setBackgroundLayers((prev) =>
                                      prev.map((item) =>
                                        item.id === layer.id ? { ...item, assetId: presetAsset.id } : item,
                                      ),
                                    );
                                    setSelectedBackgroundId(presetAsset.id);
                                    setActiveLayerKey('backgroundSecondary');
                                    setActiveBackgroundLayerId(layer.id);
                                    setLastAction(`Updated ${layer.label}`);
                                  }}
                                  className={[
                                    'aspect-[1/1.55] rounded-[8px] border transition-all',
                                    presetActive
                                      ? 'border-[#009995] shadow-[0_0_0_2px_rgba(0,153,149,0.18)]'
                                      : 'border-neutral-fillLow',
                                  ].join(' ')}
                                  style={{ background: presetAsset.thumbnail }}
                                  aria-label={presetAsset.label}
                                />
                              );
                            })}
                          </div>
                        </BackgroundLayerRow>
                      );
                    })}
                    {isDraggingBackgroundLayer && lastBackgroundLayerId && draggingLayerId !== `background:${lastBackgroundLayerId}` && (
                      <div
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                          setDropIndicator({ layerId: BACKGROUND_LIST_END_DROP_ID, position: 'after' });
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (!draggingLayerId) return;
                          moveBackgroundLayerToEnd(draggingLayerId.replace('background:', ''));
                        }}
                        className="relative h-4"
                      >
                        {dropIndicator?.layerId === BACKGROUND_LIST_END_DROP_ID && (
                          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#009995]" />
                        )}
                      </div>
                    )}
                    <BackgroundLayerRow
                      label="Background"
                      asset={baseBackground}
                      active={activeLayerKey === 'backgroundPrimary' && activeBackgroundLayerId === null}
                      showChevron={false}
                      onClick={() => {
                        setActiveLayerKey('backgroundPrimary');
                        setActiveBackgroundLayerId(null);
                        setSelectedBackgroundId(baseBackground.id);
                        setActiveTextLayerId(null);
                        setActiveStickerLayerId(null);
                      }}
                    />

                    </div>
                  </div>
                </div>

                <div
                  className="flex min-w-0 flex-1 justify-center bg-[#f2f2f2] px-4 py-6"
                  onClick={() => {
                    if (toolPanelVisible) {
                      setToolPanelVisible(false);
                    }
                  }}
                  onMouseEnter={() => {
                    setHoveredTool(null);
                  }}
                >
                  <div className="flex w-[424px] flex-col items-center">
                  <div className="mb-4 flex w-full items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        captureHistory();
                        setRemoveBackground((prev) => !prev);
                        setLastAction(removeBackground ? 'Restore background' : 'Remove background');
                      }}
                      className="flex items-center gap-2 text-neutral-highOnSurface"
                    >
                      <span className={`flex h-5 w-8 items-center rounded-full px-[2px] transition-colors ${removeBackground ? 'bg-[#12b3a6]' : 'bg-neutral-fillMed'}`}>
                        <span className={`h-4 w-4 rounded-full bg-white transition-transform ${removeBackground ? 'translate-x-3' : 'translate-x-0'}`} />
                      </span>
                      <span className="text-[15px] font-medium">Remove background</span>
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-fillLow text-[10px] text-neutral-lowOnSurface">i</span>
                    </button>
                    <button
                      type="button"
                      className="rounded-[10px] border border-neutral-fillLow bg-white px-3 py-2 text-[13px] text-neutral-highOnSurface"
                    >
                      More v
                    </button>
                  </div>

                  <PreviewPhone
                    frame={currentFrame}
                    currentTemplate={currentTemplate}
                    backgroundAsset={previewBackground}
                    product={currentProduct}
                    staticLayerOrders={staticLayerOrders}
                    removeBackground={removeBackground}
                    safeZone={safeZone}
                    activeTextLayerId={activeTextLayerId}
                    textLayers={textLayers}
                    activeStickerLayerId={activeStickerLayerId}
                    stickerLayers={stickerLayers}
                  />

                  <div className="mt-4 flex w-full items-center gap-3">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-fillLow bg-white text-[16px] text-neutral-lowOnSurface"
                    >
                      {'<'}
                    </button>
                    <div className="grid flex-1 grid-cols-4 gap-2">
                      {PRODUCT_OPTIONS.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            captureHistory();
                            setSelectedProductId(product.id);
                            setActiveLayerKey('product');
                            setActiveTextLayerId(null);
                            setActiveBackgroundLayerId(null);
                            setActiveStickerLayerId(null);
                            setLastAction(`Selected ${product.label}`);
                          }}
                          className="transition-transform hover:-translate-y-0.5"
                          aria-label={product.label}
                        >
                          <ProductThumb product={product} active={selectedProductId === product.id} />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-fillLow bg-white text-[16px] text-neutral-lowOnSurface"
                    >
                      {'>'}
                    </button>
                  </div>
                  <div className="mt-2 text-[20px] leading-none text-neutral-lowOnSurface">.</div>
                  </div>
                </div>

                {shouldShowPropertiesPanel && (
                  <div
                    className="flex w-[296px] shrink-0 self-start flex-col bg-[#f2f2f2] py-5"
                    onClick={() => {
                      if (toolPanelVisible) {
                        setToolPanelVisible(false);
                      }
                    }}
                    onMouseEnter={() => {
                      setHoveredTool(null);
                    }}
                  >
                    <div className="mx-3 flex max-h-[720px] flex-col rounded-[16px] bg-[#ffffff] px-4 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                      <div className="overflow-y-auto pr-1">
                        {renderPropertiesBody()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-neutral-fillLow bg-neutral-surface px-5 py-4">
                <div className="rounded-full bg-neutral-surface2 px-3 py-1 text-[12px] text-neutral-lowOnSurface">
                  {lastAction}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setLastAction('Cancelled');
                    }}
                    className="rounded-lg border border-neutral-fillLow px-4 py-2 text-[13px] font-medium text-neutral-highOnSurface"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="rounded-lg border border-neutral-fillLow px-4 py-2 text-[13px] font-medium text-neutral-highOnSurface"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastAction(`Confirmed ${currentTemplate.label}`)}
                    className="rounded-lg bg-primary-fill px-4 py-2 text-[13px] font-semibold text-primary-onFill"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
