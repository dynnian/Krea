import { Modal } from "antd";

type DonationAmountModalProps = {
  open: boolean;
  amount: string;
  currency?: string;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onContinue: () => void;
};

const predefinedAmounts = [50, 100, 250, 500, 1000];

export default function DonationAmountModal({
  open,
  amount,
  currency = "DOP",
  onAmountChange,
  onCancel,
  onContinue,
}: DonationAmountModalProps) {
  const parsedAmount = Number(amount);
  const isAmountValid = amount.trim() !== "" && parsedAmount > 0;

  return (
    <Modal open={open} footer={null} closable={false} centered width={650}>
      <div className="bg-[#EAF4FF] border-2 border-[#8F8E8A] rounded-lg px-7 py-6">
        <h2 className="text-3xl font-medium mb-3">Cantidad a donar</h2>

        <p className="text-base font-medium mb-4">Cantidades predefinidas</p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {predefinedAmounts.map((value) => {
            const isSelected = Number(amount) === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onAmountChange(String(value))}
                className={`h-10 rounded-md border text-base transition-colors ${
                  isSelected
                    ? "bg-[#1351AA] border-[#1351AA] text-white"
                    : "bg-[#F3F3F1] border-[#1F1F1F] hover:bg-[#E3E2DE]"
                }`}
              >
                {value} {currency}
              </button>
            );
          })}
        </div>

        <p className="text-base font-medium mb-4">Cantidad personalizada</p>

        <div className="relative mb-2">
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={`Cantidad en ${currency}`}
            className="w-full h-14 rounded-lg border-2 border-[#1F1F1F] bg-[#F3F3F1] px-5 pr-20 text-base outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
          />

          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-bold">
            {currency}
          </span>
        </div>

        {!isAmountValid && amount.trim() !== "" && (
          <p className="text-sm text-red-600 mb-2">
            Ingresa una cantidad válida.
          </p>
        )}

        <div className="flex justify-end gap-7 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-7 rounded-md border border-red-600 text-red-600 bg-transparent hover:bg-red-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={!isAmountValid}
            className="h-10 px-7 rounded-md bg-[#075C08] text-white hover:bg-[#064b07] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
}