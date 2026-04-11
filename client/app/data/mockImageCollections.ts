export interface MockPortfolioImageItem {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
}

export interface MockImageCollection {
  id: string;
  title: string;
  description?: string;
  itemCount: number;
  updatedAt: string;
  coverUrl: string | null;
  posts: MockPortfolioImageItem[];
}

export const mockPortfolioGeneralImages: MockPortfolioImageItem[] = [
  {
    id: "img-1",
    title: "Artwork 1",
    imageUrl: "https://picsum.photos/id/1015/800/1200",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "img-2",
    title: "Artwork 2",
    imageUrl: "https://picsum.photos/id/1025/800/1200",
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "img-3",
    title: "Artwork 3",
    imageUrl: "https://picsum.photos/id/1035/800/1200",
    createdAt: "2026-04-03T10:00:00.000Z",
  },
  {
    id: "img-4",
    title: "Artwork 4",
    imageUrl: "https://picsum.photos/id/1045/800/1200",
    createdAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: "img-5",
    title: "Artwork 5",
    imageUrl: "https://picsum.photos/id/1055/800/1200",
    createdAt: "2026-04-05T10:00:00.000Z",
  },
  {
    id: "img-6",
    title: "Artwork 6",
    imageUrl: "https://picsum.photos/id/1065/800/1200",
    createdAt: "2026-04-06T10:00:00.000Z",
  },
  {
    id: "img-7",
    title: "Artwork 7",
    imageUrl: "https://picsum.photos/id/1075/800/1200",
    createdAt: "2026-04-07T10:00:00.000Z",
  },
  {
    id: "img-8",
    title: "Artwork 8",
    imageUrl: "https://picsum.photos/id/1084/800/1200",
    createdAt: "2026-04-08T10:00:00.000Z",
  },
  {
    id: "img-9",
    title: "Artwork 9",
    imageUrl: "https://picsum.photos/id/1080/800/1200",
    createdAt: "2026-04-09T10:00:00.000Z",
  },
  {
    id: "img-10",
    title: "Artwork 10",
    imageUrl: "https://picsum.photos/id/109/800/1200",
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "img-11",
    title: "Artwork 11",
    imageUrl: "https://picsum.photos/id/110/800/1200",
    createdAt: "2026-04-11T10:00:00.000Z",
  },
  {
    id: "img-12",
    title: "Artwork 12",
    imageUrl: "https://picsum.photos/id/111/800/1200",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
];

export const mockImageCollections: MockImageCollection[] = [
  {
    id: "collection-1",
    title: "Fantasy Worlds",
    description: "A collection of fantasy-inspired pieces.",
    itemCount: 4,
    updatedAt: "2026-04-12T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1003/800/1200",
    posts: [
      mockPortfolioGeneralImages[0],
      mockPortfolioGeneralImages[3],
      mockPortfolioGeneralImages[7],
      mockPortfolioGeneralImages[10],
    ],
  },
  {
    id: "collection-2",
    title: "Sketchbook",
    description: "Loose sketches and rough concepts.",
    itemCount: 3,
    updatedAt: "2026-04-11T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1005/800/1200",
    posts: [
      mockPortfolioGeneralImages[1],
      mockPortfolioGeneralImages[4],
      mockPortfolioGeneralImages[8],
    ],
  },
  {
    id: "collection-3",
    title: "Portrait Studies",
    description: "Faces, expressions and character studies.",
    itemCount: 4,
    updatedAt: "2026-04-10T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1006/800/1200",
    posts: [
      mockPortfolioGeneralImages[2],
      mockPortfolioGeneralImages[5],
      mockPortfolioGeneralImages[9],
      mockPortfolioGeneralImages[11],
    ],
  },
  {
    id: "collection-4",
    title: "Environment Design",
    description: "Places and worldbuilding pieces.",
    itemCount: 3,
    updatedAt: "2026-04-09T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1011/800/1200",
    posts: [
      mockPortfolioGeneralImages[0],
      mockPortfolioGeneralImages[6],
      mockPortfolioGeneralImages[9],
    ],
  },
  {
    id: "collection-5",
    title: "Color Experiments",
    description: "Pieces focused on color and lighting.",
    itemCount: 4,
    updatedAt: "2026-04-08T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1012/800/1200",
    posts: [
      mockPortfolioGeneralImages[2],
      mockPortfolioGeneralImages[4],
      mockPortfolioGeneralImages[7],
      mockPortfolioGeneralImages[11],
    ],
  },
    {
    id: "collection-6",
    title: "Sketches",
    description: "Pieces focused on color and lighting.",
    itemCount: 4,
    updatedAt: "2026-04-08T12:00:00.000Z",
    coverUrl: "https://picsum.photos/id/1012/800/1200",
    posts: [
      mockPortfolioGeneralImages[2],
      mockPortfolioGeneralImages[4],
      mockPortfolioGeneralImages[7],
      mockPortfolioGeneralImages[11],
    ],
  },
];