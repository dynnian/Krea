import { User, Link as LinkIcon } from "lucide-react";
import type { PublicUserProfile } from "@/services/userService.ts";

type DonationSummaryCardProps = {
  amount?: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  isProcessing?: boolean;
  onPay?: () => void;
  recipient: PublicUserProfile;
};

export default function DonationSummaryCard({
  amount,
  description,
  recipient,
  onDescriptionChange,
  isProcessing = false,
  onPay,
}: DonationSummaryCardProps) {

  return (
    <div className="w-full max-w-[430px]">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">Donación a:</h2>

      <div className="flex items-center gap-4 mb-3">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1F1F1F] bg-[#F3F3F1]">
          {recipient.profilePictureUrl ? (
            <img
              src={recipient.profilePictureUrl}
              alt={recipient.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={38} />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold">
            {recipient.displayName}
          </h3>

          <p className="text-sm text-[#333]">
            @{recipient.username}
          </p>
        </div>
      </div>

      <div className="border-t border-[#1F1F1F]">
        <div className="flex justify-between items-center py-4 border-b border-[#1F1F1F]">
          <span className="text-xl">Pago Único</span>
          <span className="text-xl font-bold">
            {amount ? `${amount}USD` : "USD"}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-base font-bold mb-2">
          Descripción
        </label>

        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={180}
          placeholder="Escribe un mensaje para el artista..."
          className="w-full min-h-[110px] resize-none rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-4 py-3 outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
        />

        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#555]">
            {description.length}/180
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={!amount || isProcessing}
        className="mt-8 w-full h-12 rounded-full bg-[#075C08] text-white font-medium hover:bg-[#064b07] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? "Redirigiendo a Stripe..." : "Continuar al pago"}
      </button>
    </div>
  );
}