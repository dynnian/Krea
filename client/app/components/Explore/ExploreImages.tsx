import React from 'react';
import { Grid, Image } from 'antd';

const { useBreakpoint } = Grid;

type ExploreImagesProps = {
  selectedTag?: string | null;
  selectedArtist?: string | null;
};

const ART_IMAGES = [
  'https://i.imgur.com/1.jpg',
  'https://i.imgur.com/2.jpg',
  'https://i.imgur.com/3.jpg',
  'https://i.imgur.com/4.jpg',
  'https://i.imgur.com/5.jpg',
  'https://i.imgur.com/6.jpg',
  'https://i.imgur.com/7.jpg',
  'https://i.imgur.com/8.jpg',
  'https://i.imgur.com/9.jpg',
  'https://i.imgur.com/10.jpg',
  'https://i.imgur.com/11.jpg',
  'https://i.imgur.com/12.jpg',
  'https://i.imgur.com/13.jpg',
  'https://i.imgur.com/14.jpg',
  'https://i.imgur.com/15.jpg',
  'https://i.imgur.com/16.jpg',
  'https://i.imgur.com/17.jpg',
  'https://i.imgur.com/18.jpg',
  'https://i.imgur.com/19.jpg',
  'https://i.imgur.com/20.jpg',
  'https://i.imgur.com/21.jpg',
  'https://i.imgur.com/22.jpg',
  'https://i.imgur.com/23.jpg',
  'https://i.imgur.com/24.jpg',
  'https://i.imgur.com/25.jpg',
  'https://i.imgur.com/26.jpg',
  'https://i.imgur.com/27.jpg',
  'https://i.imgur.com/28.jpg',
  'https://i.imgur.com/29.jpg',
  'https://i.imgur.com/30.jpg',
];

export default function ExploreImages({
  selectedTag,
  selectedArtist,
}: ExploreImagesProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ padding: isMobile ? '8px' : '24px 0' }}>
      {(selectedTag || selectedArtist) && (
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto 16px auto',
            padding: isMobile ? '0 8px' : '0 16px',
            color: '#1B1C1E',
            fontSize: 14,
          }}
        >
          {selectedTag && <span>Tag: {selectedTag}</span>}
          {selectedTag && selectedArtist && <span> · </span>}
          {selectedArtist && <span>Artist: {selectedArtist}</span>}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(8, 1fr)',
          gap: 0,
          width: '100%',
        }}
      >
        {ART_IMAGES.map((src, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              background: '#ddd',
            }}
          >
            <Image
              src={src}
              alt={`art-${index}`}
              preview={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}