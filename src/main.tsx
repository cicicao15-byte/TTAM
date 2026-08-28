import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import AdsDashboard from '@/pages/AdsDashboard';
import AdsCampaign from '@/pages/AdsCampaign';
import AdsEdit from '@/pages/AdsEdit';
import CarouselTemplateEditor from '@/pages/CarouselTemplateEditor';
import CarouselTemplateEditor2 from '@/pages/CarouselTemplateEditor2';
import CarouselTemplateEditor3 from '@/pages/CarouselTemplateEditor3';
import CarouselTemplateEditor4 from '@/pages/CarouselTemplateEditor4';
import CarouselTemplateEditor5 from '@/pages/CarouselTemplateEditor5';
import CarouselTemplateEditor6 from '@/pages/CarouselTemplateEditor6';
import RecoTabVv from '@/pages/RecoTabVv';
import NotFoundPage from '@/pages/NotFound';
import { installKeystoneOverlayCompat } from '@/infra/keystoneOverlayCompat';

if (import.meta.env.DEV) {
  installKeystoneOverlayCompat();
}

const Router = window.location.hostname.endsWith('github.io') ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<AdsDashboard />} />
          <Route path="campaigns" element={<AdsCampaign />} />
          <Route
            path="carousel-template-editor-1"
            element={<CarouselTemplateEditor />}
          />
          <Route
            path="carousel-template-editor-2"
            element={<CarouselTemplateEditor2 />}
          />
          <Route
            path="carousel-template-editor-3"
            element={<CarouselTemplateEditor3 />}
          />
          <Route
            path="carousel-template-editor-4"
            element={<CarouselTemplateEditor4 />}
          />
          <Route
            path="carousel-template-editor-5"
            element={<CarouselTemplateEditor5 />}
          />
          <Route
            path="carousel-template-editor-6"
            element={<CarouselTemplateEditor6 />}
          />
          <Route path="reco-tab-v-1" element={<RecoTabVv autoSelectControl="banner" />} />
          <Route path="reco-tab-v-2" element={<RecoTabVv autoSelectControl="toggle" />} />
          <Route path="reco-tab-v-3" element={<RecoTabVv autoSelectControl="summary" />} />
          <Route path="reco-experience" element={<RecoTabVv autoSelectControl="banner" experienceOnly />} />
          <Route path="reco-experience/banner" element={<RecoTabVv autoSelectControl="banner" experienceOnly />} />
          <Route path="reco-experience/toggle" element={<RecoTabVv autoSelectControl="toggle" experienceOnly />} />
          <Route path="reco-tab-vv" element={<RecoTabVv />} />
          <Route
            path="ads/edit"
            element={
              <AdsEdit
                initialDestinationUrl=""
                destinationUrlPlaceholder="Enter PDP/PHP URL starting with http:// or https://"
                deferInitialEmptyUrlError
              />
            }
          />
          <Route
            path="ads/edit-2"
            element={<AdsEdit persistAcaUrlEditConsent />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>,
);
