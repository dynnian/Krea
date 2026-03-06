export type SubscriptionCard = {
  id: string;
  title: string;
  priceLabel: string;
  recurrenceLabel: string;
  summary: string;
  benefits: string[];
  deliveryNote: string;
  renewalNote: string;
  coverUrl?: string;
};

export type SubscriptionsPageState = {
  items: SubscriptionCard[];
};
