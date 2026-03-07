import React from "react";

export type DigitalArtwork = {
  id: string;
  title: string;
  imageUrl: string;
};

type DigitalPortfolioProps = {
  items: DigitalArtwork[];
};

export default function DigitalPortfolio({ items }: DigitalPortfolioProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay obras visuales disponibles.
      </div>
    );
  }

    return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-[1px] px-0 pb-[1px]">
        {items.map((item) => (
        <div
            key={item.id}
            className="aspect-square overflow-hidden bg-white "
        >
            <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition"
            />
        </div>
        ))}
    </div>
    );
}