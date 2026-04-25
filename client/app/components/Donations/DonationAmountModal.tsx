import { Modal } from "antd";

type DonationAmountModalProps = {
  open: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onContinue: () => void;
};

const predefinedAmounts = [5, 10, 15, 20, 25];

export default function DonationAmountModal({
  open,
  amount,
  onAmountChange,
  onCancel,
  onContinue,
}: DonationAmountModalProps) {
  return (
    <Modal open={open} footer={null} closable={false} centered width={650}>
      <div className="bg-[#EAF4FF] border-2 border-[#8F8E8A] rounded-lg px-7 py-6">
        <h2 className="text-3xl font-medium mb-3">Cantidad a donar</h2>

        <p className="text-base font-medium mb-4">Cantidades predefinidas</p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {predefinedAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onAmountChange(String(value))}
              className="h-10 rounded-md border border-[#1F1F1F] bg-[#F3F3F1] text-base hover:bg-[#E3E2DE]"
            >
              {value}$
            </button>
          ))}
        </div>

        <p className="text-base font-medium mb-4">Cantidad personalizada</p>

        <div className="relative mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Cantidad en $"
            className="w-full h-14 rounded-lg border-2 border-[#1F1F1F] bg-[#F3F3F1] px-5 pr-12 text-base outline-none placeholder:text-[#8F8E8A]"
          />

          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-bold">
            $
          </span>
        </div>

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
            className="h-10 px-7 rounded-md bg-[#075C08] text-white hover:bg-[#064b07]"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
}