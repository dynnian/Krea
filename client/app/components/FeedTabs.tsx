import { useTranslation } from "react-i18next";

interface FeedTabsProps {
  activeTab: "forYou" | "following";
  onTabChange: (tab: "forYou" | "following") => void;
  isMobile?: boolean;
}

export default function FeedTabs({ activeTab, onTabChange, isMobile }: FeedTabsProps) {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => onTabChange("forYou")}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "forYou"
              ? "text-[#0B5107] border-b-2 border-[#0B5107]"
              : "text-gray-600"
          }`}
        >
          {t("home.for_you")}
        </button>
        <button
          onClick={() => onTabChange("following")}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "following"
              ? "text-[#0B5107] border-b-2 border-[#0B5107]"
              : "text-gray-600"
          }`}
        >
          {t("home.following")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-12 mb-2 pb-2">
      <button
        onClick={() => onTabChange("forYou")}
        className={`relative pb-2 text-base font-medium ${
          activeTab === "forYou"
            ? "text-[#0B5107] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-[#0B5107]"
            : "text-gray-700"
        }`}
      >
        {t("home.for_you")}
      </button>
      <button
        onClick={() => onTabChange("following")}
        className={`text-base font-medium ${
          activeTab === "following"
            ? "text-[#0B5107] border-b-2 border-[#0B5107] pb-2"
            : "text-gray-700"
        }`}
      >
        {t("home.following")}
      </button>
    </div>
  );
}