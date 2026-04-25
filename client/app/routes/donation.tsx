import { useState } from "react";
import { useNavigate } from "react-router";

import DonationCheckoutForm from "@/components/Donations/DonationCheckoutForm.tsx";
import DonationSummaryCard from "@/components/Donations/DonationSummaryCard.tsx";
import DonationAmountModal from "@/components/Donations/DonationAmountModal.tsx";
import DonationDetailModal from "@/components/Donations/DonationDetailModal.tsx";
import DonationSuccessModal from "@/components/Donations/DonationSuccessModal.tsx";

type PaymentMethod = "card" | "paypal";

export default function DonationRoute() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");

  const [isProcessing, setIsProcessing] = useState(false);

  const [amountModalOpen, setAmountModalOpen] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleAmountContinue = () => {
    if (!amount || Number(amount) <= 0) return;

    setAmountModalOpen(false);
    setDetailModalOpen(true);
  };

  const handleDetailContinue = () => {
    setDetailModalOpen(false);
  };

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsProcessing(false);
    setSuccessModalOpen(true);
  };

  const handleFinish = () => {
    setSuccessModalOpen(false);
    navigate("/profile");
  };

  return (
    <>
      <main className="min-h-[calc(100vh-58px)] bg-[#F3F3F1] grid grid-cols-1 lg:grid-cols-2">
        <section className="flex justify-center lg:justify-end px-6 py-12 lg:py-20 lg:pr-10">
          <DonationCheckoutForm
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
          />
        </section>

        <section className="bg-[#F8F8F8] px-6 py-12 lg:py-20 lg:pl-20">
          <DonationSummaryCard
            amount={amount}
            description={description}
            onDescriptionChange={setDescription}
            isProcessing={isProcessing}
            onPay={handlePay}
          />
        </section>
      </main>

      <DonationAmountModal
        open={amountModalOpen}
        amount={amount}
        onAmountChange={setAmount}
        onCancel={() => setAmountModalOpen(false)}
        onContinue={handleAmountContinue}
      />

        <DonationDetailModal
        open={detailModalOpen}
        amount={amount}
        description={description}
        onCancel={() => setDetailModalOpen(false)}
        onContinue={handleDetailContinue}
        />

      <DonationSuccessModal
        open={successModalOpen}
        amount={amount}
        receiverName="Usuario"
        onClose={handleFinish}
      />
    </>
  );
}