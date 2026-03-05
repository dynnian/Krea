import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { subscriptionsRepository } from "../services/subscriptionsRepository";
import type { SubscriptionCard, SubscriptionsPageState } from "../types/subscriptions";

export default function SubscriptionsRoute() {
  const [pageState, setPageState] = useState<SubscriptionsPageState | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadSubscriptions = async () => {
      const data = await subscriptionsRepository.getSubscriptionsPageState();
      setPageState(data);
    };

    void loadSubscriptions();
  }, []);

  if (!pageState) {
    return (
      <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] px-6 pt-14 pb-[72px] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
        {t("subscriptions.loading")}
      </section>
    );
  }

  return (
    <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] px-6 pt-12 pb-12 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="max-w-[960px] mx-auto">
        {/* TODO(i18n): mover este texto a claves de traducción cuando se integre multilenguaje global. */}
        <h1 className="m-0 mb-[34px] text-center text-[42px] leading-[1.1] font-medium text-[#222] max-[620px]:text-[32px]">
          {t("subscriptions.list_title")}
        </h1>

        <div className="grid items-start grid-cols-3 gap-[18px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          {pageState.items.map((item) => (
            <SubscriptionCardView
              key={item.id}
              item={item}
              isExpanded={hoveredCardId === item.id}
              onMouseEnter={() => setHoveredCardId(item.id)}
              onMouseLeave={() => setHoveredCardId((prev) => (prev === item.id ? null : prev))}
              onFocusCapture={() => setHoveredCardId(item.id)}
              onBlurCapture={() => setHoveredCardId((prev) => (prev === item.id ? null : prev))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type SubscriptionCardViewProps = {
  item: SubscriptionCard;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocusCapture: () => void;
  onBlurCapture: () => void;
};

function SubscriptionCardView({
  item,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: SubscriptionCardViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <article
      className="self-start overflow-hidden rounded-xl bg-[#f5f5f5] border border-[#c4c4c4] shadow-[0_3px_8px_rgba(0,0,0,0.13)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <div
        className="h-[160px] grid place-items-center bg-[#bdbdbd] text-[rgba(255,255,255,0.75)]"
        aria-hidden
      >
        <Images size={86} strokeWidth={1.5} />
      </div>

      <div className="p-[12px_12px_10px]">
        <h2 className="m-0 text-center text-[19px] leading-[1.2] text-[#111]">
          {item.title}
        </h2>
        <p className="m-[4px_0_10px] text-center text-[15px] text-[#222]">
          {item.priceLabel} {item.recurrenceLabel}
        </p>

        {/* TODO(frontend-integration): conectar este CTA con "Pagos - Suscripción" en el próximo feature de pagos. */}
        <button
          type="button"
          className="w-full h-[26px] flex items-center justify-center border-0 rounded-[999px] bg-[#0f640f] !text-white [color:#fff] text-[12px] cursor-pointer hover:bg-[#0b530b]"
          style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
          onClick={() => navigate(`/payments/subscriptions/${item.id}`)}
        >
          {t("subscriptions.cta_join")}
        </button>

        <div className="h-4" aria-hidden />
        <p className="text-[11px] leading-[1.4] text-[#2c2c2c]">{item.summary}</p>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? "max-h-[170px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-2 pt-2 border-t border-[#d2d2d2]">
            <p className="m-0 text-[12px] font-semibold text-[#1f1f1f]">
              {t("subscriptions.includes")}
            </p>
            <ul className="m-[4px_0_0] pl-4 text-[10px] leading-[1.35] text-[#2c2c2c]">
              {item.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <p className="m-[6px_0_0] text-[10px] text-[#3b3b3b] leading-[1.3]">{item.deliveryNote}</p>
            <p className="m-[3px_0_0] text-[10px] text-[#3b3b3b] leading-[1.3]">{item.renewalNote}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
