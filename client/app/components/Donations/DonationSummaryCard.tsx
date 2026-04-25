import { User, Link as LinkIcon } from "lucide-react";

type DonationSummaryCardProps = {
  amount?: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  isProcessing?: boolean;
  onPay?: () => void;
};

export default function DonationSummaryCard({
  amount,
  description,
  onDescriptionChange,
  isProcessing = false,
  onPay,
}: DonationSummaryCardProps) {
  return (
    <div className="w-full max-w-[430px]">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">Donación a:</h2>

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
          <span className="text-xl font-bold">
            {amount ? `${amount}$` : "X$"}
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
        {isProcessing ? "Procesando..." : "Pagar"}
      </button>
    </div>
  );
}