import { useEffect, useState } from "react";
import { CheckCircle2, CircleUserRound, CreditCard } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { commissionsRepository } from "../services/commissionsRepository";
import { paymentsRepository } from "../services/paymentsRepository";
import type { CommissionDetail } from "../types/commissions";

type PaymentMethod = "card" | "paypal";
type PayFlowState = "idle" | "processing" | "success" | "error";

export default function PaymentCommissionRoute() {
  const { commissionId } = useParams();
  const { t } = useTranslation();
  const [detail, setDetail] = useState<CommissionDetail | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("paypal");
  const [payFlowState, setPayFlowState] = useState<PayFlowState>("idle");
  const [payFeedbackKey, setPayFeedbackKey] = useState<string | null>(null);

  useEffect(() => {
    if (!commissionId) return;

    const loadDetail = async () => {
      const data = await commissionsRepository.getCommissionDetail(commissionId);
      setDetail(data);
    };

    void loadDetail();
  }, [commissionId]);

  useEffect(() => {
    setPayFlowState("idle");
    setPayFeedbackKey(null);
  }, [method, commissionId]);

  const handlePayAction = async () => {
    if (method === "card") {
      setPayFlowState("error");
      setPayFeedbackKey("payments.common.card_pending_integration");
      return;
    }

    if (!commissionId || !detail) return;

    if (!paymentsRepository.hasPaypalConfiguration()) {
      setPayFlowState("error");
      setPayFeedbackKey("payments.common.paypal_missing_client_id");
      return;
    }

    try {
      setPayFlowState("processing");
      setPayFeedbackKey("payments.common.paypal_processing");

      const order = await paymentsRepository.createPaypalOrder({
        itemId: commissionId,
        amountLabel: detail.priceLabel,
        paymentType: "commission",
      });

      // TODO(frontend-integration): abrir approvalUrl/SDK de PayPal antes de capturar.
      const capture = await paymentsRepository.capturePaypalOrder(order.orderId);

      if (capture.status === "COMPLETED") {
        setPayFlowState("success");
        setPayFeedbackKey("payments.common.paypal_success");
        return;
      }

      setPayFlowState("error");
      setPayFeedbackKey("payments.common.paypal_error");
    } catch {
      setPayFlowState("error");
      setPayFeedbackKey("payments.common.paypal_error");
    }
  };

  if (!detail) {
    return (
      <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] p-6">
        {t("payments.commission.loading")}
      </section>
    );
  }

  return (
    <section className="w-screen min-h-[calc(100vh-64px)] bg-[#d4d4d4] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-[minmax(0,1fr)_40%] border-x border-[#9a9a9a] max-[1000px]:grid-cols-1">
        <section className="bg-[#d4d4d4] px-8 py-9 border-r border-[#9a9a9a] max-[1000px]:border-r-0">
          <h1 className="m-0 text-[48px] leading-[1.1]">{t("payments.commission.title")}</h1>

          <p className="m-[22px_0_8px] text-[16px]">{t("payments.common.method")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`h-[44px] rounded-md border border-[#3d3d3d] text-[22px] flex items-center justify-center gap-2 ${
                method === "card" ? "bg-[#ececec]" : "bg-[#dfdfdf]"
              }`}
              onClick={() => setMethod("card")}
            >
              {t("payments.common.card")}
              <CreditCard size={18} />
            </button>
            <button
              type="button"
              className={`h-[44px] rounded-md border border-[#3d3d3d] text-[22px] font-semibold ${
                method === "paypal" ? "bg-[#ececec]" : "bg-[#dfdfdf]"
              }`}
              onClick={() => setMethod("paypal")}
            >
              PayPal
            </button>
          </div>

          <label className="block mt-5 mb-2 text-[15px]">{t("payments.common.cardholder_name")}</label>
          <input
            className="w-full h-[44px] rounded-[10px] border border-[#3d3d3d] px-4 text-[16px] bg-[#dfdfdf]"
            placeholder={t("payments.common.name_placeholder")}
          />

          <label className="block mt-5 mb-2 text-[15px]">{t("payments.common.card_data")}</label>
          <input
            className="w-full h-[44px] rounded-[10px] border border-[#3d3d3d] px-4 text-[16px] bg-[#dfdfdf]"
            placeholder={t("payments.common.card_number_placeholder")}
          />

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <input
              className="h-[44px] rounded-[10px] border border-[#3d3d3d] px-4 text-[16px] bg-[#dfdfdf]"
              placeholder="MM/AA"
            />
            <input
              className="h-[44px] rounded-[10px] border border-[#3d3d3d] px-4 text-[16px] bg-[#dfdfdf]"
              placeholder="CVV"
            />
          </div>

          <label className="block mt-5 mb-2 text-[15px]">{t("payments.common.country")}</label>
          <select className="w-full h-[44px] rounded-[10px] border border-[#3d3d3d] px-4 text-[16px] bg-[#dfdfdf]">
            <option>{t("payments.common.default_country")}</option>
          </select>
        </section>

        <aside className="bg-[#f1f3f7] px-8 py-9">
          <h2 className="m-0 text-[42px] leading-[1.1]">{detail.title}</h2>

          <div className="mt-3 flex items-center gap-3">
            <CircleUserRound size={48} />
            <div>
              <div className="text-[29px] leading-tight flex items-center gap-1.5">
                {detail.author.name}
                {detail.author.verified ? <CheckCircle2 size={18} /> : null}
              </div>
              <div className="text-[14px] leading-tight">{detail.author.handle}</div>
            </div>
          </div>

          <div className="mt-3 border-y border-[#8f8f8f] py-2 flex items-center justify-between text-[26px]">
            <span>{t("payments.commission.single_payment")}</span>
            <span>{detail.priceLabel}</span>
          </div>
          <div className="h-8" aria-hidden />

          {/* TODO(frontend-integration): enlazar este botón con la pasarela real de pagos para comisiones. */}
          <button
            type="button"
            className="w-full h-[42px] rounded-[999px] border-0 bg-[#0d650d] !text-white [color:#fff] text-[12px] font-medium [text-shadow:0_1px_0_rgba(0,0,0,0.18)]"
            style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
            onClick={() => void handlePayAction()}
            disabled={payFlowState === "processing"}
          >
            {payFlowState === "processing"
              ? t("payments.common.paypal_processing_cta")
              : t("payments.common.pay")}
          </button>
          {method === "paypal" && payFeedbackKey ? (
            <p className="m-[8px_2px_0] text-[12px] leading-tight text-[#303030]">
              {t(payFeedbackKey)}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
