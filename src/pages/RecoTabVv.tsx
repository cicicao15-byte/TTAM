import { useState } from 'react';
import { KsCheckbox, KsInlineAlert, KsSwitch } from '@byted-keystone/react';
import { Header } from '@/layouts/Header';

type CreatorAsset = {
  id: number;
  creator: string;
  title: string;
  duration: string;
  size: string;
  background: string;
};

const CREATOR_ASSETS: CreatorAsset[] = [
  { id: 1, creator: 'Alexa.  SW', title: 'Meme #CameCut #pu...', duration: '00:07', size: '1080x1920', background: 'linear-gradient(155deg, #0f1118 0 26%, #f0ebdd 27% 54%, #1f2027 55% 100%)' },
  { id: 2, creator: 'DJAVA', title: 'Bhuo toke ? 😍😍 #h...', duration: '00:13', size: '720x1280', background: 'linear-gradient(155deg, #e6e3de 0 35%, #3f392f 36% 69%, #b48d74 70% 100%)' },
  { id: 3, creator: 'Sagar Gaming', title: 'camper vs noob player i...', duration: '00:21', size: '1080x1920', background: 'linear-gradient(155deg, #5b9ed4 0 28%, #d9edff 29% 44%, #71a359 45% 100%)' },
  { id: 4, creator: 'TMxAAMIR', title: 'Must Try New PUBG 😍😁', duration: '00:37', size: '808x1078', background: 'linear-gradient(155deg, #299ce1 0 42%, #8ccd59 43% 70%, #d39b32 71% 100%)' },
  { id: 5, creator: 'TMxAAMIR', title: 'Must Try New TDM Map', duration: '00:33', size: '1440x1080', background: 'linear-gradient(155deg, #93c1dc 0 25%, #e9e7d3 26% 48%, #5d625b 49% 100%)' },
];

const RECOMMENDED_ASSET_IDS = [1, 2, 3, 4];

export default function RecoTabVv() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedAutoSelect, setSavedAutoSelect] = useState(true);
  const [autoSelect, setAutoSelect] = useState(true);
  const [hasAcknowledgedAutoSelect, setHasAcknowledgedAutoSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(RECOMMENDED_ASSET_IDS);
  const [autoSelectedIds, setAutoSelectedIds] = useState<number[]>(RECOMMENDED_ASSET_IDS);
  const [activeTab, setActiveTab] = useState('Recommended');

  const toggleAsset = (id: number) => {
    setSelectedIds((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
    // Every direct checkbox/card action belongs to the user, even for a recommended asset.
    setAutoSelectedIds((previous) => previous.filter((item) => item !== id));
  };

  const toggleAll = () => {
    setSelectedIds((previous) => (previous.length === CREATOR_ASSETS.length ? [] : CREATOR_ASSETS.map((asset) => asset.id)));
    // Select all and clear all are direct user actions, so no asset remains auto-selected.
    setAutoSelectedIds([]);
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

  const closeWithoutSaving = () => {
    setAutoSelect(savedAutoSelect);
    setSelectedIds(savedAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setAutoSelectedIds(savedAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setDrawerOpen(false);
  };

  const reopenDrawer = () => {
    setAutoSelect(savedAutoSelect);
    setSelectedIds(savedAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setAutoSelectedIds(savedAutoSelect ? RECOMMENDED_ASSET_IDS : []);
    setDrawerOpen(true);
  };

  const saveSelection = () => {
    setSavedAutoSelect(autoSelect);
    setDrawerOpen(false);
  };

  const allAssetsSelected = selectedIds.length === CREATOR_ASSETS.length;
  const someAssetsSelected = selectedIds.length > 0 && !allAssetsSelected;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#161823]">
      <Header />

      <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#f7f7f7]">
        <div className="flex min-h-[calc(100vh-100px)]">
          <aside className="w-[300px] shrink-0 border-r border-[#e4e5e7] bg-white px-5 py-5">
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium"><span className="h-4 w-7 rounded-full bg-[#4fa9a5] p-0.5"><span className="block h-3 w-3 translate-x-3 rounded-full bg-white" /></span>Campaign turned on <span className="text-[#9ca0a5]">ⓘ</span></div>
            <div className="rounded-[6px] bg-[#f5f5f5] px-4 py-3 text-[14px] font-semibold">Video view20260818230</div>
            <div className="mt-5 text-[12px] text-[#575b61]">⌄ &nbsp; Ad group 20260818070224</div>
            <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-[#e8f8f7] px-3 py-3 text-[12px]"><span className="flex h-4 w-4 items-center justify-center rounded border border-[#bbbfc3] text-[10px]">▧</span><span>Ad name2026-08-18 07:02:34</span><span className="ml-auto">⋮</span></div>
          </aside>

          <main className="min-w-0 flex-1 bg-[#f7f7f8] px-10 py-5">
            <div className="mx-auto max-w-[980px]">
              <h1 className="mb-5 text-[18px] font-semibold">Ad</h1>
              <section className="rounded-[7px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Ad name</h2><span className="text-[#45494d]">⌃</span></div>
                <div className="mt-4 h-8 max-w-[430px] rounded-[2px] border border-[#d9dbde] px-3 py-2 text-[11px] text-[#45494d]">Ad name2026-08-18 07:02:34</div>
              </section>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_300px] gap-3">
                <section className="rounded-[7px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Creative assets <span className="text-[11px] font-normal text-[#777b82]">ⓘ</span></h2><span className="text-[#45494d]">⌃</span></div>
                  <p className="mt-2 max-w-[500px] text-[11px] leading-4 text-[#777b82]">Creative assets will be combined with your text and add-ons to create high-performing, tailored ad variations.</p>
                  <div className="mt-3">
                    <KsInlineAlert
                      variant="suggestion"
                      size="sm"
                      inverse
                      content="Up to 4 recommended creator assets will be automatically selected when you add creatives. You can review and adjust the selections before saving."
                    >
                      <button slot="actions" type="button" onClick={reopenDrawer} className="text-[11px] font-medium text-[#137e78]">Review recommendations</button>
                    </KsInlineAlert>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-[#eff0f1] pt-3">
                    <button type="button" onClick={reopenDrawer} className="rounded-[3px] border border-[#bfc3c7] bg-white px-3 py-1.5 text-[12px] font-medium">＋ Add</button>
                    <button type="button" className="rounded-[3px] border border-[#bfc3c7] bg-white px-3 py-1.5 text-[12px] font-medium">＋ Create new videos</button>
                  </div>
                </section>
                <aside className="rounded-[7px] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="mb-3 flex items-center justify-between"><span className="h-1 w-6 rounded bg-[#222]" /><span className="rounded border border-[#d8dade] px-2 py-1 text-[10px]">In feed⌄</span></div>
                  <div className="mx-auto flex h-[390px] max-w-[220px] flex-col rounded-[5px] bg-[linear-gradient(165deg,#7c7f7c,#252525)] p-3 text-white"><div className="flex justify-between text-[9px]"><span>9:41</span><span>● ● ▰</span></div><div className="mt-3 flex justify-around text-[9px]"><span>Following</span><span className="border-b border-white pb-1">For You</span><span>⌕</span></div><div className="m-auto text-center text-[30px] text-white/70">▧</div><div className="text-[9px] text-white/70">Your identity<br />Your video will be shown here</div></div>
                </aside>
              </div>

              <section className="mt-3 max-w-[665px] rounded-[7px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Text and add-ons <span className="text-[11px] font-normal text-[#777b82]">ⓘ</span></h2><span>⌃</span></div><p className="mt-2 text-[11px] text-[#777b82]">Add text and add-ons to help audiences take action on your ad.</p><div className="mt-6 flex items-center justify-between text-[12px]"><span>Call to action <span className="text-[#777b82]">ⓘ</span></span><span className="h-4 w-7 rounded-full bg-[#d9dbdd] p-0.5"><span className="block h-3 w-3 rounded-full bg-white" /></span></div><button type="button" className="mt-5 text-[11px] text-[#387d7a]">Advanced settings⌄</button></section>
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
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold">TikTok creator content</h2>
                <button type="button" className="rounded-[5px] border border-[#cfd1d4] bg-white px-3 py-1.5 text-[12px] font-medium">Filter content <span className="rounded bg-[#ececef] px-1">1</span></button>
              </div>
              <p className="mt-3 max-w-[760px] text-[12px] leading-5 text-[#777b82]">High-performing creator content from TikTok One and Content Suite, ready for your ads. Make sure you have the rights to use the content before showing it in your ads.</p>

              {!hasAcknowledgedAutoSelect && (
                <div className="mt-4">
                  <KsInlineAlert
                    variant="suggestion"
                    size="sm"
                    inverse
                    content={`We've automatically selected ${selectedIds.length} recommended creator assets for you based on predicted VTR. You can review and adjust your selections before saving.`}
                    afterClose={() => setHasAcknowledgedAutoSelect(true)}
                  />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={toggleAll} className="flex items-center gap-2 text-[12px] font-medium">
                  <span onClick={(event) => event.stopPropagation()}>
                    <KsCheckbox checked={allAssetsSelected} indeterminate={someAssetsSelected} onChange={toggleAll} size="md" />
                  </span>
                  Select all
                </button>
                <div className="flex items-center gap-2 text-[11px] text-[#5f6368]"><KsSwitch checked={autoSelect} onChange={toggleAutoSelect} size="sm" /> Auto-select <span className="text-[#d0d1d3]">|</span><span> {selectedIds.length} / 20 selected</span></div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-3">
                {CREATOR_ASSETS.map((asset) => {
                  const selected = selectedIds.includes(asset.id);
                  return (
                    <button key={asset.id} type="button" onClick={() => toggleAsset(asset.id)} className="group min-w-0 text-left">
                      <div className={`relative aspect-square overflow-hidden rounded-[5px] border-2 ${selected ? 'border-[#12aaa2]' : 'border-transparent'} p-1`} style={{ background: asset.background }}>
                        <div className="absolute right-1 top-1" onClick={(event) => event.stopPropagation()}>
                          <KsCheckbox checked={selected} onChange={() => toggleAsset(asset.id)} size="md" />
                        </div>
                        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/30 pl-0.5 text-[15px] text-white">▶</span>
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">{asset.size}</span>
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">{asset.duration}</span>
                      </div>
                      <div className="mt-2 flex gap-1.5"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[linear-gradient(135deg,#242424,#d3d3d3)]" /><span className="min-w-0"><span className="block truncate text-[11px] font-medium">{asset.creator}</span><span className="block truncate text-[10px] text-[#777b82]">{asset.title}</span></span></div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end gap-3 text-[12px] text-[#5f6368]"><span>‹</span><span className="rounded border border-[#91cfc9] px-1.5 py-0.5 text-[#137e78]">1</span><span>2</span><span>3</span><span>4</span><span>›</span></div>
            </div>
          </div>

          <footer className="border-t border-[#e2e3e5] bg-white px-5 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between"><div><div className="text-[13px] font-semibold">{selectedIds.length} of 30 assets selected</div><div className="text-[11px] text-[#777b82]">{selectedIds.length} video posts</div></div><div className="flex gap-2">{CREATOR_ASSETS.filter((asset) => selectedIds.includes(asset.id)).map((asset) => <span key={asset.id} className="h-11 w-9 rounded-[3px]" style={{ background: asset.background }} />)}</div><button type="button" onClick={saveSelection} className="rounded-[4px] bg-[#168f8a] px-4 py-2 text-[12px] font-semibold text-white">Save</button></div>
          </footer>
        </section>}
      </div>
    </div>
  );
}
