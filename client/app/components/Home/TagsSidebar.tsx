// components/Home/TagsSidebar.tsx
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const categoryTags = {
  illustration: ["#Fantasía", "#Animación", "#Fanart", "#ConceptArt", "#Inktober", "#Sketch"],
  music: ["#Rock", "#Pop", "#Electrónica", "#Jazz", "#Clásica", "#Indie"],
  literature: ["#Novela", "#Poesía", "#Cuento", "#Ensayo", "#Ficción", "#Historia"],
};

const getTabFromCategory = (category: string): string => {
  if (category === "illustration") return "images";
  if (category === "music") return "music";
  return "literature";
};

const CategoryBlock = ({ title, tags, category }: { title: string; tags: string[]; category: string }) => {
  const { t } = useTranslation();
  const tab = getTabFromCategory(category);

  return (
    <div className="bg-[#E8F1FC] rounded-[15px] outline outline-[1.5px] outline-[#95ACCC] p-4 shadow-md">
      <h3 className="text-base font-medium text-gray-900 mb-3">{title}</h3>
      <div className="flex flex-col gap-1">
        {tags.map((tag) => (
          <Link
            key={tag}
            to={`/explore?tab=${tab}&tag=${encodeURIComponent(tag.replace("#", ""))}`}
            className="text-sm text-gray-700 hover:text-[#1351AA] hover:underline"
          >
            {tag}
          </Link>
        ))}
        <Link
          to={`/explore?tab=${tab}`}
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
    <aside className="sticky top-[80px] h-fit flex flex-col gap-6 w-[300px]">
      <CategoryBlock
        title={t("tags.latest_illustration", "Lo último en Ilustración")}
        tags={categoryTags.illustration}
        category="illustration"
      />
      <CategoryBlock
        title={t("tags.latest_music", "Lo último en Música")}
        tags={categoryTags.music}
        category="music"
      />
      <CategoryBlock
        title={t("tags.latest_literature", "Lo último en Literatura")}
        tags={categoryTags.literature}
        category="literature"
      />
    </aside>
  );
}