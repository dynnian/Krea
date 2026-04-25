// components/Donations/DonationSummaryCard.tsx
import { User, Link as LinkIcon } from "lucide-react";

type DonationSummaryCardProps = {
  amount?: string;
};

export default function DonationSummaryCard({ amount }: DonationSummaryCardProps) {
  return (
    <div className="w-full max-w-[430px]">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">
        Donación a:
      </h2>

      <div className="flex items-center gap-4 mb-3">
        <div className="w-16 h-16 rounded-full border-2 border-[#1F1F1F] flex items-center justify-center bg-[#F3F3F1]">
          <User size={38} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">Usuario</h3>

            <span className="w-6 h-6 rounded-full bg-[#075C08] flex items-center justify-center">
              <LinkIcon size={14} className="text-white" />
            </span>
          </div>

          <p className="text-sm text-[#333]">@Dominio</p>
        </div>
      </div>

      <div className="border-t border-[#1F1F1F]">
        <div className="flex justify-between items-center py-4 border-b border-[#1F1F1F]">
            <span className="text-xl">Pago Único</span>
            <span className="text-xl font-bold">{amount ? `${amount}$` : "X$"}</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-10 w-full h-12 rounded-full bg-[#075C08] text-white font-medium hover:bg-[#064b07] transition-colors"
      >
        Pagar
      </button>
    </div>
  );
}