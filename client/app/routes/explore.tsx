// explore.tsx
import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
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

const Explore: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="w-full min-h-screen bg-[#E3E2DE]">

      {/* Tabs container */}
      <div className="max-w-[1200px] mx-auto md:px-4 pb-[22px]">
        <Tabs
          items={items}
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          className="krea-tabs w-full"
          tabBarStyle={{
            background: '#E3E2DE',
            borderBottom: 'none',
            marginBottom: 0,
          }}
          tabBarGutter={46}
        />
      </div>

      {/* Images - full width */}
      {activeTab === 'images' && (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] ">
          <ExploreImages
            selectedTag={selectedTag}
            selectedArtist={selectedArtist}
          />
        </div>
      )}

      {/* Music */}
      {activeTab === 'music' && (
        <div className="max-w-[1129px] mx-auto">
          <ExploreMusic
            selectedTag={selectedTag}
            selectedArtist={selectedArtist}
          />
        </div>
      )}

      {/* Literature */}
      {activeTab === 'literature' && (
        <div className="max-w-[1129px] mx-auto">
          <ExploreLiterature
            selectedTag={selectedTag}
            selectedArtist={selectedArtist}
          />
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