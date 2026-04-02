import { useTranslation } from "react-i18next";

interface FeedTabsProps {
  activeTab: "forYou" | "following";
  onTabChange: (tab: "forYou" | "following") => void;
  isMobile?: boolean; // ya no se usa en el diseño, pero se mantiene por compatibilidad
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center gap-8 mb-6">
      <button
        onClick={() => onTabChange("forYou")}
        className={`pb-1 text-base font-medium ${
          activeTab === "forYou"
            ? "text-[#0B5107] border-b-2 border-[#0B5107]"
            : "text-[#1B1C1E]"
        }`}
      >
        {t("home.for_you")}
      </button>
      <div className="w-px h-5 bg-[#8F8E8A]" />
      <button
        onClick={() => onTabChange("following")}
        className={`pb-1 text-base font-medium ${
          activeTab === "following"
            ? "text-[#0B5107] border-b-2 border-[#0B5107]"
            : "text-[#1B1C1E]"
        }`}
      >
        {t("home.following")}
      </button>
    </div>
  );
}