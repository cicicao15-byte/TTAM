import { useEffect, useState, type CSSProperties } from 'react';
import { KsButton, KsCheckbox, KsDivider, KsIconButton, KsInlineAlert, KsModal, KsPopover, KsSwitch, KsTag, KsText, KsTooltip } from '@byted-keystone/react';
import { KsIconAdNav, KsIconChevronDown, KsIconCopyContent, KsIconDelete, KsIconHelp, KsIconMoreVertical, KsIconPlus, KsIconSmartOptimization } from '@fe-infra/keystone-icons-react';
import { Header } from '@/layouts/Header';

type CreatorAsset = {
  id: number;
  creator: string;
  title: string;
  duration: string;
  size: string;
  background: string;
};

type Ad = {
  id: number;
  name: string;
  supportsAutoSelect: boolean;
  assetId?: number;
};

const CREATOR_ASSETS: CreatorAsset[] = [
  { id: 1, creator: 'Alexa.  SW', title: 'Meme #CameCut #pu...', duration: '00:07', size: '1080x1920', background: 'linear-gradient(155deg, #0f1118 0 26%, #f0ebdd 27% 54%, #1f2027 55% 100%)' },
  { id: 2, creator: 'DJAVA', title: 'Bhuo toke ? 😍😍 #h...', duration: '00:13', size: '720x1280', background: 'linear-gradient(155deg, #e6e3de 0 35%, #3f392f 36% 69%, #b48d74 70% 100%)' },
  { id: 3, creator: 'Sagar Gaming', title: 'camper vs noob player i...', duration: '00:21', size: '1080x1920', background: 'linear-gradient(155deg, #5b9ed4 0 28%, #d9edff 29% 44%, #71a359 45% 100%)' },
  { id: 4, creator: 'TMxAAMIR', title: 'Must Try New PUBG 😍😁', duration: '00:37', size: '808x1078', background: 'linear-gradient(155deg, #299ce1 0 42%, #8ccd59 43% 70%, #d39b32 71% 100%)' },
  { id: 5, creator: 'TMxAAMIR', title: 'Must Try New TDM Map', duration: '00:33', size: '1440x1080', background: 'linear-gradient(155deg, #93c1dc 0 25%, #e9e7d3 26% 48%, #5d625b 49% 100%)' },
];

const TIKTOK_POST_ASSETS: CreatorAsset[] = [
  { id: 101, creator: 'textxbqvocpaeh', title: 'City lights after the rain', duration: '00:05', size: '1080x1920', background: 'linear-gradient(160deg,#17233d 0 35%,#68809c 36% 55%,#111827 56%)' },
  { id: 102, creator: 'textxbqvocpaeh', title: '#testuseraddchallenge', duration: '00:11', size: '1080x1920', background: 'linear-gradient(145deg,#f1ede3 0 36%,#e77422 37% 68%,#17251d 69%)' },
  { id: 103, creator: 'testsbicuwpz', title: 'A productive desk setup', duration: '00:02', size: '1080x1920', background: 'linear-gradient(145deg,#c9c8c5 0 38%,#45484d 39% 72%,#a8a7a2 73%)' },
  { id: 104, creator: 'Yn test account', title: 'Easy editing workflow', duration: '00:15', size: '1080x1920', background: 'linear-gradient(160deg,#171717 0 35%,#704ec7 36% 63%,#0d0d0d 64%)' },
  { id: 105, creator: 'Yn test account', title: 'Creator tips for growth', duration: '00:29', size: '1080x1920', background: 'linear-gradient(145deg,#f7f7f7 0 28%,#563494 29% 66%,#ea7f45 67%)' },
  { id: 106, creator: 'Yn test account', title: 'Coffee break', duration: '00:27', size: '1080x1920', background: 'linear-gradient(145deg,#29573f 0 31%,#d7b285 32% 65%,#877366 66%)' },
  { id: 107, creator: 'Yn test account', title: 'New year campaign', duration: '00:30', size: '1080x1920', background: 'linear-gradient(145deg,#e75331 0 45%,#bb2428 46% 76%,#f0b329 77%)' },
  { id: 108, creator: 'Yn test account', title: 'Animated story', duration: '00:24', size: '1080x1920', background: 'linear-gradient(145deg,#f18b55 0 45%,#5689bd 46% 72%,#51372e 73%)' },
  { id: 109, creator: 'Wiggins', title: 'A day by the ocean', duration: '00:17', size: '1080x1920', background: 'linear-gradient(160deg,#84d4ef 0 43%,#f2eee0 44% 58%,#226d91 59%)' },
  { id: 110, creator: 'Mermaid Snowy Owl', title: 'Night in the city', duration: '00:09', size: '3840x2160', background: 'linear-gradient(155deg,#0c1a2f 0 42%,#c08a42 43% 62%,#18233a 63%)' },
];

const CREATIVE_LIBRARY_ASSETS: CreatorAsset[] = [
  { id: 201, creator: 'Creative library', title: 'jy>@pohX:m', duration: '00:11', size: '320x568', background: 'linear-gradient(160deg,#fff4e9 0 35%,#8b5d72 36% 68%,#ebe1d4 69%)' },
  { id: 202, creator: 'Creative library', title: 'meta_video_outputs_vertical', duration: '00:08', size: '720x1280', background: 'radial-gradient(circle at 45% 40%,#ef3c9d 0 8%,transparent 30%),linear-gradient(160deg,#071744,#0c806f)' },
  { id: 203, creator: 'Creative library', title: 'meta_video_9_16_aspect', duration: '00:06', size: '720x1280', background: 'linear-gradient(145deg,#6f9f39 0 35%,#c9d76b 36% 55%,#416820 56%)' },
  { id: 204, creator: 'Creative library', title: 'meta_video_random_9x16', duration: '00:08', size: '720x1280', background: 'linear-gradient(160deg,#22234d 0 34%,#e19237 35% 54%,#452a73 55%)' },
  { id: 205, creator: 'Creative library', title: 'meta_video_vertical_abstract', duration: '00:08', size: '720x1280', background: 'linear-gradient(160deg,#164ab5 0 35%,#078979 36% 68%,#412060 69%)' },
  { id: 206, creator: 'Creative library', title: '20260723-202254_2026.mp4', duration: '00:13', size: '720x1280', background: 'linear-gradient(145deg,#b6ada4 0 46%,#7c736d 47% 73%,#c4bab2 74%)' },
  { id: 207, creator: 'Creative library', title: 'smart_fix_2026-08-27', duration: '00:24', size: '1080x1920', background: 'linear-gradient(145deg,#f18342 0 42%,#5288bc 43% 72%,#c4b5a3 73%)' },
  { id: 208, creator: 'Creative library', title: 'Decorative Pattern Rolling', duration: '00:18', size: '720x1280', background: 'linear-gradient(145deg,#c8b9a8 0 57%,#587d8b 58% 72%,#aa9584 73%)' },
  { id: 209, creator: 'Creative library', title: 'AI Generated Video-3_web', duration: '00:10', size: '1080x1920', background: 'linear-gradient(160deg,#8edaf1 0 35%,#da5a3b 36% 62%,#285f37 63%)' },
  { id: 210, creator: 'Creative library', title: 'Tactical Pants-Music_Ref', duration: '00:17', size: '1080x1920', background: 'linear-gradient(150deg,#e7e2d8 0 40%,#876a52 41% 68%,#27251f 69%)' },
];

const ALL_ASSETS = [...CREATOR_ASSETS, ...TIKTOK_POST_ASSETS, ...CREATIVE_LIBRARY_ASSETS];

const RECOMMENDED_ASSET_IDS = [1, 2, 3, 4];
const INITIAL_ADS: Ad[] = [{ id: 1, name: 'Ad name2026-08-18 07:02:34', supportsAutoSelect: true }];

type RecoTabVvProps = {
  autoSelectControl?: 'banner' | 'toggle' | 'summary';
  experienceOnly?: boolean;
};

const RECO_EXPERIENCE_OPTIONS = [
  {
    label: 'Reco tab–VV',
    showDivider: false,
    children: [
      { value: '/reco-experience/banner', label: '1–Banner' },
      { value: '/reco-experience/toggle', label: '2–Toggle' },
    ],
  },
];

export default function RecoTabVv({ autoSelectControl = 'toggle', experienceOnly = false }: RecoTabVvProps) {
  const [campaignOn, setCampaignOn] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedAutoSelect, setSavedAutoSelect] = useState(true);
  const [autoSelect, setAutoSelect] = useState(true);
  const [hasAcknowledgedAutoSelect, setHasAcknowledgedAutoSelect] = useState(false);
  const [hasDismissedOuterNotice, setHasDismissedOuterNotice] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(RECOMMENDED_ASSET_IDS);
  const [autoSelectedIds, setAutoSelectedIds] = useState<number[]>(RECOMMENDED_ASSET_IDS);
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [activeAdId, setActiveAdId] = useState<number | null>(INITIAL_ADS[0].id);
  const [nextAdId, setNextAdId] = useState(2);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [dontShowSaveConfirmationAgain, setDontShowSaveConfirmationAgain] = useState(false);
  const [skipAutoSelectedSaveConfirmation, setSkipAutoSelectedSaveConfirmation] = useState(false);
  const [reviewHighlightedIds, setReviewHighlightedIds] = useState<number[]>([]);
  const [adGroupSelected, setAdGroupSelected] = useState(false);

  useEffect(() => {
    if (autoSelectControl === 'toggle' || reviewHighlightedIds.length === 0) return undefined;

    const timeoutId = window.setTimeout(() => setReviewHighlightedIds([]), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [autoSelectControl, reviewHighlightedIds]);

  const activeAd = ads.find((ad) => ad.id === activeAdId);
  const activeAsset = ALL_ASSETS.find((asset) => asset.id === activeAd?.assetId);
  const isFirstAd = activeAd?.supportsAutoSelect ?? false;
  const visibleAssets = activeTab === 'TikTok posts'
    ? TIKTOK_POST_ASSETS
    : activeTab === 'Creative library'
      ? CREATIVE_LIBRARY_ASSETS
      : CREATOR_ASSETS;

  const applyAdSelectionDefaults = (supportsAutoSelect: boolean, useSavedSetting = true) => {
    const shouldUseAutoSelect = supportsAutoSelect && (useSavedSetting ? savedAutoSelect : true);
    setAutoSelect(shouldUseAutoSelect);
    setSelectedIds(shouldUseAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setAutoSelectedIds(shouldUseAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setHasAcknowledgedAutoSelect(!shouldUseAutoSelect);
  };

  const selectAd = (id: number) => {
    const ad = ads.find((item) => item.id === id);
    if (!ad) return;
    setActiveAdId(id);
    setDrawerOpen(false);
    applyAdSelectionDefaults(ad.supportsAutoSelect);
  };

  const addAd = () => {
    const isNewFirstAd = ads.length === 0;
    const newAd: Ad = { id: nextAdId, name: `Ad name2026-08-18 07:02:${String(33 + nextAdId).padStart(2, '0')}`, supportsAutoSelect: isNewFirstAd };
    setAds((previous) => [...previous, newAd]);
    setNextAdId((previous) => previous + 1);
    setActiveAdId(newAd.id);
    setDrawerOpen(false);
    if (isNewFirstAd) {
      setHasDismissedOuterNotice(false);
    }
    // A newly created first Ad inherits the user's saved Auto-select preference.
    applyAdSelectionDefaults(newAd.supportsAutoSelect);
  };

  const deleteAd = (id: number) => {
    const deletingIndex = ads.findIndex((ad) => ad.id === id);
    const remainingAds = ads.filter((ad) => ad.id !== id);
    setAds(remainingAds);
    setDrawerOpen(false);

    if (remainingAds.length === 0) {
      setActiveAdId(null);
      applyAdSelectionDefaults(false);
      return;
    }

    if (id !== activeAdId) return;
    const nextActiveAd = remainingAds[Math.min(deletingIndex, remainingAds.length - 1)];
    setActiveAdId(nextActiveAd.id);
    applyAdSelectionDefaults(nextActiveAd.supportsAutoSelect);
  };

  const duplicateAdGroup = () => {
    if (ads.length === 0) return;
    const duplicatedAds = ads.map((ad, index) => ({
      ...ad,
      id: nextAdId + index,
      name: `${ad.name} copy`,
      supportsAutoSelect: false,
    }));
    setAds((previous) => [...previous, ...duplicatedAds]);
    setNextAdId((previous) => previous + duplicatedAds.length);
    setActiveAdId(duplicatedAds[0].id);
    setDrawerOpen(false);
    applyAdSelectionDefaults(false);
  };

  const deleteAdGroup = () => {
    setAds([]);
    setActiveAdId(null);
    setAdGroupSelected(false);
    setDrawerOpen(false);
    applyAdSelectionDefaults(false);
  };

  const toggleAsset = (id: number) => {
    setSelectedIds((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
    // Every direct checkbox/card action belongs to the user, even for a recommended asset.
    setAutoSelectedIds((previous) => previous.filter((item) => item !== id));
    setReviewHighlightedIds((previous) => previous.filter((item) => item !== id));
  };

  const toggleAll = () => {
    const visibleIds = visibleAssets.map((asset) => asset.id);
    const areAllVisibleAssetsSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((previous) => areAllVisibleAssetsSelected
      ? previous.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set([...previous, ...visibleIds])));
    // Select all and clear all are direct user actions, so no asset remains auto-selected.
    setAutoSelectedIds((previous) => previous.filter((id) => !visibleIds.includes(id)));
  };

  const toggleAutoSelect = () => {
    if (autoSelect) {
      // Remove only the assets that are still selected by the system.
      setSelectedIds((previous) => previous.filter((id) => !autoSelectedIds.includes(id)));
      setAutoSelectedIds([]);
      setHasAcknowledgedAutoSelect(true);
      setAutoSelect(false);
      return;
    }

    // Re-enable by adding only missing recommendations. Existing selections remain manual.
    const newlyAutoSelectedIds = RECOMMENDED_ASSET_IDS.filter((id) => !selectedIds.includes(id));
    setSelectedIds((previous) => Array.from(new Set([...previous, ...RECOMMENDED_ASSET_IDS])));
    setAutoSelectedIds(newlyAutoSelectedIds);
    setAutoSelect(true);
  };

  const clearCurrentAutoSelectedAssets = () => {
    // This CTA only changes the current Add session. It deliberately leaves
    // autoSelect and savedAutoSelect enabled for the next time the drawer opens.
    setSelectedIds((previous) => previous.filter((id) => !autoSelectedIds.includes(id)));
    setAutoSelectedIds([]);
  };

  const restoreCurrentRecommendations = () => {
    const recommendationsToRestore = RECOMMENDED_ASSET_IDS.filter((id) => !selectedIds.includes(id));
    setSelectedIds((previous) => Array.from(new Set([...previous, ...RECOMMENDED_ASSET_IDS])));
    setAutoSelectedIds(recommendationsToRestore);
  };

  const closeWithoutSaving = () => {
    setShowSaveConfirmation(false);
    setReviewHighlightedIds([]);
    applyAdSelectionDefaults(isFirstAd);
    setDrawerOpen(false);
  };

  const reopenDrawer = () => {
    const shouldUseAutoSelect = isFirstAd && savedAutoSelect;
    setAutoSelect(shouldUseAutoSelect);
    setSelectedIds(shouldUseAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setAutoSelectedIds(shouldUseAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    // The inner notice belongs to this drawer visit. Saved-off auto-select keeps it hidden.
    setHasAcknowledgedAutoSelect(!shouldUseAutoSelect);
    setDrawerOpen(true);
  };

  const createAdsFromSelectedAssets = () => {
    if (!activeAd || selectedIds.length === 0) return;

    const generatedAds = selectedIds.map((assetId, index) => ({
      id: index === 0 ? activeAd.id : nextAdId + index - 1,
      name: `Ad name ${assetId}`,
      supportsAutoSelect: index === 0 && activeAd.supportsAutoSelect,
      assetId,
    }));

    setAds((previous) => previous.flatMap((ad) => (ad.id === activeAd.id ? generatedAds : [ad])));
    setNextAdId((previous) => previous + Math.max(0, selectedIds.length - 1));
    setActiveAdId(generatedAds[0].id);
  };

  const completeSave = () => {
    if (isFirstAd) setSavedAutoSelect(autoSelect);
    createAdsFromSelectedAssets();
    setShowSaveConfirmation(false);
    setReviewHighlightedIds([]);
    setDrawerOpen(false);
  };

  const selectedAutoIds = selectedIds.filter((id) => autoSelectedIds.includes(id));

  const saveSelection = () => {
    if (selectedAutoIds.length > 0 && !skipAutoSelectedSaveConfirmation) {
      setDontShowSaveConfirmationAgain(false);
      setShowSaveConfirmation(true);
      return;
    }
    completeSave();
  };

  const confirmAutoSelectedSave = () => {
    if (dontShowSaveConfirmationAgain) setSkipAutoSelectedSaveConfirmation(true);
    setHasDismissedOuterNotice(true);
    completeSave();
    return true;
  };

  const reviewAutoSelectedAssets = () => {
    setActiveTab('Recommended');
    setReviewHighlightedIds(autoSelectControl === 'toggle' ? [] : selectedAutoIds);
    setShowSaveConfirmation(false);
  };

  const selectedVisibleAssetCount = visibleAssets.filter((asset) => selectedIds.includes(asset.id)).length;
  const allAssetsSelected = selectedVisibleAssetCount === visibleAssets.length;
  const someAssetsSelected = selectedVisibleAssetCount > 0 && !allAssetsSelected;
  const showOuterAutoSelectNotice = isFirstAd && savedAutoSelect && !hasDismissedOuterNotice;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#161823]">
      <Header demoOptions={experienceOnly ? RECO_EXPERIENCE_OPTIONS : undefined} />

      <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#f7f7f7]">
        <div className="flex min-h-[calc(100vh-100px)]">
          <aside className="w-[240px] shrink-0 border-r border-[#e4e5e7] !bg-white" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-2 py-5">
              <div className="flex h-11 items-center gap-3">
                <KsSwitch size="md" checked={campaignOn} onChange={(checked: boolean) => setCampaignOn(checked)} />
                <KsText variant="titleSm">Campaign turned on</KsText>
                <KsTooltip content="Turn the whole campaign on or off">
                  <span className="ml-auto flex cursor-help items-center"><KsIconHelp size={18} color="#87898b" /></span>
                </KsTooltip>
              </div>

              <div className="py-3"><KsDivider orientation="horizontal" /></div>

              <nav className="flex flex-col">
                <div className="flex h-[72px] w-full items-center px-3">
                  <KsText variant="titleMd">Video<br />views20260818230</KsText>
                </div>

                <div className="group relative flex h-[48px] w-full items-center gap-2 rounded-[6px] px-3 transition-colors hover:bg-[#f1f2f2]">
                  <div className="hidden w-7 shrink-0 group-hover:block group-focus-within:block">
                    <KsCheckbox checked={adGroupSelected} onChange={(checked: boolean) => setAdGroupSelected(checked)} aria-label="Select ad group" />
                  </div>
                  <KsIconChevronDown size={14} color="#121415" />
                  <div className="h-8 min-w-0 flex-1 overflow-hidden group-hover:max-w-[82px] group-focus-within:max-w-[82px]">
                    <KsText variant="labelSm" ellipsis={{ tooltip: false, maxLines: 2 }}>
                      <span className="group-hover:hidden group-focus-within:hidden">Ad group 20260818070224</span>
                      <span className="hidden group-hover:inline group-focus-within:inline">Ad group 2026…</span>
                    </KsText>
                  </div>
                  {ads.length === 0 && (
                    <KsTooltip content="Add Ad">
                      <KsIconButton size="xs" variant="text" onClick={addAd} aria-label="Add Ad"><KsIconPlus size={17} /></KsIconButton>
                    </KsTooltip>
                  )}
                  {ads.length > 0 && <div className="pointer-events-none absolute right-3 flex shrink-0 items-center opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <KsTooltip content="Duplicate ad group">
                      <KsIconButton size="xs" variant="text" onClick={duplicateAdGroup} aria-label="Duplicate ad group"><KsIconCopyContent size={17} /></KsIconButton>
                    </KsTooltip>
                    <KsPopover trigger="hover" placement="right-start" gapOffset={6} popupWidth={210} noPadding>
                      <KsIconButton size="xs" variant="text" aria-label="More ad group actions"><KsIconMoreVertical size={17} aria-hidden="true" /></KsIconButton>
                      <div slot="content" className="flex w-[210px] flex-col gap-1 p-2">
                        <KsButton size="md" variant="text" className="w-full justify-start" onClick={addAd}>
                          <span className="flex w-full items-center gap-3 text-left"><KsIconPlus size={18} /><KsText variant="labelLg">Add ad</KsText></span>
                        </KsButton>
                        <KsButton size="md" variant="text" className="w-full justify-start" onClick={deleteAdGroup}>
                          <span className="flex w-full items-center gap-3 text-left"><KsIconDelete size={18} /><KsText variant="labelLg">Delete ad group</KsText></span>
                        </KsButton>
                      </div>
                    </KsPopover>
                  </div>}
                </div>

                <div className="mt-2 space-y-1">
                  {ads.map((ad) => (
                    <div key={ad.id} onClick={() => selectAd(ad.id)} className={`group/ad relative flex h-[56px] w-full cursor-pointer items-center gap-2 rounded-[6px] pl-9 pr-3 ${activeAdId === ad.id ? 'bg-[#e8f8f7]' : 'hover:bg-[#f5f6f6]'}`}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#ececed]"><KsIconAdNav size={16} color="#87898b" /></span>
                      <div className="min-w-0 flex-1 overflow-hidden leading-4 group-hover/ad:max-w-[82px] group-focus-within/ad:max-w-[82px]">
                        <KsText variant="labelSm" ellipsis={{ tooltip: false, maxLines: 2 }}>
                          <span className="group-hover/ad:hidden group-focus-within/ad:hidden">{ad.name}</span>
                          <span className="hidden group-hover/ad:inline group-focus-within/ad:inline">Ad name2026…</span>
                        </KsText>
                      </div>
                      <div className="pointer-events-none absolute right-3 flex shrink-0 items-center opacity-0 transition-opacity group-hover/ad:pointer-events-auto group-hover/ad:opacity-100 group-focus-within/ad:pointer-events-auto group-focus-within/ad:opacity-100">
                        <KsTooltip content="Duplicate Ad">
                          <KsIconButton size="xs" variant="text" onClick={(event) => { event.stopPropagation(); addAd(); }} aria-label={`Duplicate ${ad.name}`}><KsIconCopyContent size={17} /></KsIconButton>
                        </KsTooltip>
                        <KsPopover trigger="hover" placement="right-start" gapOffset={6} popupWidth={200} noPadding>
                          <KsIconButton size="xs" variant="text" onClick={(event) => event.stopPropagation()} aria-label={`More actions for ${ad.name}`}><KsIconMoreVertical size={17} aria-hidden="true" /></KsIconButton>
                          <div slot="content" className="flex w-[200px] flex-col gap-1 p-2" onClick={(event) => event.stopPropagation()}>
                            <KsButton size="md" variant="text" className="w-full justify-start" onClick={() => addAd()}>
                              <span className="flex w-full items-center gap-3 text-left"><KsIconCopyContent size={18} /><KsText variant="labelLg">Duplicate ad</KsText></span>
                            </KsButton>
                            <KsButton size="md" variant="text" className="w-full justify-start" onClick={() => deleteAd(ad.id)}>
                              <span className="flex w-full items-center gap-3 text-left"><KsIconDelete size={18} /><KsText variant="labelLg">Delete ad</KsText></span>
                            </KsButton>
                          </div>
                        </KsPopover>
                      </div>
                    </div>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          <main className="min-w-0 flex-1 bg-[#f7f7f8] px-10 py-5">
            <div className="mx-auto max-w-[980px]">
              <h1 className="mb-5 text-[18px] font-semibold">{activeAd ? 'Ad' : 'Ad group'}</h1>
              {activeAd && <>
              <section className="rounded-[7px] !bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Ad name</h2><span className="text-[#45494d]">⌃</span></div>
                <div className="mt-4 h-8 max-w-[430px] rounded-[2px] border border-[#d9dbde] px-3 py-2 text-[11px] text-[#45494d]">{activeAd?.name ?? 'No Ad selected'}</div>
              </section>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_300px] gap-3">
                <section className="rounded-[7px] !bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Creative assets <span className="text-[11px] font-normal text-[#777b82]">ⓘ</span></h2><span className="text-[#45494d]">⌃</span></div>
                  <p className="mt-2 max-w-[500px] text-[11px] leading-4 text-[#777b82]">Creative assets will be combined with your text and add-ons to create high-performing, tailored ad variations.</p>
                  {activeAsset ? (
                    <div className="mt-4 flex items-center gap-3 rounded-[6px] bg-[#f7f7f8] p-3">
                      <div className="h-16 w-16 shrink-0 rounded-[5px]" style={{ background: activeAsset.background }} />
                      <div className="min-w-0"><div className="truncate text-[12px] font-medium">Name goes here. a long name possibly</div><div className="mt-1 truncate text-[11px] text-[#777b82]">🔴 {activeAsset.creator} · TikTok post · {activeAsset.duration}</div></div>
                    </div>
                  ) : (
                    <>
                      {showOuterAutoSelectNotice && (
                        <div className="mt-3">
                          <KsInlineAlert
                            variant="suggestion"
                            size="sm"
                            inverse={false}
                            content="We’ll automatically select up to 4 recommended creator assets when you add creatives."
                            afterClose={() => setHasDismissedOuterNotice(true)}
                          >
                            <button slot="actions" type="button" onClick={reopenDrawer} className="text-[11px] font-medium text-[#137e78]">
                              View recommendations.
                            </button>
                          </KsInlineAlert>
                        </div>
                      )}
                      <div className="mt-4 flex gap-2 border-t border-[#eff0f1] pt-3">
                        <button type="button" onClick={reopenDrawer} className="rounded-[3px] border border-[#bfc3c7] bg-white px-3 py-1.5 text-[12px] font-medium">＋ Add</button>
                        <button type="button" className="rounded-[3px] border border-[#bfc3c7] bg-white px-3 py-1.5 text-[12px] font-medium">＋ Create new videos</button>
                      </div>
                    </>
                  )}
                </section>
                <aside className="rounded-[7px] !bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ backgroundColor: '#ffffff' }}>
                  <div className="mb-3 flex items-center justify-between">{activeAsset ? <KsTag variant="info" color="primary" size="sm">Video 1</KsTag> : <span className="h-1 w-6 rounded bg-[#222]" />}<span className="text-[10px] text-[#777b82]">‹ &nbsp; {activeAd ? ads.findIndex((ad) => ad.id === activeAd.id) + 1 : 0} / {ads.length} &nbsp; ›</span></div>
                  <div className="mb-2 rounded border border-[#d8dade] px-2 py-1 text-[10px]">In feed⌄</div>
                  <div className="mx-auto flex h-[390px] max-w-[220px] flex-col rounded-[5px] p-3 text-white" style={{ background: activeAsset?.background ?? 'linear-gradient(165deg,#7c7f7c,#252525)' }}><div className="flex justify-between text-[9px]"><span>9:41</span><span>● ● ▰</span></div><div className="mt-3 flex justify-around text-[9px]"><span>Following</span><span className="border-b border-white pb-1">For You</span><span>⌕</span></div><div className="m-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-black/20 pl-0.5 text-[18px]">▶</div><div className="text-[9px] text-white/80">{activeAsset?.creator ?? 'Your identity'}<br />{activeAsset?.title ?? 'Your video will be shown here'}</div></div>
                </aside>
              </div>

              <section className="mt-3 max-w-[665px] rounded-[7px] !bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ backgroundColor: '#ffffff' }}><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">{activeAsset ? 'Details and add-ons' : 'Text and add-ons'} <span className="text-[11px] font-normal text-[#777b82]">ⓘ</span></h2><span>⌃</span></div><p className="mt-2 text-[11px] text-[#777b82]">{activeAsset ? 'Brief description of the value of the module' : 'Add text and add-ons to help audiences take action on your ad.'}</p>{activeAsset ? <div className="mt-5 space-y-4"><div><div className="mb-2 text-[11px] font-medium">Identity ⓘ</div><div className="rounded border border-[#d8dade] px-3 py-2 text-[11px]">🔴 {activeAsset.creator}<span className="float-right">⌄</span></div></div><div><div className="mb-1 text-[11px] font-medium">Text (2/5) ⓘ</div><div className="mb-2 text-[10px] text-[#777b82]">Include text alternatives to see what resonates best with your audience.</div><div className="rounded border border-[#d8dade] px-3 py-3 text-[11px]">Audit ROI: Power, luxury, and speed.<span className="float-right text-[#9ca0a5]">1/100</span></div></div></div> : <><div className="mt-6 flex items-center justify-between text-[12px]"><span>Call to action <span className="text-[#777b82]">ⓘ</span></span><span className="h-4 w-7 rounded-full bg-[#d9dbdd] p-0.5"><span className="block h-3 w-3 rounded-full bg-white" /></span></div><button type="button" className="mt-5 text-[11px] text-[#387d7a]">Advanced settings⌄</button></>}</section>
              </>}
            </div>
          </main>
        </div>

        {drawerOpen && <div className="absolute inset-0 bg-black/35" />}

        {drawerOpen && <section className="absolute inset-y-0 right-0 flex w-[min(100%,1040px)] flex-col bg-[#f7f7f7] shadow-[-14px_0_35px_rgba(0,0,0,0.18)]">
          <header className="flex h-14 items-center border-b border-[#e8e8e8] bg-white px-5">
            <h1 className="text-[17px] font-semibold">Add creatives</h1>
            <button type="button" onClick={closeWithoutSaving} aria-label="Close add creatives" className="ml-auto text-[24px] leading-none text-[#6e7176]">×</button>
          </header>

          <div className="flex h-12 items-end gap-7 border-b border-[#e7e7e7] bg-white px-5">
            {['Recommended', 'TikTok posts', 'Creative library'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative h-full pb-3 text-[13px] ${activeTab === tab ? 'font-medium text-[#161823]' : 'text-[#777b82]'}`}
              >
                {tab}
                {tab === 'Recommended' && <span className="ml-1 rounded-[3px] bg-[#f0eaff] px-1 py-0.5 text-[10px] text-[#785bd4]">New</span>}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#12aaa2]" />}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              {activeTab === 'Recommended' ? <>
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold">TikTok creator content</h2>
                <button type="button" className="rounded-[5px] border border-[#cfd1d4] bg-white px-3 py-1.5 text-[12px] font-medium">Filter content <span className="rounded bg-[#ececef] px-1">1</span></button>
              </div>
              <p className="mt-3 max-w-[760px] text-[12px] leading-5 text-[#777b82]">High-performing creator content from TikTok One and Content Suite, ready for your ads. Make sure you have the rights to use the content before showing it in your ads.</p>

              {isFirstAd && autoSelectControl !== 'summary' && !hasAcknowledgedAutoSelect && (
                <div className="mt-4">
                  <KsInlineAlert
                    variant="suggestion"
                    size="sm"
                    inverse={autoSelectControl === 'toggle'}
                    style={autoSelectControl === 'banner' ? { '--ks-color-neutral-surface1': '#ffffff' } as CSSProperties : undefined}
                    content={autoSelectedIds.length > 0
                      ? `We've automatically selected ${autoSelectedIds.length} recommended creator assets for you based on predicted VTR. You can review and adjust your selections before saving.`
                      : 'Auto-selected assets have been cleared. You can select assets yourself or restore the recommended selections.'}
                    afterClose={() => setHasAcknowledgedAutoSelect(true)}
                  >
                    {autoSelectControl === 'banner' && (
                      <button
                        slot="actions"
                        type="button"
                        onClick={autoSelectedIds.length > 0 ? clearCurrentAutoSelectedAssets : restoreCurrentRecommendations}
                        style={{
                          color: 'var(--ks-color-primary-onSurface, #017976)',
                          fontFamily: '"TikTok Sans Text"',
                          fontSize: '12px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: '16px',
                          letterSpacing: '0.161px',
                        }}
                      >
                        {autoSelectedIds.length > 0 ? 'Clear auto-selected assets' : 'Restore recommendations'}
                      </button>
                    )}
                  </KsInlineAlert>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={toggleAll} className="flex items-center gap-2 text-[12px] font-medium">
                  <span onClick={(event) => event.stopPropagation()}>
                    <KsCheckbox checked={allAssetsSelected} indeterminate={someAssetsSelected} onChange={toggleAll} size="md" />
                  </span>
                  Select all
                </button>
                <div className="flex items-center gap-2 text-[11px] text-[#5f6368]">{isFirstAd && autoSelectControl === 'toggle' && <><KsSwitch checked={autoSelect} onChange={toggleAutoSelect} size="sm" /> Auto-select <span className="text-[#d0d1d3]">|</span></>}<span> {selectedIds.length} / 20 selected</span></div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-3">
                {CREATOR_ASSETS.map((asset) => {
                  const selected = selectedIds.includes(asset.id);
                  const highlightedForReview = reviewHighlightedIds.includes(asset.id);
                  return (
                    <button key={asset.id} type="button" onClick={() => toggleAsset(asset.id)} className="group relative min-w-0 text-left">
                      {highlightedForReview && autoSelectControl !== 'toggle' && (
                        <span aria-hidden="true" className={`pointer-events-none absolute -inset-2 rounded-[8px] ${autoSelectControl === 'summary' ? 'bg-[#ccefeb]' : 'bg-[#ffedb5]'}`} />
                      )}
                      <div className={`relative z-[1] aspect-square overflow-hidden rounded-[5px] border-2 ${selected ? 'border-[#12aaa2]' : 'border-transparent'} p-1`} style={{ background: asset.background }}>
                        {autoSelectControl === 'summary' && autoSelectedIds.includes(asset.id) && (
                          <span className="absolute bottom-1 left-1 z-[2] flex items-center gap-1 rounded-full bg-[#161823]/80 px-2 py-1 text-[9px] text-white">
                            <KsIconSmartOptimization size={11} /> Recommended
                          </span>
                        )}
                        <div className="absolute right-1 top-1" onClick={(event) => event.stopPropagation()}>
                          <KsCheckbox checked={selected} onChange={() => toggleAsset(asset.id)} size="md" />
                        </div>
                        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/30 pl-0.5 text-[15px] text-white">▶</span>
                        {!(autoSelectControl === 'summary' && autoSelectedIds.includes(asset.id)) && <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">{asset.size}</span>}
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">{asset.duration}</span>
                      </div>
                      <div className="relative z-[1] mt-2 flex gap-1.5"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[linear-gradient(135deg,#242424,#d3d3d3)]" /><span className="min-w-0"><span className="block truncate text-[11px] font-medium">{asset.creator}</span><span className="block truncate text-[10px] text-[#777b82]">{asset.title}</span></span></div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end gap-3 text-[12px] text-[#5f6368]"><span>‹</span><span className="rounded border border-[#91cfc9] px-1.5 py-0.5 text-[#137e78]">1</span><span>2</span><span>3</span><span>4</span><span>›</span></div>
              </> : <>
                <div className="flex items-center justify-between gap-4">
                  <label className="flex h-10 w-[330px] items-center rounded-[5px] bg-[#f1f2f2] px-3 text-[12px] text-[#97999d]">
                    <input
                      aria-label={`Search ${activeTab}`}
                      placeholder={activeTab === 'TikTok posts' ? 'Search by post caption or post ID' : 'Search by name or ID'}
                      className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#a5a7aa]"
                    />
                    <span className="text-[17px]">⌕</span>
                  </label>
                  {activeTab === 'TikTok posts' ? (
                    <div className="flex items-center gap-4">
                      <button type="button" className="text-[12px] font-medium text-[#0b8580]">🔗 Link TikTok account</button>
                      <button type="button" className="rounded-[5px] bg-[#242424] px-4 py-2 text-[12px] font-medium text-white">Add post</button>
                    </div>
                  ) : (
                    <button type="button" className="rounded-[5px] bg-[#242424] px-4 py-2 text-[12px] font-medium text-white">Upload</button>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3 text-[11px] text-[#45484d]">
                  <button type="button" className="min-w-[220px] rounded-[5px] bg-[#f1f2f2] px-3 py-2 text-left">
                    Sort by: {activeTab === 'TikTok posts' ? 'Post date (Most to least recent)' : 'Creation time (Most to least recent)'} <span className="float-right">⌄</span>
                  </button>
                  <button type="button" className="min-w-[220px] rounded-[5px] bg-[#f1f2f2] px-3 py-2 text-left">
                    {activeTab === 'TikTok posts' ? 'TikTok account: All accounts' : 'Source: All'} <span className="float-right">⌄</span>
                  </button>
                  {activeTab === 'TikTok posts' ? (
                    <>
                      <button type="button" className="min-w-[140px] rounded-[5px] bg-[#f1f2f2] px-3 py-2 text-left">Format: Videos <span className="float-right">⌄</span></button>
                      <button type="button" className="rounded-[5px] bg-[#f1f2f2] px-3 py-2">＋ Filter</button>
                    </>
                  ) : <span className="ml-1 text-[#777b82]">Showing: <span className="text-[#45484d]">Videos only</span></span>}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-x-3 gap-y-5">
                  {visibleAssets.map((asset, index) => {
                    const selected = selectedIds.includes(asset.id);
                    return (
                      <button key={asset.id} type="button" onClick={() => toggleAsset(asset.id)} className="group min-w-0 text-left">
                        <div className={`relative aspect-square overflow-hidden rounded-[5px] border-2 ${selected ? 'border-[#12aaa2]' : 'border-transparent'} p-1`} style={{ background: asset.background }}>
                          {index % 6 === 0 && <span className="absolute left-1 top-1 text-[14px] text-[#f28b72]">⚠</span>}
                          <div className="absolute right-1 top-1" onClick={(event) => event.stopPropagation()}>
                            <KsCheckbox checked={selected} onChange={() => toggleAsset(asset.id)} size="md" />
                          </div>
                          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/30 pl-0.5 text-[15px] text-white">▶</span>
                          <span className="absolute bottom-1 left-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[9px] text-white">{asset.size}</span>
                          <span className="absolute bottom-1 right-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[9px] text-white">{asset.duration}</span>
                        </div>
                        <div className="mt-2 flex min-w-0 gap-1.5">
                          {activeTab === 'TikTok posts' && <span className="h-5 w-5 shrink-0 rounded-full bg-[#e3e4e5]" />}
                          <span className="min-w-0"><span className="block truncate text-[11px] font-medium">{activeTab === 'TikTok posts' ? asset.creator : asset.title}</span>{activeTab === 'TikTok posts' && <span className="block truncate text-[10px] text-[#777b82]">{asset.title}</span>}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>}
            </div>
          </div>

          <footer className="border-t border-[#e2e3e5] bg-white px-5 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            {isFirstAd && autoSelectControl === 'summary' && (
              <div className="mb-3 flex items-center gap-3 rounded-[6px] border border-[#d8ecea] bg-[#f2fbfa] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9f3f0] text-[#137e78]">
                  <KsIconSmartOptimization size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium">Smart recommendations</div>
                  <div className="mt-0.5 text-[11px] text-[#5f6368]">
                    {autoSelect
                      ? `${selectedAutoIds.length} recommended assets are included based on predicted VTR.`
                      : 'Smart recommendations are off. Only assets you select manually will be saved.'}
                  </div>
                </div>
                {autoSelect && selectedAutoIds.length > 0 && (
                  <button type="button" onClick={reviewAutoSelectedAssets} className="text-[12px] font-medium text-[#137e78]">Review</button>
                )}
                <span className="h-5 w-px bg-[#d4d8da]" />
                <label className="flex items-center gap-2 text-[12px] font-medium">
                  <KsSwitch checked={autoSelect} onChange={toggleAutoSelect} size="sm" />
                  Auto-select
                </label>
              </div>
            )}
            <div className="flex items-center justify-between"><div><div className="text-[13px] font-semibold">{selectedIds.length} of 30 assets selected</div><div className="text-[11px] text-[#777b82]">{selectedIds.length} video posts</div></div><div className="flex max-w-[430px] gap-2 overflow-hidden">{ALL_ASSETS.filter((asset) => selectedIds.includes(asset.id)).map((asset) => <span key={asset.id} className="h-11 w-9 shrink-0 rounded-[3px]" style={{ background: asset.background }} />)}</div><button type="button" onClick={saveSelection} className="rounded-[4px] bg-[#168f8a] px-4 py-2 text-[12px] font-semibold text-white">Save</button></div>
          </footer>
        </section>}

        <KsModal
          open={showSaveConfirmation}
          size="md"
          zIndex={3000}
          title="Contains auto-selected recommended creatives. Confirm to save?"
          confirmText="Confirm"
          cancelText="Review"
          onConfirm={confirmAutoSelectedSave}
          onCancel={(reason) => {
            if (reason === 'cancelButtonClick') reviewAutoSelectedAssets();
            else setShowSaveConfirmation(false);
            return true;
          }}
        >
          <div className="py-2 text-[14px] leading-6 text-[#3f4247]">
            {selectedAutoIds.length} auto-selected creatives from the &quot;Recommended&quot; tab have been added. You can save now or click &quot;Review&quot; to check.
          </div>
          <label slot="footerPrepend" className="flex cursor-pointer items-center gap-2 text-[13px] text-[#3f4247]">
            <KsCheckbox checked={dontShowSaveConfirmationAgain} onChange={() => setDontShowSaveConfirmationAgain((previous) => !previous)} size="md" />
            Don&apos;t show again
          </label>
        </KsModal>
      </div>
    </div>
  );
}
