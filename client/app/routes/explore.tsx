// explore.tsx
import React, { useEffect, useState } from 'react';
import { Tabs, Grid } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ExploreImages from "../components/Explore/ExploreImages.tsx";
import ExploreMusic from "../components/Explore/ExploreMusic.tsx";
import ExploreLiterature from "../components/Explore/ExploreLiterature.tsx";

// ---------- ClientOnly wrapper (evita errores de SSR) ----------
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

const { useBreakpoint } = Grid;

const Explore: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const selectedArtist = searchParams.get('artist');
  const [activeTab, setActiveTab] = useState('images');

  const items = [
    {
      key: 'images',
      label: t('explore.tabs.images'),
    },
    {
      key: 'music',
      label: t('explore.tabs.music'),
    },
    {
      key: 'literature',
      label: t('explore.tabs.literature'),
    },
  ];

  return (
    <div style={{ width: '100%', background: '#E3E2DE', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 0 : '0 16px' }}>
        <Tabs 
          items={items}
          activeKey={activeTab}
          onChange={setActiveTab}
          centered={!isMobile}
          className="krea-tabs"
          tabBarStyle={{
            background: '#E3E2DE',
            borderBottom: 'none',
            marginBottom: 0,
          }}
          tabBarGutter={46}
          style={{ width: '100%' }}
        />
      </div>

      {activeTab === 'images' && (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <ExploreImages selectedTag={selectedTag} selectedArtist={selectedArtist} />
        </div>
      )}

      {activeTab === 'music' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '8px' : '0 16px' }}>
          <ExploreMusic selectedTag={selectedTag} selectedArtist={selectedArtist} />
        </div>
      )}

      {activeTab === 'literature' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '8px' : '0 16px' }}>
          <ExploreLiterature selectedTag={selectedTag} selectedArtist={selectedArtist} />
        </div>
      )}
    </div>
  );
};

// Exportación envuelta en ClientOnly para evitar SSR
export default function ExploreWrapper() {
  return (
    <ClientOnly>
      <Explore />
    </ClientOnly>
  );
}