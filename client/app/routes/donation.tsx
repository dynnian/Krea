import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { createDonation } from "@/services/donationsService.ts";
import type { PublicUserProfile } from "@/services/userService.ts";
import { userService } from "@/services/userService.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

import DonationSummaryCard from "@/components/Donations/DonationSummaryCard.tsx";
import DonationAmountModal from "@/components/Donations/DonationAmountModal.tsx";
import DonationDetailModal from "@/components/Donations/DonationDetailModal.tsx";

export default function DonationRoute() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [amountModalOpen, setAmountModalOpen] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [recipient, setRecipient] = useState<PublicUserProfile | null>(null);
  const [donorProfile, setDonorProfile] = useState<PublicUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoadingUser(false);
      return;
    }

    const fetchRecipient = async () => {
      try {
        const res = await userService.getPublicProfile(userId);
        setRecipient(res.data);
      } catch (error) {
        console.error("Error loading recipient:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchRecipient();
  }, [userId]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDonor = async () => {
      try {
        const res = await userService.getPublicProfile(user.id);
        setDonorProfile(res.data);
      } catch (error) {
        console.error("Error loading donor profile:", error);
      }
    };

    fetchDonor();
  }, [user?.id]);

  const handleAmountContinue = () => {
    if (!amount || Number(amount) <= 0) return;

    setAmountModalOpen(false);
    setDetailModalOpen(true);
  };

  const handleDetailContinue = () => {
    setDetailModalOpen(false);
  };

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0 || !recipient) return;

    try {
      setIsProcessing(true);

      const response = await createDonation({
        recipientId: recipient.id,
        amount: Number(amount),
        currency: "DOP",
        message: description,
        successUrl: `${globalThis.location.origin}/donations/success`,
        cancelUrl: `${globalThis.location.origin}/donations/cancel`,
      });

      globalThis.location.href = response.checkoutUrl;
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  if (!userId) {
    return <div className="p-10">Usuario inválido</div>;
  }

  if (isLoadingUser) {
    return <div className="p-10">Cargando...</div>;
  }

  if (!recipient) {
    return <div className="p-10">Usuario no encontrado</div>;
  }

  return (
    <>
      <main className="min-h-[calc(100vh-58px)] bg-[#F3F3F1] flex justify-center px-6 py-12 lg:py-20">
          <DonationSummaryCard
            amount={amount}
            description={description}
            onDescriptionChange={setDescription}
            isProcessing={isProcessing}
            onPay={handlePay}
            recipient={recipient}
          />
      </main>

      <DonationAmountModal
        open={amountModalOpen}
        amount={amount}
        currency="DOP"
        onAmountChange={setAmount}
        onCancel={() => navigate(-1)}
        onContinue={handleAmountContinue}
      />

      <DonationDetailModal
        open={detailModalOpen}
        amount={amount}
        currency="DOP"
        description={description}
        donor={donorProfile}
        recipient={recipient}
        onCancel={() => setDetailModalOpen(false)}
        onContinue={handleDetailContinue}
      />
    </>
  );
}