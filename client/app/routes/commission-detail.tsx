import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, CircleUserRound, Ellipsis, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { commissionsRepository } from "../services/commissionsRepository";
import type { CommissionDetail } from "../types/commissions";

export default function CommissionDetailRoute() {
  const { commissionId } = useParams();
  const [detail, setDetail] = useState<CommissionDetail | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!commissionId) return;

    const loadDetail = async () => {
      const data = await commissionsRepository.getCommissionDetail(commissionId);
      setDetail(data);
    };

    void loadDetail();
  }, [commissionId]);

  if (!detail) {
    return (
      <section className="w-screen min-h-[calc(100vh-64px)] bg-[#ccd3df] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
        <div className="max-w-[1370px] mx-auto grid grid-cols-[minmax(0,1fr)_360px] border-x border-[#8f96a3] max-[1100px]:grid-cols-1">
          <div className="border-r border-[#8f96a3] max-[1100px]:border-r-0">
            <div className="flex items-center gap-[10px] px-[14px] py-2 border-b border-[#8f96a3] text-[24px]">
              <Link to="/commissions" className="text-[#333] no-underline">
                <ChevronLeft size={16} />
              </Link>
              {t("commissions.detail.breadcrumb")}
            </div>
            <div className="px-[14px] pt-3 pb-[18px]">{t("commissions.detail.loading")}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-screen min-h-[calc(100vh-64px)] bg-[#ccd3df] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="max-w-[1310px] mx-auto grid grid-cols-[minmax(0,1fr)_340px] border-x border-[#8f96a3] max-[1100px]:grid-cols-1">
        <div className="border-r border-[#8f96a3] max-[1100px]:border-r-0">
          <div className="flex items-center gap-[10px] px-[14px] py-2 border-b border-[#8f96a3] text-[18px]">
            <Link
              to="/commissions"
              className="text-[#333] no-underline"
              aria-label={t("commissions.detail.back_to_commissions")}
            >
              <ChevronLeft size={16} />
            </Link>
            {t("commissions.detail.breadcrumb")}
          </div>

          <div className="px-[14px] pt-2 pb-4">
            <h1 className="m-0 text-[39px] leading-[1.08]">{detail.title}</h1>

            <div className="mt-[6px] flex items-center gap-[10px]">
              <div
                className="w-9 h-9 rounded-[999px] border border-[#444] grid place-items-center"
                aria-hidden
              >
                <UserRound size={20} />
              </div>
              <div>
                <div className="text-[23px] leading-[1.08] flex items-center gap-2">
                  {detail.author.name}
                  {detail.author.verified ? <CheckCircle2 size={18} /> : null}
                </div>
                <div className="mt-[-3px] text-[14px]">{detail.author.handle}</div>
              </div>
            </div>

            <div className="mt-3 relative h-[220px] bg-[#d7d6d4] flex items-center justify-center px-12">
              {/* TODO(frontend-integration): renderizar carrusel real con assets del backend. */}
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-[999px] border border-[#b8b8b8] bg-[#d8d8d8] grid place-items-center text-[16px] text-[rgba(50,50,50,0.55)]"
              >
                ‹
              </button>
              <img
                className="h-[190px] w-full max-w-[430px] object-cover object-center"
                src="https://picsum.photos/900/600"
                alt={`Vista previa de ${detail.title}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-[999px] border border-[#b8b8b8] bg-[#d8d8d8] grid place-items-center text-[16px] text-[rgba(50,50,50,0.55)]"
              >
                ›
              </button>
            </div>

            <h2 className="m-[10px_0_6px] text-[28px]">{t("commissions.detail.about_title")}</h2>
            <p className="m-0 text-[13px] leading-[1.55]">{detail.about}</p>

            <h2 className="m-[10px_0_6px] text-[26px]">{t("commissions.detail.tags_title")}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {detail.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#71757e] rounded-[999px] px-[14px] py-1 text-[11px] bg-transparent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 border-t border-[#8f96a3] p-[12px_14px_20px]">
            <h2 className="m-[0_0_8px] text-[32px]">{t("commissions.detail.comments_title")}</h2>

            <div className="grid grid-cols-[36px_1fr_auto] gap-2 items-center pb-3 border-b border-[#8f96a3]">
              <CircleUserRound size={30} />
              <input
                className="border-0 bg-transparent text-[14px] outline-none text-[#202020]"
                placeholder={t("commissions.detail.comment_placeholder")}
              />
              <button
                type="button"
                className="border border-[#707784] rounded-[999px] px-[14px] py-[3px] bg-transparent text-[11px]"
              >
                {t("commissions.detail.comment_post")}
              </button>
            </div>

            <div className="mt-2">
              {detail.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="grid grid-cols-[36px_1fr_auto] gap-2 items-start py-[11px] border-b border-[#8f96a3]"
                >
                  <CircleUserRound size={30} />
                  <div>
                    <p className="m-0 text-[13px]">
                      {comment.author} {comment.handle} · {comment.dateLabel}
                    </p>
                    <p className="m-[4px_0_0] text-[12px] leading-[1.5]">{comment.body}</p>
                  </div>
                  <Ellipsis size={16} />
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="p-[56px_12px_20px] max-[1100px]:pt-0 max-[1100px]:border-t max-[1100px]:border-[#8f96a3]">
          <article className="border border-[#6f7784] rounded-[7px] bg-[#d6e6d2] p-[10px_10px] shadow-[0_2px_6px_rgba(0,0,0,0.16)]">
            <div className="flex justify-between items-baseline">
              <span className="text-[33px] leading-none">{t("commissions.detail.price_title")}</span>
              <span className="text-[34px] leading-none">{detail.priceLabel}</span>
            </div>
            <p className="m-[10px_0_12px] text-[13px]">{detail.deliveryEstimate}</p>

            <div className="flex flex-col gap-[10px]">
              <button
                type="button"
                className="w-full h-[30px] rounded-[999px] text-[12px] font-medium border-0 bg-[#0d650d] !text-white [color:#fff] [text-shadow:0_1px_0_rgba(0,0,0,0.18)]"
                style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
                onClick={() => navigate(`/payments/commissions/${detail.id}`)}
              >
                {/* TODO(frontend-integration): enlazar con "Pagos - Comisiones" en el siguiente feature/PR. */}
                {t("commissions.detail.pay_cta")}
              </button>
              <button
                type="button"
                className="w-full h-[30px] rounded-[999px] text-[11px] border border-[#6f7784] bg-[#eef3ed]"
              >
                {t("commissions.detail.message_creator_cta")}
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
