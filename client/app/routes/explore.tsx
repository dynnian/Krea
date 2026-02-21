// explore.tsx
import React from 'react';
import { Tabs, Card, Typography, Row, Col, Grid, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Image as ImageIcon,
  Music,
  Book,
} from 'lucide-react';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// ---------- Reusable Styled Components ----------

interface TagProps {
  children: React.ReactNode;
}

const TrendingTag: React.FC<TagProps> = ({ children }) => (
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
    }}
  >
    {children}
  </div>
);

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

// ---------- Tab Content Components ----------

const ImagesTab: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const images = Array.from({ length: 40 }, (_, i) => (
    <img
      key={i}
      src={`https://placehold.co/${isMobile ? '140' : '239'}x${isMobile ? '140' : '239'}`}
      alt={`art-${i}`}
      style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
    />
  ));

  return (
    <div style={{ padding: isMobile ? '8px' : '24px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '200px'}, 1fr))`,
          gap: isMobile ? '4px' : '8px',
        }}
      >
        {images}
      </div>
    </div>
  );
};

const MusicTab: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { t } = useTranslation();

  // Dummy data
  const featured = {
    artist: t('explore.music.featured_artist'),
    song: t('explore.music.featured_song'),
    genres: ['Jazz', 'Rock'],
    cover: 'https://placehold.co/190x190',
  };

  const newAlbums = Array.from({ length: 4 }, (_, i) => ({
    title: t('explore.music.album_title'),
    artist: t('explore.music.album_artist'),
    cover: 'https://placehold.co/168x168',
  }));

  const latestSongs = Array.from({ length: 4 }, (_, i) => ({
    title: t('explore.music.song_title'),
    artist: t('explore.music.song_artist'),
    genres: t('explore.music.song_genres'),
    cover: 'https://placehold.co/180x180',
  }));

  const trendingGenres = ['Jazz', 'Rock', 'Pop', 'Vocaloid', 'Punk', 'Trance', 'Lo-Fi', 'Nightcore'];
  const trendingArtists = ['Sabrina Carpenter', 'James', 'Kendrik', 'Pierce The Veil', 'SEATBELTS', 'Toby Fox'];

  // Generate random waveform bars
  const waveform = (count: number) => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: Math.random() * 40 + 10,
            background: '#0B5107',
          }}
        />
      ))}
    </div>
  );

  return (
    <Row gutter={[24, 24]} style={{ padding: isMobile ? '8px' : '24px 0' }}>
      {/* Main content */}
      <Col xs={24} md={16}>
        {/* Featured card */}
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
              <img src={featured.cover} alt="featured" style={{ width: '100%', borderRadius: 5 }} />
            </Col>
            <Col xs={24} sm={16}>
              <Row justify="space-between" align="top">
                <Col>
                  <Text type="secondary" style={{ fontSize: 19, display: 'block' }}>
                    {featured.artist}
                  </Text>
                  <Text strong style={{ fontSize: 24, display: 'block' }}>
                    {featured.song}
                  </Text>
                  <FollowButton />
                </Col>
                <Col>
                  <Space direction="vertical" size="small">
                    {featured.genres.map(g => (
                      <TrendingTag key={g}>{g}</TrendingTag>
                    ))}
                  </Space>
                </Col>
              </Row>
              {/* Waveform */}
              <div style={{ marginTop: 16 }}>{waveform(20)}</div>
              <Space size="middle" style={{ marginTop: 16 }}>
                <ActionButton icon={<SkipBack size={18} />} />
                <ActionButton icon={<Play size={24} />} active />
                <ActionButton icon={<SkipForward size={18} />} />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* New albums */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>{t('explore.music.new_albums')}</Title>
          <Row gutter={[16, 16]}>
            {newAlbums.map((album, i) => (
              <Col xs={12} sm={8} md={6} key={i}>
                <Card
                  cover={<img alt={album.title} src={album.cover} style={{ borderRadius: 5 }} />}
                  bordered={false}
                  bodyStyle={{ padding: '8px 4px' }}
                >
                  <Card.Meta
                    title={<Text strong>{album.title}</Text>}
                    description={<Text type="secondary">{album.artist}</Text>}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Latest songs */}
        <div>
          <Title level={3}>{t('explore.music.latest_songs')}</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {latestSongs.map((song, i) => (
              <Card key={i} style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
                <Row gutter={16} align="middle">
                  <Col xs={6} sm={4}>
                    <img src={song.cover} alt={song.title} style={{ width: '100%', borderRadius: 5 }} />
                  </Col>
                  <Col xs={18} sm={20}>
                    <Row justify="space-between" align="top">
                      <Col>
                        <Text strong style={{ fontSize: 20 }}>{song.title}</Text>
                        <br />
                        <Text type="secondary">{song.artist}</Text>
                      </Col>
                      <Col>
                        <Text>{song.genres}</Text>
                      </Col>
                    </Row>
                    <div style={{ marginTop: 8 }}>{waveform(30)}</div>
                    <Space size="middle" style={{ marginTop: 8 }}>
                      <ActionButton icon={<Heart size={18} />} />
                      <ActionButton icon={<Play size={18} />} />
                      <ActionButton icon={<Heart size={18} />} active />
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </div>
      </Col>

      {/* Sidebar – only visible on md and up */}
      {!isMobile && (
        <Col md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
              <Title level={4}>{t('explore.music.trending_genres')}</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trendingGenres.map(g => (
                  <TrendingTag key={g}>{g}</TrendingTag>
                ))}
              </div>
            </Card>
            <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
              <Title level={4}>{t('explore.music.trending_artists')}</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trendingArtists.map(a => (
                  <TrendingTag key={a}>{a}</TrendingTag>
                ))}
              </div>
            </Card>
          </Space>
        </Col>
      )}
    </Row>
  );
};

const LiteratureTab: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { t } = useTranslation();

  // Dummy data
  const featuredBook = {
    title: t('explore.literature.featured_title'),
    author: t('explore.literature.featured_author'),
    handle: '@dominio',
    genres: ['Fantasia', 'Ciencia ficción'],
    synopsis: t('explore.literature.synopsis'),
    cover: 'https://placehold.co/182x281',
  };

  const trendingBooks = Array.from({ length: 5 }, (_, i) => ({
    title: t('explore.literature.book_title'),
    author: t('explore.literature.book_author'),
    cover: 'https://placehold.co/123x190',
  }));

  const recentBooks = Array.from({ length: 3 }, (_, i) => ({
    title: t('explore.literature.recent_title'),
    author: t('explore.literature.recent_author'),
    handle: '@dominio',
    genres: 'Fantasia, Romance, etc...',
    chapters: t('explore.literature.chapters'),
    synopsis: t('explore.literature.recent_synopsis'),
    cover: 'https://placehold.co/92x143',
  }));

  const trendingGenres = ['Fantasia', 'Ciencia ficción', 'Thriller', 'Romance', 'Paranormal', 'Mistery'];
  const trendingAuthors = [
    'Steven Erikson',
    'George R. R.',
    'Tolkien',
    'Brandon',
    'Robert Jordan',
    'Tamsyn Muir',
  ];

  return (
    <Row gutter={[24, 24]} style={{ padding: isMobile ? '8px' : '24px 0' }}>
      {/* Main content */}
      <Col xs={24} md={16}>
        {/* Featured book */}
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
              <img src={featuredBook.cover} alt="featured" style={{ width: '100%', boxShadow: '4px 4px 4px rgba(0,0,0,0.25)' }} />
            </Col>
            <Col xs={24} sm={16}>
              <Row justify="space-between">
                <Col>
                  <Title level={3} style={{ margin: 0 }}>{featuredBook.title}</Title>
                  <Text type="secondary">
                    {featuredBook.author} ⋅ {featuredBook.handle}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <FollowButton />
                  </div>
                </Col>
                <Col>
                  <Space direction="vertical">
                    {featuredBook.genres.map(g => (
                      <TrendingTag key={g}>{g}</TrendingTag>
                    ))}
                  </Space>
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <Text strong>{t('explore.literature.synopsis_label')}</Text>
                <Text style={{ display: 'block', textAlign: 'justify', fontSize: 13, lineHeight: '24px' }}>
                  {featuredBook.synopsis}
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

        {/* Trending books */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>{t('explore.literature.trending')}</Title>
          <Row gutter={[16, 16]}>
            {trendingBooks.map((book, i) => (
              <Col xs={12} sm={8} md={6} key={i}>
                <Card
                  cover={<img alt={book.title} src={book.cover} style={{ width: '100%' }} />}
                  bordered={false}
                  bodyStyle={{ padding: '8px 4px' }}
                >
                  <Card.Meta
                    title={<Text strong>{book.title}</Text>}
                    description={<Text type="secondary">{book.author}</Text>}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Recently published */}
        <div>
          <Title level={3}>{t('explore.literature.recent')}</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {recentBooks.map((book, i) => (
              <Card key={i} style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
                <Row gutter={16} align="top">
                  <Col xs={6} sm={4}>
                    <img src={book.cover} alt={book.title} style={{ width: '100%', boxShadow: '4px 4px 4px rgba(0,0,0,0.25)' }} />
                  </Col>
                  <Col xs={18} sm={20}>
                    <Row justify="space-between">
                      <Col>
                        <Text strong style={{ fontSize: 20 }}>{book.title}</Text>
                        <br />
                        <Text type="secondary">
                          {book.author} ⋅ {book.handle}
                        </Text>
                      </Col>
                      <Col>
                        <Text>{book.genres}</Text>
                      </Col>
                    </Row>
                    <Text style={{ display: 'block', textAlign: 'justify', fontSize: 11, lineHeight: '16px', marginTop: 8 }}>
                      {book.synopsis}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>{book.chapters}</Text>
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

      {/* Sidebar – only visible on md and up */}
      {!isMobile && (
        <Col md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
              <Title level={4}>{t('explore.literature.trending_genres')}</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trendingGenres.map(g => (
                  <TrendingTag key={g}>{g}</TrendingTag>
                ))}
              </div>
            </Card>
            <Card style={{ background: '#E8F1FC', borderColor: '#8F8E8A' }}>
              <Title level={4}>{t('explore.literature.trending_authors')}</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trendingAuthors.map(a => (
                  <TrendingTag key={a}>{a}</TrendingTag>
                ))}
              </div>
            </Card>
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

  const items = [
    {
      key: 'images',
      label: t('explore.tabs.images'),
      children: <ImagesTab />,
    },
    {
      key: 'music',
      label: t('explore.tabs.music'),
      children: <MusicTab />,
    },
    {
      key: 'literature',
      label: t('explore.tabs.literature'),
      children: <LiteratureTab />,
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
          renderTabBar={(tabBarProps, DefaultTabBar) => (
            <DefaultTabBar {...tabBarProps} className="custom-tabs" />
          )}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default Explore;