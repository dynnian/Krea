// components/Posts/PostImageDetail.tsx
import { useState } from 'react';
import { Modal } from 'antd';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PostDto } from '../../types/api.ts';

interface PostImageDetailProps {
  post: PostDto;
}

export default function PostImageDetail({ post }: PostImageDetailProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = post.media
    .filter(m => m.mimeType.startsWith('image/'))
    .map(m => m.url);

  if (images.length === 0) return null;

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        {images.length === 1 && (
          <img
            src={images[0]}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => {
              setSelectedImageIndex(0);
              setModalVisible(true);
            }}
          />
        )}
        {images.length === 2 && (
          <div className="flex gap-2 w-full">
            <img
              src={images[0]}
              alt="Post image 1"
              className="w-1/2 h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedImageIndex(0);
                setModalVisible(true);
              }}
            />
            <img
              src={images[1]}
              alt="Post image 2"
              className="w-1/2 h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedImageIndex(1);
                setModalVisible(true);
              }}
            />
          </div>
        )}
        {images.length >= 3 && (
          <div className="flex gap-2 w-full">
            <img
              src={images[0]}
              alt="Post image 1"
              className="w-1/2 h-80 object-cover rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedImageIndex(0);
                setModalVisible(true);
              }}
            />
            <div className="w-1/2 flex flex-col gap-2">
              <img
                src={images[1]}
                alt="Post image 2"
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedImageIndex(1);
                  setModalVisible(true);
                }}
              />
              <img
                src={images[2]}
                alt="Post image 3"
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedImageIndex(2);
                  setModalVisible(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        centered
        width="90vw"
        styles={{ body: { padding: 0, height: '80vh' } }}
        closeIcon={<X className="text-white" />}
      >
        <div className="relative h-full flex items-center justify-center bg-black">
          <img
            src={images[selectedImageIndex]}
            alt="Full size"
            className="max-h-full max-w-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}