// components/TagsSidebar.tsx
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { PostType } from "../../types/common";

// Datos mock de tags por categoría (pueden venir de una API)
const categoryTags = {
  illustration: [
    "#Fantasía",
    "#Animación",
    "#Fanart",
    "#ConceptArt",
    "#Inktober",
    "#Sketch",
  ],
  music: [
    "#Rock",
    "#Pop",
    "#Electrónica",
    "#Jazz",
    "#Clásica",
    "#Indie",
  ],
  literature: [
    "#Novela",
    "#Poesía",
    "#Cuento",
    "#Ensayo",
    "#Ficción",
    "#Historia",
  ],
};

// Componente interno para un bloque de categoría
const CategoryBlock = ({ 
  title, 
  tags, 
  seeMoreLink 
}: { 
  title: string; 
  tags: string[]; 
  seeMoreLink: string; 
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#E8F1FC] border-2 border-[#8F8E8A] rounded-lg p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">{title}</h3>
      <div className="flex flex-col gap-1">
        {tags.map((tag) => (
          <Link
            key={tag}
            to={`/explore?tag=${encodeURIComponent(tag)}`}
            className="text-sm text-gray-700 hover:text-[#1351AA] hover:underline"
          >
            {tag}
          </Link>
        ))}
        <Link
          to={seeMoreLink}
          className="text-sm text-[#1351AA] text-left mt-2 hover:underline"
        >
          {t("tags.see_more", "Ver más...")}
        </Link>
      </div>
    </div>
  );
};

export default function TagsSidebar() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <CategoryBlock
        title={t("tags.latest_illustration", "Lo último en Ilustración")}
        tags={categoryTags.illustration}
        seeMoreLink="/explore?category=illustration"
      />
      <CategoryBlock
        title={t("tags.latest_music", "Lo último en Música")}
        tags={categoryTags.music}
        seeMoreLink="/explore?category=music"
      />
      <CategoryBlock
        title={t("tags.latest_literature", "Lo último en Literatura")}
        tags={categoryTags.literature}
        seeMoreLink="/explore?category=literature"
      />
    </div>
  );
}