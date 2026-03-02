// explore.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Card, Typography, Row, Col, Grid, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Bookmark,
} from 'lucide-react';

// ---------- ClientOnly wrapper (evita errores de SSR) ----------
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

// ---------- Mock data (simulando estructura de posts) ----------
enum PostType {
  IMAGE = 'image',
  AUDIO = 'audio',
  LINK = 'link',
}

const mockAuthors = [
  { name: 'Ana López', handle: 'artista_visual', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Carlos Méndez', handle: 'musico_creativo', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Laura García', handle: 'escritor_novel', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const mockExplorePosts = [
  // Imágenes
  {
    id: 1,
    type: PostType.IMAGE,
    title: null,
    content: 'Mi última ilustración',
    author: mockAuthors[0],
    media: [
      { media: { path: 'https://images.unsplash.com/photo-1575995872537-3793d29d972c?w=400' } },
      { media: { path: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400' } },
      { media: { path: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' } },
    ],
  },
  // Audio (música)
  {
    id: 2,
    type: PostType.AUDIO,
    title: 'Amanecer',
    content: 'Nuevo tema',
    author: mockAuthors[1],
    media: [
      { media: { mime_type: 'audio/mpeg', path: '/assets/audio-sample.mp3' } },
      { media: { mime_type: 'image/jpeg', path: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' } },
    ],
    likesCount: 128,
    favoritesCount: 45,
  },
  {
    id: 3,
    type: PostType.AUDIO,
    title: 'Atardecer',
    content: 'Canción relajante',
    author: mockAuthors[1],
    media: [
      { media: { mime_type: 'audio/mpeg', path: '/assets/audio-sample.mp3' } },
      { media: { mime_type: 'image/jpeg', path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' } },
    ],
    likesCount: 98,
    favoritesCount: 23,
  },
  // Literatura (link)
  {
    id: 4,
    type: PostType.LINK,
    title: 'El jardín secreto',
    content: 'Recomiendo este libro...',
    author: mockAuthors[2],
    media: [{ media: { path: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' } }],
  },
  {
    id: 5,
    type: PostType.LINK,
    title: 'Cien años de soledad',
    content: 'Un clásico',
    author: mockAuthors[2],
    media: [{ media: { path: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' } }],
  },
];

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// ---------- Componentes reutilizables ----------

interface TagProps {
  children: React.ReactNode;
  to?: string;
}

const TrendingTag: React.FC<TagProps> = ({ children, to }) => {
  const content = (
    <div
      style={{
        display: 'inline-flex',
        padding: '4px 18px',
        background: '#E8F1FC',
        borderRadius: 41,
        border: '1px solid #464749',
        color: '#464749',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: '22.54px',
        whiteSpace: 'nowrap',
        cursor: to ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
};

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, active }) => (
  <button
    onClick={onClick}
    style={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: active ? '#0B5107' : '#E9FDE8',
      border: active ? 'none' : '1.67px solid #0B5107',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: active ? '#E3E2DE' : '#0B5107',
    }}
  >
    {icon}
  </button>
);

const FollowButton: React.FC = () => (
  <div
    style={{
      padding: '0 22px',
      background: '#E8F1FC',
      borderRadius: 55,
      border: '1px solid #1B1C1E',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 28,
      fontSize: 12,
      fontWeight: 500,
      color: '#1B1C1E',
      cursor: 'pointer',
    }}
  >
    Seguir
  </div>
);

interface AlbumCardProps {
  cover: string;
  title: string;
  artist: string;
  id?: number;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ cover, title, artist }) => (
  <Card
    cover={<img alt={title} src={cover} style={{ borderRadius: 5 }} />}
    bordered={false}
    bodyStyle={{ padding: '8px 4px' }}
  >
    <Card.Meta
      title={<Text strong>{title}</Text>}
      description={<Text type="secondary">{artist}</Text>}
    />
  </Card>
);

interface WaveformPlayerProps {
  audioUrl: string;
  coverUrl?: string;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl, coverUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#0B5107',
        progressColor: '#1351AA',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 1,
        height: 40,
        responsive: true,
        url: audioUrl,
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));
    }

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      {coverUrl && (
        <img src={coverUrl} alt="cover" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
      )}
      <div ref={waveformRef} style={{ flex: 1 }} />
      <ActionButton
        icon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
        onClick={togglePlayPause}
        active={isPlaying}
      />
    </div>
  );
};

interface SongRowProps {
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  genres?: string;
}

const SongRow: React.FC<SongRowProps> = ({ title, artist, cover, audioUrl, genres }) => (
  <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
    <Row gutter={16} align="middle">
      <Col xs={6} sm={4}>
        <img src={cover} alt={title} style={{ width: '100%', borderRadius: 5 }} />
      </Col>
      <Col xs={18} sm={20}>
        <Row justify="space-between" align="top">
          <Col>
            <Text strong style={{ fontSize: 20 }}>{title}</Text>
            <br />
            <Text type="secondary">{artist}</Text>
          </Col>
          {genres && (
            <Col>
              <Text>{genres}</Text>
            </Col>
          )}
        </Row>
        <div style={{ marginTop: 8 }}>
          <WaveformPlayer audioUrl={audioUrl} coverUrl={cover} />
        </div>
        <Space size="middle" style={{ marginTop: 8 }}>
          <ActionButton icon={<Heart size={18} />} />
          <ActionButton icon={<Play size={18} />} />
          <ActionButton icon={<Bookmark size={18} />} />
        </Space>
      </Col>
    </Row>
  </Card>
);

interface SidebarCardProps {
  title: string;
  items: string[];
  linkPrefix: 'tag' | 'artist';
}

const SidebarCard: React.FC<SidebarCardProps> = ({ title, items, linkPrefix }) => (
  <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
    <Title level={4}>{title}</Title>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(item => (
        <TrendingTag key={item} to={`?${linkPrefix}=${encodeURIComponent(item)}`}>
          {item}
        </TrendingTag>
      ))}
    </div>
  </Card>
);

// ---------- Tabs Content (ahora reciben selectedTag/selectedArtist como props) ----------

interface TabProps {
  selectedTag: string | null;
  selectedArtist: string | null;
}

const ImagesTab: React.FC<TabProps> = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const imagePosts = mockExplorePosts.filter(p => p.type === PostType.IMAGE);

  return (
    <div style={{ padding: isMobile ? '8px' : '24px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '200px'}, 1fr))`,
          gap: isMobile ? '4px' : '8px',
        }}
      >
        {imagePosts.flatMap(post =>
          post.media.map(m => (
            <img
              key={m.media.path}
              src={m.media.path}
              alt={post.content}
              style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const MusicTab: React.FC<TabProps> = ({ selectedTag, selectedArtist }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { t } = useTranslation();

  const audioPosts = mockExplorePosts.filter(p => p.type === PostType.AUDIO);
  // Aquí podrías filtrar según selectedTag/selectedArtist (simulado)
  const filteredPosts = audioPosts;

  const featured = filteredPosts[0];
  const newAlbums = filteredPosts.slice(1, 5);
  const latestSongs = filteredPosts;

  const trendingGenres = ['Jazz', 'Rock', 'Pop', 'Vocaloid', 'Punk', 'Trance', 'Lo-Fi', 'Nightcore'];
  const trendingArtists = mockAuthors.map(a => a.name);

  return (
    <Row gutter={[24, 24]} style={{ padding: isMobile ? '8px' : '24px 0' }}>
      <Col xs={24} md={16}>
        {featured && (
          <Card
            style={{
              background: '#E8F1FC',
              border: '1.5px solid #8F8E8A',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: isMobile ? '16px' : '18px 24px' }}
          >
            <Title level={2} style={{ marginTop: 0, fontSize: isMobile ? 24 : 36 }}>
              {t('explore.music.featured')}
            </Title>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <img
                  src={featured.media.find(m => m.media.mime_type?.startsWith('image'))?.media.path || 'https://placehold.co/190x190'}
                  alt="featured"
                  style={{ width: '100%', borderRadius: 5 }}
                />
              </Col>
              <Col xs={24} sm={16}>
                <Row justify="space-between" align="top">
                  <Col>
                    <Text type="secondary" style={{ fontSize: 19, display: 'block' }}>
                      {featured.author.name}
                    </Text>
                    <Text strong style={{ fontSize: 24, display: 'block' }}>
                      {featured.title}
                    </Text>
                    <FollowButton />
                  </Col>
                  <Col>
                    <Space direction="vertical" size="small">
                      {trendingGenres.slice(0, 2).map(g => (
                        <TrendingTag key={g} to={`?tag=${g}`}>{g}</TrendingTag>
                      ))}
                    </Space>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <WaveformPlayer
                    audioUrl={featured.media.find(m => m.media.mime_type?.startsWith('audio'))?.media.path || '/assets/audio-sample.mp3'}
                    coverUrl={featured.media.find(m => m.media.mime_type?.startsWith('image'))?.media.path}
                  />
                </div>
                <Space size="middle" style={{ marginTop: 16 }}>
                  <ActionButton icon={<SkipBack size={18} />} />
                  <ActionButton icon={<Play size={24} />} active />
                  <ActionButton icon={<SkipForward size={18} />} />
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <div style={{ marginBottom: 32 }}>
          <Title level={3}>{t('explore.music.new_albums')}</Title>
          <Row gutter={[16, 16]}>
            {newAlbums.map((post) => (
              <Col xs={12} sm={8} md={6} key={post.id}>
                <AlbumCard
                  cover={post.media.find(m => m.media.mime_type?.startsWith('image'))?.media.path || 'https://placehold.co/168x168'}
                  title={post.title || ''}
                  artist={post.author.name}
                />
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <Title level={3}>{t('explore.music.latest_songs')}</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {latestSongs.map((post) => (
              <SongRow
                key={post.id}
                title={post.title || ''}
                artist={post.author.name}
                cover={post.media.find(m => m.media.mime_type?.startsWith('image'))?.media.path || 'https://placehold.co/180x180'}
                audioUrl={post.media.find(m => m.media.mime_type?.startsWith('audio'))?.media.path || '/assets/audio-sample.mp3'}
                genres={t('explore.music.song_genres')}
              />
            ))}
          </Space>
        </div>
      </Col>

      {!isMobile && (
        <Col md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <SidebarCard title={t('explore.music.trending_genres')} items={trendingGenres} linkPrefix="tag" />
            <SidebarCard title={t('explore.music.trending_artists')} items={trendingArtists} linkPrefix="artist" />
          </Space>
        </Col>
      )}
    </Row>
  );
};

const LiteratureTab: React.FC<TabProps> = ({ selectedTag, selectedArtist }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { t } = useTranslation();

  const linkPosts = mockExplorePosts.filter(p => p.type === PostType.LINK);
  const filteredPosts = linkPosts;

  const featuredBook = filteredPosts[0];
  const trendingBooks = filteredPosts.slice(1, 6);
  const recentBooks = filteredPosts.slice(0, 3);

  const trendingGenres = ['Fantasia', 'Ciencia ficción', 'Thriller', 'Romance', 'Paranormal', 'Mistery'];
  const trendingAuthors = mockAuthors.map(a => a.name);

  return (
    <Row gutter={[24, 24]} style={{ padding: isMobile ? '8px' : '24px 0' }}>
      <Col xs={24} md={16}>
        {featuredBook && (
          <Card
            style={{
              background: '#E8F1FC',
              border: '1.5px solid #8F8E8A',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: isMobile ? '16px' : '30px 24px' }}
          >
            <Title level={2} style={{ marginTop: 0, fontSize: isMobile ? 24 : 36 }}>
              {t('explore.literature.featured')}
            </Title>
            <Row gutter={24} align="top">
              <Col xs={24} sm={8}>
                <img
                  src={featuredBook.media[0]?.media.path || 'https://placehold.co/182x281'}
                  alt="featured"
                  style={{ width: '100%', boxShadow: '4px 4px 4px rgba(0,0,0,0.25)' }}
                />
              </Col>
              <Col xs={24} sm={16}>
                <Row justify="space-between">
                  <Col>
                    <Title level={3} style={{ margin: 0 }}>{featuredBook.title || t('explore.literature.featured_title')}</Title>
                    <Text type="secondary">
                      {featuredBook.author.name} ⋅ @{featuredBook.author.handle}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <FollowButton />
                    </div>
                  </Col>
                  <Col>
                    <Space direction="vertical">
                      {trendingGenres.slice(0, 2).map(g => (
                        <TrendingTag key={g} to={`?tag=${g}`}>{g}</TrendingTag>
                      ))}
                    </Space>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Text strong>{t('explore.literature.synopsis_label')}</Text>
                  <Text style={{ display: 'block', textAlign: 'justify', fontSize: 13, lineHeight: '24px' }}>
                    {featuredBook.content || t('explore.literature.synopsis')}
                  </Text>
                </div>
                <Space size="middle" style={{ marginTop: 16 }}>
                  <div
                    style={{
                      padding: '8px 22px',
                      background: '#0B5107',
                      borderRadius: 55,
                      color: '#E3E2DE',
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {t('explore.literature.read_now')}
                  </div>
                  <ActionButton icon={<BookOpen size={18} />} />
                  <ActionButton icon={<Heart size={18} />} />
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <div style={{ marginBottom: 32 }}>
          <Title level={3}>{t('explore.literature.trending')}</Title>
          <Row gutter={[16, 16]}>
            {trendingBooks.map((post) => (
              <Col xs={12} sm={8} md={6} key={post.id}>
                <AlbumCard
                  cover={post.media[0]?.media.path || 'https://placehold.co/123x190'}
                  title={post.title || t('explore.literature.book_title')}
                  artist={post.author.name}
                />
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <Title level={3}>{t('explore.literature.recent')}</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {recentBooks.map((post) => (
              <Card key={post.id} style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
                <Row gutter={16} align="top">
                  <Col xs={6} sm={4}>
                    <img
                      src={post.media[0]?.media.path || 'https://placehold.co/92x143'}
                      alt={post.title}
                      style={{ width: '100%', boxShadow: '4px 4px 4px rgba(0,0,0,0.25)' }}
                    />
                  </Col>
                  <Col xs={18} sm={20}>
                    <Row justify="space-between">
                      <Col>
                        <Text strong style={{ fontSize: 20 }}>{post.title || t('explore.literature.recent_title')}</Text>
                        <br />
                        <Text type="secondary">
                          {post.author.name} ⋅ @{post.author.handle}
                        </Text>
                      </Col>
                      <Col>
                        <Text>{t('explore.literature.song_genres')}</Text>
                      </Col>
                    </Row>
                    <Text style={{ display: 'block', textAlign: 'justify', fontSize: 11, lineHeight: '16px', marginTop: 8 }}>
                      {post.content || t('explore.literature.recent_synopsis')}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>{t('explore.literature.chapters')}</Text>
                    </div>
                    <Space size="middle" style={{ marginTop: 8 }}>
                      <div
                        style={{
                          padding: '5px 33px',
                          background: '#0B5107',
                          borderRadius: 55,
                          color: '#E3E2DE',
                          fontWeight: 500,
                          fontSize: 9.82,
                          cursor: 'pointer',
                        }}
                      >
                        {t('explore.literature.read')}
                      </div>
                      <ActionButton icon={<BookOpen size={14} />} />
                      <ActionButton icon={<Heart size={14} />} />
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </div>
      </Col>

      {!isMobile && (
        <Col md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <SidebarCard title={t('explore.literature.trending_genres')} items={trendingGenres} linkPrefix="tag" />
            <SidebarCard title={t('explore.literature.trending_authors')} items={trendingAuthors} linkPrefix="artist" />
          </Space>
        </Col>
      )}
    </Row>
  );
};

// ---------- Main Explore Component ----------
const Explore: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const selectedArtist = searchParams.get('artist');

  const items = [
    {
      key: 'images',
      label: t('explore.tabs.images'),
      children: <ImagesTab selectedTag={selectedTag} selectedArtist={selectedArtist} />,
    },
    {
      key: 'music',
      label: t('explore.tabs.music'),
      children: <MusicTab selectedTag={selectedTag} selectedArtist={selectedArtist} />,
    },
    {
      key: 'literature',
      label: t('explore.tabs.literature'),
      children: <LiteratureTab selectedTag={selectedTag} selectedArtist={selectedArtist} />,
    },
  ];

  return (
    <div style={{ width: '100%', background: '#E3E2DE', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 0 : '0 16px' }}>
        <Tabs
          items={items}
          centered={!isMobile}
          tabBarStyle={{
            background: '#E3E2DE',
            borderBottom: 'none',
            marginBottom: 0,
          }}
          tabBarGutter={46}
          style={{ width: '100%' }}
        />
      </div>
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