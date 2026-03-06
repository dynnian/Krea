export type CommissionCard = {
  id: string;
  title: string;
  priceLabel: string;
  deliveryLabel: string;
  summary: string;
  coverUrl?: string;
};

export type CommissionsPageState = {
  items: CommissionCard[];
};

export type CommissionAuthor = {
  name: string;
  handle: string;
  verified: boolean;
};

export type CommissionComment = {
  id: string;
  author: string;
  handle: string;
  dateLabel: string;
  body: string;
};

export type CommissionDetail = {
  id: string;
  title: string;
  priceLabel: string;
  deliveryEstimate: string;
  about: string;
  tags: string[];
  author: CommissionAuthor;
  gallery: string[];
  comments: CommissionComment[];
};
