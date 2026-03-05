import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { commissionsRepository } from "../services/commissionsRepository";
import type { CommissionCard, CommissionsPageState } from "../types/commissions";

export default function CommissionsRoute() {
  const [pageState, setPageState] = useState<CommissionsPageState | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadCommissions = async () => {
      const data = await commissionsRepository.getCommissionsPageState();
      setPageState(data);
    };

    void loadCommissions();
  }, []);

  if (!pageState) {
    return (
      <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] px-6 pt-14 pb-[72px] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
        {t("commissions.loading")}
      </section>
    );
  }

  return (
    <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] px-6 pt-12 pb-12 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="max-w-[960px] mx-auto">
        {/* TODO(i18n): mover este texto a claves de traducción cuando se integre multilenguaje global. */}
        <h1 className="m-0 mb-[34px] text-center text-[42px] leading-[1.1] font-medium text-[#222] max-[620px]:text-[32px]">
          {t("commissions.list_title")}
        </h1>

        <div className="grid items-start grid-cols-3 gap-[18px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          {pageState.items.map((item) => (
            <CommissionCardView key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommissionCardView({ item }: { item: CommissionCard }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <article className="self-start overflow-hidden rounded-xl bg-[#f5f5f5] border border-[#c4c4c4] shadow-[0_3px_8px_rgba(0,0,0,0.13)]">
      <div
        className="h-[160px] grid place-items-center bg-[#bdbdbd] text-[rgba(255,255,255,0.75)]"
        aria-hidden
      >
        <Images size={86} strokeWidth={1.5} />
      </div>

      <div className="p-[12px_12px_10px]">
        <h2 className="m-0 text-center text-[19px] leading-[1.2] text-[#111]">{item.title}</h2>
        <p className="m-[4px_0_10px] text-center text-[15px] text-[#222]">
          {item.priceLabel} · {item.deliveryLabel}
        </p>

        <button
          type="button"
          className="w-full h-[26px] flex items-center justify-center border-0 rounded-[999px] bg-[#0f640f] !text-white [color:#fff] text-[12px] cursor-pointer hover:bg-[#0b530b]"
          style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
          onClick={() => navigate(`/commissions/${item.id}`)}
        >
          {t("commissions.cta_more")}
        </button>

        <div className="h-4" aria-hidden />
        <p className="text-[11px] leading-[1.4] text-[#2c2c2c]">{item.summary}</p>
      </div>
    </article>
  );
}
