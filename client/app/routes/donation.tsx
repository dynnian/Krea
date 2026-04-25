import { useState } from "react";
import DonationCheckoutForm from "../components/Donations/DonationCheckoutForm";
import DonationSummaryCard from "../components/Donations/DonationSummaryCard";
import DonationAmountModal from "../components/Donations/DonationAmountModal";
import DonationDetailModal from "../components/Donations/DonationDetailModal";

export default function DonationRoute() {
  const [amount, setAmount] = useState("");
  const [amountModalOpen, setAmountModalOpen] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleAmountContinue = () => {
    setAmountModalOpen(false);
    setDetailModalOpen(true);
  };

  const handleDetailContinue = () => {
    setDetailModalOpen(false);
  };

  return (
    <>
      <main className="min-h-[calc(100vh-58px)] bg-[#F3F3F1] grid grid-cols-1 lg:grid-cols-2">
        <section className="flex justify-center lg:justify-end px-6 py-12 lg:py-20 lg:pr-10">
          <DonationCheckoutForm />
        </section>

        <section className="bg-[#F8F8F8] px-6 py-12 lg:py-20 lg:pl-20">
          <DonationSummaryCard amount={amount} />
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
        onCancel={() => setDetailModalOpen(false)}
        onContinue={handleDetailContinue}
      />
    </>
  );
}